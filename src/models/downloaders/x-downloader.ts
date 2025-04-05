import { format } from '@custom-types/format'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { TwitterDL } from 'twitter-downloader'
import { Twitter } from 'twitter-downloader/lib/types/twitter'

export class XDownloader implements Idownloader {
  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const twitter:Twitter = await TwitterDL(url)

      if (twitter.status !== 'success' || !twitter.result) {
        return Failure<Error>(new Error('Unable to download resource'))
      }

      let postUrl: string = ''

      const { id } = twitter.result
      const { media } = twitter.result

      postUrl = media?.[0]?.videos?.[2]?.url ?? media?.[0]?.image ?? ''

      if (!postUrl) {
        return Failure<Error>(new Error('Resource not found'))
      }

      

      const post: Response = await fetch(postUrl)

      if (!post.body) {
        return Failure<Error>(new Error('Error getting the stream'))
      }

      const bytes: Uint8Array<ArrayBufferLike> = await post.bytes()

      const buffer: Buffer<ArrayBuffer> = Buffer.from(bytes)

      const stream: Readable = Readable.from(buffer)
      const extension =
        media[0]?.type === 'video'
          ? 'mp4'
          : `${media[0]?.image?.split('/')[4]?.split('.').pop()}`
      const filename = `${id}.${extension}`

      await pipeline(stream, createWriteStream(`./src/downloads/${filename}`))
      
      return Success<string>(filename)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
