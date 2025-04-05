import { Idownloader } from '@interfaces/downloader.interface'

export abstract class DownloaderFactory {
  private donwloader!: Idownloader
  public getDownloader(): Idownloader {
    this.donwloader = this.create()

    return this.donwloader
  }

  protected abstract create(): Idownloader
}
