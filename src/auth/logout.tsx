import Loading from '@/app/loading'
import { Button, ButtonProps } from '@/components/ui/button'
import { logout } from '@/server/actions'

import React, { useState } from 'react'

type LogoutProps = Pick<ButtonProps, 'variant' | 'size'> & {
  children?: React.ReactNode
}

export function Logout({
  children,
  variant = 'default',
  size = 'default',
}: LogoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <form action={logout}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsLoading(true)}
        className='w-24'
      >
        {isLoading ? <Loading /> : children}
      </Button>
    </form>
  )
}
