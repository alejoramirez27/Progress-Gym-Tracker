'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight, History, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Sesion {
  id_sesion:      string
  fecha:          string
  nombre_rutina:  string
  num_ejercicios: number
  num_series:     number
}
interface DetalleEjercicio {
  nombre: string
  series: {
    id_serie: string; numero_serie: number; peso_kg: number | null
    repeticiones: number; rir: number | null; notas: string | null
  }[]
}

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}
function fmtMes(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', {
    month: 'long', year: 'numeric',
  }).toUpperCase()
}

export default function HistorialPage() {
  const [sesiones, setSesiones]       = useState<Sesion[]>([])
  const [loading, setLoading]         = useState(true)
  const [expandida, setExpandida]     = useState<string | null>(null)
  const [detalles, setDetalles]       = useState<Record<string, DetalleEjercicio[]>>({})
  const [cargandoDet, setCargandoDet] = useState<string | null>(null)

  const cargar = () => {
    setLoading(true)
    fetch('/api/historial')
      .then(r => r.json())
      .then(d => { setSesiones(Array.isArray(d) ? d : []); setLoading(false) })
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
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Historial</h1>
        <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>
          Registro completo de tus sesiones de entrenamiento
        </p>
      </div>

      {loading && Array.from({ length: 4 }).map((_, i) =>
        <Skeleton key={i} style={{ height: '72px', borderRadius: '12px', marginBottom: '10px', backgroundColor: '#1e2024' }} />
      )}

      {!loading && sesiones.length === 0 && (
        <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <History style={{ width: '32px', height: '32px', color: '#43474c', margin: '0 auto 16px' }} />
          <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Sin sesiones registradas</p>
          <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>
            Empieza registrando una sesión en <strong style={{ color: '#8d9197' }}>Progreso</strong>
          </p>
        </div>
      )}

      {!loading && Object.entries(porMes).map(([mes, sessMes]) => (
        <div key={mes} style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', color: '#43474c', fontWeight: '500', letterSpacing: '0.1em', marginBottom: '12px', marginTop: 0 }}>
            {fmtMes(sessMes[0].fecha)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessMes.map(sesion => (
              <div key={sesion.id_sesion}
                style={{ backgroundColor: '#1e2024', border: `1px solid ${expandida === sesion.id_sesion ? '#8d9197' : '#43474c'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>

                <div
                  onClick={() => toggleSesion(sesion.id_sesion)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#282a2e'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {expandida === sesion.id_sesion
                      ? <ChevronDown style={{ width: '15px', height: '15px', color: '#b1c9e1', flexShrink: 0 }} />
                      : <ChevronRight style={{ width: '15px', height: '15px', color: '#8d9197', flexShrink: 0 }} />
                    }
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#e2e2e8', margin: 0, textTransform: 'capitalize' }}>
                        {fmtFecha(sesion.fecha)}
                      </p>
                      <p style={{ fontSize: '12px', color: '#8d9197', margin: '3px 0 0', fontWeight: '300' }}>
                        {sesion.nombre_rutina}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#b1c9e1', margin: 0 }}>{sesion.num_ejercicios}</p>
                        <p style={{ fontSize: '10px', color: '#43474c', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ejerc.</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#b1c9e1', margin: 0 }}>{sesion.num_series}</p>
                        <p style={{ fontSize: '10px', color: '#43474c', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>series</p>
                      </div>
                    </div>
                    <button
                      onClick={e => eliminarSesion(sesion.id_sesion, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43474c', padding: '4px', borderRadius: '4px', transition: 'color 0.15s', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#43474c'}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>

                {expandida === sesion.id_sesion && (
                  <div style={{ borderTop: '1px solid #282a2e', padding: '20px 24px', backgroundColor: '#16181c' }}>
                    {cargandoDet === sesion.id_sesion ? (
                      <Skeleton style={{ height: '60px', borderRadius: '8px', backgroundColor: '#1e2024' }} />
                    ) : (detalles[sesion.id_sesion] ?? []).map(ej => (
                      <div key={ej.nombre} style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#c3c7cd', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {ej.nombre}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {ej.series.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '8px 12px', backgroundColor: '#1e2024', borderRadius: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: '#43474c', minWidth: '24px', fontWeight: '600' }}>S{s.numero_serie}</span>
                              {s.peso_kg != null && (
                                <span style={{ fontSize: '14px', color: '#e2e2e8', fontWeight: '500' }}>
                                  {s.peso_kg} <span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}>kg</span>
                                </span>
                              )}
                              <span style={{ fontSize: '13px', color: '#c3c7cd' }}>
                                {s.repeticiones} <span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}>reps</span>
                              </span>
                              {s.rir !== null && (
                                <span style={{ fontSize: '11px', color: '#7ab8d4', backgroundColor: '#1a2f3a', padding: '2px 7px', borderRadius: '4px' }}>
                                  RIR {s.rir}
                                </span>
                              )}
                              {s.notas && (
                                <span style={{ fontSize: '11px', color: '#43474c', fontStyle: 'italic' }}>{s.notas}</span>
                              )}
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
