import { factoryProvider } from '@config/factoryProivder'
import { format } from '@custom-types/format'
import { CustomError } from '@utils/httpError'
import { Failure, ResultResponse, Success } from '@utils/result'
import { compressVideoIfNeeded } from '@utils/compressVideo'
import { logger } from '@utils/logger'
import path from 'node:path'
import os from 'node:os'

export const downloader = async (
  url: string,
  format?: format
): Promise<ResultResponse<string, Error>> => {
  const factory = factoryProvider(url)

  if (!factory) {
    return Failure<CustomError>(
      new CustomError(403, 'Social network no supported')
    )
  }

  const downloader = factory.getDownloader()

  const response = await downloader.download(url, format)

  if (!response.success) {
    return response
  }

  if (format !== 'mp3') {
    try {
      const downloadsDir = path.join(os.tmpdir(), 'downloads')
      const fullPath = path.join(downloadsDir, response.value)
      const finalFileName = await compressVideoIfNeeded(fullPath)
      return Success<string>(finalFileName)
    } catch (compressError) {
      logger.warn('Failed to compress video if needed:', compressError)
    }
  }

  return response
}
