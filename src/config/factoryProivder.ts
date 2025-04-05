import { socialNetworksType } from '@custom-types/socialNetworks'
import { DownloaderFactory } from '@factories/downloader-factory'
import { InstagramDownloaderFactory } from '@factories/instagram-downloader-factory'
import { TikTokDownloaderFactory } from '@factories/tiktok-downloader-factory'
import { XDownloaderFactory } from '@factories/x-downloader-factory'
import { YoutubeDownloaderFactory } from '@factories/youtube-downloader-factory'
import { detectSocialNetWork } from '@utils/detectSocialNetwork'

export const factoryProvider = (url: string): DownloaderFactory | null => {
  const downloaders: Map<socialNetworksType, DownloaderFactory> = new Map<
    socialNetworksType,
    DownloaderFactory
  >([
    ['x', new XDownloaderFactory()],
    ['youtube', new YoutubeDownloaderFactory()],
    ['instagram', new InstagramDownloaderFactory()],
    ['tiktok', new TikTokDownloaderFactory()]
  ])
  const socialNetwork = detectSocialNetWork(url)

  if (!socialNetwork) {
    return null
  }

  return downloaders.get(socialNetwork)!
}
