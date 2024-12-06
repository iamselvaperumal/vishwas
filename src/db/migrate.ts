import { migrate } from 'drizzle-orm/postgres-js/migrator'

import postgres from 'postgres'

import { env } from '@/utils/env.mjs'

import db from '.'

const client = postgres(env.DATABASE_URL as string, { max: 1 })

export const migrateDB = async () => {
  try {
    console.log('🟠 Migrating client')
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('🟢 Successfully migrated')
    await client.end()
  } catch (error) {
    console.log('🔴 Error migrating client', error)
  }
}

migrateDB()
