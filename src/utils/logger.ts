import { createLogger, transports, format } from 'winston'

const { combine, timestamp, printf, colorize, simple, json } = format

const devFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const isDevelopment = process.env.NODE_ENV === 'development'
const fileName = isDevelopment ? `error.log` : `/build/error.log`

export const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isDevelopment ? colorize() : json(),
    isDevelopment ? devFormat : simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: fileName,
      level: 'error'
    })
  ]
})
