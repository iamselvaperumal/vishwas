"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fixWebmDuration } from "@/lib/audioDurationFix/fixWebmDuration";
import { cn } from "@/lib/utils";
import { AudioMetadata } from "@/types/audio";
import { Microphone, Pause, Play, Stop } from "@phosphor-icons/react";

type Props = {
  className?: string;
  timerClassName?: string;
  onAudioRecorded: (audioMetadata: AudioMetadata | null) => void;
};

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerInterval: NodeJS.Timeout;
let startTime: number | null = null;

const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, "0");
};

export const AudioRecorder = ({
  className,
  timerClassName,
  onAudioRecorded,
}: Props) => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [timer, setTimer] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const mediaRecorderRef = useRef<{
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    mediaRecorder: MediaRecorder | null;
    audioContext: AudioContext | null;
  }>({
    stream: null,
    analyser: null,
    mediaRecorder: null,
    audioContext: null,
  });

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  const [hourLeft, hourRight] = useMemo(
    () => padWithLeadingZeros(hours, 2).split(""),
    [hours]
  );
  const [minuteLeft, minuteRight] = useMemo(
    () => padWithLeadingZeros(minutes, 2).split(""),
    [minutes]
  );
  const [secondLeft, secondRight] = useMemo(
    () => padWithLeadingZeros(seconds, 2).split(""),
    [seconds]
  );

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setIsRecording(true);
        setIsPaused(false);
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        mediaRecorderRef.current = {
          stream,
          analyser,
          mediaRecorder: null,
          audioContext: audioCtx,
        };

        const mimeTypes = [
          "audio/webm",
          "audio/mp4",
          "audio/ogg",
          "audio/wav",
          "audio/aac",
        ];

        let selectedMimeType = "";
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }

        if (!selectedMimeType) {
          throw new Error("No supported MIME type found for this browser");
        }

        recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
        recorder.start();
        startTime = Date.now();
        recordingChunks = [];
        recorder.ondataavailable = (e) => {
          recordingChunks.push(e.data);
        };

        startTimer();
      } catch (error) {
        console.error("Error starting recording:", error);
        alert(
          "Failed to start recording. Please check your browser permissions and try again."
        );
      }
    } else {
      alert("Your browser does not support audio recording");
    }
  };

  const togglePauseResume = () => {
    if (isPaused) {
      if (recorder && recorder.state === "paused") {
        recorder.resume();
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => {
          track.enabled = true;
        });
        startTimer();
        setIsPaused(false);
      }
    } else {
      if (recorder && recorder.state === "recording") {
        recorder.pause();
        mediaRecorderRef.current.stream?.getTracks().forEach((track) => {
          track.enabled = false;
        });
        clearInterval(timerInterval);
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
      clearInterval(timerInterval);
      setIsRecording(false);
      setIsPaused(false);

      recorder.onstop = async () => {
        const duration = Date.now() - (startTime || Date.now());
        const blob = new Blob(recordingChunks, { type: recorder.mimeType });
        const fixedBlob = await fixWebmDuration(blob, duration);
        const audioMetadata: AudioMetadata = {
          blob: fixedBlob,
          name: `Audio_Record_${new Date().getTime()}.wav`,
          duration: duration / 1000, // duration in seconds
          size: fixedBlob.size,
          mimeType: fixedBlob.type,
        };
        setAudioBlob(fixedBlob);
        onAudioRecorded(audioMetadata); // Pass the audio metadata to the parent
        setTimer(0);
      };
    }
  };

  const startTimer = () => {
    timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const drawWaveform = (dataArray: Uint8Array) => {
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "#939393";

      const barWidth = 2;
      const spacing = 4;
      const maxBarHeight = HEIGHT / 2.5;
      const numBars = Math.floor(WIDTH / (barWidth + spacing));

      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.pow(dataArray[i] / 128.0, 8) * maxBarHeight;
        const x = (barWidth + spacing) * i;
        const y = HEIGHT / 2 - barHeight / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    const drawPausedState = () => {
      if (!canvasCtx) return;
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      canvasCtx.fillStyle = "#939393";

      const barWidth = 2;
      const spacing = 4;
      const maxBarHeight = HEIGHT / 2.5;
      const numBars = Math.floor(WIDTH / (barWidth + spacing));
      const barHeight = maxBarHeight;

      for (let i = 0; i < numBars; i++) {
        const x = (barWidth + spacing) * i;
        const y = HEIGHT / 2 - barHeight / 2;
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      }
    };

    const visualizeVolume = () => {
      if (!mediaRecorderRef.current?.analyser) return;
      const bufferLength = mediaRecorderRef.current.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!isRecording) {
          cancelAnimationFrame(animationRef.current || 0);
          return;
        }
        animationRef.current = requestAnimationFrame(draw);
        mediaRecorderRef.current?.analyser?.getByteTimeDomainData(dataArray);
        drawWaveform(dataArray);
      };

      draw();
    };

    if (isRecording) {
      visualizeVolume();
    } else {
      drawPausedState();
    }

    return () => {
      cancelAnimationFrame(animationRef.current || 0);
    };
  }, [isRecording, isPaused, theme]);

  return (
    <div className={cn("flex flex-col items-start gap-4 w-full", className)}>
      <div className="flex w-full px-4 py-2 rounded border-2 border-dashed border-muted-foreground/25">
        <canvas ref={canvasRef} className="h-12 w-full bg-background mr-3" />
        <Timer
          hourLeft={hourLeft}
          hourRight={hourRight}
          minuteLeft={minuteLeft}
          minuteRight={minuteRight}
          secondLeft={secondLeft}
          secondRight={secondRight}
          timerClassName={timerClassName}
        />
      </div>

      <div className="flex flex-1 justify-center w-full gap-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={startRecording}
                size="default"
                variant="default"
                disabled={isRecording}
              >
                <Microphone size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="m-2">
              <span>Start recording</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={togglePauseResume}
                size="default"
                variant="default"
                disabled={!isRecording}
              >
                {isPaused ? (
                  <>
                    <Play weight="duotone" size={20} />
                  </>
                ) : (
                  <>
                    <Pause weight="duotone" size={20} />
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="m-2">
              <span>{isPaused ? "Resume recording" : "Pause recording"}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={stopRecording}
                size="default"
                variant="destructive"
                disabled={!isRecording}
              >
                <Stop size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="m-2">
              <span>Stop recording</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type='button'
                onClick={resetRecording}
                size='icon'
                variant='destructive'
                disabled={isRecording || !audioBlob}
              >
                <Delete02Icon size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className='m-2'>
              <span>Reset recording</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type='button' onClick={downloadAudio} size='icon' disabled={!audioBlob}>
                <Download02Icon size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className='m-2'>
              <span>Download recording</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  );
};

const Timer = React.memo(
  ({
    hourLeft,
    hourRight,
    minuteLeft,
    minuteRight,
    secondLeft,
    secondRight,
    timerClassName,
  }: {
    hourLeft: string;
    hourRight: string;
    minuteLeft: string;
    minuteRight: string;
    secondLeft: string;
    secondRight: string;
    timerClassName?: string;
  }) => {
    return (
      <div
        className={cn(
          "items-center justify-center gap-0.5 border p-1.5 rounded-md font-medium text-foreground flex",
          timerClassName
        )}
      >
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {hourLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {hourRight}
        </span>
        <span>:</span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {minuteLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {minuteRight}
        </span>
        <span>:</span>
        <span className="rounded-md bg-background p-0.5 text-foreground">
          {secondLeft}
        </span>
        <span className="rounded-md bg-background p-0.5 text-foreground ">
          {secondRight}
        </span>
      </div>
    );
  }
);
Timer.displayName = "Timer";
