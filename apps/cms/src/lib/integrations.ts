import amqp from 'amqplib'
import Redis from 'ioredis'

let redisClient: Redis | null = null
let rabbitConnection: amqp.ChannelModel | null = null
let rabbitChannel: amqp.Channel | null = null

const blogExchange = 'learning.blog'

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

export async function getRabbitChannel() {
  if (!rabbitChannel) {
    const connection = await getRabbitConnection()

    rabbitChannel = await connection.createChannel()
    await rabbitChannel.assertExchange(blogExchange, 'topic', { durable: true })
  }

  return rabbitChannel
}

export async function publishEvent(routingKey: string, payload: Record<string, unknown>) {
  const channel = await getRabbitChannel()

  channel.publish(blogExchange, routingKey, Buffer.from(JSON.stringify(payload)), {
    contentType: 'application/json',
    persistent: true,
    timestamp: Date.now(),
  })
}
