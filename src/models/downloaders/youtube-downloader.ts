import { format } from '@custom-types/format'
import { chromium } from '@playwright/test'
import { Idownloader } from '@interfaces/downloader.interface'
import { logger } from '@utils/logger'
import { Failure, ResultResponse, Success } from '@utils/result'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export class YoutubeDownloader implements Idownloader {
  async download(
    url: string,
    format?: format
  ): Promise<ResultResponse<string, Error>> {
    try {
      const FORMAT_MP3 = 'mp3'
      const AUDIO_QUALITY = 128
      const browser = await chromium.launch({ headless: true })
      const context = await browser.newContext({ acceptDownloads: true })
      const page = await context.newPage()

      await page.goto('https://y2mate.net.co/es/1')

      await page.getByPlaceholder('Search or paste link here...').fill(url)

      await page.getByRole('button', { name: 'Start' }).click()
      await page.locator('#downloadSection').waitFor()

      const options = await page.locator('#quality option').all()

      let maxQuality: number = 0
      for (const option of options) {
        const value = await option.getAttribute('value')

        const quality = Number(value?.trim())

        if (format === FORMAT_MP3 && quality === AUDIO_QUALITY) {
          maxQuality = quality
          break
        }

        if (!Number.isNaN(quality) && quality > maxQuality) {
          maxQuality = quality
        }
      }

      await page.locator('#quality').selectOption(String(maxQuality))
      await page.getByText('Get Link').click()

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('div.download.btn').click()
      ])

      const downloadsDir = path.join(os.tmpdir(), 'downloads')

      if (!existsSync(downloadsDir)) {
        mkdirSync(downloadsDir, { recursive: true })
      }

      const fileName = download.suggestedFilename()
      const filePath = path.join(downloadsDir, fileName)

      await download.saveAs(filePath)

      await browser.close()

      return Success<string>(fileName)
    } catch (error) {
      logger.error(error)
      return Failure<Error>(error as Error)
    }
  }
}
