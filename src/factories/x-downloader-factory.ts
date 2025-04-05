import { Idownloader } from "@interfaces/downloader.interface";
import { XDownloader } from "@models/downloaders/x-downloader";
import { DownloaderFactory } from "./downloader-factory";

export class XDownloaderFactory extends DownloaderFactory {
  protected create(): Idownloader {
    return new XDownloader()
  }
}
