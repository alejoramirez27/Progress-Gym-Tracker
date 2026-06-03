'use client'
import { useEffect, useState } from 'react'
import { Dumbbell, TrendingUp, Layers, Calendar, ChevronDown, Info, Flame, BarChart2, StickyNote } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats { totalRutinas: number; totalEjercicios: number; totalSeries: number; ultimaSesion: string | null; rachaActual: number; rachaMejor: number; sesionesEstaSemana: number; sesionesSemanaPasada: number }
interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; id_rutina: string }
interface PuntoProgreso { fecha: string; peso_max: number; reps: number }
interface PuntoVolumen  { fecha: string; volumen: number; sesiones: number }
interface HeatDay       { fecha: string; count: number }

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
  const [nota, setNota]             = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)

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

  // Heatmap organizado en semanas (filas) × días (columnas)
  const semanas: HeatDay[][] = []
  for (let i = 0; i < heatmap.length; i += 7) semanas.push(heatmap.slice(i, i + 7))

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
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

      {/* Racha + sesiones semana */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'var(--surface-deep)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame style={{ width: '16px', height: '16px', color: '#e07040', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Racha</p>
              <p className="num" style={{ fontSize: '20px', fontWeight: '700', color: stats.rachaActual > 0 ? '#e07040' : 'var(--text-disabled)', margin: 0, letterSpacing: '-0.03em' }}>
                {stats.rachaActual}<span style={{ fontSize: '11px', fontWeight: '300', color: 'var(--text-secondary)' }}> días</span>
              </p>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--surface-deep)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame style={{ width: '16px', height: '16px', color: '#d4a07a', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mejor racha</p>
              <p className="num" style={{ fontSize: '20px', fontWeight: '700', color: '#d4a07a', margin: 0, letterSpacing: '-0.03em' }}>
                {stats.rachaMejor}<span style={{ fontSize: '11px', fontWeight: '300', color: 'var(--text-secondary)' }}> días</span>
              </p>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--surface-deep)', padding: '14px 18px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Esta semana</p>
              <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>
                {stats.sesionesSemanaPasada > 0 ? `vs ${stats.sesionesSemanaPasada} la anterior` : ''}
              </span>
            </div>
            <p className="num" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              {stats.sesionesEstaSemana}<span style={{ fontSize: '11px', fontWeight: '300', color: 'var(--text-secondary)' }}> sesiones</span>
            </p>
          </div>
        </div>
      )}

      {/* Heatmap */}
      {!loading && heatmap.length > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actividad — últimas 5 semanas</p>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px', paddingTop: '2px' }}>
              {DIAS_SEMANA.map(d => (
                <span key={d} style={{ fontSize: '9px', color: 'var(--text-disabled)', height: '14px', display: 'flex', alignItems: 'center', letterSpacing: '0.04em' }}>{d}</span>
              ))}
            </div>
            {semanas.map((semana, si) => (
              <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {semana.map(dia => {
                  const isToday = dia.fecha === hoy()
                  const bg = dia.count === 0
                    ? 'var(--surface-raised)'
                    : dia.count === 1 ? 'color-mix(in srgb, var(--accent) 40%, var(--surface-raised))'
                    : 'color-mix(in srgb, var(--accent) 80%, var(--surface-raised))'
                  return (
                    <div key={dia.fecha} title={`${dia.fecha}${dia.count > 0 ? ` — ${dia.count} sesión${dia.count > 1 ? 'es' : ''}` : ''}`}
                      style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: bg, border: isToday ? '1px solid var(--accent)' : '1px solid transparent', boxSizing: 'border-box' }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>Menos</span>
            {[0, 0.4, 0.8].map(op => (
              <div key={op} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: op === 0 ? 'var(--surface-raised)' : `color-mix(in srgb, var(--accent) ${op * 100}%, var(--surface-raised))` }} />
            ))}
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>Más</span>
          </div>
        </div>
      )}

      {/* Nota del día */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <StickyNote style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nota del día</p>
        </div>
        <textarea
          value={nota} onChange={e => { setNota(e.target.value); setNotaGuardada(false) }}
          placeholder="¿Cómo te sientes hoy? ¿Dormiste bien? ¿Energía alta o baja?..." rows={2}
          style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={guardarNota}
            style={{ padding: '5px 14px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 'var(--r-sm)', border: 'none', backgroundColor: notaGuardada ? 'var(--success-dim)' : 'var(--accent)', color: notaGuardada ? 'var(--success)' : '#0c0e12', fontWeight: '500', transition: 'all 0.14s' }}>
            {notaGuardada ? '✓ Guardada' : 'Guardar nota'}
          </button>
        </div>
      </div>

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
    </div>
  )
}
