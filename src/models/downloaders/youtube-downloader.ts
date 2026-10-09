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

export class YoutubeDownloader implements Idownloader {
  async download(
    url: string,
    format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const isMp3 = format === 'mp3'
      const downloadsDir = path.join(os.tmpdir(), 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const filePrefix = `yt_${Date.now()}`
      const extraPaths = [
        path.join(os.homedir(), '.local', 'bin'),
        path.join(os.homedir(), '.deno', 'bin'),
        '/usr/local/bin',
        '/usr/bin'
      ]
      const env = {
        ...process.env,
        PATH: `${extraPaths.join(':')}:${process.env.PATH ?? ''}`
      }

      const args = [
        '--no-playlist',
        '--extractor-args',
        'youtube:player_client=android,web',
        '-P',
        downloadsDir,
        '-o',
        `${filePrefix}.%(ext)s`
      ]

      if (isMp3) {
        args.push('-x', '--audio-format', 'mp3')
      } else {
        args.push('-f', 'bv*+ba/b', '--merge-output-format', 'mp4')
      }

      args.push(url)

      await execFileAsync('yt-dlp', args, { env })

      const files = await fsPromises.readdir(downloadsDir)
      const matchedFiles = files.filter((file) => file.startsWith(filePrefix))

      if (matchedFiles.length === 0) {
        return Failure<Error>(
          new Error('No media file found after downloading with yt-dlp')
        )
      }

      const expectedExt = isMp3 ? '.mp3' : '.mp4'
      const targetFile =
        matchedFiles.find((file) => file.endsWith(expectedExt)) ??
        matchedFiles[0]

      for (const file of matchedFiles) {
        if (file !== targetFile) {
          try {
            await fsPromises.unlink(path.join(downloadsDir, file))
          } catch (cleanError) {
            logger.warn(`Failed to clean residual file ${file}:`, cleanError)
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
