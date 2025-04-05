import { Idownloader } from '@interfaces/downloader.interface'
import { DownloaderFactory } from './downloader-factory'
import { InstagramDownloader } from '@models/downloaders/instagram-downloader'

export class InstagramDownloaderFactory extends DownloaderFactory {
  protected create(): Idownloader {
    return new InstagramDownloader()
  }
}
