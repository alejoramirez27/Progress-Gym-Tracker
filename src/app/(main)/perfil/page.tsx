'use client'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { User, Check, LogOut, Download, Scale, ChevronRight, Camera, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Perfil {
  id_usuario: string
  nombre: string
  email: string
  created_at: string
  foto_perfil: string | null
}

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PerfilPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [perfil, setPerfil]           = useState<Perfil | null>(null)
  const [loading, setLoading]         = useState(true)
  const [nombre, setNombre]           = useState('')
  const [guardando, setGuardando]     = useState(false)
  const [editando, setEditando]       = useState(false)
  const [subiendo, setSubiendo]       = useState(false)
  const [avatarUrl, setAvatarUrl]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/perfil').then(r => r.json()).then(d => {
      if (d.error) return
      setPerfil(d)
      setNombre(d.nombre)
      setAvatarUrl(d.foto_perfil ?? null)
      setLoading(false)
    })
  }, [])

  const guardar = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    const res  = await fetch('/api/perfil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuardando(false); return }
    setPerfil(prev => prev ? { ...prev, nombre: data.nombre } : prev)
    setEditando(false); setGuardando(false)
    toast.success('Nombre actualizado')
  }

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview instant
    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)
    setSubiendo(true)

    const form = new FormData()
    form.append('file', file)

    const res  = await fetch('/api/perfil/avatar', { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error ?? 'Error al subir foto')
      setAvatarUrl(perfil?.foto_perfil ?? null)
    } else {
      setAvatarUrl(data.url)
      setPerfil(prev => prev ? { ...prev, foto_perfil: data.url } : prev)
      toast.success('Foto de perfil actualizada')
    }
    setSubiendo(false)
    // Reset input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  const eliminarFoto = async () => {
    setSubiendo(true)
    const res = await fetch('/api/perfil/avatar', { method: 'DELETE' })
    if (res.ok) {
      setAvatarUrl(null)
      setPerfil(prev => prev ? { ...prev, foto_perfil: null } : prev)
      toast.success('Foto eliminada')
    } else {
      toast.error('No se pudo eliminar la foto')
    }
    setSubiendo(false)
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

          {/* Avatar con botón de cámara */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--surface-high))',
              border: '2px solid color-mix(in srgb, var(--accent) 25%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              opacity: subiendo ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User style={{ width: '28px', height: '28px', color: 'var(--accent)' }} />
              )}
            </div>

            {/* Botón cámara */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              title="Cambiar foto"
              style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: 'var(--accent)', border: '2px solid var(--surface-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: subiendo ? 'not-allowed' : 'pointer',
              }}
            >
              <Camera style={{ width: '11px', height: '11px', color: '#0c0e12' }} />
            </button>

            {/* Input oculto */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={subirFoto}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              {perfil?.nombre}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{perfil?.email}</p>

            {/* Acciones foto */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={subiendo}
                style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', opacity: subiendo ? 0.5 : 1 }}
              >
                {subiendo ? 'Subiendo…' : avatarUrl ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {avatarUrl && !subiendo && (
                <button
                  onClick={eliminarFoto}
                  style={{ fontSize: '11px', color: 'var(--text-disabled)', background: 'none', border: '1px solid var(--border-faint)', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Trash2 style={{ width: '9px', height: '9px' }} /> Quitar
                </button>
              )}
            </div>
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

      {/* Peso corporal */}
      <div className="card card-active" style={{ padding: '14px 20px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => router.push('/peso')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--surface-high)', borderRadius: 'var(--r-md)', padding: '8px', display: 'flex' }}>
              <Scale style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px', fontWeight: '500' }}>Peso corporal</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Registra y sigue tu peso diariamente</p>
            </div>
          </div>
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-disabled)' }} />
        </div>
      </div>

      {/* Exportar datos */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '12px' }}>
        <p className="label" style={{ margin: '0 0 10px' }}>Datos</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px' }}>Exportar historial</p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Descarga CSV con todas tus series</p>
          </div>
          <a href="/api/export" download
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'inherit', fontWeight: '500' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          >
            <Download style={{ width: '13px', height: '13px' }} />
            CSV
          </a>
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
