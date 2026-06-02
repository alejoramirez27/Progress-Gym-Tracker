'use client'
import { useEffect, useState } from 'react'
import { Dumbbell, TrendingUp, Layers, Calendar, ChevronDown, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats      { totalRutinas: number; totalEjercicios: number; totalSeries: number; ultimaSesion: string | null }
interface Rutina     { id_rutina: string; nombre: string }
interface Ejercicio  { id_ejercicio: string; nombre: string; id_rutina: string }
interface PuntoProgreso { fecha: string; peso_max: number; reps: number }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

const sel: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-md)',
  padding: '7px 28px 7px 10px', fontSize: '13px', cursor: 'pointer',
  fontFamily: 'inherit', appearance: 'none', outline: 'none', width: '100%',
}

export default function DashboardPage() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [rutinas, setRutinas]       = useState<Rutina[]>([])
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [progreso, setProgreso]     = useState<PuntoProgreso[]>([])
  const [rutinaSeleccionada, setRutinaSel] = useState('')
  const [ejSeleccionado, setEjSel]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)

  const ejerciciosFiltrados = rutinaSeleccionada
    ? ejercicios.filter(e => e.id_rutina === rutinaSeleccionada)
    : ejercicios

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setStats(d.stats); setRutinas(d.rutinas ?? []); setEjercicios(d.ejercicios ?? [])
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

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Evolución y métricas de tu entrenamiento</p>
      </div>

      {/* Stats — compact metric row */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '76px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          {metricCards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} style={{ backgroundColor: 'var(--surface-deep)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="label">{c.label}</span>
                  <Icon style={{ width: '13px', height: '13px', color: c.color, opacity: 0.5 }} />
                </div>
                <p className="num" style={{ fontSize: '28px', fontWeight: '700', color: c.color, margin: 0, letterSpacing: '-0.04em' }}>{c.value}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Chart section */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Chart header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
              Progreso de peso
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Peso máximo por sesión · kg
            </p>
          </div>

          {/* Filtros */}
          {!loading && rutinas.length > 0 && (
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
                  {ejerciciosFiltrados.length === 0
                    ? <option>Sin ejercicios</option>
                    : ejerciciosFiltrados.map(e => <option key={e.id_ejercicio} value={e.id_ejercicio}>{e.nombre}</option>)}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* Chart body */}
        {loading || loadingChart ? (
          <div className="skeleton" style={{ height: '240px' }} />
        ) : ejerciciosFiltrados.length === 0 ? (
          <div className="empty-state" style={{ height: '240px', padding: 0 }}>
            <TrendingUp style={{ width: '24px', height: '24px' }} />
            <p>Esta rutina no tiene ejercicios</p>
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
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Solo hay una sesión registrada. Entrena más veces para ver la línea de progreso.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="num" style={{ fontSize: '36px', fontWeight: '500', color: 'var(--accent)', margin: 0, letterSpacing: '-0.03em' }}>
                {progreso[0].peso_max} <span style={{ fontSize: '16px', fontWeight: '300', color: 'var(--text-secondary)' }}>kg</span>
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {fmtFecha(progreso[0].fecha)} · {progreso[0].reps} reps
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={progreso.map(p => ({ ...p, fechaFmt: fmtFecha(p.fecha) }))} margin={{ top: 5, right: 8, left: -16, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
              <XAxis dataKey="fechaFmt" tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}kg`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                formatter={(val, name) => name === 'peso_max' ? [`${val} kg`, 'Peso máx.'] : [`${val} reps`, 'Reps']}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '11px' }}
                cursor={{ stroke: 'var(--border-default)' }}
              />
              <Line type="monotone" dataKey="peso_max" stroke="var(--accent)" strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 3.5, strokeWidth: 0 }}
                activeDot={{ r: 5.5, fill: 'var(--accent)', stroke: 'var(--surface-base)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
