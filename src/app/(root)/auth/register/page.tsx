import { getUser } from '@/utils/utils.server'
import { redirect } from 'next/navigation'
import RegisterForm from './RegisterForm'

export default async function Register() {
  const user = await getUser()
  if (user) {
    redirect('/')
  }
  return (
    <>
      <RegisterForm />
    </>
  )
}
