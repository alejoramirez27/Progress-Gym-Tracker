'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Dumbbell, ChevronRight, Trash2, X } from 'lucide-react'

interface Rutina {
  id_rutina:   string
  nombre:      string
  descripcion: string | null
  created_at:  string
}

export default function RutinasPage() {
  const router = useRouter()
  const [rutinas, setRutinas]       = useState<Rutina[]>([])
  const [loading, setLoading]       = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre]         = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando]   = useState(false)

  const cargar = () => {
    setLoading(true)
    fetch('/api/rutinas').then(r => r.json()).then(d => { setRutinas(d); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    const res  = await fetch('/api/rutinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardando(false); return }
    toast.success(`Rutina "${nombre}" creada`)
    setNombre(''); setDescripcion(''); setMostrarForm(false); setGuardando(false)
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
    <div style={{ minHeight: '100dvh', backgroundColor: '#09090b', padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Dumbbell style={{ width: '22px', height: '22px', color: '#22c55e' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Mis Rutinas</h1>
            <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>Organiza tu entrenamiento por rutina</p>
          </div>
        </div>
        <Button
          onClick={() => setMostrarForm(f => !f)}
          variant={mostrarForm ? 'outline' : 'default'}
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {mostrarForm ? <><X style={{ width: '13px', height: '13px' }} /> Cancelar</> : <><Plus style={{ width: '13px', height: '13px' }} /> Nueva rutina</>}
        </Button>
      </div>

      {/* Formulario nueva rutina */}
      {mostrarForm && (
        <form onSubmit={crear} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '18px' }}>Nueva rutina</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label>Nombre *</Label>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Push Day, Pierna, Full Body..." required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Label>Descripción <span style={{ color: '#52525b' }}>(opcional)</span></Label>
              <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="ej: Pecho, hombro y tríceps" />
            </div>
            <Button type="submit" disabled={guardando} style={{ alignSelf: 'flex-end' }}>
              {guardando ? 'Guardando...' : 'Guardar rutina'}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de rutinas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} style={{ height: '72px', borderRadius: '12px' }} />
        ))}

        {!loading && rutinas.length === 0 && (
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <Dumbbell style={{ width: '28px', height: '28px', color: '#27272a', margin: '0 auto 12px' }} />
            <p style={{ color: '#3f3f46', fontSize: '13px' }}>No tienes rutinas todavía</p>
            <p style={{ color: '#27272a', fontSize: '12px', marginTop: '4px' }}>Crea tu primera rutina con el botón de arriba</p>
          </div>
        )}

        {!loading && rutinas.map(rutina => (
          <div
            key={rutina.id_rutina}
            style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onClick={() => router.push(`/rutinas/${rutina.id_rutina}`)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3f3f46')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#27272a')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ backgroundColor: '#18181b', borderRadius: '8px', padding: '8px' }}>
                <Dumbbell style={{ width: '16px', height: '16px', color: '#22c55e' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{rutina.nombre}</p>
                {rutina.descripcion && (
                  <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{rutina.descripcion}</p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={e => { e.stopPropagation(); eliminar(rutina) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#3f3f46', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#b84444')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}
              >
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </button>
              <ChevronRight style={{ width: '16px', height: '16px', color: '#3f3f46' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
