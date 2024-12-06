import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: number | string
  color?: string
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

export default function Loading({
  size = 24,
  color = 'currentColor',
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn('spinner-wrapper', className)}
      style={{ width: size, height: size }}
    >
      <div className='spinner' style={{ width: size, height: size }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className='loading-bar'
            style={{ backgroundColor: color }}
          ></div>
        ))}
      </div>
    </div>
  )
}
