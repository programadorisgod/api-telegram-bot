import { format } from '@custom-types/format'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'path'
import os from 'node:os'

// Sanitiza caracteres ilegales para nombres de archivo
const sanitizeFilename = (name: string) => name.replace(/[\/\\?%*:|"<>]/g, '_')

export class TikTokDownloader implements Idownloader {
  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const tiktokUrl = `https://tikwm.com/api?url=${encodeURIComponent(url)}`
      const response: Response = await fetch(tiktokUrl)
      const json = await response.json()

      if (!response.ok || json?.code !== 0 || (!json?.data?.play && !json?.data?.wmplay)) {
        const errorMsg = json?.msg || 'No se pudo obtener el video de TikTok'
        return Failure<Error>(new Error(errorMsg))
      }

      const videoUrl = json.data.play || json.data.wmplay
      const id = json?.data?.id ?? Date.now().toString()
      const filename = `tiktok_${id}_${Date.now()}.mp4`

      const videResponse: Response = await fetch(videoUrl)
      if (!videResponse.ok || !videResponse.body) {
        return Failure<Error>(new Error(`Error descargando el archivo de TikTok (HTTP ${videResponse.status})`))
      }

      const bytes: ArrayBuffer = await videResponse.arrayBuffer()
      const buffer: Buffer = Buffer.from(bytes)
      const streamVideo: Readable = Readable.from(buffer)

      const downloadsDir = path.join(os.tmpdir(), 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePath = path.join(downloadsDir, filename)
      await pipeline(streamVideo, createWriteStream(filePath))

      return Success<string>(filename)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
