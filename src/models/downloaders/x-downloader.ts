import { format } from '@custom-types/format'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { TwitterDL } from 'twitter-downloader'
import { Twitter } from 'twitter-downloader/lib/types/twitter'
import path from 'node:path'

// Evita caracteres inválidos en nombres de archivo
const sanitizeFilename = (name: string) => name.replace(/[\/\\?%*:|"<>]/g, '_')

export class XDownloader implements Idownloader {
  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const twitter: Twitter = await TwitterDL(url)

      if (twitter.status !== 'success' || !twitter.result) {
        return Failure<Error>(new Error('Unable to download resource'))
      }

      const { id, media } = twitter.result
      const fileUrl: string =
        media?.[0]?.videos?.[2]?.url ?? media?.[0]?.image ?? ''

      if (!fileUrl) {
        return Failure<Error>(new Error('Resource not found'))
      }

      const post: Response = await fetch(fileUrl)
      if (!post.body) {
        return Failure<Error>(new Error('Error getting the stream'))
      }

      const bytes: Uint8Array = await post.bytes()
      const buffer: Buffer = Buffer.from(bytes)
      const stream: Readable = Readable.from(buffer)

      const extension =
        media[0]?.type === 'video'
          ? 'mp4'
          : media[0]?.image?.split('.').pop() || 'jpg'

      const filename = sanitizeFilename(`${id}.${extension}`)

      const downloadsDir = path.join(process.cwd(), 'src', 'downloads')
      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePath = path.join(downloadsDir, filename)
      await pipeline(stream, createWriteStream(filePath))

      return Success<string>(filename)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
