import { OpenAPIHono } from '@hono/zod-openapi'

import { ContextVariables } from '@/types/hono'

import { secret } from './secret'

export const secretApp = new OpenAPIHono<{
  Variables: ContextVariables
}>()
  .use(async (c, next) => {
    const user = c.get('user')
    if (!user) {
      c.status(401)
      return c.json(
        { error: 'Unauthorized', issues: [{ message: 'Unauthorized usage' }] },
        401,
      )
    }

    return next()
  })
  .route('/', secret)
