import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './src/lib/db/sqlite.db',
  },
  verbose: true,
  strict: true,
} satisfies Config
