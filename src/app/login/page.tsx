'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dumbbell } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al iniciar sesión')
      setLoading(false)
      return
    }
    toast.success(`Bienvenido, ${data.nombre}`)
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#09090b', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        backgroundColor: '#111113', border: '1px solid #27272a',
        borderRadius: '16px', padding: '40px 32px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '8px' }}>
            <Dumbbell style={{ width: '20px', height: '20px', color: '#22c55e' }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>Progreso Gym</p>
            <p style={{ fontSize: '11px', color: '#52525b' }}>Tracking de entrenamiento</p>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Email</Label>
            <Input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required autoComplete="email"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Contraseña</Label>
            <Input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  )
}
