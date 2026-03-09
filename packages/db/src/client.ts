import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var __learningPgPool: Pool | undefined
}

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:6432/learning'

const pool = globalThis.__learningPgPool ?? new Pool({ connectionString })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__learningPgPool = pool
}

export const db = drizzle({ client: pool, schema })
export { pool }
