'use client'
import { Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <Dumbbell style={{ width: '40px', height: '40px', color: '#22c55e' }} />
      <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>Progreso Gym</h1>
      <p style={{ color: '#52525b', fontSize: '14px' }}>Login funcionando correctamente</p>
      <Button variant="outline" onClick={cerrarSesion}>Cerrar sesión</Button>
    </div>
  )
}
