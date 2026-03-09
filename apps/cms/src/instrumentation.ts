// Runs once when the Next.js server starts (before any requests).
// Pre-initialises Payload so the first request to /admin isn't slow.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPayload } = await import('payload')
    const { default: config } = await import('@payload-config')
    await getPayload({ config })
  }
}
