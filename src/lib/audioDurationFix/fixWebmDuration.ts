import { fixParsedWebmDuration } from './fixParsedWebmDuration'
import { Options } from './parser/Options'
import { WebmFile } from './parser/WebmFile'

export const fixWebmDuration = async (
  blob: Blob,
  duration: number,
  options?: Options,
): Promise<Blob> => {
  try {
    const file = await WebmFile.fromBlob(blob)
    if (fixParsedWebmDuration(file, duration, options)) {
      return file.toBlob(blob.type)
    }
  } catch (error) {
    console.error('Error fixing WebM duration:', error)
  }

  return blob
}
