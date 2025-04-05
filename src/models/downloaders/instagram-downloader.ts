import { format } from '@custom-types/format'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import os from 'node:os'
export class InstagramDownloader implements Idownloader {
  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const instagramDownloaderUrl = `${process.env.INSTAGRAM_DOWNLOADER_URL}?postUrl=${url}`
      const response: Response = await fetch(instagramDownloaderUrl)

      if (!response.ok) {
        return Failure<Error>(new Error('Unable to download resource'))
      }
      const data = await response.json()

      if (data?.status !== 'success') {
        return Failure<Error>(new Error('Unable to download resource'))
      }

      const { data: info } = data

      const post: Response = await fetch(info.videoUrl)

      if (!post.body) {
        return Failure<Error>(new Error('Error getting the stream'))
      }

      const arrayBuffer: ArrayBuffer = await post.arrayBuffer()

      const buffer = Buffer.from(arrayBuffer)

      const stream: Readable = Readable.from(buffer)

      const downloadsDir = path.join(process.cwd(), 'src', 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePath = path.join(os.tmpdir(), 'downloads', info.filename)

      await pipeline(stream, createWriteStream(filePath))

      return Success<string>(info.filename)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
