'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight, History } from 'lucide-react'

interface Sesion { fecha: string; nombre_rutina: string; num_ejercicios: number; num_series: number }
interface DetalleEjercicio { nombre: string; series: { id_serie: string; numero_serie: number; peso_kg: number | null; repeticiones: number; rir: number | null; notas: string | null }[] }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}
function fmtMes(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).toUpperCase()
}

export default function HistorialPage() {
  const [sesiones, setSesiones]     = useState<Sesion[]>([])
  const [loading, setLoading]       = useState(true)
  const [expandida, setExpandida]   = useState<string | null>(null)
  const [detalles, setDetalles]     = useState<Record<string, DetalleEjercicio[]>>({})
  const [cargandoDet, setCargandoDet] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/historial').then(r => r.json()).then(d => { setSesiones(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const toggleSesion = async (fecha: string) => {
    if (expandida === fecha) { setExpandida(null); return }
    setExpandida(fecha)
    if (!detalles[fecha]) {
      setCargandoDet(fecha)
      const d = await fetch(`/api/historial?fecha=${fecha}`).then(r => r.json())
      setDetalles(p => ({ ...p, [fecha]: Array.isArray(d) ? d : [] }))
      setCargandoDet(null)
    }
  }

  // Agrupar por mes
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
        <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>Registro completo de tus sesiones de entrenamiento</p>
      </div>

      {loading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} style={{ height: '72px', borderRadius: '12px', marginBottom: '10px', backgroundColor: '#1e2024' }} />)}

      {!loading && sesiones.length === 0 && (
        <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <History style={{ width: '32px', height: '32px', color: '#43474c', margin: '0 auto 16px' }} />
          <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Sin sesiones registradas</p>
          <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>Empieza a registrar series en tus rutinas</p>
        </div>
      )}

      {!loading && Object.entries(porMes).map(([mes, sessMes]) => (
        <div key={mes} style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', color: '#43474c', fontWeight: '500', letterSpacing: '0.1em', marginBottom: '12px', marginTop: 0 }}>{fmtMes(sessMes[0].fecha)}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessMes.map(sesion => (
              <div key={sesion.fecha} style={{ backgroundColor: '#1e2024', border: `1px solid ${expandida === sesion.fecha ? '#8d9197' : '#43474c'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s' }}>
                {/* Cabecera sesión */}
                <div onClick={() => toggleSesion(sesion.fecha)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#282a2e'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {expandida === sesion.fecha ? <ChevronDown style={{ width: '15px', height: '15px', color: '#b1c9e1' }} /> : <ChevronRight style={{ width: '15px', height: '15px', color: '#8d9197' }} />}
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#e2e2e8', margin: 0, textTransform: 'capitalize' }}>{fmtFecha(sesion.fecha)}</p>
                      <p style={{ fontSize: '12px', color: '#8d9197', margin: '3px 0 0', fontWeight: '300' }}>{sesion.nombre_rutina}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', textAlign: 'right' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '500', color: '#b1c9e1', margin: 0 }}>{sesion.num_ejercicios}</p>
                      <p style={{ fontSize: '10px', color: '#43474c', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ejercicios</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '500', color: '#b1c9e1', margin: 0 }}>{sesion.num_series}</p>
                      <p style={{ fontSize: '10px', color: '#43474c', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>series</p>
                    </div>
                  </div>
                </div>

                {/* Detalle expandido */}
                {expandida === sesion.fecha && (
                  <div style={{ borderTop: '1px solid #282a2e', padding: '20px 24px', backgroundColor: '#16181c' }}>
                    {cargandoDet === sesion.fecha ? (
                      <Skeleton style={{ height: '60px', borderRadius: '8px', backgroundColor: '#1e2024' }} />
                    ) : (detalles[sesion.fecha] ?? []).map(ej => (
                      <div key={ej.nombre} style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#c3c7cd', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ej.nombre}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {ej.series.map(s => (
                            <div key={s.id_serie} style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '8px 12px', backgroundColor: '#1e2024', borderRadius: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#43474c', minWidth: '24px', fontWeight: '600' }}>S{s.numero_serie}</span>
                              {s.peso_kg && <span style={{ fontSize: '13px', color: '#e2e2e8', fontWeight: '500' }}>{s.peso_kg} <span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}>kg</span></span>}
                              <span style={{ fontSize: '13px', color: '#c3c7cd' }}>{s.repeticiones} <span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '300' }}>reps</span></span>
                              {s.rir !== null && <span style={{ fontSize: '11px', color: '#7ab8d4', backgroundColor: '#1a2f3a', padding: '2px 7px', borderRadius: '4px' }}>RIR {s.rir}</span>}
                              {s.notas && <span style={{ fontSize: '11px', color: '#43474c', fontStyle: 'italic' }}>{s.notas}</span>}
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
