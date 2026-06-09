'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, History, Trash2, Search, X, Pencil, RotateCcw, TrendingUp, TrendingDown, Minus, ListFilter } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Sesion { id_sesion: string; id_rutina: string; fecha: string; nombre_rutina: string; grupos_rutina: string | null; num_ejercicios: number; num_series: number }
interface SerieDet { id_serie: string; numero_serie: number; peso_kg: number | null; repeticiones: number; rir: number | null; notas: string | null }
interface EjDet { nombre: string; id_ejercicio: string; series: SerieDet[] }
interface EjAnterior { id_ejercicio: string; peso_max: number; fecha: string }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtMes(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}
/** Lunes de la semana que contiene la fecha */
function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(d)
  mon.setDate(d.getDate() + diff)
  return mon.toISOString().split('T')[0]
}
/** Domingo de la semana (6 días después del lunes) */
function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}
function fmtSemana(weekStart: string): string {
  const end = getWeekEnd(weekStart)
  const s = new Date(weekStart + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  const sD = s.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  const eD = e.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  return `${sD} – ${eD}`
}

export default function HistorialPage() {
  const router = useRouter()
  const [sesiones, setSesiones]       = useState<Sesion[]>([])
  const [loading, setLoading]         = useState(true)
  const [expandida, setExpandida]     = useState<string | null>(null)
  const [detalles, setDetalles]       = useState<Record<string, { current: EjDet[]; anterior: EjAnterior[] }>>({})
  const [cargandoDet, setCargandoDet] = useState<string | null>(null)
  const [busqueda, setBusqueda]           = useState('')
  const [filtroMusculo, setFiltroMusculo] = useState<string | null>(null)
  const [filtroOpen, setFiltroOpen]       = useState(false)
  const [mesesCollapsed, setMesesCollapsed]     = useState<Set<string>>(new Set())
  const [semanasCollapsed, setSemanasCollapsed] = useState<Set<string>>(new Set())
  const filtroRef = useRef<HTMLDivElement>(null)

  const toggleMes = (mes: string) => setMesesCollapsed(prev => {
    const next = new Set(prev); next.has(mes) ? next.delete(mes) : next.add(mes); return next
  })
  const toggleSemana = (wk: string) => setSemanasCollapsed(prev => {
    const next = new Set(prev); next.has(wk) ? next.delete(wk) : next.add(wk); return next
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node)) setFiltroOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const cargar = () => {
    setLoading(true)
    fetch('/api/historial').then(r => r.json()).then(d => { setSesiones(Array.isArray(d) ? d : []); setLoading(false) })
  }
  useEffect(() => { cargar() }, [])

  const toggleSesion = async (id: string) => {
    if (expandida === id) { setExpandida(null); return }
    setExpandida(id)
    if (!detalles[id]) {
      setCargandoDet(id)
      const d = await fetch(`/api/historial?id_sesion=${id}`).then(r => r.json())
      setDetalles(p => ({ ...p, [id]: d }))
      setCargandoDet(null)
    }
  }

  const eliminarSesion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta sesión y todas sus series?')) return
    const res = await fetch(`/api/sesiones/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success('Sesión eliminada')
    setSesiones(prev => prev.filter(s => s.id_sesion !== id))
    if (expandida === id) setExpandida(null)
  }

  const repetirSesion = async (sesion: Sesion, e: React.MouseEvent) => {
    e.stopPropagation()
    // Cargar detalle si no está
    let det = detalles[sesion.id_sesion]
    if (!det) {
      const d = await fetch(`/api/historial?id_sesion=${sesion.id_sesion}`).then(r => r.json())
      det = d
      setDetalles(p => ({ ...p, [sesion.id_sesion]: d }))
    }
    // Guardar en localStorage como plantilla
    const plantilla = {
      id_rutina: sesion.id_rutina,
      nombre_rutina: sesion.nombre_rutina,
      ejercicios: (det.current ?? []).map((ej: EjDet) => ({
        id_ejercicio: ej.id_ejercicio,
        nombre: ej.nombre,
        series: ej.series.map((s: SerieDet) => ({
          peso_kg: s.peso_kg != null ? String(s.peso_kg) : '',
          repeticiones: String(s.repeticiones),
          rir: s.rir != null ? String(s.rir) : '',
          notas: '',
        }))
      }))
    }
    localStorage.setItem('repeat_session', JSON.stringify(plantilla))
    toast.success(`Cargando plantilla de "${sesion.nombre_rutina}"`)
    router.push('/progreso')
  }

  // Músculo groups únicos
  const musculosUnicos = Array.from(
    new Set(
      sesiones.flatMap(s =>
        s.grupos_rutina
          ? s.grupos_rutina.split(',').map(g => g.trim()).filter(Boolean)
          : []
      )
    )
  ).sort()

  const sesionesFiltered = sesiones.filter(s => {
    const matchBusqueda = busqueda === '' ||
      s.nombre_rutina.toLowerCase().includes(busqueda.toLowerCase()) ||
      fmtFecha(s.fecha).toLowerCase().includes(busqueda.toLowerCase())
    const matchMusculo = !filtroMusculo ||
      (s.grupos_rutina ?? '').split(',').map(g => g.trim()).includes(filtroMusculo)
    return matchBusqueda && matchMusculo
  })

  // mes → semana → sesiones
  const porMes: Record<string, Record<string, Sesion[]>> = {}
  for (const s of sesionesFiltered) {
    const mes = s.fecha.substring(0, 7)
    const wk  = getWeekKey(s.fecha)
    if (!porMes[mes]) porMes[mes] = {}
    if (!porMes[mes][wk]) porMes[mes][wk] = []
    porMes[mes][wk].push(s)
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Historial</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {!loading && `${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''} registrada${sesiones.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {!loading && sesiones.length > 0 && (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Buscar por rutina o fecha..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 32px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            {busqueda && (
              <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: '2px' }}>
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>

          {/* Filter button + dropdown */}
          {musculosUnicos.length > 0 && (
            <div ref={filtroRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setFiltroOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '13px', fontWeight: '500',
                  backgroundColor: filtroMusculo ? 'color-mix(in srgb, var(--accent) 10%, var(--surface-raised))' : 'var(--surface-raised)',
                  color: filtroMusculo ? 'var(--accent)' : 'var(--text-secondary)',
                  border: filtroMusculo ? '1px solid color-mix(in srgb, var(--accent) 35%, var(--border-subtle))' : '1px solid var(--border-subtle)',
                  transition: 'all var(--t-sm) var(--ease-out)',
                  whiteSpace: 'nowrap',
                }}
              >
                <ListFilter style={{ width: '12px', height: '12px' }} />
                {filtroMusculo ?? 'Músculo'}
                <ChevronDown style={{ width: '11px', height: '11px', opacity: 0.6, transform: filtroOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--t-sm) var(--ease-out)' }} />
              </button>

              {filtroOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 50,
                  backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--r-md)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  minWidth: '180px', padding: '6px', animation: 'fadeUp 0.12s ease both',
                }}>
                  {[null, ...musculosUnicos].map(m => (
                    <button key={m ?? '__todos'}
                      onClick={() => { setFiltroMusculo(m); setFiltroOpen(false) }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '7px 10px', borderRadius: 'var(--r-sm)',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '13px',
                        backgroundColor: filtroMusculo === m ? 'color-mix(in srgb, var(--accent) 10%, var(--surface-raised))' : 'transparent',
                        color: filtroMusculo === m ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: filtroMusculo === m ? '500' : '400',
                        transition: 'background-color var(--t-sm) var(--ease-out), color var(--t-sm) var(--ease-out)',
                      }}
                      onMouseEnter={e => { if (filtroMusculo !== m) { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                      onMouseLeave={e => { if (filtroMusculo !== m) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                    >
                      {m ?? 'Todos los grupos'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[64, 56, 64, 56].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      )}

      {!loading && sesiones.length === 0 && (
        <div className="card empty-state">
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--surface-raised))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History style={{ width: '26px', height: '26px', color: 'var(--accent)' }} />
          </div>
          <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)', margin: '4px 0 2px' }}>Cada rep cuenta. Empieza a escribir tu historia</p>
          <p className="empty-hint" style={{ maxWidth: '280px', textAlign: 'center' }}>Cuando termines tu primer entrenamiento quedará guardado aquí para siempre.</p>
          <button onClick={() => router.push('/progreso')}
            style={{ marginTop: '4px', padding: '8px 20px', backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: '13px', fontFamily: 'inherit', fontWeight: '500', cursor: 'pointer', transition: 'opacity var(--t-sm) var(--ease-out)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Registrar entrenamiento
          </button>
        </div>
      )}
      {!loading && sesiones.length > 0 && sesionesFiltered.length === 0 && (
        <div className="card empty-state"><Search style={{ width: '26px', height: '26px' }} /><p>Sin resultados para "{busqueda}"</p></div>
      )}

      {!loading && Object.entries(porMes).map(([mes, semanas]) => {
        const allSesiones = Object.values(semanas).flat()
        const mesOpen = !mesesCollapsed.has(mes)
        return (
          <div key={mes} style={{ marginBottom: '24px' }}>
            {/* ── Cabecera de mes (colapsable) ── */}
            <div
              onClick={() => toggleMes(mes)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleMes(mes)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
            >
              <ChevronDown style={{ width: '13px', height: '13px', color: 'var(--text-disabled)', flexShrink: 0, transform: mesOpen ? 'none' : 'rotate(-90deg)', transition: 'transform var(--t-sm) var(--ease-out)' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'capitalize', letterSpacing: '0.04em' }}>{fmtMes(allSesiones[0].fecha)}</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-faint)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{allSesiones.length} sesión{allSesiones.length !== 1 ? 'es' : ''}</span>
            </div>

            {mesOpen && Object.entries(semanas).map(([wk, sessSemana]) => {
              const wkOpen = !semanasCollapsed.has(wk)
              return (
                <div key={wk} style={{ marginBottom: '10px' }}>
                  {/* ── Cabecera de semana (colapsable) ── */}
                  <div
                    onClick={() => toggleSemana(wk)}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && toggleSemana(wk)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', marginBottom: '4px', borderRadius: 'var(--r-sm)', cursor: 'pointer', userSelect: 'none', transition: 'background-color var(--t-sm) var(--ease-out)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ChevronRight style={{ width: '11px', height: '11px', color: 'var(--text-disabled)', flexShrink: 0, transform: wkOpen ? 'rotate(90deg)' : 'none', transition: 'transform var(--t-sm) var(--ease-out)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {fmtSemana(wk)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-disabled)', marginLeft: 'auto' }}>
                      {sessSemana.length} sesión{sessSemana.length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  {wkOpen && (
                    <div className="card" style={{ overflow: 'hidden' }}>
                      {sessSemana.map((sesion, idx) => (
                        <div key={sesion.id_sesion}>
                          {idx > 0 && <hr className="divider" />}
                          <div onClick={() => toggleSesion(sesion.id_sesion)} role="button" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && toggleSesion(sesion.id_sesion)}
                            style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background-color var(--t-sm) var(--ease-out)', backgroundColor: expandida === sesion.id_sesion ? 'var(--surface-raised)' : 'transparent' }}
                            onMouseEnter={e => { if (expandida !== sesion.id_sesion) e.currentTarget.style.backgroundColor = 'var(--surface-raised)' }}
                            onMouseLeave={e => { if (expandida !== sesion.id_sesion) e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ color: expandida === sesion.id_sesion ? 'var(--accent)' : 'var(--text-tertiary)', display: 'flex', transition: 'color var(--t-sm) var(--ease-out)' }}>
                                {expandida === sesion.id_sesion ? <ChevronDown style={{ width: '14px', height: '14px' }} /> : <ChevronRight style={{ width: '14px', height: '14px' }} />}
                              </span>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>{fmtFecha(sesion.fecha)}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sesion.nombre_rutina}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '14px' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <p className="num" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent)', margin: 0 }}>{sesion.num_ejercicios}</p>
                                  <p className="label" style={{ margin: '1px 0 0' }}>ejerc.</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p className="num" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent)', margin: 0 }}>{sesion.num_series}</p>
                                  <p className="label" style={{ margin: '1px 0 0' }}>series</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                <button onClick={e => repetirSesion(sesion, e)} aria-label="Repetir sesión"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '4px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out)' }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--success)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}>
                                  <RotateCcw style={{ width: '13px', height: '13px' }} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); router.push(`/sesiones/${sesion.id_sesion}/editar`) }} aria-label="Editar sesión"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '4px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out)' }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}>
                                  <Pencil style={{ width: '13px', height: '13px' }} />
                                </button>
                                <button onClick={e => eliminarSesion(sesion.id_sesion, e)} aria-label="Eliminar sesión"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '4px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-dim)' }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.backgroundColor = 'transparent' }}>
                                  <Trash2 style={{ width: '13px', height: '13px' }} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {expandida === sesion.id_sesion && (
                            <div style={{ borderTop: '1px solid var(--border-faint)', padding: '16px 20px', backgroundColor: 'var(--surface-raised)' }}>
                              {cargandoDet === sesion.id_sesion ? (
                                <div className="skeleton" style={{ height: '60px' }} />
                              ) : (() => {
                                const det = detalles[sesion.id_sesion]
                                const anteriorMap = Object.fromEntries((det?.anterior ?? []).map(a => [a.id_ejercicio, a.peso_max]))
                                return (det?.current ?? []).map(ej => {
                                  const pesoMaxActual = Math.max(...ej.series.filter(s => s.peso_kg != null).map(s => Number(s.peso_kg)), 0)
                                  const pesoAnterior = anteriorMap[ej.id_ejercicio]
                                  const diff = pesoAnterior != null && pesoMaxActual > 0 ? pesoMaxActual - pesoAnterior : null
                                  return (
                                    <div key={ej.nombre} style={{ marginBottom: '14px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <p className="label" style={{ margin: 0 }}>{ej.nombre}</p>
                                        {diff !== null && (
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '500', color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                                            {diff > 0 ? <TrendingUp style={{ width: '10px', height: '10px' }} /> : diff < 0 ? <TrendingDown style={{ width: '10px', height: '10px' }} /> : <Minus style={{ width: '10px', height: '10px' }} />}
                                            {diff > 0 ? `+${diff}` : diff} kg vs anterior
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        {ej.series.map((s, i) => (
                                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '6px 10px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--r-sm)', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-disabled)', minWidth: '22px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>S{s.numero_serie}</span>
                                            {s.peso_kg != null && <span className="num" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>{s.peso_kg} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '300' }}>kg</span></span>}
                                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.repeticiones} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '300' }}>reps</span></span>
                                            {s.rir !== null && <span className="tag tag-accent">RIR {s.rir}</span>}
                                            {s.notas && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{s.notas}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                })
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
