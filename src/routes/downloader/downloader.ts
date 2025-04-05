import { postDownloader } from '@controllers/downloader/downloader'
import { Router } from 'express'

const routerDownloader = Router()

const path = '/api/v1/download'

routerDownloader.get(`${path}`, postDownloader)

export default routerDownloader
