import swaggerUi from 'swagger-ui-express'
import { type Request, type Response } from 'express'

import swaggerJSDoc, {
  type OAS3Definition,
  type OAS3Options
} from 'swagger-jsdoc'

import { config } from 'dotenv'

config()

const swaggerDefinition: OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'API',
    version: '1.0.0',
    description: 'API documentation server bot telegram'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}`,
      description: 'Development server'
    },
    {
      url: `${process.env.URL_PRODUCTION}`,
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      chat: {
        type: 'object',
        required: ['chatId'],
        properties: {
          chatId: {
            type: 'number'
          },
          list: {
            type: 'array'
          }
        }
      },
      command: {
        type: 'object',
        required: ['name', 'description', 'type', 'command', 'creator'],
        properties: {
          name: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          type: {
            type: 'string'
          },
          command: {
            type: 'string'
          },
          creator: {
            type: 'string'
          }
        }
      }
    }
  }
}

const isProduction = process.env.NODE_ENV === 'production'
const apis = isProduction
  ? [
      `${process.cwd()}/build/routes/chat/*.js`,
      `${process.cwd()}/build/routes/command/*.js`
    ]
  : [
      `${process.cwd()}/src/routes/chat/*.ts`,
      `${process.cwd()}/src/routes/command/*.ts`
    ]

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: apis
}

const swgagerSpec = swaggerJSDoc(swaggerOptions)

export const swaggerDocs = (app: any, port: number | string): void => {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swgagerSpec))
  app.get('/api/v1/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swgagerSpec)
  })
  console.log(` 📑 📑Swagger running on http://localhost:${port}/api/v1/docs`)
}
