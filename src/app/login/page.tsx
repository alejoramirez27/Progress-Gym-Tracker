'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!email.trim()) { setError('Ingresa tu email'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Ingresa un email válido'); return }
    if (!password) { setError('Ingresa tu contraseña'); return }
    setLoading(true)
    const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Credenciales incorrectas'); setLoading(false); return }
    toast.success(`Bienvenido, ${data.nombre}`)
    window.location.href = '/rutinas'
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', backgroundColor: '#ffffff' }}>

      {/* Left: editorial image panel */}
      <div className="auth-img-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Image src="/screenshots/gym2.jpg" alt="Atleta entrenando" fill unoptimized priority style={{ objectFit: 'cover', objectPosition: 'center 30%' }} />
        {/* Right-edge fade into form panel */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 45%, rgba(255,255,255,0.97) 100%)' }} />
        {/* Bottom fade for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,12,16,0.95) 0%, rgba(10,12,16,0.3) 50%, transparent 75%)' }} />

        {/* Editorial text at bottom-left */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: 'clamp(32px,4vw,52px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '22px' }}>
            <div style={{ backgroundColor: '#2d7fad', borderRadius: '7px', padding: '6px', display: 'flex' }}>
              <Zap style={{ width: '13px', height: '13px', color: '#ffffff' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.01em' }}>VoltTrack</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: '1.05', margin: '0 0 12px' }}>
            Cada kilo.<br />Cada récord.
          </h2>
          <p style={{ fontSize: '14px', color: '#9199a3', margin: 0, fontWeight: '300', lineHeight: '1.6', maxWidth: '320px' }}>
            El sistema de tracking para atletas serios.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel" style={{ width: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '52px 44px', backgroundColor: '#ffffff' }}>

        {/* Mobile logo */}
        <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
          <div style={{ backgroundColor: '#2d7fad', borderRadius: '7px', padding: '6px', display: 'flex' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#111318', letterSpacing: '-0.01em' }}>VoltTrack</span>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111318', letterSpacing: '-0.03em', margin: '0 0 6px' }}>Bienvenido</h1>
          <p style={{ fontSize: '13px', color: '#7a8290', margin: 0 }}>Introduce tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="l-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="l-email" type="text" inputMode="email" autoCapitalize="none" value={email} onChange={e => { setEmail(e.target.value); if (error) setError('') }}
                placeholder="tu@email.com" autoComplete="email"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="l-password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="l-password" type="password" value={password} onChange={e => { setPassword(e.target.value); if (error) setError('') }}
                placeholder="••••••••" autoComplete="current-password"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--error-dim)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--error)', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--error)', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ marginTop: '4px', backgroundColor: '#2d7fad', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.14s', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#246a94' }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#2d7fad'}
          >
            {loading ? 'Iniciando sesión...' : <><span>Iniciar sesión</span><ArrowRight style={{ width: '14px', height: '14px' }} /></>}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eceef2' }} />
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#9aa0a8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#eceef2' }} />
        </div>

        <a href="/api/auth/google"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#f8f9fb', border: '1px solid #dde0e6', borderRadius: '8px', padding: '11px', fontSize: '14px', color: '#111318', fontFamily: 'inherit', textDecoration: 'none', transition: 'border-color 0.14s, background-color 0.14s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#c4c9d1'; (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f2f5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#dde0e6'; (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fb' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </a>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#7a8290' }}>
          No tienes cuenta?{' '}
          <a href="/registro" style={{ color: '#2d7fad', textDecoration: 'none', fontWeight: '500' }}>Crear cuenta</a>
        </p>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .auth-img-panel  { display: none !important; }
          .auth-form-panel { width: 100% !important; padding: 44px 24px !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
