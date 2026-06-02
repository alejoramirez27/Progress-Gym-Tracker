'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, X, Pencil, Check, GripVertical, ChevronDown, BookOpen } from 'lucide-react'

const BANCO_EJERCICIOS: Record<string, string[]> = {
  'Pecho': ['Press banca', 'Press banca inclinado', 'Press banca declinado', 'Aperturas con mancuernas', 'Fondos en paralelas', 'Press con mancuernas', 'Cruces en polea'],
  'Espalda': ['Jalón al pecho', 'Remo en barra', 'Remo con mancuerna', 'Pull-up', 'Chin-up', 'Remo en polea baja', 'Peso muerto', 'Peso muerto sumo'],
  'Hombros': ['Press militar', 'Press con mancuernas', 'Elevaciones laterales', 'Elevaciones frontales', 'Pájaros', 'Press Arnold', 'Face pull'],
  'Bíceps': ['Curl con barra', 'Curl con mancuernas', 'Curl martillo', 'Curl predicador', 'Curl concentrado', 'Curl en polea'],
  'Tríceps': ['Press francés', 'Extensión en polea', 'Patada de tríceps', 'Fondos en banco', 'Extensión sobre la cabeza', 'Skull crusher'],
  'Cuádriceps': ['Sentadilla', 'Sentadilla frontal', 'Prensa de pierna', 'Extensión de cuádriceps', 'Zancadas', 'Sentadilla búlgara', 'Hack squat'],
  'Isquios/Glúteos': ['Peso muerto rumano', 'Curl femoral', 'Hip thrust', 'Buenos días', 'Extensión de cadera en polea', 'Sentadilla sumo'],
  'Gemelos': ['Elevación de talones de pie', 'Elevación de talones sentado', 'Prensa de gemelos'],
  'Core': ['Plancha', 'Crunch', 'Crunch en polea', 'Elevación de piernas', 'Ab wheel', 'Russian twist', 'Plancha lateral'],
}

interface Rutina    { id_rutina: string; nombre: string; descripcion: string | null; grupos: string | null; dia_semana: string | null }
interface Ejercicio { id_ejercicio: string; nombre: string; orden: number; num_series: number }

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function RutinaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [rutina, setRutina]                 = useState<Rutina | null>(null)
  const [editandoRutina, setEditandoRutina] = useState(false)
  const [editNombre, setEditNombre]         = useState('')
  const [editDesc, setEditDesc]             = useState('')
  const [editGrupos, setEditGrupos]         = useState('')
  const [editDia, setEditDia]               = useState('')
  const [guardandoRutina, setGuardandoRutina] = useState(false)

  const [ejercicios, setEjercicios]         = useState<Ejercicio[]>([])
  const [loading, setLoading]               = useState(true)
  const [mostrarFormEj, setMostrarFormEj]   = useState(false)
  const [mostrarBanco, setMostrarBanco]     = useState(false)
  const [grupoBanco, setGrupoBanco]         = useState(Object.keys(BANCO_EJERCICIOS)[0])
  const [nombreEj, setNombreEj]             = useState('')
  const [numSeriesEj, setNumSeriesEj]       = useState('3')
  const [guardandoEj, setGuardandoEj]       = useState(false)
  const [editandoEj, setEditandoEj]         = useState<string | null>(null)
  const [editNombreEj, setEditNombreEj]     = useState('')
  const [editNumSeriesEj, setEditNumSeries] = useState('3')

  const [draggedIdx, setDraggedIdx]   = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const cargarRutina = () =>
    fetch(`/api/rutinas/${id}`).then(r => r.json()).then(d => { if (d.id_rutina) setRutina(d) })

  const cargarEjercicios = () => {
    setLoading(true)
    fetch(`/api/ejercicios?id_rutina=${id}`).then(r => r.json()).then(d => {
      setEjercicios(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }
  useEffect(() => { cargarRutina(); cargarEjercicios() }, [id])

  const abrirEdicionRutina = () => {
    if (!rutina) return
    setEditNombre(rutina.nombre); setEditDesc(rutina.descripcion ?? '')
    setEditGrupos(rutina.grupos ?? ''); setEditDia(rutina.dia_semana ?? '')
    setEditandoRutina(true)
  }

  const guardarRutina = async () => {
    if (!editNombre.trim()) return
    setGuardandoRutina(true)
    const res = await fetch(`/api/rutinas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: editNombre, descripcion: editDesc, grupos: editGrupos, dia_semana: editDia || null }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoRutina(false); return }
    setRutina(data); setEditandoRutina(false); setGuardandoRutina(false)
    toast.success('Rutina actualizada')
  }

  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardandoEj(true)
    try {
      const res = await fetch('/api/ejercicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_rutina: id, nombre: nombreEj, orden: ejercicios.length + 1, num_series: Number(numSeriesEj) || 3 }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al agregar'); return }
      toast.success(`"${nombreEj}" agregado`)
      setNombreEj(''); setNumSeriesEj('3'); setMostrarFormEj(false)
      cargarEjercicios()
    } catch { toast.error('Error de conexión') } finally { setGuardandoEj(false) }
  }

  const guardarEditEj = async (id_ej: string) => {
    try {
      const res = await fetch(`/api/ejercicios/${id_ej}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: editNombreEj, num_series: Number(editNumSeriesEj) || 3 }) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); return }
      toast.success('Ejercicio actualizado'); setEditandoEj(null); cargarEjercicios()
    } catch { toast.error('Error de conexión') }
  }

  const eliminarEjercicio = async (ej: Ejercicio) => {
    if (!confirm(`¿Eliminar "${ej.nombre}"?`)) return
    await fetch(`/api/ejercicios/${ej.id_ejercicio}`, { method: 'DELETE' })
    toast.success(`"${ej.nombre}" eliminado`); cargarEjercicios()
  }

  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(idx))
    setTimeout(() => setDraggedIdx(idx), 0)
  }
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'
    if (draggedIdx === null || draggedIdx === idx) return
    setDragOverIdx(idx)
  }
  const onDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    const fromIdx = draggedIdx ?? Number(e.dataTransfer.getData('text/plain'))
    if (fromIdx === null || fromIdx === dropIdx) { setDraggedIdx(null); setDragOverIdx(null); return }
    const next = [...ejercicios]; const [moved] = next.splice(fromIdx, 1); next.splice(dropIdx, 0, moved)
    setEjercicios(next); setDraggedIdx(null); setDragOverIdx(null)
    await Promise.all(next.map((ej, i) => fetch(`/api/ejercicios/${ej.id_ejercicio}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orden: i + 1 }) })))
  }
  const onDragEnd = () => { setDraggedIdx(null); setDragOverIdx(null) }

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: '13px', boxSizing: 'border-box' }
  const sel: React.CSSProperties = { ...inp, appearance: 'none', cursor: 'pointer', paddingRight: '26px' }

  const tags = rutina?.grupos ? rutina.grupos.split(',').map(g => g.trim()).filter(Boolean) : []

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => router.push('/rutinas')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', transition: 'color var(--t-sm) var(--ease-out)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          aria-label="Volver a rutinas"
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Mis Rutinas</span>
      </div>

      {/* Rutina header */}
      {!editandoRutina ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {rutina?.nombre ?? <span style={{ color: 'var(--text-disabled)' }}>—</span>}
              </h1>
              {rutina?.dia_semana && <span className="tag tag-day">{rutina.dia_semana}</span>}
            </div>
            {rutina?.descripcion && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 8px', fontWeight: '300' }}>{rutina.descripcion}</p>
            )}
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {tags.map(tag => <span key={tag} className="tag tag-accent">{tag}</span>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={abrirEdicionRutina}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '6px 12px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color var(--t-sm) var(--ease-out), color var(--t-sm) var(--ease-out)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-default)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              <Pencil style={{ width: '11px', height: '11px' }} /> Editar
            </button>
            <button onClick={() => { setMostrarBanco(false); setMostrarFormEj(f => !f) }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: mostrarFormEj ? 'transparent' : 'color-mix(in srgb, var(--accent) 10%, var(--surface-card))', color: mostrarFormEj ? 'var(--text-secondary)' : 'var(--accent)', border: `1px solid ${mostrarFormEj ? 'var(--border-default)' : 'color-mix(in srgb, var(--accent) 25%, transparent)'}`, borderRadius: 'var(--r-md)', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: 'all var(--t-sm) var(--ease-out)' }}
            >
              {mostrarFormEj ? <><X style={{ width: '11px', height: '11px' }} />Cancelar</> : <><Plus style={{ width: '11px', height: '11px' }} />Ejercicio</>}
            </button>
            <button onClick={() => { setMostrarFormEj(false); setMostrarBanco(b => !b) }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: mostrarBanco ? 'transparent' : 'var(--surface-raised)', color: mostrarBanco ? 'var(--text-secondary)' : 'var(--text-secondary)', border: `1px solid ${mostrarBanco ? 'var(--border-default)' : 'var(--border-subtle)'}`, borderRadius: 'var(--r-md)', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all var(--t-sm) var(--ease-out)' }}
            >
              <BookOpen style={{ width: '11px', height: '11px' }} />
              {mostrarBanco ? 'Cerrar' : 'Banco'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '18px', marginBottom: '28px', borderColor: 'var(--accent)' }}>
          <p className="label" style={{ marginBottom: '14px', marginTop: 0 }}>Editar rutina</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="label">Nombre *</label>
              <input style={inp} value={editNombre} onChange={e => setEditNombre(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="label">Grupos musculares</label>
                <input style={inp} value={editGrupos} onChange={e => setEditGrupos(e.target.value)} placeholder="Pecho, Tríceps..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="label">Día de la semana</label>
                <div style={{ position: 'relative' }}>
                  <select style={sel} value={editDia} onChange={e => setEditDia(e.target.value)}>
                    <option value="">Sin asignar</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="label">Descripción</label>
              <input style={inp} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditandoRutina(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '6px 14px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={guardarRutina} disabled={guardandoRutina || !editNombre.trim()} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '6px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Check style={{ width: '11px', height: '11px' }} /> {guardandoRutina ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Banco de ejercicios */}
      {mostrarBanco && (
        <div className="card" style={{ padding: '16px', marginBottom: '16px', overflow: 'hidden' }}>
          <p className="label" style={{ margin: '0 0 12px' }}>Banco de ejercicios</p>
          {/* Grupo tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Object.keys(BANCO_EJERCICIOS).map(grupo => (
              <button key={grupo} onClick={() => setGrupoBanco(grupo)}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  backgroundColor: grupoBanco === grupo ? 'var(--accent)' : 'var(--surface-raised)',
                  color: grupoBanco === grupo ? '#0c0e12' : 'var(--text-secondary)',
                  fontWeight: grupoBanco === grupo ? '500' : '400',
                }}>
                {grupo}
              </button>
            ))}
          </div>
          {/* Ejercicios del grupo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {BANCO_EJERCICIOS[grupoBanco].map(ej => (
              <button key={ej} onClick={async () => {
                setGuardandoEj(true)
                const res = await fetch('/api/ejercicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_rutina: id, nombre: ej, orden: ejercicios.length + 1, num_series: 3 }) })
                const data = await res.json()
                if (!res.ok) { toast.error(data.error ?? 'Error'); setGuardandoEj(false); return }
                toast.success(`"${ej}" agregado`)
                setGuardandoEj(false); cargarEjercicios()
              }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', color: 'var(--text-primary)', backgroundColor: 'transparent', textAlign: 'left', transition: 'background-color var(--t-sm) var(--ease-out)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {ej}
                <Plus style={{ width: '12px', height: '12px', color: 'var(--accent)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form nuevo ejercicio */}
      {mostrarFormEj && (
        <form onSubmit={crearEjercicio} className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="label" htmlFor="ej-nombre">Nombre del ejercicio *</label>
              <input id="ej-nombre" style={inp} value={nombreEj} onChange={e => setNombreEj(e.target.value)} placeholder="Press banca, Sentadilla..." required autoFocus />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="label" htmlFor="ej-series">Series</label>
              <input id="ej-series" style={{ ...inp, textAlign: 'center' }} type="number" min="1" max="20" value={numSeriesEj} onChange={e => setNumSeriesEj(e.target.value)} />
            </div>
            <button type="submit" disabled={guardandoEj} style={{ backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>
              {guardandoEj ? 'Agregando...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      {/* Ejercicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {loading && [56, 48, 56].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}

        {!loading && ejercicios.length === 0 && (
          <div className="card empty-state">
            <p>Sin ejercicios todavía</p>
            <p className="empty-hint">Agrega tu primer ejercicio con el botón de arriba</p>
          </div>
        )}

        {!loading && ejercicios.map((ej, index) => {
          const isDragging = draggedIdx === index
          const isDragOver = dragOverIdx === index && draggedIdx !== index
          return (
            <div
              key={ej.id_ejercicio}
              draggable
              onDragStart={e => onDragStart(e, index)}
              onDragOver={e => onDragOver(e, index)}
              onDrop={e => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className="card"
              style={{
                opacity: isDragging ? 0.4 : 1,
                borderColor: isDragOver ? 'var(--accent)' : undefined,
                transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                transition: 'border-color var(--t-sm) var(--ease-out), opacity var(--t-sm) var(--ease-out), transform var(--t-sm) var(--ease-out)',
                overflow: 'hidden',
              }}
            >
              {editandoEj === ej.id_ejercicio ? (
                <div style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--surface-raised)' }}>
                  <input style={{ ...inp, flex: 1 }} value={editNombreEj} onChange={e => setEditNombreEj(e.target.value)} placeholder="Nombre" autoFocus />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label className="label">Series</label>
                    <input style={{ ...inp, width: '58px', textAlign: 'center' }} type="number" min="1" max="20" value={editNumSeriesEj} onChange={e => setEditNumSeries(e.target.value)} />
                  </div>
                  <button onClick={() => guardarEditEj(ej.id_ejercicio)} style={{ backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '7px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Check style={{ width: '12px', height: '12px' }} />
                  </button>
                  <button onClick={() => setEditandoEj(null)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '7px 9px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ cursor: 'grab', color: 'var(--text-disabled)', padding: '3px 2px', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color var(--t-sm) var(--ease-out)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                    title="Arrastrar para reordenar"
                  >
                    <GripVertical style={{ width: '13px', height: '13px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-disabled)', fontWeight: '500', minWidth: '18px', fontVariantNumeric: 'tabular-nums' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{ej.nombre}</p>
                  <span className="tag tag-accent">{ej.num_series ?? 3} series</span>
                  <button onClick={e => { e.stopPropagation(); setEditandoEj(ej.id_ejercicio); setEditNombreEj(ej.nombre); setEditNumSeries(String(ej.num_series ?? 3)) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-disabled)', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                    aria-label="Editar ejercicio"
                  >
                    <Pencil style={{ width: '12px', height: '12px' }} />
                  </button>
                  <button onClick={() => eliminarEjercicio(ej)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: 'var(--text-disabled)', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-dim)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                    aria-label="Eliminar ejercicio"
                  >
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {!loading && ejercicios.length > 1 && (
          <p style={{ fontSize: '11px', color: 'var(--text-disabled)', textAlign: 'center', marginTop: '8px' }}>
            Arrastra para cambiar el orden
          </p>
        )}
      </div>
    </div>
  )
}
