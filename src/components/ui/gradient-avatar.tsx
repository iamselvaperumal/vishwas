import { CSSProperties, FC } from 'react'

import clsx from 'clsx'

export type GradientAvatarProps = {
  text: string
  className?: string
  style?: CSSProperties
}

function hashStringToInt(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function intToRGB(i: number) {
  const r = (i >> 16) & 255
  const g = (i >> 8) & 255
  const b = i & 255
  return `rgb(${r},${g},${b})`
}

function rgbToBrightness({ r, g, b }: { r: number; g: number; b: number }) {
  // Formula to calculate brightness: (0.299*R + 0.587*G + 0.114*B)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function generateGradient(text: string) {
  const hash1 = hashStringToInt(text)
  const hash2 = hashStringToInt(text.split('').reverse().join(''))

  const color1 = intToRGB(hash1)
  const color2 = intToRGB(hash2)

  return `linear-gradient(135deg, ${color1}, ${color2})`
}

export const GradientAvatar: FC<GradientAvatarProps> = ({
  className,
  style,
  text,
}) => {
  const gradient = generateGradient(text)
  const initials = text
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={clsx(
        'flex items-center justify-center w-12 h-12 rounded-full text-white font-bold',
        className
      )}
      style={{ background: gradient, ...style }}>
      {initials}
    </div>
  )
}
