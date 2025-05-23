import { format } from '@custom-types/format'
import ytdl from '@distube/ytdl-core'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  type WriteStream
} from 'node:fs'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import os from 'node:os'

export class YoutubeDownloader implements Idownloader {
  async download(
    url: string,
    format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const info: ytdl.videoInfo = await ytdl.getBasicInfo(url)

      const { videoDetails } = info

      const filename: string = `${videoDetails.title}.${format}`

      const filter: ytdl.Filter =
        format && format === 'mp4' ? 'audioandvideo' : 'audioonly'

      const streamYtdl: Readable = ytdl(url, { filter })

      const downloadsDir = path.join(os.tmpdir(), 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePath = path.join(downloadsDir, filename)

      const writeStream: WriteStream = createWriteStream(filePath)

      await pipeline(streamYtdl, writeStream).catch((err) => {
        logger.error(err)
        return Failure<Error>(new Error('File not found'))
      })

      return Success<string>(filename)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
