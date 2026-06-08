import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VoltTrack',
    short_name: 'VoltTrack',
    description: 'Tracking de entrenamiento personal — registra pesos, series y récords',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#111318',
    theme_color: '#111318',
    categories: ['fitness', 'health', 'sports'],
    icons: [
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Registrar sesión',
        short_name: 'Sesión',
        description: 'Ir a registrar un nuevo entrenamiento',
        url: '/progreso',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Ver métricas y heatmap',
        url: '/dashboard',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: 'Récords personales',
        short_name: 'PRs',
        description: 'Ver todos mis PRs',
        url: '/records',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
    ],
    screenshots: [],
  }
}
