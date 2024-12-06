'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { lucia } from '@/auth'
import { Routes } from '@/lib/routes'
import { cache } from 'react'

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

export async function logout() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value

  if (!sessionId) {
    return redirect(Routes.login)
  }

  await lucia.invalidateSession(sessionId)
  cookies().set(lucia.sessionCookieName, '', {
    expires: new Date(0),
    sameSite: 'strict',
  })
  revalidatePath(Routes.login)
  return redirect(Routes.login)
}
