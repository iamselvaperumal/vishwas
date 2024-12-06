import { OpenAPIHono } from '@hono/zod-openapi'

import { ContextVariables } from '@/types/hono'

import { resetPassword } from './reset'
import { verifyEmail } from './verify-email'

export const reset = new OpenAPIHono<{}>()
  .route('/', verifyEmail)
  .route('/', resetPassword)
