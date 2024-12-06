import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosProgressEvent } from 'axios'
import { toast } from 'sonner'

interface ToastContext {
  toastId: string
}

interface AudioMetadata {
  blob: Blob
  duration: number
}

const processAudioTranscribe = async (
  audioMetadata: AudioMetadata,
  fileName: string,
  onUploadProgress: (progress: number) => void,
  patientId: string,
  setJobStatus: (status: string) => void,
) => {
  try {
    const response = await axios.post('/api/v1/healthscribe/upload', {
      fileName,
      fileType: audioMetadata.blob.type,
      duration: audioMetadata.duration.toString(),
      patientId,
    })

    if (!response.data) {
      throw new Error('Failed to get presigned URL')
    }

    const { audioId, url, newFileName } = response.data

    const uploadResponse = await axios.put(url, audioMetadata.blob, {
      headers: {
        'Content-Type': audioMetadata.blob.type,
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total !== undefined) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          )
          onUploadProgress(progress)
        }
      },
    })

    if (uploadResponse.status !== 200) {
      throw new Error('Failed to upload file to S3')
    }

    const startJobResponse = await axios.post('/api/v1/healthscribe/start', {
      jobName: `job_${Date.now()}`,
      fileName: newFileName,
      fileType: audioMetadata.blob.type,
    })

    if (startJobResponse.status !== 200) {
      throw new Error('Failed to start MedicalScribe job')
    }

    const { jobName } = startJobResponse.data

    const checkJobStatus = async (jobName: string) => {
      try {
        const statusResponse = await axios.get(
          `/api/v1/healthscribe/status?jobName=${encodeURIComponent(jobName)}`,
        )
        if (statusResponse.status !== 200) {
          throw new Error('Failed to check job status')
        }
        const { status, summaryContent, transcriptContent } =
          statusResponse.data
        setJobStatus(status)
        if (status === 'COMPLETED') {
          await axios.post(`/api/v1/healthscribe/add`, {
            jobName: jobName,
            status: status,
            audioId: audioId,
            patientId: patientId,
            transcript: transcriptContent,
            clinicalSummary: summaryContent,
          })
          return { summaryContent, transcriptContent }
        }
        await new Promise((resolve) => setTimeout(resolve, 30000))
        return await checkJobStatus(jobName)
      } catch (error) {
        console.error('Error checking job status:', error)
        throw error
      }
    }

    return await checkJobStatus(jobName)
  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}

export const useTranscribeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      patientId,
      audioMetadata,
      setJobStatus,
    }: {
      patientId: string
      audioMetadata: AudioMetadata
      setJobStatus: (status: string) => void
    }) => {
      const result = await processAudioTranscribe(
        audioMetadata,
        `audio_${Date.now()}`,
        (progress) => {
          queryClient.setQueryData(['uploadProgress', patientId], progress)
        },
        patientId,
        setJobStatus,
      )
      return result
    },
    onMutate: () => {
      const toastId = toast.loading('Uploading and transcribing...')
      return { toastId } as ToastContext
    },
    onSuccess: (result, variables, context?: ToastContext) => {
      if (context?.toastId) {
        toast.success('Audio uploaded and transcribed successfully', {
          id: context.toastId,
        })
      }
    },
    onError: (error, variables, context?: ToastContext) => {
      if (context?.toastId) {
        toast.error('Audio upload failed', {
          description: (error as Error).message || 'Please try again.',
          id: context.toastId,
        })
      }
    },
    onSettled: (_data, _error, _variables, context?: ToastContext) => {
      if (context?.toastId) {
        setTimeout(() => {
          toast.dismiss(context.toastId)
        }, 5000)
      }
    },
  })
}
