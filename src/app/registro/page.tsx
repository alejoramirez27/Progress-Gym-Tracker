'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const res  = await fetch('/api/auth/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, email, password }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al crear la cuenta'); setLoading(false); return }
    toast.success(`Bienvenido, ${data.nombre}`)
    router.push('/rutinas')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', backgroundColor: 'var(--surface-base)' }}>

      {/* Left panel */}
      <div style={{ flex: 1, backgroundColor: 'var(--surface-deep)', borderRight: '1px solid var(--border-faint)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}
        className="auth-left-panel">
        <div style={{ position: 'absolute', top: '35%', left: '35%', width: '480px', height: '480px', borderRadius: '50%', backgroundColor: 'var(--accent)', opacity: 0.025, filter: 'blur(100px)', transform: 'translate(-50%, -50%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' }}>
          <div style={{ backgroundColor: 'var(--accent)', borderRadius: 'var(--r-md)', padding: '7px', display: 'flex' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#0c0e12' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>VoltTrack</span>
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.15', margin: '0 0 14px' }}>
          Empieza a trackear tu progreso hoy
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 48px', maxWidth: '360px' }}>
          Crea tu cuenta y comienza a registrar cada sesión, cada peso, cada repetición.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { text: 'Dashboard con evolución de peso por ejercicio' },
            { text: 'Rutinas organizadas por día de semana' },
            { text: 'Récords personales automáticos' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent)', flexShrink: 0, marginTop: '6px', opacity: 0.7 }} />
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '52px 44px' }}
        className="auth-right-panel">

        <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '36px' }}>
          <div style={{ backgroundColor: 'var(--accent)', borderRadius: 'var(--r-md)', padding: '7px', display: 'flex' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#0c0e12' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>VoltTrack</span>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Crear cuenta</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Completa los datos para empezar</p>
        </div>

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="r-nombre">Nombre</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="r-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required autoFocus autoComplete="name"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="r-email">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="r-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required autoComplete="email"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="r-password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="r-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required autoComplete="new-password"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label className="label" htmlFor="r-confirm">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              <input id="r-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite tu contraseña" required autoComplete="new-password"
                style={{ width: '100%', padding: '10px 12px 10px 34px', fontSize: '14px', boxSizing: 'border-box', borderColor: confirm && confirm !== password ? 'var(--error)' : undefined }} />
            </div>
            {confirm && confirm !== password && (
              <p style={{ fontSize: '12px', color: 'var(--error)', margin: 0 }}>Las contraseñas no coinciden</p>
            )}
          </div>

          {error && (
            <div style={{ backgroundColor: 'var(--error-dim)', border: '1px solid var(--error-border)', borderRadius: 'var(--r-md)', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--error)', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'color-mix(in srgb, var(--error) 80%, white)', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: '4px', backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '11px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? 'Creando cuenta...' : <><span>Crear cuenta</span><ArrowRight style={{ width: '15px', height: '15px' }} /></>}
          </button>
        </form>

        {/* Google */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-faint)' }} />
          <span className="label">o</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-faint)' }} />
        </div>
        <a href="/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '11px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'inherit', textDecoration: 'none', transition: 'border-color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-high)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-card)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </a>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
          Ya tienes cuenta?{' '}
          <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>Iniciar sesión</a>
        </p>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { width: 100% !important; padding: 44px 24px !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
