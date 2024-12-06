'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { emailVerificationCodes, passwordResetTokens, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

import { lucia } from '@/auth'
import db from '@/db'
import { Session, User } from 'lucia'
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo'
import { alphabet, generateRandomString } from 'oslo/crypto'

import { EmailTemplate, sendMail } from '@/lib/email'
import { Routes } from '@/lib/routes'

export const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return { user: null, session: null }
  }
  const result = await lucia.validateSession(sessionId)
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
  } catch {
    console.error('Failed to set session cookie')
  }
  return result
}

export const validateRequest = cache(uncachedValidateRequest)

export async function generateEmailVerificationCode(
  userId: string,
  email: string,
): Promise<string> {
  await db
    .delete(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId))
  const code = generateRandomString(6, alphabet('0-9')) // 6 digit code
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(10, 'm')),
  })
  return code
}

export async function resendVerificationEmail(): Promise<{
  error?: string
  success?: boolean
}> {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(Routes.login)
  }
  const lastSent = await db.query.emailVerificationCodes.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
    columns: { expiresAt: true },
  })

  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
    }
  }
  const verificationCode = await generateEmailVerificationCode(
    user.id,
    user.email,
  )
  await sendMail(user.email, EmailTemplate.EmailVerification, {
    code: verificationCode,
  })

  return { success: true }
}

export async function generatePasswordResetToken(
  userId: string,
): Promise<string> {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId))
  const [insertedToken] = await db
    .insert(passwordResetTokens)
    .values({
      userId,
      expiresAt: createDate(new TimeSpan(2, 'h')),
    })
    .returning({ id: passwordResetTokens.id })
  return insertedToken.id
}

const timeFromNow = (time: Date) => {
  const now = new Date()
  const diff = time.getTime() - now.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const seconds = Math.floor(diff / 1000) % 60
  return `${minutes}m ${seconds}s`
}

export const getUser = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) return null
  const { user, session } = await lucia.validateSession(sessionId)
  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
  } catch (error) {
    console.error(error)
  }
  return user
})

export async function ensureAuthenticated() {
  const user = await getUser()
  if (!user) {
    throw redirect(Routes.login)
  }

  return user
}
