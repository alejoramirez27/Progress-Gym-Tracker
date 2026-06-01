'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function RegistroPage() {
  const router   = useRouter()
  const isMobile = useIsMobile()

  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const res  = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear la cuenta')
      setLoading(false)
      return
    }

    toast.success(`¡Bienvenido, ${data.nombre}! Tu cuenta fue creada`)
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
          <div style={{ position: 'absolute', top: '40%', left: '40%', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: '#b1c9e1', opacity: 0.03, filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ backgroundColor: '#b1c9e1', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#0c0e12' }} />
            </div>
            <p style={{ fontSize: '20px', fontWeight: '600', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>VoltTrack</p>
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.02em', lineHeight: '1.2', margin: '0 0 16px' }}>
            Empieza a trackear tu progreso hoy
          </h2>
          <p style={{ fontSize: '16px', color: '#8d9197', fontWeight: '300', lineHeight: '1.6', margin: 0, maxWidth: '380px' }}>
            Crea tu cuenta gratis y comienza a registrar cada sesión, cada peso, cada repetición.
          </p>

          <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '📊', text: 'Dashboard con tu evolución en kg por ejercicio' },
              { icon: '🗂️', text: 'Rutinas organizadas por día de semana' },
              { icon: '📅', text: 'Historial completo de sesiones' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '16px', marginTop: '1px' }}>{item.icon}</span>
                <p style={{ fontSize: '14px', color: '#8d9197', margin: 0, fontWeight: '300', lineHeight: '1.5' }}>{item.text}</p>
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

        {/* Logo móvil */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
            <div style={{ backgroundColor: '#b1c9e1', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <Zap style={{ width: '20px', height: '20px', color: '#0c0e12' }} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: '600', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>VoltTrack</p>
          </div>
        )}

        <div style={{ marginBottom: '32px', textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: '0 0 8px' }}>Crear cuenta</h1>
          <p style={{ fontSize: '14px', color: '#8d9197', margin: 0, fontWeight: '300' }}>
            Completa los datos para empezar
          </p>
        </div>

        <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Nombre</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#43474c' }} />
              <input
                style={inputStyle} type="text" value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre" required autoFocus autoComplete="name"
                onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                onBlur={e => e.target.style.borderColor  = '#43474c'}
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres" required autoComplete="new-password"
                onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                onBlur={e => e.target.style.borderColor  = '#43474c'}
              />
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#43474c' }} />
              <input
                style={{
                  ...inputStyle,
                  borderColor: confirm && confirm !== password ? '#6b2020' : '#43474c',
                }}
                type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña" required autoComplete="new-password"
                onFocus={e => e.target.style.borderColor = confirm !== password ? '#6b2020' : '#b1c9e1'}
                onBlur={e => e.target.style.borderColor  = confirm !== password ? '#6b2020' : '#43474c'}
              />
            </div>
            {confirm && confirm !== password && (
              <p style={{ fontSize: '12px', color: '#fca5a5', margin: 0, fontWeight: '300' }}>Las contraseñas no coinciden</p>
            )}
          </div>

          {/* Error general */}
          {error && (
            <div style={{ backgroundColor: '#2a1515', border: '1px solid #6b2020', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#fca5a5', margin: 0, fontWeight: '300' }}>{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit" disabled={loading}
            style={{ marginTop: '6px', backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.15s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creando cuenta...' : <><span>Crear Cuenta</span><ArrowRight style={{ width: '16px', height: '16px' }} /></>}
          </button>
        </form>

        {/* Link a login */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#43474c', fontWeight: '300' }}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={{ color: '#b1c9e1', textDecoration: 'none', fontWeight: '500' }}>
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  )
}
