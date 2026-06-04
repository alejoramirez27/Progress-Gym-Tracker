import type { Metadata, Viewport } from 'next'
import { Lexend } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'VoltTrack',
  description: 'Tracking de entrenamiento personal — registra pesos, series y récords',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VoltTrack',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#111318',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={lexend.variable}>
      <body style={{ backgroundColor: '#111318', color: '#e2e2e8', margin: 0, fontFamily: 'var(--font-lexend), sans-serif' }}>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}
