'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, TrendingUp, Layers, Calendar, ChevronDown, Info, Flame, BarChart2, StickyNote, Scale, Plus } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats { totalRutinas: number; totalEjercicios: number; totalSeries: number; ultimaSesion: string | null; rachaActual: number; rachaMejor: number; sesionesEstaSemana: number; sesionesSemanaPasada: number }
interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; id_rutina: string }
interface PuntoProgreso { fecha: string; peso_max: number; reps: number }
interface PuntoVolumen  { fecha: string; volumen: number; sesiones: number }
interface HeatDay       { fecha: string; count: number }
interface RegistroPeso  { id: string; fecha: string; peso_kg: number }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function hoy() { return new Date().toISOString().split('T')[0] }

const sel: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-md)',
  padding: '7px 28px 7px 10px', fontSize: '13px', cursor: 'pointer',
  fontFamily: 'inherit', appearance: 'none', outline: 'none', width: '100%',
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats]           = useState<Stats | null>(null)
  const [rutinas, setRutinas]       = useState<Rutina[]>([])
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [progreso, setProgreso]     = useState<PuntoProgreso[]>([])
  const [volumen, setVolumen]       = useState<PuntoVolumen[]>([])
  const [heatmap, setHeatmap]       = useState<HeatDay[]>([])
  const [rutinaSeleccionada, setRutinaSel] = useState('')
  const [ejSeleccionado, setEjSel]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)
  const [tabChart, setTabChart]     = useState<'peso' | 'volumen'>('peso')
  const [nota, setNota]                   = useState('')
  const [notaGuardada, setNotaGuardada]   = useState(false)
  const [pesoHoy, setPesoHoy]             = useState('')
  const [registrosPeso, setRegistrosPeso] = useState<RegistroPeso[]>([])
  const [guardandoPeso, setGuardandoPeso] = useState(false)

  const todayKey = `nota_dia_${hoy()}`

  useEffect(() => {
    const saved = localStorage.getItem(todayKey)
    if (saved) setNota(saved)
  }, [todayKey])

  const guardarNota = () => {
    localStorage.setItem(todayKey, nota)
    setNotaGuardada(true)
    setTimeout(() => setNotaGuardada(false), 2000)
  }

  const ejerciciosFiltrados = rutinaSeleccionada
    ? ejercicios.filter(e => e.id_rutina === rutinaSeleccionada)
    : ejercicios

  useEffect(() => {
    fetch('/api/peso-corporal').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setRegistrosPeso(d.slice(0, 7).reverse())
    })
  }, [])

  const hoyStr = hoy()
  const pesoHoyRegistrado = registrosPeso.find(r => r.fecha === hoyStr)

  const guardarPesoRapido = async () => {
    if (!pesoHoy || parseFloat(pesoHoy) <= 0) return
    setGuardandoPeso(true)
    const res = await fetch('/api/peso-corporal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: hoyStr, peso_kg: parseFloat(pesoHoy) }),
    })
    if (res.ok) {
      const data = await res.json()
      setRegistrosPeso(prev => {
        const filtered = prev.filter(r => r.fecha !== hoyStr)
        return [...filtered, data].sort((a, b) => a.fecha.localeCompare(b.fecha))
      })
      setPesoHoy('')
    }
    setGuardandoPeso(false)
  }

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setStats(d.stats); setRutinas(d.rutinas ?? []); setEjercicios(d.ejercicios ?? [])
      setVolumen(d.volumen ?? []); setHeatmap(d.heatmap ?? [])
      if (d.rutinas?.length > 0) {
        const primeraRutina = d.rutinas[0].id_rutina
        setRutinaSel(primeraRutina)
        const ejDeRutina = (d.ejercicios ?? []).filter((e: Ejercicio) => e.id_rutina === primeraRutina)
        if (ejDeRutina.length > 0) setEjSel(ejDeRutina[0].id_ejercicio)
      }
      setLoading(false)
    })
  }, [])

  const onRutinaChange = (id: string) => {
    setRutinaSel(id)
    const ejDeRutina = ejercicios.filter(e => e.id_rutina === id)
    setEjSel(ejDeRutina.length > 0 ? ejDeRutina[0].id_ejercicio : '')
    setProgreso([])
  }

  useEffect(() => {
    if (!ejSeleccionado) return
    setLoadingChart(true)
    fetch(`/api/dashboard?id_ejercicio=${ejSeleccionado}`).then(r => r.json()).then(d => {
      setProgreso(d.progreso ?? []); setLoadingChart(false)
    })
  }, [ejSeleccionado])

  const nombreEjercicio = ejercicios.find(e => e.id_ejercicio === ejSeleccionado)?.nombre ?? ''

  const metricCards = stats ? [
    { label: 'Rutinas',        value: stats.totalRutinas,    icon: Dumbbell,   color: 'var(--accent)' },
    { label: 'Ejercicios',     value: stats.totalEjercicios, icon: TrendingUp, color: 'var(--success)' },
    { label: 'Series totales', value: stats.totalSeries,     icon: Layers,     color: '#d4a07a' },
    { label: 'Última sesión',  value: stats.ultimaSesion ? fmtFecha(stats.ultimaSesion) : '—', icon: Calendar, color: '#a07ad4' },
  ] : []

  // Heatmap: columnas = semanas, filas = días (Lun→Dom)
  const semanas: HeatDay[][] = []
  for (let i = 0; i < heatmap.length; i += 7) semanas.push(heatmap.slice(i, i + 7))

  // Etiquetas de meses
  const mesesLabels: { col: number; label: string }[] = []
  semanas.forEach((sem, colIdx) => {
    if (sem[0]) {
      const d = new Date(sem[0].fecha + 'T12:00:00')
      if (d.getDate() <= 7) {
        mesesLabels.push({
          col: colIdx,
          label: d.toLocaleDateString('es-CO', { month: 'short' })
        })
      }
    }
  })

  const totalSesiones365 = heatmap.filter(d => d.count > 0).length

  return (
    <div className="page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Evolución y métricas de tu entrenamiento</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '76px' }} />)}
        </div>
      ) : (
        <div className="metrics-grid">
          {metricCards.map(c => {
            const Icon = c.icon
            const isDate = c.label === 'Última sesión'
            return (
              <div key={c.label} style={{ backgroundColor: 'var(--surface-deep)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="label">{c.label}</span>
                  <Icon style={{ width: '13px', height: '13px', color: c.color, opacity: 0.5 }} />
                </div>
                {isDate ? (
                  <p style={{ fontSize: '15px', fontWeight: '600', color: c.color, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {String(c.value) === '—' ? '—' : String(c.value)}
                  </p>
                ) : (
                  <p className="num" style={{ fontSize: '28px', fontWeight: '700', color: c.color, margin: 0, letterSpacing: '-0.04em' }}>{c.value}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Racha + sesiones — 3 columnas iguales */}
      {!loading && stats && (
        <div className="racha-grid">
          {[
            {
              icon: <Flame style={{ width: '15px', height: '15px', color: '#e07040' }} />,
              label: 'Racha actual',
              value: stats.rachaActual,
              unit: 'días',
              color: stats.rachaActual > 0 ? '#e07040' : 'var(--text-disabled)',
              sub: stats.rachaActual > 0 ? '🔥 en racha' : 'Entrena hoy',
            },
            {
              icon: <Flame style={{ width: '15px', height: '15px', color: '#d4a07a' }} />,
              label: 'Mejor racha',
              value: stats.rachaMejor,
              unit: 'días',
              color: '#d4a07a',
              sub: 'récord personal',
            },
            {
              icon: <Calendar style={{ width: '15px', height: '15px', color: 'var(--success)' }} />,
              label: 'Esta semana',
              value: stats.sesionesEstaSemana,
              unit: 'sesiones',
              color: 'var(--success)',
              sub: stats.sesionesSemanaPasada > 0 ? `${stats.sesionesSemanaPasada} la semana pasada` : `${totalSesiones365} en el año`,
            },
          ].map(c => (
            <div key={c.label} className="racha-cell" style={{ backgroundColor: 'var(--surface-deep)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.label}</span>
                {c.icon}
              </div>
              <p className="num racha-value" style={{ fontSize: '26px', fontWeight: '700', color: c.color, margin: '0 0 3px', letterSpacing: '-0.04em' }}>
                {c.value}<span style={{ fontSize: '11px', fontWeight: '300', color: 'var(--text-secondary)', marginLeft: '3px' }}>{c.unit}</span>
              </p>
              <p className="racha-sub" style={{ fontSize: '11px', color: 'var(--text-disabled)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Resumen semanal — dots L M X J V S D */}
      {!loading && stats && heatmap.length > 0 && (() => {
        const hoyStr = hoy()
        const d = new Date(hoyStr)
        const lunesOffset = d.getDay() === 0 ? 6 : d.getDay() - 1
        const lunesStr = new Date(d.getFullYear(), d.getMonth(), d.getDate() - lunesOffset).toISOString().split('T')[0]
        const diasSemana = DIAS_SEMANA.map((nombre, i) => {
          const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate() - lunesOffset + i)
          const fechaStr = dia.toISOString().split('T')[0]
          const isFuture = fechaStr > hoyStr
          const count = heatmap.find(h => h.fecha === fechaStr)?.count ?? 0
          const entreno = !isFuture && count > 0
          return { nombre, fechaStr, isFuture, entreno }
        })
        const diasEntrenados = diasSemana.filter(d => d.entreno).length
        return (
          <div className="card" style={{ padding: '14px 18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Esta semana</p>
              <span style={{ fontSize: '11px', color: diasEntrenados > 0 ? 'var(--success)' : 'var(--text-disabled)' }}>
                {diasEntrenados} de 7 días
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {diasSemana.map(dia => (
                <div key={dia.nombre} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dia.nombre}</span>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: dia.entreno
                      ? 'color-mix(in srgb, var(--accent) 20%, var(--surface-raised))'
                      : dia.isFuture
                        ? 'transparent'
                        : 'var(--surface-high)',
                    border: dia.fechaStr === hoyStr
                      ? '2px solid var(--accent)'
                      : dia.entreno
                        ? '2px solid color-mix(in srgb, var(--accent) 50%, transparent)'
                        : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                    boxSizing: 'border-box',
                  }}>
                    {dia.entreno && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Heatmap 365 días estilo GitHub */}
      {!loading && heatmap.length > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Actividad — últimos 12 meses
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>
              {totalSesiones365} sesión{totalSesiones365 !== 1 ? 'es' : ''} en el año
            </span>
          </div>

          <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 'max-content' }}>
              {/* Etiquetas de meses */}
              <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '24px' }}>
                {semanas.map((_, si) => {
                  const mesLabel = mesesLabels.find(m => m.col === si)
                  return (
                    <div key={si} style={{ width: '13px', marginRight: '2px', flexShrink: 0 }}>
                      {mesLabel && (
                        <span style={{ fontSize: '9px', color: 'var(--text-disabled)', textTransform: 'capitalize', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                          {mesLabel.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Grid días × semanas */}
              <div style={{ display: 'flex', gap: '0' }}>
                {/* Etiquetas días */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px', paddingTop: '1px', width: '20px', flexShrink: 0 }}>
                  {DIAS_SEMANA.map((d, i) => (
                    <div key={d} style={{ height: '13px', display: 'flex', alignItems: 'center' }}>
                      {i % 2 === 0 && <span style={{ fontSize: '9px', color: 'var(--text-disabled)', letterSpacing: '0.04em' }}>{d}</span>}
                    </div>
                  ))}
                </div>

                {/* Columnas = semanas */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {semanas.map((semana, si) => (
                    <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {semana.map((dia, di) => {
                        const isToday = dia.fecha === hoy()
                        const isFuture = dia.fecha > hoy()
                        const bg = isFuture
                          ? 'transparent'
                          : dia.count === 0
                            ? 'var(--surface-raised)'
                            : dia.count === 1
                              ? 'color-mix(in srgb, var(--accent) 35%, var(--surface-raised))'
                              : 'color-mix(in srgb, var(--accent) 75%, var(--surface-raised))'
                        const d = new Date(dia.fecha + 'T12:00:00')
                        const titulo = `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}${dia.count > 0 ? ` — ${dia.count} sesión${dia.count > 1 ? 'es' : ''}` : ''}`
                        return (
                          <div key={di} title={titulo}
                            onClick={() => dia.count > 0 && router.push('/historial')}
                            style={{
                              width: '13px', height: '13px', borderRadius: '3px',
                              backgroundColor: bg,
                              border: isToday ? '1.5px solid var(--accent)' : '1px solid transparent',
                              boxSizing: 'border-box',
                              transition: 'background-color 0.1s, transform 0.1s',
                              cursor: dia.count > 0 ? 'pointer' : 'default',
                            }}
                            onMouseEnter={e => { if (dia.count > 0) e.currentTarget.style.transform = 'scale(1.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>Menos</span>
            {[
              'var(--surface-raised)',
              'color-mix(in srgb, var(--accent) 35%, var(--surface-raised))',
              'color-mix(in srgb, var(--accent) 75%, var(--surface-raised))',
            ].map((bg, i) => (
              <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: bg }} />
            ))}
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>Más</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {([['peso', TrendingUp, 'Progreso peso'], ['volumen', BarChart2, 'Volumen total']] as const).map(([tab, Icon, label]) => (
                <button key={tab} onClick={() => setTabChart(tab)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 'var(--r-sm)', border: 'none', backgroundColor: tabChart === tab ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-raised))' : 'transparent', color: tabChart === tab ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: tabChart === tab ? '500' : '400' }}>
                  <Icon style={{ width: '11px', height: '11px' }} />{label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              {tabChart === 'peso' ? 'Peso máximo por sesión · kg' : 'Peso × reps acumulado · kg'}
            </p>
          </div>
          {tabChart === 'peso' && !loading && rutinas.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '140px' }}>
                <select value={rutinaSeleccionada} onChange={e => onRutinaChange(e.target.value)} style={sel}>
                  {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
              <div style={{ position: 'relative', minWidth: '140px' }}>
                <select value={ejSeleccionado} onChange={e => setEjSel(e.target.value)} disabled={ejerciciosFiltrados.length === 0}
                  style={{ ...sel, opacity: ejerciciosFiltrados.length === 0 ? 0.4 : 1 }}>
                  {ejerciciosFiltrados.length === 0 ? <option>Sin ejercicios</option>
                    : ejerciciosFiltrados.map(e => <option key={e.id_ejercicio} value={e.id_ejercicio}>{e.nombre}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {tabChart === 'volumen' ? (
          loading ? <div className="skeleton" style={{ height: '240px' }} />
          : volumen.length === 0 ? (
            <div className="empty-state" style={{ height: '240px', padding: 0 }}>
              <BarChart2 style={{ width: '24px', height: '24px' }} />
              <p>Sin datos de volumen todavía</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volumen.map(p => ({ ...p, fechaFmt: fmtFecha(p.fecha) }))} margin={{ top: 5, right: 8, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                <XAxis dataKey="fechaFmt" tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'inherit' }} formatter={(val) => [`${Number(val).toLocaleString('es-CO')} kg`, 'Volumen']} labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="volumen" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )
        ) : (
          loading || loadingChart ? <div className="skeleton" style={{ height: '240px' }} />
          : ejerciciosFiltrados.length === 0 ? (
            <div className="empty-state" style={{ height: '240px', padding: 0 }}>
              <TrendingUp style={{ width: '24px', height: '24px' }} /><p>Esta rutina no tiene ejercicios</p>
            </div>
          ) : progreso.length === 0 ? (
            <div className="empty-state" style={{ height: '240px', padding: 0 }}>
              <TrendingUp style={{ width: '24px', height: '24px' }} />
              <p>Sin datos para {nombreEjercicio}</p>
              <p className="empty-hint">Registra sesiones con peso para ver tu progreso</p>
            </div>
          ) : progreso.length === 1 ? (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-faint)', borderRadius: 'var(--r-md)', padding: '12px 16px' }}>
                <Info style={{ width: '13px', height: '13px', color: 'var(--text-secondary)', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Solo hay una sesión. Entrena más veces para ver la línea de progreso.</p>
              </div>
              <p className="num" style={{ fontSize: '36px', fontWeight: '500', color: 'var(--accent)', margin: 0, letterSpacing: '-0.03em' }}>
                {progreso[0].peso_max} <span style={{ fontSize: '16px', fontWeight: '300', color: 'var(--text-secondary)' }}>kg</span>
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={progreso.map(p => ({ ...p, fechaFmt: fmtFecha(p.fecha) }))} margin={{ top: 5, right: 8, left: -16, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                <XAxis dataKey="fechaFmt" tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}kg`} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'inherit' }} formatter={(val, name) => name === 'peso_max' ? [`${val} kg`, 'Peso máx.'] : [`${val} reps`, 'Reps']} labelStyle={{ color: 'var(--text-secondary)', fontSize: '11px' }} cursor={{ stroke: 'var(--border-default)' }} />
                <Line type="monotone" dataKey="peso_max" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5.5, fill: 'var(--accent)', stroke: 'var(--surface-base)', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>

      {/* Widget: Peso corporal */}
      <div className="card" style={{ padding: '16px 18px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Scale style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Peso corporal</p>
          </div>
          <button onClick={() => router.push('/peso')}
            style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: 'inherit' }}>
            Ver todo →
          </button>
        </div>

        {/* Quick register */}
        {!pesoHoyRegistrado ? (
          <div style={{ display: 'flex', gap: '8px', marginBottom: registrosPeso.length > 0 ? '12px' : '0' }}>
            <input
              type="number" step="0.1" min="20" max="400"
              placeholder="Peso de hoy (kg)"
              value={pesoHoy}
              onChange={e => setPesoHoy(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') guardarPesoRapido() }}
              inputMode="decimal"
              style={{ flex: 1, backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 11px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
            />
            <button
              onClick={guardarPesoRapido}
              disabled={guardandoPeso || !pesoHoy}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: pesoHoy ? 'var(--accent)' : 'var(--surface-raised)', color: pesoHoy ? '#0c0e12' : 'var(--text-disabled)', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: '12px', fontWeight: '500', cursor: pesoHoy ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all var(--t-sm) var(--ease-out)', whiteSpace: 'nowrap' }}
            >
              <Plus style={{ width: '12px', height: '12px' }} />
              Registrar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: registrosPeso.length > 1 ? '12px' : '0', backgroundColor: 'var(--success-dim)', borderRadius: 'var(--r-md)', padding: '8px 12px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--success)' }}>{pesoHoyRegistrado.peso_kg} kg</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>registrado hoy ✓</span>
          </div>
        )}

        {/* Mini sparkline dots */}
        {registrosPeso.length >= 2 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '36px' }}>
            {registrosPeso.map((r, i) => {
              const vals = registrosPeso.map(x => x.peso_kg)
              const min = Math.min(...vals); const max = Math.max(...vals)
              const range = max - min || 1
              const pct = ((r.peso_kg - min) / range)
              const h = 8 + pct * 26
              const isHoy = r.fecha === hoyStr
              return (
                <div key={r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '100%', height: `${h}px`, backgroundColor: isHoy ? 'var(--accent)' : 'var(--surface-high)', borderRadius: '3px', transition: 'height 0.3s ease' }} />
                  <span style={{ fontSize: '9px', color: isHoy ? 'var(--accent)' : 'var(--text-disabled)', fontWeight: isHoy ? '600' : '400', fontVariantNumeric: 'tabular-nums' }}>
                    {r.peso_kg}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Nota del día — al final para no interrumpir el flujo de métricas */}
      <div className="card" style={{ padding: '16px 18px', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <StickyNote style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nota del día</p>
          {nota && <span style={{ fontSize: '10px', color: 'var(--text-disabled)', marginLeft: 'auto' }}>guardada en local</span>}
        </div>
        <textarea
          value={nota} onChange={e => { setNota(e.target.value); setNotaGuardada(false) }}
          placeholder="¿Cómo te sientes hoy? ¿Dormiste bien? ¿Energía alta o baja?..." rows={2}
          style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={guardarNota}
            style={{ padding: '5px 14px', fontSize: '12px', fontFamily: 'inherit', borderRadius: 'var(--r-sm)', backgroundColor: notaGuardada ? 'var(--success-dim)' : 'var(--surface-raised)', color: notaGuardada ? 'var(--success)' : 'var(--text-secondary)', border: `1px solid ${notaGuardada ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'var(--border-subtle)'}`, fontWeight: '500', transition: 'all 0.14s', cursor: 'pointer' }}>
            {notaGuardada ? '✓ Guardada' : 'Guardar nota'}
          </button>
        </div>
      </div>
    </div>
  )
}
