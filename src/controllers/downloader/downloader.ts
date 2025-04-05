import { format } from '@custom-types/format'
import { downloader } from '@services/downloader/downloader'
import { HandleError } from '@utils/httpError'
import { logger } from '@utils/logger'
import { ResultResponse } from '@utils/result'
import { Request, Response } from 'express'
import { unlink } from 'fs'
import path from 'path'
import os from 'node:os'

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

    const filePath = path.join(os.tmpdir(), 'downloads', postDownloaded.value)

    res.status(200).sendFile(filePath, (err) => {
      if (err) {
        logger.error(`Archivo no encontrado: ${filePath}`)
        res.status(404).json({ error: 'Archivo no encontrado' })
        return
      } else {
        unlink(filePath, (unlinkErr) => {
          if (unlinkErr) logger.error(unlinkErr)
        })
      }
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
