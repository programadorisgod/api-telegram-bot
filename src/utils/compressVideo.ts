import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { promises as fsPromises, existsSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { logger } from '@utils/logger'

const execFileAsync = promisify(execFile)

// Telegram limits file uploads for bots to 50 MB (52,428,800 bytes).
// We trigger compression if size > 49 MB, targeting ~45 MB to stay safely within limits.
const MAX_FILE_SIZE_BYTES = 49 * 1024 * 1024
const TARGET_FILE_SIZE_BYTES = 45 * 1024 * 1024

const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.webm',
  '.mkv',
  '.mov',
  '.avi',
  '.flv'
])

export const compressVideoIfNeeded = async (
  filePath: string,
  maxBytes: number = MAX_FILE_SIZE_BYTES
): Promise<string> => {
  const originalFileName = path.basename(filePath)
  if (!existsSync(filePath)) {
    return originalFileName
  }

  const ext = path.extname(filePath).toLowerCase()
  if (!VIDEO_EXTENSIONS.has(ext)) {
    return originalFileName
  }

  const stat = await fsPromises.stat(filePath)
  if (stat.size <= maxBytes) {
    return originalFileName
  }

  logger.info(
    `Video ${originalFileName} (${(stat.size / (1024 * 1024)).toFixed(2)} MB) exceeds ${(maxBytes / (1024 * 1024)).toFixed(0)} MB limit. Starting compression...`
  )

  const dir = path.dirname(filePath)
  const baseNameWithoutExt = path.basename(filePath, ext)
  const tempCompressedPath = path.join(
    dir,
    `compressed_${Date.now()}_${baseNameWithoutExt}.mp4`
  )

  const extraPaths = [
    path.join(os.homedir(), '.local', 'bin'),
    '/usr/local/bin',
    '/usr/bin'
  ]
  const env = {
    ...process.env,
    PATH: `${extraPaths.join(':')}:${process.env.PATH ?? ''}`
  }

  try {
    let duration = 0
    try {
      const { stdout } = await execFileAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          filePath
        ],
        { env }
      )
      duration = parseFloat(stdout.trim())
    } catch (probeErr) {
      logger.warn('Failed to get video duration with ffprobe:', probeErr)
    }

    const ffmpegArgs: string[] = ['-y', '-i', filePath]

    if (duration > 0 && !isNaN(duration)) {
      const targetBits = TARGET_FILE_SIZE_BYTES * 8
      const totalBitrate = Math.floor(targetBits / duration)
      const audioBitrate = Math.min(
        128000,
        Math.max(64000, Math.floor(totalBitrate * 0.15))
      )
      const videoBitrate = Math.max(150000, totalBitrate - audioBitrate)

      ffmpegArgs.push(
        '-vf',
        "scale='if(gte(iw,ih),min(1280,iw),-2)':'if(gte(iw,ih),-2,min(1280,ih))'",
        '-c:v',
        'libx264',
        '-b:v',
        `${videoBitrate}`,
        '-maxrate',
        `${Math.floor(videoBitrate * 1.3)}`,
        '-bufsize',
        `${videoBitrate * 2}`,
        '-preset',
        'ultrafast',
        '-c:a',
        'aac',
        '-b:a',
        `${audioBitrate}`,
        '-movflags',
        '+faststart',
        tempCompressedPath
      )
    } else {
      ffmpegArgs.push(
        '-vf',
        "scale='if(gte(iw,ih),min(1280,iw),-2)':'if(gte(iw,ih),-2,min(1280,ih))'",
        '-c:v',
        'libx264',
        '-crf',
        '28',
        '-preset',
        'ultrafast',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-movflags',
        '+faststart',
        tempCompressedPath
      )
    }

    await execFileAsync('ffmpeg', ffmpegArgs, { env })

    if (existsSync(tempCompressedPath)) {
      const compressedStat = await fsPromises.stat(tempCompressedPath)
      logger.info(
        `Video compressed: ${(stat.size / (1024 * 1024)).toFixed(2)} MB -> ${(compressedStat.size / (1024 * 1024)).toFixed(2)} MB`
      )

      if (compressedStat.size < stat.size) {
        if (ext === '.mp4') {
          await fsPromises.unlink(filePath)
          await fsPromises.rename(tempCompressedPath, filePath)
          return originalFileName
        } else {
          const finalMp4Name = `${baseNameWithoutExt}.mp4`
          const finalPath = path.join(dir, finalMp4Name)
          await fsPromises.unlink(filePath)
          await fsPromises.rename(tempCompressedPath, finalPath)
          return finalMp4Name
        }
      } else {
        await fsPromises.unlink(tempCompressedPath)
      }
    }
  } catch (error) {
    logger.error('Error during video compression:', error)
    if (existsSync(tempCompressedPath)) {
      try {
        await fsPromises.unlink(tempCompressedPath)
      } catch {}
    }
  }

  return originalFileName
}
