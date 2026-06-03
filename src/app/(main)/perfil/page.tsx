'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, Check, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Perfil { id_usuario: string; nombre: string; email: string; created_at: string }

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PerfilPage() {
  const router = useRouter()
  const [perfil, setPerfil]       = useState<Perfil | null>(null)
  const [loading, setLoading]     = useState(true)
  const [nombre, setNombre]       = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando]   = useState(false)

  useEffect(() => {
    fetch('/api/perfil').then(r => r.json()).then(d => {
      if (d.error) return
      setPerfil(d); setNombre(d.nombre); setLoading(false)
    })
  }, [])

  const guardar = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    const res = await fetch('/api/perfil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuardando(false); return }
    setPerfil(prev => prev ? { ...prev, nombre: data.nombre } : prev)
    setEditando(false); setGuardando(false)
    toast.success('Nombre actualizado')
  }

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  if (loading) return (
    <div className="page-enter">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[80, 60, 60].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
      </div>
    </div>
  )

  const inp: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 12px',
    fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Perfil</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Tu cuenta VoltTrack</p>
      </div>

      {/* Avatar + nombre */}
      <div className="card" style={{ padding: '24px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--surface-high))',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User style={{ width: '22px', height: '22px', color: 'var(--accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              {perfil?.nombre}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{perfil?.email}</p>
          </div>
        </div>

        {/* Editar nombre */}
        <div>
          <label className="label" style={{ display: 'block', marginBottom: '6px' }}>Nombre</label>
          {editando ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={nombre} onChange={e => setNombre(e.target.value)} style={inp} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') guardar(); if (e.key === 'Escape') { setEditando(false); setNombre(perfil?.nombre ?? '') } }}
              />
              <button onClick={guardar} disabled={guardando || !nombre.trim()}
                style={{ backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '9px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                <Check style={{ width: '13px', height: '13px' }} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditando(false); setNombre(perfil?.nombre ?? '') }}
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '9px 12px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
                Cancelar
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>{perfil?.nombre}</p>
              <button onClick={() => setEditando(true)}
                style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px' }}>
                Editar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info de cuenta */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '12px' }}>
        <p className="label" style={{ margin: '0 0 12px' }}>Cuenta</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{perfil?.email}</span>
          </div>
          <hr className="divider" style={{ margin: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Miembro desde</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{perfil?.created_at ? fmtFecha(perfil.created_at) : '—'}</span>
          </div>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button onClick={cerrarSesion}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', backgroundColor: 'transparent',
          border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
          borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
          color: 'var(--error)', transition: 'background-color var(--t-sm) var(--ease-out)',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--error-dim)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <LogOut style={{ width: '14px', height: '14px' }} />
        Cerrar sesión
      </button>
    </div>
  )
}
