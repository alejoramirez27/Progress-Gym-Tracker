'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, X, Pencil, Check, Target } from 'lucide-react'

interface Rutina   { id_rutina: string; nombre: string; descripcion: string | null; grupos: string | null }
interface Ejercicio { id_ejercicio: string; nombre: string; orden: number; num_series: number }
interface Serie {
  id_serie: string; numero_serie: number; peso_kg: number | null
  repeticiones: number; rir: number | null; descanso_seg: number | null; notas: string | null; fecha: string
}

const hoy = () => new Date().toISOString().split('T')[0]

export default function RutinaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  // Rutina
  const [rutina, setRutina]           = useState<Rutina | null>(null)
  const [editando, setEditando]       = useState(false)
  const [editNombre, setEditNombre]   = useState('')
  const [editDesc, setEditDesc]       = useState('')
  const [editGrupos, setEditGrupos]   = useState('')
  const [guardandoEdit, setGuardandoEdit] = useState(false)

  // Ejercicios
  const [ejercicios, setEjercicios]       = useState<Ejercicio[]>([])
  const [loading, setLoading]             = useState(true)
  const [expandido, setExpandido]         = useState<string | null>(null)
  const [series, setSeries]               = useState<Record<string, Serie[]>>({})
  const [mostrarFormEj, setMostrarFormEj] = useState(false)
  const [nombreEj, setNombreEj]           = useState('')
  const [numSeriesEj, setNumSeriesEj]     = useState('3')
  const [guardandoEj, setGuardandoEj]     = useState(false)
  // Edición inline de ejercicio
  const [editandoEj, setEditandoEj]       = useState<string | null>(null)
  const [editNombreEj, setEditNombreEj]   = useState('')
  const [editNumSeriesEj, setEditNumSeriesEj] = useState('3')
  const [ejercicioActivo, setEjercicioActivo] = useState<string | null>(null)
  const [peso, setPeso]         = useState('')
  const [reps, setReps]         = useState('')
  const [rir, setRir]           = useState('')
  const [descanso, setDescanso] = useState('')
  const [notas, setNotas]       = useState('')
  const [guardandoSerie, setGuardandoSerie] = useState(false)

  const cargarRutina = () => {
    fetch(`/api/rutinas/${id}`).then(r => r.json()).then(d => {
      if (d.id_rutina) setRutina(d)
    })
  }

  const cargarEjercicios = () => {
    setLoading(true)
    fetch(`/api/ejercicios?id_rutina=${id}`).then(r => r.json()).then(d => {
      setEjercicios(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }

  const cargarSeries = (id_ej: string) => {
    fetch(`/api/series?id_ejercicio=${id_ej}`).then(r => r.json()).then(d =>
      setSeries(p => ({ ...p, [id_ej]: Array.isArray(d) ? d : [] }))
    )
  }

  useEffect(() => { cargarRutina(); cargarEjercicios() }, [id])

  const abrirEdicion = () => {
    if (!rutina) return
    setEditNombre(rutina.nombre)
    setEditDesc(rutina.descripcion ?? '')
    setEditGrupos(rutina.grupos ?? '')
    setEditando(true)
  }

  const guardarEdicion = async () => {
    if (!editNombre.trim()) return
    setGuardandoEdit(true)
    const res  = await fetch(`/api/rutinas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: editNombre, descripcion: editDesc, grupos: editGrupos }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoEdit(false); return }
    setRutina(data)
    setEditando(false)
    setGuardandoEdit(false)
    toast.success('Rutina actualizada')
  }

  const toggleEjercicio = (id_ej: string) => {
    if (expandido === id_ej) { setExpandido(null); setEjercicioActivo(null) }
    else { setExpandido(id_ej); setEjercicioActivo(null); if (!series[id_ej]) cargarSeries(id_ej) }
  }

  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardandoEj(true)
    const res  = await fetch('/api/ejercicios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rutina: id, nombre: nombreEj, orden: ejercicios.length + 1, num_series: Number(numSeriesEj) || 3 }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoEj(false); return }
    toast.success(`"${nombreEj}" agregado`)
    setNombreEj(''); setNumSeriesEj('3'); setMostrarFormEj(false); setGuardandoEj(false); cargarEjercicios()
  }

  const abrirEditEj = (ej: Ejercicio, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditandoEj(ej.id_ejercicio)
    setEditNombreEj(ej.nombre)
    setEditNumSeriesEj(String(ej.num_series ?? 3))
    if (expandido === ej.id_ejercicio) setExpandido(null)
  }

  const guardarEditEj = async (id_ej: string) => {
    const res = await fetch(`/api/ejercicios/${id_ej}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: editNombreEj, num_series: Number(editNumSeriesEj) || 3 }),
    })
    if (!res.ok) { toast.error('Error al guardar'); return }
    toast.success('Ejercicio actualizado')
    setEditandoEj(null)
    cargarEjercicios()
  }

  const eliminarEjercicio = async (ej: Ejercicio) => {
    if (!confirm(`¿Eliminar "${ej.nombre}" y todas sus series?`)) return
    await fetch(`/api/ejercicios/${ej.id_ejercicio}`, { method: 'DELETE' })
    toast.success(`"${ej.nombre}" eliminado`); cargarEjercicios()
  }

  const registrarSerie = async (e: React.FormEvent, id_ej: string) => {
    e.preventDefault(); setGuardandoSerie(true)
    const seriesHoy = (series[id_ej] ?? []).filter(s => s.fecha === hoy())
    const res = await fetch('/api/series', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_ejercicio: id_ej, numero_serie: seriesHoy.length + 1,
        peso_kg: peso ? Number(peso) : null, repeticiones: Number(reps),
        rir: rir ? Number(rir) : null, descanso_seg: descanso ? Number(descanso) : null,
        notas: notas || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoSerie(false); return }
    toast.success('Serie registrada')
    setPeso(''); setReps(''); setRir(''); setDescanso(''); setNotas('')
    setGuardandoSerie(false); setEjercicioActivo(null); cargarSeries(id_ej)
  }

  const eliminarSerie = async (id_serie: string, id_ej: string) => {
    await fetch(`/api/series/${id_serie}`, { method: 'DELETE' })
    toast.success('Serie eliminada'); cargarSeries(id_ej)
  }

  const inputStyle = {
    backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8',
    borderRadius: '6px', padding: '8px 10px', fontSize: '13px',
    fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' as const,
  }

  const COLORES_TAG = ['#1e3a4a', '#1e2f3a', '#2a1e3a', '#1e3a2a', '#3a2a1e']
  const TEXTO_TAG   = ['#7ab8d4', '#7ab0c9', '#a07ad4', '#7ad4a0', '#d4a07a']

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

        {/* Nombre de la rutina + edición */}
        {!editando ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: '0 0 4px' }}>
                {rutina?.nombre ?? <span style={{ color: '#43474c' }}>—</span>}
              </h1>
              {rutina?.descripcion && (
                <p style={{ fontSize: '13px', color: '#8d9197', margin: '0 0 8px', fontWeight: '300' }}>{rutina.descripcion}</p>
              )}
              {rutina?.grupos && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {rutina.grupos.split(',').map((g, i) => {
                    const tag = g.trim()
                    return tag ? (
                      <span key={tag} style={{ backgroundColor: COLORES_TAG[i % COLORES_TAG.length], color: TEXTO_TAG[i % TEXTO_TAG.length], fontSize: '11px', padding: '2px 10px', borderRadius: '20px', fontWeight: '500' }}>
                        {tag}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
              <button onClick={abrirEdicion}
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
          /* Formulario de edición inline */
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #b1c9e1', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '12px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', marginTop: 0 }}>Editar rutina</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre *</label>
                <input style={inputStyle} value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre de la rutina" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grupos musculares</label>
                <input style={inputStyle} value={editGrupos} onChange={e => setEditGrupos(e.target.value)} placeholder="ej: Pecho, Tríceps, Hombros" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descripción</label>
                <input style={inputStyle} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción opcional" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditando(false)}
                style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardandoEdit || !editNombre.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Check style={{ width: '12px', height: '12px' }} />
                {guardandoEdit ? 'Guardando...' : 'Guardar'}
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
              <input style={inputStyle} value={nombreEj} onChange={e => setNombreEj(e.target.value)} placeholder="ej: Press banca, Sentadilla..." required />
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

      {/* Lista ejercicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && Array.from({ length: 3 }).map((_, i) =>
          <Skeleton key={i} style={{ height: '64px', borderRadius: '12px', backgroundColor: '#1e2024' }} />
        )}

        {!loading && ejercicios.length === 0 && (
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '56px', textAlign: 'center' }}>
            <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Sin ejercicios todavía</p>
            <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>Agrega tu primer ejercicio con el botón de arriba</p>
          </div>
        )}

        {!loading && ejercicios.map((ej, index) => {
          const seriesEj  = series[ej.id_ejercicio] ?? []
          const seriesHoy = seriesEj.filter(s => s.fecha === hoy())
          return (
            <div key={ej.id_ejercicio}
              style={{ backgroundColor: '#1e2024', border: `1px solid ${expandido === ej.id_ejercicio ? '#8d9197' : '#43474c'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>

              {/* Edición inline de ejercicio */}
              {editandoEj === ej.id_ejercicio ? (
                <div style={{ padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'center', borderBottom: '1px solid #282a2e', backgroundColor: '#16181c' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }} value={editNombreEj}
                    onChange={e => setEditNombreEj(e.target.value)} placeholder="Nombre del ejercicio" autoFocus />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label style={{ fontSize: '9px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Series</label>
                    <input style={{ ...inputStyle, width: '60px', textAlign: 'center' }} type="number" min="1" max="20"
                      value={editNumSeriesEj} onChange={e => setEditNumSeriesEj(e.target.value)} />
                  </div>
                  <button onClick={() => guardarEditEj(ej.id_ejercicio)}
                    style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '7px 12px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check style={{ width: '12px', height: '12px' }} />
                  </button>
                  <button onClick={() => setEditandoEj(null)}
                    style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <X style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              ) : (
              /* Cabecera ejercicio */
              <div onClick={() => toggleEjercicio(ej.id_ejercicio)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#282a2e'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '500', minWidth: '20px' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {expandido === ej.id_ejercicio
                    ? <ChevronDown style={{ width: '15px', height: '15px', color: '#b1c9e1' }} />
                    : <ChevronRight style={{ width: '15px', height: '15px', color: '#8d9197' }} />
                  }
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', margin: 0 }}>{ej.nombre}</p>
                  <span style={{ backgroundColor: '#1a2f3a', color: '#7ab8d4', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>
                    {ej.num_series ?? 3} series
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={e => abrirEditEj(ej, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#43474c', borderRadius: '4px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#b1c9e1'}
                    onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                    <Pencil style={{ width: '13px', height: '13px' }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); eliminarEjercicio(ej) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#43474c', borderRadius: '4px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>
              )}

              {/* Panel expandido */}
              {expandido === ej.id_ejercicio && (
                <div style={{ borderTop: '1px solid #282a2e', padding: '20px 24px', backgroundColor: '#16181c' }}>

                  {/* Series de hoy */}
                  {seriesHoy.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '10px', color: '#43474c', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', marginTop: 0 }}>
                        Series de hoy
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {seriesHoy.map(serie => (
                          <div key={serie.id_serie}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e2024', borderRadius: '8px', padding: '10px 14px', border: '1px solid #282a2e' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '600', minWidth: '24px' }}>S{serie.numero_serie}</span>
                              {serie.peso_kg != null && (
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8' }}>
                                  {serie.peso_kg}<span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}> kg</span>
                                </span>
                              )}
                              <span style={{ fontSize: '13px', color: '#c3c7cd' }}>
                                {serie.repeticiones}<span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}> reps</span>
                              </span>
                              {serie.rir !== null && (
                                <span style={{ fontSize: '11px', color: '#7ab8d4', backgroundColor: '#1a2f3a', padding: '2px 8px', borderRadius: '4px' }}>RIR {serie.rir}</span>
                              )}
                              {serie.descanso_seg != null && (
                                <span style={{ fontSize: '11px', color: '#43474c' }}>{serie.descanso_seg}s</span>
                              )}
                              {serie.notas && (
                                <span style={{ fontSize: '11px', color: '#43474c', fontStyle: 'italic' }}>{serie.notas}</span>
                              )}
                            </div>
                            <button onClick={() => eliminarSerie(serie.id_serie, ej.id_ejercicio)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43474c', padding: '4px', flexShrink: 0, transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botón / Form nueva serie */}
                  {ejercicioActivo !== ej.id_ejercicio ? (
                    <button onClick={() => setEjercicioActivo(ej.id_ejercicio)}
                      style={{ width: '100%', backgroundColor: 'transparent', border: '1px dashed #43474c', borderRadius: '8px', padding: '10px', color: '#8d9197', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#b1c9e1'; e.currentTarget.style.color = '#b1c9e1' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#43474c'; e.currentTarget.style.color = '#8d9197' }}>
                      <Plus style={{ width: '14px', height: '14px' }} /> Registrar serie
                    </button>
                  ) : (
                    <form onSubmit={e => registrarSerie(e, ej.id_ejercicio)}
                      style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ fontSize: '11px', color: '#8d9197', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', marginTop: 0 }}>Nueva serie</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        {[
                          { label: 'Peso (kg)', val: peso,    set: setPeso,    step: '0.5', min: '0',  ph: '80',  req: false },
                          { label: 'Reps *',    val: reps,    set: setReps,    step: '1',   min: '1',  ph: '10',  req: true  },
                          { label: 'RIR (0-5)', val: rir,     set: setRir,     step: '1',   min: '0',  ph: '2',   req: false },
                          { label: 'Descanso s',val: descanso,set: setDescanso,step: '5',   min: '0',  ph: '90',  req: false },
                        ].map(f => (
                          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                            <input style={inputStyle} type="number" step={f.step} min={f.min} value={f.val}
                              onChange={e => f.set(e.target.value)} placeholder={f.ph} required={f.req} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                        <label style={{ fontSize: '10px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</label>
                        <input style={inputStyle} value={notas} onChange={e => setNotas(e.target.value)} placeholder="ej: Buena técnica, sin dolor..." />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEjercicioActivo(null)}
                          style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Cancelar
                        </button>
                        <button type="submit" disabled={guardandoSerie}
                          style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {guardandoSerie ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
