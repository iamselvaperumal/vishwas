import { env } from '@/utils/env.mjs'
import type { Config } from 'drizzle-kit'

if (!env.DATABASE_URL) {
  console.log('🔴 Cannot find database url')
}

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL || '',
    ssl: {
      rejectUnauthorized: false,
    },
  },
} satisfies Config
