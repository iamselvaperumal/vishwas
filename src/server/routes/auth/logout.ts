import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { getCookie, setCookie } from 'hono/cookie'

import { lucia } from '@/auth'

import { ContextVariables } from '@/types/hono'

export const logout = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: 'get',
    path: '/auth/logout',
    tags: ['Auth'],
    summary: 'Logout',
    description: 'Logs out the current user and redirects to the login page.',
    responses: {
      200: {
        description: 'Success',
      },
      400: {
        description: 'Not Found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  }),
  async (c) => {
    const sessionId = getCookie(c, lucia.sessionCookieName)

    if (!sessionId) {
      return c.redirect('/auth/login')
    }

    await lucia.invalidateSession(sessionId)
    setCookie(c, lucia.sessionCookieName, '', {
      expires: new Date(0),
      sameSite: 'Strict',
    })
    return c.redirect('/')
  },
)
