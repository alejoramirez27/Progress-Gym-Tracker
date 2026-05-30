'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react'

interface Ejercicio { id_ejercicio: string; nombre: string; orden: number }
interface Serie {
  id_serie: string; numero_serie: number; peso_kg: number | null
  repeticiones: number; rir: number | null; descanso_seg: number | null; notas: string | null; fecha: string
}

const hoy = () => new Date().toISOString().split('T')[0]

export default function RutinaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [ejercicios, setEjercicios]       = useState<Ejercicio[]>([])
  const [loading, setLoading]             = useState(true)
  const [expandido, setExpandido]         = useState<string | null>(null)
  const [series, setSeries]               = useState<Record<string, Serie[]>>({})
  const [mostrarFormEj, setMostrarFormEj] = useState(false)
  const [nombreEj, setNombreEj]           = useState('')
  const [guardandoEj, setGuardandoEj]     = useState(false)
  const [ejercicioActivo, setEjercicioActivo] = useState<string | null>(null)
  const [peso, setPeso]       = useState('')
  const [reps, setReps]       = useState('')
  const [rir, setRir]         = useState('')
  const [descanso, setDescanso] = useState('')
  const [notas, setNotas]     = useState('')
  const [guardandoSerie, setGuardandoSerie] = useState(false)

  const cargarEjercicios = () => {
    setLoading(true)
    fetch(`/api/ejercicios?id_rutina=${id}`).then(r => r.json()).then(d => { setEjercicios(Array.isArray(d) ? d : []); setLoading(false) })
  }
  const cargarSeries = (id_ej: string) => {
    fetch(`/api/series?id_ejercicio=${id_ej}`).then(r => r.json()).then(d => setSeries(p => ({ ...p, [id_ej]: Array.isArray(d) ? d : [] })))
  }

  useEffect(() => { cargarEjercicios() }, [id])

  const toggleEjercicio = (id_ej: string) => {
    if (expandido === id_ej) { setExpandido(null); setEjercicioActivo(null) }
    else { setExpandido(id_ej); setEjercicioActivo(null); if (!series[id_ej]) cargarSeries(id_ej) }
  }

  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardandoEj(true)
    const res  = await fetch('/api/ejercicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_rutina: id, nombre: nombreEj, orden: ejercicios.length + 1 }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoEj(false); return }
    toast.success(`"${nombreEj}" agregado`)
    setNombreEj(''); setMostrarFormEj(false); setGuardandoEj(false); cargarEjercicios()
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
      body: JSON.stringify({ id_ejercicio: id_ej, numero_serie: seriesHoy.length + 1, peso_kg: peso ? Number(peso) : null, repeticiones: Number(reps), rir: rir ? Number(rir) : null, descanso_seg: descanso ? Number(descanso) : null, notas: notas || null }),
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

  const inputStyle = { backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', fontFamily: 'inherit', width: '100%', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => router.push('/rutinas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d9197', padding: '6px', borderRadius: '6px', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e2e8'} onMouseLeave={e => e.currentTarget.style.color = '#8d9197'}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Ejercicios</h1>
            <p style={{ fontSize: '13px', color: '#8d9197', marginTop: '4px', fontWeight: '300' }}>Registra tus series, peso y RIR</p>
          </div>
        </div>
        <button onClick={() => setMostrarFormEj(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: mostrarFormEj ? 'transparent' : '#1e2024', color: mostrarFormEj ? '#8d9197' : '#b1c9e1', border: '1px solid #43474c', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
          {mostrarFormEj ? <><X style={{ width: '13px', height: '13px' }} />Cancelar</> : <><Plus style={{ width: '13px', height: '13px' }} />Ejercicio</>}
        </button>
      </div>

      {/* Form nuevo ejercicio */}
      {mostrarFormEj && (
        <form onSubmit={crearEjercicio} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: '#c3c7cd', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nombre del ejercicio *</label>
            <input style={inputStyle} value={nombreEj} onChange={e => setNombreEj(e.target.value)} placeholder="ej: Press banca, Sentadilla..." required />
          </div>
          <button type="submit" disabled={guardandoEj} style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {guardandoEj ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      )}

      {/* Lista ejercicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: '64px', borderRadius: '12px', backgroundColor: '#1e2024' }} />)}

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
            <div key={ej.id_ejercicio} style={{ backgroundColor: '#1e2024', border: `1px solid ${expandido === ej.id_ejercicio ? '#8d9197' : '#43474c'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
              {/* Cabecera */}
              <div onClick={() => toggleEjercicio(ej.id_ejercicio)}
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#282a2e'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '500', minWidth: '20px' }}>{String(index + 1).padStart(2, '0')}</span>
                  {expandido === ej.id_ejercicio ? <ChevronDown style={{ width: '15px', height: '15px', color: '#b1c9e1' }} /> : <ChevronRight style={{ width: '15px', height: '15px', color: '#8d9197' }} />}
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', margin: 0 }}>{ej.nombre}</p>
                  {seriesHoy.length > 0 && (
                    <span style={{ backgroundColor: '#1a3345', color: '#b1c9e1', fontSize: '11px', padding: '2px 8px', borderRadius: '20px' }}>
                      {seriesHoy.length} serie{seriesHoy.length !== 1 ? 's' : ''} hoy
                    </span>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); eliminarEjercicio(ej) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#43474c', borderRadius: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                  <Trash2 style={{ width: '13px', height: '13px' }} />
                </button>
              </div>

              {/* Expandido */}
              {expandido === ej.id_ejercicio && (
                <div style={{ borderTop: '1px solid #282a2e', padding: '20px 24px', backgroundColor: '#16181c' }}>
                  {/* Series hoy */}
                  {seriesHoy.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '10px', color: '#43474c', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', marginTop: 0 }}>Series de hoy</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {seriesHoy.map(serie => (
                          <div key={serie.id_serie} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e2024', borderRadius: '8px', padding: '10px 14px', border: '1px solid #282a2e' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '600', minWidth: '24px' }}>S{serie.numero_serie}</span>
                              {serie.peso_kg && <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8' }}>{serie.peso_kg}<span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}> kg</span></span>}
                              <span style={{ fontSize: '13px', color: '#c3c7cd' }}>{serie.repeticiones}<span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}> reps</span></span>
                              {serie.rir !== null && <span style={{ fontSize: '11px', color: '#7ab8d4', backgroundColor: '#1a2f3a', padding: '2px 8px', borderRadius: '4px' }}>RIR {serie.rir}</span>}
                              {serie.descanso_seg && <span style={{ fontSize: '11px', color: '#43474c' }}>{serie.descanso_seg}s</span>}
                            </div>
                            <button onClick={() => eliminarSerie(serie.id_serie, ej.id_ejercicio)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43474c' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
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
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#b1c9e1'; e.currentTarget.style.color = '#b1c9e1' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#43474c'; e.currentTarget.style.color = '#8d9197' }}>
                      <Plus style={{ width: '14px', height: '14px' }} /> Registrar serie
                    </button>
                  ) : (
                    <form onSubmit={e => registrarSerie(e, ej.id_ejercicio)} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '10px', padding: '16px' }}>
                      <p style={{ fontSize: '11px', color: '#8d9197', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', marginTop: 0 }}>Nueva serie</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        {[
                          { label: 'Peso (kg)', val: peso, set: setPeso, type: 'number', step: '0.5', min: '0', ph: '80' },
                          { label: 'Reps *',    val: reps, set: setReps, type: 'number', step: '1',   min: '1', ph: '10' },
                          { label: 'RIR (0-5)', val: rir,  set: setRir,  type: 'number', step: '1',   min: '0', ph: '2'  },
                          { label: 'Descanso s',val: descanso, set: setDescanso, type: 'number', step: '5', min: '0', ph: '90' },
                        ].map(f => (
                          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                            <input style={inputStyle} type={f.type} step={f.step} min={f.min} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required={f.label.includes('*')} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                        <label style={{ fontSize: '10px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</label>
                        <input style={inputStyle} value={notas} onChange={e => setNotas(e.target.value)} placeholder="ej: Buena técnica, sin dolor..." />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEjercicioActivo(null)} style={{ backgroundColor: 'transparent', border: '1px solid #43474c', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', color: '#8d9197', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                        <button type="submit" disabled={guardandoSerie} style={{ backgroundColor: '#b1c9e1', color: '#0c0e12', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{guardandoSerie ? 'Guardando...' : 'Guardar'}</button>
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
