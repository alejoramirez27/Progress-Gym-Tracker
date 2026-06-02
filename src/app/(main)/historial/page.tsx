'use client'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, History, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Sesion { id_sesion: string; fecha: string; nombre_rutina: string; num_ejercicios: number; num_series: number }
interface DetalleEjercicio {
  nombre: string
  series: { id_serie: string; numero_serie: number; peso_kg: number | null; repeticiones: number; rir: number | null; notas: string | null }[]
}

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtMes(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export default function HistorialPage() {
  const [sesiones, setSesiones]       = useState<Sesion[]>([])
  const [loading, setLoading]         = useState(true)
  const [expandida, setExpandida]     = useState<string | null>(null)
  const [detalles, setDetalles]       = useState<Record<string, DetalleEjercicio[]>>({})
  const [cargandoDet, setCargandoDet] = useState<string | null>(null)

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
      setDetalles(p => ({ ...p, [id]: Array.isArray(d) ? d : [] }))
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

  const porMes: Record<string, Sesion[]> = {}
  for (const s of sesiones) {
    const mes = s.fecha.substring(0, 7)
    if (!porMes[mes]) porMes[mes] = []
    porMes[mes].push(s)
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Historial</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {!loading && `${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''} registrada${sesiones.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[64, 56, 64, 56].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      )}

      {!loading && sesiones.length === 0 && (
        <div className="card empty-state">
          <History style={{ width: '26px', height: '26px' }} />
          <p>Sin sesiones registradas</p>
          <p className="empty-hint">Empieza registrando una sesión en Progreso</p>
        </div>
      )}

      {!loading && Object.entries(porMes).map(([mes, sessMes]) => (
        <div key={mes} style={{ marginBottom: '28px' }}>
          {/* Month header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'capitalize', letterSpacing: '0.02em' }}>
              {fmtMes(sessMes[0].fecha)}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-faint)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{sessMes.length} sesión{sessMes.length !== 1 ? 'es' : ''}</span>
          </div>

          <div className="card stagger-list" style={{ overflow: 'hidden' }}>
            {sessMes.map((sesion, idx) => (
              <div key={sesion.id_sesion}>
                {idx > 0 && <hr className="divider" />}

                {/* Session row */}
                <div
                  onClick={() => toggleSesion(sesion.id_sesion)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleSesion(sesion.id_sesion)}
                  style={{
                    padding: '14px 16px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer',
                    transition: 'background-color var(--t-sm) var(--ease-out)',
                    backgroundColor: expandida === sesion.id_sesion ? 'var(--surface-raised)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (expandida !== sesion.id_sesion) e.currentTarget.style.backgroundColor = 'var(--surface-raised)' }}
                  onMouseLeave={e => { if (expandida !== sesion.id_sesion) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: expandida === sesion.id_sesion ? 'var(--accent)' : 'var(--text-tertiary)', display: 'flex', transition: 'color var(--t-sm) var(--ease-out)' }}>
                      {expandida === sesion.id_sesion
                        ? <ChevronDown style={{ width: '14px', height: '14px' }} />
                        : <ChevronRight style={{ width: '14px', height: '14px' }} />}
                    </span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
                        {fmtFecha(sesion.fecha)}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {sesion.nombre_rutina}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p className="num" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent)', margin: 0 }}>{sesion.num_ejercicios}</p>
                        <p className="label" style={{ margin: '1px 0 0' }}>ejerc.</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="num" style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent)', margin: 0 }}>{sesion.num_series}</p>
                        <p className="label" style={{ margin: '1px 0 0' }}>series</p>
                      </div>
                    </div>
                    <button
                      onClick={e => eliminarSesion(sesion.id_sesion, e)}
                      aria-label="Eliminar sesión"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '4px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-dim)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandida === sesion.id_sesion && (
                  <div style={{ borderTop: '1px solid var(--border-faint)', padding: '16px 20px', backgroundColor: 'var(--surface-raised)' }}>
                    {cargandoDet === sesion.id_sesion ? (
                      <div className="skeleton" style={{ height: '60px' }} />
                    ) : (detalles[sesion.id_sesion] ?? []).map(ej => (
                      <div key={ej.nombre} style={{ marginBottom: '14px' }}>
                        <p className="label" style={{ margin: '0 0 6px' }}>{ej.nombre}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {ej.series.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '6px 10px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--r-sm)', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-disabled)', minWidth: '22px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>S{s.numero_serie}</span>
                              {s.peso_kg != null && (
                                <span className="num" style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                  {s.peso_kg} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '300' }}>kg</span>
                                </span>
                              )}
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {s.repeticiones} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '300' }}>reps</span>
                              </span>
                              {s.rir !== null && <span className="tag tag-accent">RIR {s.rir}</span>}
                              {s.notas && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{s.notas}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
