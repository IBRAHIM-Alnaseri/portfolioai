import { ClerkProvider } from '@clerk/nextjs'
import { Fraunces, Outfit } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata = {
  title: 'PortfolioAI — Build Your Portfolio with AI',
  description: 'Paste your CV, get a live portfolio website instantly. Powered by AI.',
}

export default function RootLayout({ children }) {
  return (
    // ClerkProvider wraps everything — this enables auth across all pages
    <ClerkProvider>
      <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
