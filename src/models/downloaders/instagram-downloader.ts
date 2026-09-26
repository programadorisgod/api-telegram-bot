import { format } from '@custom-types/format'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, promises as fsPromises } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const execFileAsync = promisify(execFile)

export class InstagramDownloader implements Idownloader {
  private extractShortcode(url: string): string | null {
    try {
      const parsedUrl = new URL(url)
      const match = parsedUrl.pathname.match(
        /(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i
      )
      if (match?.[1]) {
        return match[1]
      }
    } catch {
      const match = url.match(/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/i)
      if (match?.[1]) {
        return match[1]
      }
    }
    return null
  }

  async download(
    url: string,
    _format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const shortcode = this.extractShortcode(url)
      if (!shortcode) {
        return Failure<Error>(
          new Error(`Could not extract Instagram shortcode from URL: ${url}`)
        )
      }

      const downloadsDir = path.join(os.tmpdir(), 'downloads')
      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePrefix = `ig_${shortcode}_${Date.now()}`
      const extraPaths = [
        path.join(os.homedir(), '.local', 'bin'),
        '/usr/local/bin',
        '/usr/bin'
      ]
      const env = {
        ...process.env,
        PATH: `${extraPaths.join(':')}:${process.env.PATH ?? ''}`
      }

      const args = [
        '--no-video-thumbnails',
        '--no-captions',
        '--no-metadata-json',
        '--no-compress-json',
        '--dirname-pattern',
        downloadsDir,
        '--filename-pattern',
        filePrefix,
        '--',
        `-${shortcode}`
      ]

      await execFileAsync('instaloader', args, { env })

      const files = await fsPromises.readdir(downloadsDir)
      const matchedFiles = files.filter((file) => file.startsWith(filePrefix))

      if (matchedFiles.length === 0) {
        return Failure<Error>(
          new Error('No media file found after downloading with instaloader')
        )
      }

      const videoFile = matchedFiles.find((file) => file.endsWith('.mp4'))
      const targetFile = videoFile ?? matchedFiles[0]

      for (const file of matchedFiles) {
        if (file !== targetFile) {
          try {
            await fsPromises.unlink(path.join(downloadsDir, file))
          } catch (cleanError) {
            logger.warn(`Failed to clean auxiliary file ${file}:`, cleanError)
          }
        }
      }

      return Success<string>(targetFile)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
