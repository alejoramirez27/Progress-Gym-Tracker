'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Dumbbell, Trash2, X, ChevronRight } from 'lucide-react'

interface Rutina {
  id_rutina:   string
  nombre:      string
  descripcion: string | null
  grupos:      string | null
  created_at:  string
}

const TAG_BG   = '#1a2f3a'
const TAG_TEXT = '#7ab8d4'

export default function RutinasPage() {
  const router = useRouter()
  const [rutinas, setRutinas]         = useState<Rutina[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [grupos, setGrupos]           = useState('')
  const [guardando, setGuardando]     = useState(false)

  const cargar = () => {
    setLoading(true)
    fetch('/api/rutinas').then(r => r.json()).then(d => { setRutinas(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    const res  = await fetch('/api/rutinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, grupos }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardando(false); return }
    toast.success(`Rutina "${nombre}" creada`)
    setNombre(''); setDescripcion(''); setGrupos(''); setMostrarForm(false); setGuardando(false)
    cargar()
  }

  const eliminar = async (rutina: Rutina) => {
    if (!confirm(`¿Eliminar "${rutina.nombre}"?`)) return
    const res = await fetch(`/api/rutinas/${rutina.id_rutina}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success(`"${rutina.nombre}" eliminada`)
    cargar()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Mis Rutinas</h1>
          <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>
            Gestiona y personaliza tus planes de entrenamiento
          </p>
        </div>
        <Button
          onClick={() => setMostrarForm(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: mostrarForm ? 'transparent' : '#b1c9e1', color: mostrarForm ? '#8d9197' : '#0c0e12', border: mostrarForm ? '1px solid #43474c' : 'none', fontFamily: 'inherit', fontWeight: '500', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >
          {mostrarForm ? <><X style={{ width: '14px', height: '14px' }} />Cancelar</> : <><Plus style={{ width: '14px', height: '14px' }} />Crear Nueva Rutina</>}
        </Button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <form onSubmit={crear} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '28px', marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', marginBottom: '20px', marginTop: 0 }}>Nueva rutina</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label style={{ color: '#c3c7cd', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nombre *</Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Push Day, Pierna..." required
                style={{ backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label style={{ color: '#c3c7cd', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Grupos musculares</Label>
              <Input value={grupos} onChange={e => setGrupos(e.target.value)} placeholder="ej: Pecho, Tríceps, Hombros"
                style={{ backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            <Label style={{ color: '#c3c7cd', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Descripción</Label>
            <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="ej: Enfoque en hipertrofia y fuerza explosiva"
              style={{ backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={guardando} style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {guardando ? 'Guardando...' : 'Crear Rutina'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: '96px', borderRadius: '12px', backgroundColor: '#1e2024' }} />)}

        {!loading && rutinas.length === 0 && (
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
            <Dumbbell style={{ width: '32px', height: '32px', color: '#43474c', margin: '0 auto 16px' }} />
            <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>No tienes rutinas todavía</p>
            <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>Crea tu primera rutina con el botón de arriba</p>
          </div>
        )}

        {!loading && rutinas.map(rutina => {
          const tags = rutina.grupos ? rutina.grupos.split(',').map(g => g.trim()).filter(Boolean) : []
          return (
            <div
              key={rutina.id_rutina}
              onClick={() => router.push(`/rutinas/${rutina.id_rutina}`)}
              style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8d9197'; e.currentTarget.style.backgroundColor = '#282a2e' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#43474c'; e.currentTarget.style.backgroundColor = '#1e2024' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                  <div style={{ backgroundColor: '#282a2e', borderRadius: '10px', padding: '10px', marginTop: '2px' }}>
                    <Dumbbell style={{ width: '18px', height: '18px', color: '#b1c9e1' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '15px', fontWeight: '500', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>{rutina.nombre}</p>
                    {rutina.descripcion && (
                      <p style={{ fontSize: '13px', color: '#8d9197', marginTop: '4px', marginBottom: 0, fontWeight: '300', lineHeight: '1.5' }}>{rutina.descripcion}</p>
                    )}
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {tags.map((tag) => (
                          <span key={tag} style={{ backgroundColor: TAG_BG, color: TAG_TEXT, fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                  <button onClick={e => { e.stopPropagation(); eliminar(rutina) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#43474c', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <ChevronRight style={{ width: '16px', height: '16px', color: '#43474c' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
