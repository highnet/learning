export async function GET() {
  return Response.json({ status: 'ok', app: 'cms', ts: new Date().toISOString() })
}
