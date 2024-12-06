import { OpenAPIHono } from '@hono/zod-openapi'

import { ContextVariables } from '@/types/hono'

import { login } from './login'
import { logout } from './logout'
import { register } from './register'
import { reset } from './reset-password'

export const authApp = new OpenAPIHono<{}>()
  .route('/', register)
  .route('/', login)
  .route('/', reset)
  .route('/', logout)
