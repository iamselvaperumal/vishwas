import { getUser } from '@/utils/utils.server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function Login() {
  return (
    <>
      <LoginForm />
    </>
  )
}
