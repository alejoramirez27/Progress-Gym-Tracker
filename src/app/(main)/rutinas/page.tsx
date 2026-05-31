'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Dumbbell, Trash2, X, ChevronRight, GripVertical, ChevronDown } from 'lucide-react'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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
const TAG_BG   = '#1a2f3a'
const TAG_TEXT = '#7ab8d4'

// ─── Tarjeta sortable individual ────────────────────────────────────────────
function RutinaCard({
  rutina,
  onNavigate,
  onEliminar,
}: {
  rutina: Rutina
  onNavigate: () => void
  onEliminar: (e: React.MouseEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rutina.id_rutina })

  const tags = rutina.grupos ? rutina.grupos.split(',').map(g => g.trim()).filter(Boolean) : []

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition,
        opacity:    isDragging ? 0.5 : 1,
        zIndex:     isDragging ? 50 : 'auto',
        position:   'relative',
      }}
    >
      <div
        onClick={onNavigate}
        style={{
          backgroundColor: '#1e2024', border: '1px solid #43474c',
          borderRadius: '12px', padding: '16px 20px',
          cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#8d9197'; e.currentTarget.style.backgroundColor = '#282a2e' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#43474c'; e.currentTarget.style.backgroundColor = '#1e2024' }}
      >
        {/* Drag handle — solo este elemento activa el arrastre */}
        <div
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          onClick={e => e.stopPropagation()}
          style={{ color: '#43474c', cursor: 'grab', flexShrink: 0, padding: '4px', display: 'flex', alignItems: 'center', touchAction: 'none' }}
          title="Arrastrar para reordenar"
        >
          <GripVertical style={{ width: '16px', height: '16px' }} />
        </div>

        {/* Icono */}
        <div style={{ backgroundColor: '#282a2e', borderRadius: '10px', padding: '9px', flexShrink: 0 }}>
          <Dumbbell style={{ width: '16px', height: '16px', color: '#b1c9e1' }} />
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>
              {rutina.nombre}
            </p>
            {rutina.dia_semana && (
              <span style={{ backgroundColor: '#1e3045', color: '#b1c9e1', fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '500', flexShrink: 0 }}>
                {rutina.dia_semana}
              </span>
            )}
          </div>
          {rutina.descripcion && (
            <p style={{ fontSize: '12px', color: '#8d9197', margin: '3px 0 0', fontWeight: '300', lineHeight: '1.5' }}>
              {rutina.descripcion}
            </p>
          )}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <span key={tag} style={{ backgroundColor: TAG_BG, color: TAG_TEXT, fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '500' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={onEliminar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#43474c', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#43474c'}
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
          <ChevronRight style={{ width: '15px', height: '15px', color: '#43474c' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function RutinasPage() {
  const router = useRouter()
  const [rutinas, setRutinas]         = useState<Rutina[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [grupos, setGrupos]           = useState('')
  const [diaSemana, setDiaSemana]     = useState('')
  const [guardando, setGuardando]     = useState(false)

  // Sensores: PointerSensor para mouse (activa tras 8px de movimiento para no interferir con clicks)
  // TouchSensor para móvil (activa tras 250ms de presión sostenida)
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

  // ── Reordenar ──────────────────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = rutinas.findIndex(r => r.id_rutina === active.id)
    const newIdx = rutinas.findIndex(r => r.id_rutina === over.id)
    const reordenadas = arrayMove(rutinas, oldIdx, newIdx)

    // Actualización optimista
    setRutinas(reordenadas)

    // Persistir en Supabase
    await Promise.all(
      reordenadas.map((r, i) =>
        fetch(`/api/rutinas/${r.id_rutina}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orden: i + 1 }),
        })
      )
    )
  }

  // ── Crear ──────────────────────────────────────────────────────────────────
  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    const res = await fetch('/api/rutinas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, grupos, dia_semana: diaSemana || null }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardando(false); return }
    toast.success(`Rutina "${nombre}" creada`)
    setNombre(''); setDescripcion(''); setGrupos(''); setDiaSemana(''); setMostrarForm(false); setGuardando(false)
    cargar()
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const eliminar = async (rutina: Rutina, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${rutina.nombre}"?`)) return
    const res = await fetch(`/api/rutinas/${rutina.id_rutina}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success(`"${rutina.nombre}" eliminada`); cargar()
  }

  const inputStyle = {
    width: '100%', backgroundColor: '#282a2e', border: '1px solid #43474c',
    color: '#e2e2e8', borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const,
  }
  const selectStyle = { ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Mis Rutinas</h1>
          <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>
            Gestiona y personaliza tus planes de entrenamiento
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: mostrarForm ? 'transparent' : '#b1c9e1', color: mostrarForm ? '#8d9197' : '#0c0e12', border: mostrarForm ? '1px solid #43474c' : 'none', fontFamily: 'inherit', fontWeight: '500', fontSize: '13px', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {mostrarForm ? <><X style={{ width: '14px', height: '14px' }} />Cancelar</> : <><Plus style={{ width: '14px', height: '14px' }} />Nueva Rutina</>}
        </button>
      </div>

      {/* Formulario crear */}
      {mostrarForm && (
        <form onSubmit={crear} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#e2e2e8', marginBottom: '16px', marginTop: 0 }}>Nueva rutina</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre *</label>
              <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej: Upper A, Pierna..." required autoFocus />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Día de la semana</label>
              <div style={{ position: 'relative' }}>
                <select style={selectStyle} value={diaSemana} onChange={e => setDiaSemana(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#8d9197', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grupos musculares</label>
              <input style={inputStyle} value={grupos} onChange={e => setGrupos(e.target.value)} placeholder="ej: Pecho, Tríceps" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descripción</label>
              <input style={inputStyle} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={guardando}
              style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {guardando ? 'Guardando...' : 'Crear Rutina'}
            </button>
          </div>
        </form>
      )}

      {/* Lista con drag & drop */}
      {loading && Array.from({ length: 4 }).map((_, i) =>
        <Skeleton key={i} style={{ height: '80px', borderRadius: '12px', backgroundColor: '#1e2024', marginBottom: '10px' }} />
      )}

      {!loading && rutinas.length === 0 && (
        <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <Dumbbell style={{ width: '32px', height: '32px', color: '#43474c', margin: '0 auto 16px' }} />
          <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>No tienes rutinas todavía</p>
          <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>Crea tu primera rutina con el botón de arriba</p>
        </div>
      )}

      {!loading && rutinas.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rutinas.map(r => r.id_rutina)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rutinas.map(rutina => (
                <RutinaCard
                  key={rutina.id_rutina}
                  rutina={rutina}
                  onNavigate={() => router.push(`/rutinas/${rutina.id_rutina}`)}
                  onEliminar={e => eliminar(rutina, e)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!loading && rutinas.length > 1 && (
        <p style={{ fontSize: '11px', color: '#43474c', textAlign: 'center', marginTop: '12px', fontWeight: '300' }}>
          Mantén presionado el ícono ⠿ y arrastra para reordenar
        </p>
      )}
    </div>
  )
}
