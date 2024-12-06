import { hc } from 'hono/client'

import type { AppType } from '@/server'

import { env } from '@/utils/env.mjs'

export const client = hc<AppType>(env.NEXT_PUBLIC_APP_URL)
