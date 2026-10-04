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
import os from 'node:os'
// Evita caracteres inválidos en nombres de archivo
const sanitizeFilename = (name: string) => name.replace(/[\/\\?%*:|"<>]/g, '_')

interface VxMediaExtended {
  altText?: string | null
  duration_millis?: number
  id_str?: string
  size?: { height: number; width: number }
  thumbnail_url?: string
  type: 'video' | 'image' | 'gif' | string
  url: string
}

interface VxTweetResponse {
  conversationID?: string
  date?: string
  hasMedia?: boolean
  mediaURLs?: string[]
  media_extended?: VxMediaExtended[]
  text?: string
  tweetID?: string
  user_name?: string
  user_screen_name?: string
}

const MEDIA_TYPE_EXTENSIONS: Record<string, string> = {
  video: 'mp4',
  gif: 'gif'
}

export class XDownloader implements Idownloader {
  private resolveExtension(fileUrl: string, defaultExt: string): string {
    const ext = path.extname(new URL(fileUrl).pathname).slice(1).toLowerCase()
    return ext && ext.length <= 4 ? ext : defaultExt
  }

  private resolveVxMedia(data: VxTweetResponse): {
    fileUrl: string
    extension: string
  } | null {
    if (data.media_extended?.length) {
      const selected =
        data.media_extended.find((m) => m.type === 'video') ??
        data.media_extended[0]

      const extension =
        MEDIA_TYPE_EXTENSIONS[selected.type] ??
        this.resolveExtension(selected.url, 'jpg')

      return { fileUrl: selected.url, extension }
    }

    if (data.mediaURLs?.length) {
      const fileUrl = data.mediaURLs[0]
      return {
        fileUrl,
        extension: this.resolveExtension(fileUrl, 'mp4')
      }
    }

    return null
  }

  private async getMediaInfoFromVx(url: string): Promise<{
    fileUrl: string
    id: string
    extension: string
  } | null> {
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
      const parsedUrl = new URL(normalizedUrl)
      const apiUrl = `https://api.vxtwitter.com${parsedUrl.pathname}`

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'TelegramBot (like TwitterBot)',
          Accept: 'application/json'
        }
      })

      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('application/json')
      ) {
        return null
      }

      const data: VxTweetResponse = await response.json()
      const media = this.resolveVxMedia(data)

      if (!media) {
        return null
      }

      const id =
        data.tweetID ??
        parsedUrl.pathname.split('/').filter(Boolean).pop() ??
        Date.now().toString()

      return { fileUrl: media.fileUrl, id, extension: media.extension }
    } catch {
      return null
    }
  }

  private async getMediaInfoFromFallback(url: string): Promise<{
    fileUrl: string
    id: string
    extension: string
  } | null> {
    try {
      const twitter: Twitter = await TwitterDL(url)
      if (twitter.status !== 'success' || !twitter.result) {
        return null
      }

      const { id, media } = twitter.result
      const firstMedia = media?.[0]
      const fileUrl: string =
        firstMedia?.videos?.[2]?.url ??
        firstMedia?.videos?.[0]?.url ??
        firstMedia?.image ??
        ''

      if (!fileUrl) {
        return null
      }

      const extension =
        MEDIA_TYPE_EXTENSIONS[firstMedia?.type ?? ''] ??
        this.resolveExtension(fileUrl, 'jpg')

      return { fileUrl, id, extension }
    } catch {
      return null
    }
  }

  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      // 1. Intentar primero con la API nativa de vxTwitter
      let mediaInfo = await this.getMediaInfoFromVx(url)

      // 2. Fallback a twitter-downloader en caso de que vxTwitter no responda
      if (!mediaInfo) {
        mediaInfo = await this.getMediaInfoFromFallback(url)
      }

      if (!mediaInfo) {
        return Failure<Error>(
          new Error('Resource not found or unable to download')
        )
      }

      const { fileUrl, id, extension } = mediaInfo

      const post: Response = await fetch(fileUrl)
      if (!post.body) {
        return Failure<Error>(new Error('Error getting the stream'))
      }

      const arrayBuffer: ArrayBuffer = await post.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const stream: Readable = Readable.from(buffer)

      const filename = sanitizeFilename(`x_${id}_${Date.now()}.${extension}`)
      const downloadsDir = path.join(os.tmpdir(), 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePath = path.join(downloadsDir, filename)
      await pipeline(stream, createWriteStream(filePath))

      return Success<string>(filename)
    } catch (error) {
      console.log(error)
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
