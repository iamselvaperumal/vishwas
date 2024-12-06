import { OpenAPIHono } from '@hono/zod-openapi'

import { ContextVariables } from '@/types/hono'

import { sendRegistrationCode } from './send-registration-code'
import { verifyCode } from './verify'

export const register = new OpenAPIHono<{}>()
  .route('/', sendRegistrationCode)
  .route('/', verifyCode)
