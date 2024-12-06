type TranscriptSegment = {
  Content: string
  SegmentId: string
  EndAudioTime: number
  BeginAudioTime: number
  SectionDetails?: any // Add specific type if available
}

type Conversation = {
  JobName: string
  JobType: string
  LanguageCode: string
  ConversationId: string
  TranscriptSegments: TranscriptSegment[]
}

export type TranscriptedData = {
  Conversation: Conversation
}

export function FormattedTranscript({
  data,
}: {
  data: TranscriptedData | null
}): JSX.Element {
  if (!data || !data.Conversation) {
    return <p>No Transcript Available</p>
  }

  const { TranscriptSegments } = data.Conversation

  return (
    <div>
      <div>
        {TranscriptSegments.map((segment) => (
          <div key={segment.SegmentId} className='mb-4'>
            <p>{segment.Content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
