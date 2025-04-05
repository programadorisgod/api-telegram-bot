import express, { json, urlencoded } from 'express'
import cors from 'cors'
import morgan from 'morgan'

import { findPort } from '@config/findPort'
import routerChat from '@routes/chat/chat'
import { connectionDatabase } from '@config/connectionDatabase'
import RouterCommand from '@routes/command/command'
import { swaggerDocs as v1SwaggerDocs } from './docs/swagger'
import '@config/isToEquals'
import { logger } from '@utils/logger'
import routerDownloader from '@routes/downloader/downloader'

const PORT = process.env.PORT || process.argv[3] || 3000

const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/', (_, res) => {
  res.send('its working!')
})

app.use(routerChat)
app.use(RouterCommand)
app.use(routerDownloader)

void connectionDatabase()
void findPort(PORT).then((port) => {
  app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Server running on port http://localhost:${port}`)
    }
    v1SwaggerDocs(app, port)
  })
})

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, {
    stack: err.stack
  })
})

export default app
