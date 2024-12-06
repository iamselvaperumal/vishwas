import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

import { emailVerificationCodes, users } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

import { lucia } from '@/auth'
import db from '@/db'
import { verificationCodeSchema } from '@/validators/auth.schema'
import { isWithinExpirationDate } from 'oslo'

import { ContextVariables } from '@/types/hono'

export const verifyCode = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: 'post',
    path: '/auth/register/verify-code',
    tags: ['Auth'],
    summary: 'Register/Verify Code',
    description:
      'Verifies the confirmation code and completes the registration process.',
    request: {
      body: {
        description: 'Verification code Request body',
        content: {
          'application/json': {
            schema: verificationCodeSchema.openapi('VerificationCode', {
              example: {
                email: 'example@example.com',
                verificationCode: '123456',
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Successfully verified the user',
      },
      400: {
        description: 'Bad Request',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  }),

  async (c) => {
    try {
      const { email, verificationCode } = c.req.valid('json')

      const existingUser = await db.query.users.findFirst({
        where: eq(users?.email, email!),
      })

      if (!existingUser) {
        return c.json({ error: 'User not found' }, 400)
      }

      if (existingUser.emailVerified) {
        return c.json({ error: 'Email already verified' }, 400)
      }

      const code = await db.query.emailVerificationCodes.findFirst({
        where: and(
          eq(emailVerificationCodes.userId, existingUser.id),
          eq(emailVerificationCodes.code, verificationCode),
        ),
      })

      if (!code || !isWithinExpirationDate(code.expiresAt)) {
        return c.json({ error: 'Invalid or expired verification code' }, 400)
      }

      try {
        await db.transaction(async (tx) => {
          await tx
            .update(users)
            .set({
              emailVerified: true,
            })
            .where(eq(users.id, existingUser.id))

          await tx
            .delete(emailVerificationCodes)
            .where(eq(emailVerificationCodes.id, code.id))
        })
      } catch (txError) {
        return c.json({ error: `'Error updating user data: ${txError}` }, 500)
      }

      try {
        const session = await lucia.createSession(existingUser.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        const maxAge = Math.min(sessionCookie.attributes.maxAge || 0, 34560000)

        setCookie(c, sessionCookie.name, sessionCookie.value, {
          ...sessionCookie.attributes,
          maxAge: maxAge,
          sameSite: 'Strict',
        })
      } catch (sessionError) {
        return c.json(
          { error: `'Error creating session: ${sessionError}` },
          500,
        )
      }

      return c.json(
        {
          message: 'Email verified and registration completed successfully.',
        },
        200,
      )
    } catch (error) {
      return c.json(
        {
          error: `An unexpected error occurred during verifying the user. Please try again later: ${error}`,
        },
        500,
      )
    }
  },
)
