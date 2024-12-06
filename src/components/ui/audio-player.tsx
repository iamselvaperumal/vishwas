import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  SpeakerHigh,
  SpeakerX,
} from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'

type AudioPlayerProps = {
  audioSource: Blob | string
}

const SKIP_TIME = 5 // seconds

export default function AudioPlayer({ audioSource }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof audioSource === 'string') {
      setAudioUrl(audioSource)
    } else if (audioSource instanceof Blob) {
      const url = URL.createObjectURL(audioSource)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [audioSource])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
      const handleLoadedMetadata = () => {
        if (!isNaN(audio.duration)) {
          setDuration(audio.duration)
        }
      }
      const handleTimeUpdate = () => {
        if (!isNaN(audio.currentTime)) {
          setCurrentTime(audio.currentTime)
        }
      }
      const handleEnded = () => {
        setIsPlaying(false)
      }
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('ended', handleEnded)
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [volume, audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      setIsMuted(!isMuted)
      audio.muted = !isMuted
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
  }

  const handleSeekChange = (value: number[]) => {
    const audio = audioRef.current
    if (audio && duration) {
      audio.currentTime = (value[0] / 100) * duration
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className='bg-background rounded-lg border p-6 w-full flex flex-col gap-4 h-[125px] justify-center'>
      <audio ref={audioRef} src={audioUrl || undefined} />
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <div>{formatTime(currentTime)}</div>
        <Slider
          value={duration ? [(currentTime / duration) * 100] : [0]}
          max={100}
          onValueChange={handleSeekChange}
          className='flex-1 mx-4 [&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform'
        />
        <div>{formatTime(duration)}</div>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='w-8 h-8'
                  onClick={() =>
                    audioRef.current &&
                    (audioRef.current.currentTime -= SKIP_TIME)
                  }
                >
                  <Rewind className='w-5 h-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rewind {SKIP_TIME} seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='w-8 h-8'
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause weight='duotone' className='w-5 h-5' />
                  ) : (
                    <Play weight='duotone' className='w-5 h-5' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? 'Pause' : 'Play'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='w-8 h-8'
                  onClick={() =>
                    audioRef.current &&
                    (audioRef.current.currentTime += SKIP_TIME)
                  }
                >
                  <FastForward className='w-5 h-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Forward {SKIP_TIME} seconds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='w-8 h-8'
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <SpeakerX className='w-5 h-5' />
                  ) : (
                    <SpeakerHigh className='w-5 h-5' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? 'Unmute' : 'Mute'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Slider
            value={[volume * 100]}
            max={100}
            onValueChange={handleVolumeChange}
            className='w-20 [&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform'
          />
          <p className='text-sm w-8 ml-2'>{Math.floor(volume * 100)}</p>
        </div>
      </div>
    </div>
  )
}
