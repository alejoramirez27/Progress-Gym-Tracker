'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function LoginPage() {
  const router    = useRouter()
  const isMobile  = useIsMobile()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Credenciales incorrectas'); setLoading(false); return }
    toast.success(`Bienvenido, ${data.nombre}`)
    router.push('/rutinas')
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#1e2024', border: '1px solid #43474c',
    borderRadius: '8px', padding: '12px 14px 12px 40px', fontSize: '14px',
    color: '#e2e2e8', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', backgroundColor: '#111318' }}>

      {/* ── Panel izquierdo decorativo — solo desktop ── */}
      {!isMobile && (
        <div style={{
          flex: 1, backgroundColor: '#0c0e12', borderRight: '1px solid #1e2024',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow de fondo */}
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: '#b1c9e1', opacity: 0.03, filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ backgroundColor: '#b1c9e1', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#0c0e12' }} />
            </div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>VoltTrack</p>
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.02em', lineHeight: '1.2', margin: '0 0 16px' }}>
            Elevando el rendimiento humano
          </h2>
          <p style={{ fontSize: '16px', color: '#8d9197', fontWeight: '300', lineHeight: '1.6', margin: 0, maxWidth: '380px' }}>
            A través de datos precisos y disciplina inquebrantable.
          </p>

          <div style={{ marginTop: '60px', display: 'flex', gap: '32px' }}>
            {[{ label: 'Seguro', sub: 'Datos privados' }, { label: 'Preciso', sub: 'Métricas reales' }, { label: 'Enfocado', sub: 'Sin distracciones' }].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#c3c7cd', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#43474c', margin: 0, fontWeight: '300' }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Panel del formulario ── */}
      <div style={{
        width: isMobile ? '100%' : '440px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: isMobile ? '48px 24px' : '60px 48px',
      }}>

        {/* Logo visible solo en móvil (reemplaza el panel izquierdo) */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ backgroundColor: '#b1c9e1', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#0c0e12' }} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: '600', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>VoltTrack</p>
          </div>
        )}

        {/* Título */}
        <div style={{ marginBottom: '32px', textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Bienvenido</h1>
          <p style={{ fontSize: '14px', color: '#8d9197', margin: 0, fontWeight: '300' }}>Introduce tus credenciales para continuar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#43474c' }} />
              <input
                style={inputStyle} type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com" required autoComplete="email"
                onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                onBlur={e => e.target.style.borderColor  = '#43474c'}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#43474c' }} />
              <input
                style={inputStyle} type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                onBlur={e => e.target.style.borderColor  = '#43474c'}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ backgroundColor: '#2a1515', border: '1px solid #6b2020', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#fca5a5', margin: 0, fontWeight: '300' }}>{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit" disabled={loading}
            style={{ marginTop: '8px', backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Iniciando sesión...' : <><span>Iniciar Sesión</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>}
          </button>
        </form>

        {/* Divisor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#282a2e' }} />
          <span style={{ fontSize: '11px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#282a2e' }} />
        </div>

        {/* Botón Google */}
        <a
          href="/api/auth/google"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '8px',
            padding: '12px', fontSize: '14px', color: '#e2e2e8', fontFamily: 'inherit',
            textDecoration: 'none', fontWeight: '400', marginTop: '12px',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#8d9197'; (e.currentTarget as HTMLElement).style.backgroundColor = '#282a2e' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#43474c'; (e.currentTarget as HTMLElement).style.backgroundColor = '#1e2024' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </a>

        {/* Link a registro */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#43474c', fontWeight: '300' }}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={{ color: '#b1c9e1', textDecoration: 'none', fontWeight: '500' }}>
            Crear cuenta
          </a>
        </p>
      </div>
    </div>
  )
}
