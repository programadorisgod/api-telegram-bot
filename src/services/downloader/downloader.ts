import { factoryProvider } from '@config/factoryProivder'
import { format } from '@custom-types/format'
import { CustomError } from '@utils/httpError'
import { Failure, ResultResponse } from '@utils/result'

export const downloader = async (
  url: string,
  format?: format
): Promise<ResultResponse<string, Error>> => {
  const factory = factoryProvider(url)
  console.log(factory, 'factory')

  if (!factory) {
    return Failure<CustomError>(
      new CustomError(403, 'Social network no supported')
    )
  }

  const downloader = factory.getDownloader()

  const response = await downloader.download(url, format)

  return response
}
