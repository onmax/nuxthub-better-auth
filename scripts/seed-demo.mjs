import { readFile } from 'node:fs/promises'
import { createClient } from '@libsql/client'

if (process.argv.length > 2) {
  throw new Error('Usage: pnpm db:seed:demo. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to seed Turso instead of local SQLite.')
}
if (process.env.TURSO_AUTH_TOKEN && !process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_AUTH_TOKEN requires TURSO_DATABASE_URL. No demo accounts were created.')
}

const sql = await readFile(new URL('./demo-users.sql', import.meta.url), 'utf8')
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:.data/db/sqlite.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

try {
  await client.batch(sql.split('--> statement-breakpoint').map(statement => statement.trim()).filter(Boolean), 'write')
  console.log('Demo accounts seeded. These accounts have public passwords and must not be used in production.')
}
finally {
  client.close()
}
