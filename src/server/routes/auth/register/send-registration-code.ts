import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

import db from '@/db'
import { registrationSchema } from '@/validators/auth.schema'
import { Argon2id } from 'oslo/password'

import { EmailTemplate, sendMail } from '@/lib/email'
import { ContextVariables } from '@/types/hono'
import { generateEmailVerificationCode } from '@/utils/utils.server'

export const sendRegistrationCode = new OpenAPIHono<{
  // Variables: ContextVariables
}>().openapi(
  createRoute({
    method: 'post',
    path: '/auth/register/send-verification-code',
    tags: ['Auth'],
    summary: 'Register/Send Verification Code',
    description: 'Emails the user a temporary registration code',
    request: {
      body: {
        description: 'Register Request body',
        content: {
          'application/json': {
            schema: registrationSchema.openapi('SendRegistrationCode', {
              example: {
                email: 'example@example.com',
                password: 'password123',
                confirmPassword: 'password123',
              },
            }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Successfully sent verification code',
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  }),

  async (c) => {
    try {
      const { email, password } = c.req.valid('json')

      let existingUser
      try {
        existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        })
      } catch (error) {
        return c.json(
          { error: `Database error while checking existing user: ${error}` },
          500,
        )
      }

      if (existingUser && existingUser.emailVerified) {
        return c.json({ message: 'Email already registered and verified' }, 400)
      }

      const hashedPassword = await new Argon2id().hash(password)

      let userId: string
      if (!existingUser) {
        try {
          const result = await db
            .insert(users)
            .values({
              email: email,
              hashedPassword: hashedPassword,
              emailVerified: false,
            })
            .returning({ insertedUserId: users.id })

          userId = result[0].insertedUserId
          console.log(`New user created with ID: ${userId}`)
        } catch (error) {
          return c.json(
            { error: `Database error while creating new user: ${error}` },
            500,
          )
        }
      } else {
        userId = existingUser.id
        console.log(`Using existing user ID: ${userId}`)
      }

      let code: string
      try {
        code = await generateEmailVerificationCode(userId, email)
        console.log(`Email verification code generated: ${code}`)
      } catch (error) {
        return c.json(
          { error: `Error generating email verification code: ${error}` },
          500,
        )
      }

      let success: boolean
      try {
        success = await sendMail(email, EmailTemplate.EmailVerification, {
          code: code,
        })
        console.log(`Email sending attempt completed. Success: ${success}`)
      } catch (error) {
        return c.json(
          { error: `Error occurred while sending email: ${error}` },
          500,
        )
      }

      if (!success) {
        return c.json({ error: `Failed to send email.` }, 500)
      }
      console.log('Registration process completed successfully')
      return c.json({ message: 'Verification code sent successfully' }, 200)
    } catch (error) {
      return c.json(
        {
          error: `An unexpected error occurred during sending the verification code: ${error}`,
        },
        500,
      )
    }
  },
)
