'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Trash2, X, Pencil, Check, GripVertical, ChevronDown } from 'lucide-react'

interface Rutina    { id_rutina: string; nombre: string; descripcion: string | null; grupos: string | null; dia_semana: string | null }
interface Ejercicio { id_ejercicio: string; nombre: string; orden: number; num_series: number }

const TAG_BG   = '#1a2f3a'
const TAG_TEXT = '#7ab8d4'

export default function RutinaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  // — Rutina —
  const [rutina, setRutina]             = useState<Rutina | null>(null)
  const [editandoRutina, setEditandoRutina] = useState(false)
  const [editNombre, setEditNombre]     = useState('')
  const [editDesc, setEditDesc]         = useState('')
  const [editGrupos, setEditGrupos]     = useState('')
  const [editDia, setEditDia]           = useState('')
  const [guardandoRutina, setGuardandoRutina] = useState(false)

  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  // — Ejercicios —
  const [ejercicios, setEjercicios]     = useState<Ejercicio[]>([])
  const [loading, setLoading]           = useState(true)
  const [mostrarFormEj, setMostrarFormEj] = useState(false)
  const [nombreEj, setNombreEj]         = useState('')
  const [numSeriesEj, setNumSeriesEj]   = useState('3')
  const [guardandoEj, setGuardandoEj]   = useState(false)
  const [editandoEj, setEditandoEj]     = useState<string | null>(null)
  const [editNombreEj, setEditNombreEj] = useState('')
  const [editNumSeriesEj, setEditNumSeriesEj] = useState('3')

  // — Drag & Drop —
  const [draggedIdx, setDraggedIdx]   = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const cargarRutina = () =>
    fetch(`/api/rutinas/${id}`).then(r => r.json()).then(d => { if (d.id_rutina) setRutina(d) })

  const cargarEjercicios = () => {
    setLoading(true)
    fetch(`/api/ejercicios?id_rutina=${id}`)
      .then(r => r.json())
      .then(d => { setEjercicios(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { cargarRutina(); cargarEjercicios() }, [id])

  // — Editar rutina —
  const abrirEdicionRutina = () => {
    if (!rutina) return
    setEditNombre(rutina.nombre); setEditDesc(rutina.descripcion ?? ''); setEditGrupos(rutina.grupos ?? ''); setEditDia(rutina.dia_semana ?? '')
    setEditandoRutina(true)
  }
  const guardarRutina = async () => {
    if (!editNombre.trim()) return
    setGuardandoRutina(true)
    const res  = await fetch(`/api/rutinas/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: editNombre, descripcion: editDesc, grupos: editGrupos, dia_semana: editDia || null }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoRutina(false); return }
    setRutina(data); setEditandoRutina(false); setGuardandoRutina(false)
    toast.success('Rutina actualizada')
  }

  // — Crear ejercicio —
  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardandoEj(true)
    try {
      const res  = await fetch('/api/ejercicios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rutina: id, nombre: nombreEj, orden: ejercicios.length + 1, num_series: Number(numSeriesEj) || 3 }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al agregar ejercicio')
        return
      }
      toast.success(`"${nombreEj}" agregado`)
      setNombreEj(''); setNumSeriesEj('3'); setMostrarFormEj(false)
      cargarEjercicios()
    } catch (err) {
      console.error('Error creando ejercicio:', err)
      toast.error('Error de conexión al agregar ejercicio')
    } finally {
      setGuardandoEj(false)
    }
  }

  // — Editar ejercicio —
  const abrirEditEj = (ej: Ejercicio, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoEj(ej.id_ejercicio); setEditNombreEj(ej.nombre); setEditNumSeriesEj(String(ej.num_series ?? 3))
  }
  const guardarEditEj = async (id_ej: string) => {
    try {
      const res  = await fetch(`/api/ejercicios/${id_ej}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombreEj, num_series: Number(editNumSeriesEj) || 3 }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); return }
      toast.success('Ejercicio actualizado'); setEditandoEj(null); cargarEjercicios()
    } catch {
      toast.error('Error de conexión')
    }
  }

  // — Eliminar ejercicio —
  const eliminarEjercicio = async (ej: Ejercicio) => {
    if (!confirm(`¿Eliminar "${ej.nombre}" y todas sus series?`)) return
    await fetch(`/api/ejercicios/${ej.id_ejercicio}`, { method: 'DELETE' })
    toast.success(`"${ej.nombre}" eliminado`); cargarEjercicios()
  }

  // — Drag & Drop handlers —
  const onDragStart = (e: React.DragEvent, idx: number) => {
    // Requerido para Firefox y Safari
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
    // Pequeño delay para que React actualice el estado antes de que el browser tome el snapshot
    setTimeout(() => setDraggedIdx(idx), 0)
  }

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIdx === null || draggedIdx === idx) return
    setDragOverIdx(idx)
  }

  const onDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    const fromIdx = draggedIdx ?? Number(e.dataTransfer.getData('text/plain'))
    if (fromIdx === null || fromIdx === dropIdx) { setDraggedIdx(null); setDragOverIdx(null); return }

    // Reordenar array localmente (optimista)
    const next = [...ejercicios]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(dropIdx, 0, moved)
    setEjercicios(next)
    setDraggedIdx(null); setDragOverIdx(null)

    // Persistir nuevos ordenes en paralelo (solo los que cambiaron)
    await Promise.all(
      next.map((ej, i) =>
        fetch(`/api/ejercicios/${ej.id_ejercicio}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orden: i + 1 }),
        })
      )
    )
  }

  const onDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null) }

  const inputStyle = {
    backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8',
    borderRadius: '6px', padding: '8px 10px', fontSize: '13px',
    fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' as const,
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <button onClick={() => router.push('/rutinas')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d9197', padding: '4px', borderRadius: '6px', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e2e8'}
            onMouseLeave={e => e.currentTarget.style.color = '#8d9197'}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
          </button>
          <span style={{ fontSize: '12px', color: '#43474c' }}>Mis Rutinas</span>
        </div>

        {!editandoRutina ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
                {rutina?.nombre ?? <span style={{ color: '#43474c' }}>—</span>}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: rutina?.descripcion || rutina?.grupos ? '6px' : '0' }}>
                {rutina?.dia_semana && (
                  <span style={{ backgroundColor: '#1e3045', color: '#b1c9e1', fontSize: '11px', padding: '2px 9px', borderRadius: '20px', fontWeight: '500' }}>
                    {rutina.dia_semana}
                  </span>
                )}
              </div>
              {rutina?.descripcion && (
                <p style={{ fontSize: '13px', color: '#8d9197', margin: '0 0 8px', fontWeight: '300' }}>{rutina.descripcion}</p>
              )}
              {rutina?.grupos && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {rutina.grupos.split(',').map((g) => {
                    const tag = g.trim()
                    return tag ? (
                      <span key={tag} style={{ backgroundColor: TAG_BG, color: TAG_TEXT, fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '500' }}>
                        {tag}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
              <button onClick={abrirEdicionRutina}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e2e2e8'; e.currentTarget.style.borderColor = '#8d9197' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#8d9197'; e.currentTarget.style.borderColor = '#43474c' }}>
                <Pencil style={{ width: '12px', height: '12px' }} /> Editar
              </button>
              <button onClick={() => setMostrarFormEj(f => !f)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: mostrarFormEj ? 'transparent' : '#1e2024', color: mostrarFormEj ? '#8d9197' : '#b1c9e1', border: '1px solid #43474c', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: 'all 0.15s' }}>
                {mostrarFormEj ? <><X style={{ width: '12px', height: '12px' }} />Cancelar</> : <><Plus style={{ width: '12px', height: '12px' }} />Ejercicio</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #b1c9e1', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', marginTop: 0 }}>Editar rutina</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre *</label>
                <input style={inputStyle} value={editNombre} onChange={e => setEditNombre(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grupos musculares</label>
                <input style={inputStyle} value={editGrupos} onChange={e => setEditGrupos(e.target.value)} placeholder="ej: Pecho, Tríceps" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Día de la semana</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none' as const, cursor: 'pointer', paddingRight: '28px' }} value={editDia} onChange={e => setEditDia(e.target.value)}>
                    <option value="">Sin asignar</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: '#8d9197', pointerEvents: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descripción</label>
                <input style={inputStyle} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Opcional" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditandoRutina(false)}
                style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={guardarRutina} disabled={guardandoRutina || !editNombre.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Check style={{ width: '12px', height: '12px' }} />
                {guardandoRutina ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form nuevo ejercicio */}
      {mostrarFormEj && (
        <form onSubmit={crearEjercicio} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#c3c7cd', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nombre del ejercicio *</label>
              <input style={inputStyle} value={nombreEj} onChange={e => setNombreEj(e.target.value)} placeholder="ej: Press banca, Sentadilla..." required autoFocus />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: '#c3c7cd', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Series</label>
              <input style={{ ...inputStyle, width: '72px', textAlign: 'center' }} type="number" min="1" max="20" value={numSeriesEj} onChange={e => setNumSeriesEj(e.target.value)} />
            </div>
            <button type="submit" disabled={guardandoEj}
              style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>
              {guardandoEj ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Lista ejercicios con drag & drop */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading && Array.from({ length: 3 }).map((_, i) =>
          <Skeleton key={i} style={{ height: '60px', borderRadius: '12px', backgroundColor: '#1e2024' }} />
        )}

        {!loading && ejercicios.length === 0 && (
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '56px', textAlign: 'center' }}>
            <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Sin ejercicios todavía</p>
            <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>Agrega tu primer ejercicio con el botón de arriba</p>
          </div>
        )}

        {!loading && ejercicios.map((ej, index) => {
          const isDragging  = draggedIdx === index
          const isDragOver  = dragOverIdx === index && draggedIdx !== index
          return (
            <div
              key={ej.id_ejercicio}
              draggable
              onDragStart={e => onDragStart(e, index)}
              onDragOver={e => onDragOver(e, index)}
              onDrop={e => onDrop(e, index)}
              onDragEnd={onDragEnd}
              style={{
                backgroundColor: '#1e2024',
                border: `1px solid ${isDragOver ? '#b1c9e1' : '#43474c'}`,
                borderRadius: '12px', overflow: 'hidden',
                opacity: isDragging ? 0.45 : 1,
                transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                transition: 'border-color 0.1s, opacity 0.1s, transform 0.1s',
                userSelect: 'none',
              }}
            >
              {editandoEj === ej.id_ejercicio ? (
                /* Edición inline */
                <div style={{ padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#16181c' }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={editNombreEj}
                    onChange={e => setEditNombreEj(e.target.value)} placeholder="Nombre" autoFocus />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Series</label>
                    <input style={{ ...inputStyle, width: '60px', textAlign: 'center' }} type="number" min="1" max="20"
                      value={editNumSeriesEj} onChange={e => setEditNumSeriesEj(e.target.value)} />
                  </div>
                  <button onClick={() => guardarEditEj(ej.id_ejercicio)}
                    style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Check style={{ width: '13px', height: '13px' }} />
                  </button>
                  <button onClick={() => setEditandoEj(null)}
                    style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '8px 10px', color: '#8d9197', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              ) : (
                /* Fila normal */
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Drag handle */}
                  <div style={{ cursor: 'grab', color: '#43474c', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                    title="Arrastrar para reordenar">
                    <GripVertical style={{ width: '15px', height: '15px' }} />
                  </div>
                  {/* Número */}
                  <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '600', minWidth: '20px' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {/* Nombre */}
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', margin: 0, flex: 1 }}>{ej.nombre}</p>
                  {/* Badge series */}
                  <span style={{ backgroundColor: '#1a2f3a', color: '#7ab8d4', fontSize: '11px', padding: '2px 9px', borderRadius: '20px', flexShrink: 0 }}>
                    {ej.num_series ?? 3} series
                  </span>
                  {/* Acciones */}
                  <button onClick={e => abrirEditEj(ej, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#43474c', borderRadius: '4px', transition: 'color 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#b1c9e1'}
                    onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                    <Pencil style={{ width: '13px', height: '13px' }} />
                  </button>
                  <button onClick={() => eliminarEjercicio(ej)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#43474c', borderRadius: '4px', transition: 'color 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {!loading && ejercicios.length > 1 && (
          <p style={{ fontSize: '11px', color: '#43474c', textAlign: 'center', marginTop: '4px', fontWeight: '300' }}>
            Arrastra los ejercicios para cambiar el orden
          </p>
        )}
      </div>
    </div>
  )
}
