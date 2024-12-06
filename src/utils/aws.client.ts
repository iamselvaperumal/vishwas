'use server'

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import {
  DeleteMedicalScribeJobCommand,
  GetMedicalScribeJobCommand,
  ListMedicalScribeJobsCommand,
  StartMedicalScribeJobCommand,
  StartMedicalScribeJobRequest,
  TranscribeClient,
} from '@aws-sdk/client-transcribe'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { MAX_SPEAKERS } from '@/lib/constants'

import { getUser } from '@/utils/utils.server'
import { env } from './env.mjs'

const s3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const transcribeClient = new TranscribeClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
})

// S3 Operations

export async function getPreSignedUrl(fileName: string, fileType: string) {
  const user = await getUser()
  const uniqueFileName = `Record_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileName.split('.').pop()}`
  const newFileName = `${user?.id}/${uniqueFileName}`
  const url = await getSignedUrl(
    s3client,
    new PutObjectCommand({
      Bucket: env.AWS_S3_INPUT_BUCKET,
      Key: newFileName,
      ContentType: fileType,
    }),
    { expiresIn: 60 },
  )
  return { url, newFileName }
}

export async function getFile(
  bucket: string,
  fileName: string,
  download?: string | boolean,
  range?: string | null,
) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  })
  const fileObject = await s3client.send(getObjectCommand)
  const contentType = fileObject.ContentType || 'application/octet-stream'
  const contentLength = fileObject.ContentLength?.toString() || '0'

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': contentLength,
  }

  const createResponse = (
    status: number,
    headers: any,
    stream?: any,
    error?: string,
  ) => ({
    status,
    headers,
    stream,
    error,
  })

  const stream = fileObject.Body?.transformToWebStream()

  if (!stream)
    return createResponse(
      500,
      { 'Content-Type': 'text/plain' },
      undefined,
      'Error retrieving file data',
    )

  if (download === 'true') {
    return createResponse(
      200,
      {
        ...headers,
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
          fileName,
        )}`,
      },
      stream,
    )
  }

  if (range) {
    const [start, end] = range
      .replace(/bytes=/, '')
      .split('-')
      .map(Number)
    const total = parseInt(contentLength, 10)
    const chunkSize = (end || total - 1) - start + 1

    return createResponse(
      206,
      {
        ...headers,
        'Content-Range': `bytes ${start}-${end || total - 1}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
      },
      stream,
    )
  }

  return createResponse(200, headers, stream)
}

// Transcribe Medical (HealthScribe) Operations

export async function startMedicalScribeJob(
  params: StartMedicalScribeJobRequest,
) {
  const command = new StartMedicalScribeJobCommand(params)
  return await transcribeClient.send(command)
}

export async function getMedicalScribeJob(jobName: string) {
  const command = new GetMedicalScribeJobCommand({
    MedicalScribeJobName: jobName,
  })
  return await transcribeClient.send(command)
}

export async function listMedicalScribeJobs(params: {
  JobNameContains?: string
  maxResults?: number
  nextToken?: string
  Status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
}) {
  const command = new ListMedicalScribeJobsCommand(params)
  return await transcribeClient.send(command)
}

export async function deleteMedicalScribeJob(jobName: string) {
  const command = new DeleteMedicalScribeJobCommand({
    MedicalScribeJobName: jobName,
  })
  return await transcribeClient.send(command)
}

export async function processAudioFile(
  jobName: string,
  fileName: string,
  fileType: string,
) {
  try {
    const { url, newFileName: s3FileName } = await getPreSignedUrl(
      fileName,
      fileType,
    )

    const transcribeParams: StartMedicalScribeJobRequest = {
      MedicalScribeJobName: jobName,
      Media: {
        MediaFileUri: `s3://${env.AWS_S3_INPUT_BUCKET}/${s3FileName}`,
      },
      OutputBucketName: env.AWS_S3_OUTPUT_BUCKET,
      DataAccessRoleArn: env.AWS_TRANSCRIBE_ROLE_ARN,
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: MAX_SPEAKERS,
        ChannelIdentification: false,
      },
    }

    const startJobResponse = await startMedicalScribeJob(transcribeParams)

    if (!startJobResponse.MedicalScribeJob) {
      throw new Error('Failed to start MedicalScribe job')
    }

    // await saveToDatabase({})
    return {
      uploadUrl: url,
      jobName: jobName,
      jobStatus: startJobResponse.MedicalScribeJob.MedicalScribeJobStatus,
    }
  } catch (error) {
    console.log('Error getting presigned URL', error)
    throw new Error('Failed to get presigned URL')
  }
}

export async function checkJobStatus(jobName: string) {
  const job = await getMedicalScribeJob(jobName)

  if (job?.MedicalScribeJob?.MedicalScribeJobStatus === 'COMPLETED') {
    const summaryKey = `${jobName}/summary.json`
    const transcriptKey = `${jobName}/transcript.json`

    const summaryResponse = await s3client.send(
      new GetObjectCommand({
        Bucket: env.AWS_S3_OUTPUT_BUCKET,
        Key: summaryKey,
      }),
    )

    const transcriptResponse = await s3client.send(
      new GetObjectCommand({
        Bucket: env.AWS_S3_OUTPUT_BUCKET,
        Key: transcriptKey,
      }),
    )

    const summaryContent = await summaryResponse.Body?.transformToString()
    const transcriptContent = await transcriptResponse.Body?.transformToString()

    return {
      status: 'COMPLETED',
      summaryContent: summaryContent ? JSON.parse(summaryContent) : null,
      transcriptContent: transcriptContent
        ? JSON.parse(transcriptContent)
        : null,
    }
  }
  return {
    status: job.MedicalScribeJob?.MedicalScribeJobStatus,
  }
}
