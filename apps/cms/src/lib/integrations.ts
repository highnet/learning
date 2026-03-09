import amqp from 'amqplib'
import Redis from 'ioredis'

let redisClient: Redis | null = null
let rabbitConnection: amqp.ChannelModel | null = null

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
  }

  return redisClient
}

export async function getRabbitConnection() {
  if (!rabbitConnection) {
    rabbitConnection = await amqp.connect(
      process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    )
  }

  return rabbitConnection
}
