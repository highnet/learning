// Runs once when the Next.js server starts (before any requests).
// Pre-initialises Payload so the first request to /admin isn't slow.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    const { getRabbitChannel, getRedisClient } = await import('./lib/integrations')

    await getPayload({ config })

    try {
      const redis = getRedisClient()

      if (redis.status === 'wait') {
        await redis.connect()
      }
    } catch (error) {
      console.error('Failed to warm Redis during startup', error)
    }

    try {
      await getRabbitChannel()
    } catch (error) {
      console.error('Failed to warm RabbitMQ during startup', error)
    }
  }
}
