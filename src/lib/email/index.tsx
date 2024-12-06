import type { ComponentProps } from 'react'

import { render } from '@react-email/components'
import { createTransport, type TransportOptions } from 'nodemailer'

import { env } from '@/utils/env.mjs'

import 'server-only'

import { EMAIL_SENDER } from '../constants'
import { EmailVerificationTemplate } from './templates/email-verification'
import { ResetPasswordTemplate } from './templates/reset-password'

export enum EmailTemplate {
  EmailVerification = 'EmailVerification',
  PasswordReset = 'PasswordReset',
}

export type PropsMap = {
  [EmailTemplate.EmailVerification]: ComponentProps<
    typeof EmailVerificationTemplate
  >
  [EmailTemplate.PasswordReset]: ComponentProps<typeof ResetPasswordTemplate>
}

const getEmailTemplate = <T extends EmailTemplate>(
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  switch (template) {
    case EmailTemplate.EmailVerification:
      return {
        subject: 'Verify your email address',
        body: render(
          <EmailVerificationTemplate
            {...(props as PropsMap[EmailTemplate.EmailVerification])}
          />,
        ),
      }
    case EmailTemplate.PasswordReset:
      return {
        subject: 'Reset your password',
        body: render(
          <ResetPasswordTemplate
            {...(props as PropsMap[EmailTemplate.PasswordReset])}
          />,
        ),
      }
    default:
      throw new Error('Invalid email template')
  }
}

const requiresAuth =
  typeof env.SMTP_USER !== 'undefined' &&
  typeof env.SMTP_PASSWORD !== 'undefined'

const smtpConfig = {
  auth: requiresAuth
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      }
    : undefined,
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true,
}

const transporter = createTransport(smtpConfig as TransportOptions)

export const sendMail = async <T extends EmailTemplate>(
  to: string,
  template: T,
  props: PropsMap[NoInfer<T>],
) => {
  const { subject, body } = getEmailTemplate(template, props)

  // if (env.NODE_ENV !== 'production') {
  //   console.log(
  //     '📨 Email sent to:',
  //     to,
  //     'with template:',
  //     template,
  //     'and props:',
  //     props,
  //   )
  //   return true
  // }

  try {
    await transporter.sendMail({ from: EMAIL_SENDER, to, subject, html: body })
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
