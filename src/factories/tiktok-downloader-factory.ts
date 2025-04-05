import { TikTokDownloader } from "@models/downloaders/tiktok-downloader";
import { DownloaderFactory } from "./downloader-factory";
import { Idownloader } from "@interfaces/downloader.interface";

export class TikTokDownloaderFactory extends DownloaderFactory {
  protected create(): Idownloader {
    return new TikTokDownloader()
  }
}
