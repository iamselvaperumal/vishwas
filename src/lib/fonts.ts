import LocalFont from 'next/font/local'

export const satoshi = LocalFont({
  display: 'swap',
  fallback: ['sans-serif'],
  src: [
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '300',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '500',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '600',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '700',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '800',
    },
    {
      path: '../../public/fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '900',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '300',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '400',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '500',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '600',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '700',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '800',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '900',
    },
  ],
  variable: '--font-satoshi',
})
