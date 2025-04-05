import { Idownloader } from "@interfaces/downloader.interface";
import { DownloaderFactory } from "./downloader-factory";
import { YoutubeDownloader } from "@models/downloaders/youtube-downloader";

export class YoutubeDownloaderFactory extends DownloaderFactory {
  protected create(): Idownloader {
    return new YoutubeDownloader()
  }
}
