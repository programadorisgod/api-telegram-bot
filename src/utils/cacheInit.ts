import Redis from 'ioredis'
import { config } from 'dotenv'
config()

const redis = new Redis({
  host: process.env.HOST,
  port: 6379,
  password: process.env.PASS
})

export default redis
