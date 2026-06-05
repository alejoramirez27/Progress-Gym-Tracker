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
  title: 'VoltTrack — Tracker de entrenamiento para atletas serios',
  description: 'Registra cada serie, calcula tus PRs automáticamente y visualiza 365 días de progreso. Gratis para siempre, sin anuncios, sin límite de rutinas.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VoltTrack',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'VoltTrack',
    title: 'VoltTrack — Entrena con intención',
    description: 'Registra pesos, sigue tus PRs y visualiza 365 días de progreso. Gratis para siempre.',
    // TODO: subir og-image.png real (1200×630) con screenshot del dashboard
    // images: [{ url: '/og/og-image.png', width: 1200, height: 630, alt: 'VoltTrack Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VoltTrack — Entrena con intención',
    description: 'Registra pesos, sigue tus PRs y visualiza 365 días de progreso. Gratis para siempre.',
    // TODO: subir og-image.png real
    // images: ['/og/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  // P2-7: NO maximum-scale ni userScalable=false — viola WCAG para usuarios con baja visión
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={lexend.variable}>
      <body style={{ backgroundColor: '#ffffff', color: '#111318', margin: 0, fontFamily: 'var(--font-lexend), sans-serif' }}>
        {children}
        <Toaster theme="light" position="top-right" richColors />
      </body>
    </html>
  )
}
