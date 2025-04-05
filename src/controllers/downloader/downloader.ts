import { format } from '@custom-types/format'
import { downloader } from '@services/downloader/downloader'
import { HandleError } from '@utils/httpError'
import { logger } from '@utils/logger'
import { ResultResponse } from '@utils/result'
import { Request, Response } from 'express'
import { unlink } from 'fs'
import path from 'path'

export const postDownloader = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postUrl: url, format } = req.query
  try {
    const postDownloaded: ResultResponse<string, Error> = await downloader(
      url as string,
      format as format
    )

    if (!postDownloaded.success) {
      await HandleError(postDownloaded.error, res)
      return
    }

    const filePath = path.join(
      process.cwd(),
      'src/downloads/',
      postDownloaded.value
    )
    res.status(200).sendFile(filePath, (err) => {
      if (err) {
        logger.error(err)
      } else {
        unlink(filePath, (unlinkErr) => {
          if (unlinkErr) logger.error(unlinkErr)
        })
      }
    })
  } catch (error) {}
}
