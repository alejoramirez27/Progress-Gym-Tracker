'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Dumbbell, Trash2, X, ChevronRight, GripVertical, ChevronDown } from 'lucide-react'

import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  KeyboardSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Rutina {
  id_rutina:   string
  nombre:      string
  descripcion: string | null
  grupos:      string | null
  dia_semana:  string | null
  orden:       number | null
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function RutinaCard({ rutina, onNavigate, onEliminar }: {
  rutina: Rutina
  onNavigate: () => void
  onEliminar: (e: React.MouseEvent) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: rutina.id_rutina })
  const tags = rutina.grupos ? rutina.grupos.split(',').map(g => g.trim()).filter(Boolean) : []

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 50 : 'auto' }}
    >
      <div
        className="card card-active"
        onClick={onNavigate}
        style={{ padding: '13px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div
          ref={setActivatorNodeRef} {...listeners} {...attributes}
          onClick={e => e.stopPropagation()}
          style={{ color: 'var(--text-disabled)', cursor: 'grab', flexShrink: 0, padding: '4px 2px', display: 'flex', alignItems: 'center', touchAction: 'none', transition: 'color var(--t-sm) var(--ease-out)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
          title="Arrastrar para reordenar"
        >
          <GripVertical style={{ width: '14px', height: '14px' }} />
        </div>

        <div style={{ backgroundColor: 'var(--surface-high)', borderRadius: 'var(--r-md)', padding: '8px', flexShrink: 0, display: 'flex' }}>
          <Dumbbell style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {rutina.nombre}
            </span>
            {rutina.dia_semana && <span className="tag tag-day">{rutina.dia_semana}</span>}
          </div>
          {rutina.descripcion && (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: '1.4' }}>
              {rutina.descripcion}
            </p>
          )}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
              {tags.map(tag => <span key={tag} className="tag tag-accent">{tag}</span>)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={onEliminar}
            aria-label={`Eliminar ${rutina.nombre}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 'var(--r-sm)', color: 'var(--text-disabled)', transition: 'color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-dim)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Trash2 style={{ width: '13px', height: '13px' }} />
          </button>
          <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-disabled)' }} />
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontSize: '13px', boxSizing: 'border-box' }
const sel: React.CSSProperties = { ...inp, appearance: 'none', cursor: 'pointer', paddingRight: '28px' }

export default function RutinasPage() {
  const router = useRouter()
  const [rutinas, setRutinas]     = useState<Rutina[]>([])
  const [loading, setLoading]     = useState(true)
  const [mostrarForm, setForm]    = useState(false)
  const [nombre, setNombre]       = useState('')
  const [descripcion, setDesc]    = useState('')
  const [grupos, setGrupos]       = useState('')
  const [diaSemana, setDia]       = useState('')
  const [guardando, setGuardando] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const cargar = () => {
    setLoading(true)
    fetch('/api/rutinas').then(r => r.json()).then(d => { setRutinas(Array.isArray(d) ? d : []); setLoading(false) })
  }
  useEffect(() => { cargar() }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = rutinas.findIndex(r => r.id_rutina === active.id)
    const newIdx = rutinas.findIndex(r => r.id_rutina === over.id)
    const reordenadas = arrayMove(rutinas, oldIdx, newIdx)
    setRutinas(reordenadas)
    await Promise.all(reordenadas.map((r, i) =>
      fetch(`/api/rutinas/${r.id_rutina}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orden: i + 1 }) })
    ))
  }

  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    const res = await fetch('/api/rutinas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, descripcion, grupos, dia_semana: diaSemana || null }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardando(false); return }
    toast.success(`"${nombre}" creada`)
    setNombre(''); setDesc(''); setGrupos(''); setDia(''); setForm(false); setGuardando(false)
    cargar()
  }

  const eliminar = async (rutina: Rutina, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${rutina.nombre}"?`)) return
    const res = await fetch(`/api/rutinas/${rutina.id_rutina}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success(`"${rutina.nombre}" eliminada`)
    cargar()
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 3px' }}>
            Mis Rutinas
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {!loading && `${rutinas.length} rutina${rutinas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setForm(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: mostrarForm ? 'transparent' : 'var(--accent)', color: mostrarForm ? 'var(--text-secondary)' : '#0c0e12', border: mostrarForm ? '1px solid var(--border-default)' : 'none', fontFamily: 'inherit', fontWeight: '500', fontSize: '13px', padding: '8px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {mostrarForm ? <><X style={{ width: '13px', height: '13px' }} />Cancelar</> : <><Plus style={{ width: '13px', height: '13px' }} />Nueva rutina</>}
        </button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ padding: '18px', marginBottom: '16px' }}>
          <p className="label" style={{ marginBottom: '12px', marginTop: 0 }}>Nueva rutina</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label" htmlFor="r-nombre">Nombre *</label>
              <input id="r-nombre" style={inp} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Upper A, Pierna..." required autoFocus />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label" htmlFor="r-dia">Día de la semana</label>
              <div style={{ position: 'relative' }}>
                <select id="r-dia" style={sel} value={diaSemana} onChange={e => setDia(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label" htmlFor="r-grupos">Grupos musculares</label>
              <input id="r-grupos" style={inp} value={grupos} onChange={e => setGrupos(e.target.value)} placeholder="Pecho, Tríceps..." />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label" htmlFor="r-desc">Descripción</label>
              <input id="r-desc" style={inp} value={descripcion} onChange={e => setDesc(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={guardando} style={{ backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {guardando ? 'Creando...' : 'Crear rutina'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[72, 56, 64].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      ) : rutinas.length === 0 ? (
        <div className="card empty-state">
          <Dumbbell style={{ width: '26px', height: '26px' }} />
          <p>Sin rutinas todavía</p>
          <p className="empty-hint">Crea tu primera rutina con el botón de arriba</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rutinas.map(r => r.id_rutina)} strategy={verticalListSortingStrategy}>
            <div className="stagger-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {rutinas.map(rutina => (
                <RutinaCard key={rutina.id_rutina} rutina={rutina}
                  onNavigate={() => router.push(`/rutinas/${rutina.id_rutina}`)}
                  onEliminar={e => eliminar(rutina, e)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {!loading && rutinas.length > 1 && (
        <p style={{ fontSize: '11px', color: 'var(--text-disabled)', textAlign: 'center', marginTop: '14px' }}>
          Arrastra ⠿ para reordenar
        </p>
      )}
    </div>
  )
}
