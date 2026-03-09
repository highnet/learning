export function GET() {
  return Response.json({
    name: '@learning/web',
    ok: true,
    timestamp: new Date().toISOString(),
  })
}
