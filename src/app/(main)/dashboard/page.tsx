'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, ChevronDown, Flame, BarChart2, StickyNote, Scale, Plus, Trophy } from 'lucide-react'
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
function hoy() {
  const col = new Date(Date.now() - 5 * 60 * 60 * 1000)
  return col.toISOString().split('T')[0]
}
function diasDesde(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Math.round((new Date(hoy() + 'T12:00:00').getTime() - new Date(dateStr + 'T12:00:00').getTime()) / 86400000)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'ayer'
  if (diff <= 6) return `hace ${diff} días`
  if (diff <= 13) return 'hace 1 semana'
  return `hace ${Math.round(diff / 7)} semanas`
}

const sel: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-md)',
  padding: '7px 28px 7px 10px', fontSize: '13px', cursor: 'pointer',
  fontFamily: 'inherit', appearance: 'none', outline: 'none', width: '100%',
}
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// ── StatCard reutilizable ────────────────────────────────────────────────────
function StatCard({ label, value, unit, sub, subColor, icon }: {
  label: string
  value: string | number
  unit?: string
  sub?: string
  subColor?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <p className="label" style={{ margin: 0 }}>{label}</p>
        {icon}
      </div>
      <p className="num" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-tertiary)', marginLeft: '5px' }}>{unit}</span>}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: subColor ?? 'var(--text-disabled)', margin: 0 }}>{sub}</p>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
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
  const [nota, setNota]             = useState('')
  const [notaGuardada, setNotaGuardada] = useState(false)
  const [pesoHoy, setPesoHoy]       = useState('')
  const [registrosPeso, setRegistrosPeso] = useState<RegistroPeso[]>([])
  const [guardandoPeso, setGuardandoPeso] = useState(false)
  const [heatmapCompleto, setHeatmapCompleto] = useState(false)

  const hoyStr  = hoy()
  const todayKey = `nota_dia_${hoyStr}`

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

  const pesoHoyRegistrado = registrosPeso.find(r => r.fecha === hoyStr)
  // Último y penúltimo registro para delta
  const ultimoPeso     = registrosPeso.length > 0 ? registrosPeso[registrosPeso.length - 1] : null
  const penultimoPeso  = registrosPeso.length >= 2 ? registrosPeso[registrosPeso.length - 2] : null
  const deltaPeso      = ultimoPeso && penultimoPeso
    ? Math.round((ultimoPeso.peso_kg - penultimoPeso.peso_kg) * 10) / 10
    : null

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
    setRutinaSel(id); setProgreso([])
    const ejDeRutina = ejercicios.filter(e => e.id_rutina === id)
    setEjSel(ejDeRutina.length > 0 ? ejDeRutina[0].id_ejercicio : '')
  }

  useEffect(() => {
    if (!ejSeleccionado) return
    setLoadingChart(true)
    fetch(`/api/dashboard?id_ejercicio=${ejSeleccionado}`).then(r => r.json()).then(d => {
      setProgreso(d.progreso ?? []); setLoadingChart(false)
    })
  }, [ejSeleccionado])

  const nombreEjercicio = ejercicios.find(e => e.id_ejercicio === ejSeleccionado)?.nombre ?? ''

  // ── Heatmap ─────────────────────────────────────────────────────────────────
  const semanas: HeatDay[][] = []
  for (let i = 0; i < heatmap.length; i += 7) semanas.push(heatmap.slice(i, i + 7))

  const semanaOffset   = heatmapCompleto ? 0 : Math.max(0, semanas.length - 12)
  const semanasVis     = semanas.slice(semanaOffset)
  const totalSes365    = heatmap.filter(d => d.count > 0).length
  const totalSesVis    = heatmap.slice(semanaOffset * 7).filter(d => d.count > 0).length

  const mesesLabels: { col: number; label: string }[] = []
  semanas.forEach((sem, colIdx) => {
    if (sem[0]) {
      const d = new Date(sem[0].fecha + 'T12:00:00')
      if (d.getDate() <= 7) mesesLabels.push({ col: colIdx, label: d.toLocaleDateString('es-CO', { month: 'short' }) })
    }
  })
  const mesesVis = mesesLabels
    .filter(m => m.col >= semanaOffset)
    .map(m => ({ ...m, col: m.col - semanaOffset }))

  // ── Semana actual (dots) ────────────────────────────────────────────────────
  const semanaActualDias = DIAS_SEMANA.map((nombre, i) => {
    const base   = new Date(hoyStr + 'T12:00:00')
    const offset = base.getDay() === 0 ? 6 : base.getDay() - 1
    const dia    = new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset + i)
    const fStr   = dia.toISOString().split('T')[0]
    const count  = heatmap.find(h => h.fecha === fStr)?.count ?? 0
    return { nombre, fStr, isFuture: fStr > hoyStr, entreno: fStr <= hoyStr && count > 0, isHoy: fStr === hoyStr }
  })

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Evolución y métricas de tu entrenamiento</p>
      </div>

      {/* ══ KPIs ══════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="dash-kpis" style={{ marginBottom: '6px' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '90px' }} />)}
        </div>
      ) : stats && (
        <>
          <div className="dash-kpis">
            <StatCard
              label="Racha actual"
              value={stats.rachaActual}
              unit="días"
              sub={stats.rachaActual > 0 ? '🔥 días consecutivos' : 'Entrena hoy para empezar'}
              subColor={stats.rachaActual > 0 ? 'var(--accent)' : undefined}
              icon={<Flame style={{ width: '13px', height: '13px', color: stats.rachaActual > 0 ? '#e07040' : 'var(--text-disabled)', opacity: 0.7 }} />}
            />
            <StatCard
              label="Esta semana"
              value={stats.sesionesEstaSemana}
              unit="/ 7 días"
              sub={stats.sesionesSemanaPasada > 0 ? `${stats.sesionesSemanaPasada} sem. pasada` : totalSes365 > 0 ? `${totalSes365} en el año` : 'primera semana'}
              icon={<Calendar style={{ width: '13px', height: '13px', color: 'var(--text-disabled)', opacity: 0.7 }} />}
            />
            <StatCard
              label="Última sesión"
              value={stats.ultimaSesion ? fmtFecha(stats.ultimaSesion) : '—'}
              sub={stats.ultimaSesion ? diasDesde(stats.ultimaSesion) : 'sin sesiones aún'}
              icon={<Calendar style={{ width: '13px', height: '13px', color: 'var(--text-disabled)', opacity: 0.7 }} />}
            />
            <StatCard
              label="Mejor racha"
              value={stats.rachaMejor}
              unit="días"
              sub="récord personal"
              icon={<Trophy style={{ width: '13px', height: '13px', color: 'var(--text-disabled)', opacity: 0.7 }} />}
            />
          </div>

          {/* Config line — datos de configuración, no de progreso */}
          <p style={{ fontSize: '11px', color: 'var(--text-disabled)', margin: '0 0 20px', paddingLeft: '2px' }}>
            {stats.totalRutinas} rutinas · {stats.totalEjercicios} ejercicios · {stats.totalSeries.toLocaleString('es-CO')} series totales
          </p>
        </>
      )}

      {/* ══ 2 COLUMNAS: Gráfica + Peso corporal ══════════════════════════════ */}
      <div className="dash-2col">

        {/* Gráfica de progreso */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {([['peso', TrendingUp, 'Progreso peso'], ['volumen', BarChart2, 'Volumen total']] as const).map(([tab, Icon, label]) => (
                  <button key={tab} onClick={() => setTabChart(tab)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 'var(--r-sm)', border: 'none', backgroundColor: tabChart === tab ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-raised))' : 'transparent', color: tabChart === tab ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: tabChart === tab ? '500' : '400', transition: 'all var(--t-sm) var(--ease-out)' }}>
                    <Icon style={{ width: '11px', height: '11px' }} />{label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                {tabChart === 'peso' ? 'Peso máximo por sesión · kg' : 'Peso × reps acumulado · kg'}
              </p>
            </div>

            {tabChart === 'peso' && !loading && rutinas.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', minWidth: '120px' }}>
                  <select value={rutinaSeleccionada} onChange={e => onRutinaChange(e.target.value)} style={sel}>
                    {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                </div>
                <div style={{ position: 'relative', minWidth: '120px' }}>
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

          {/* Contenido de la gráfica */}
          {tabChart === 'volumen' ? (
            loading ? <div className="skeleton" style={{ height: '220px' }} />
            : volumen.length === 0 ? (
              <div className="empty-state" style={{ height: '220px', padding: 0 }}>
                <BarChart2 style={{ width: '22px', height: '22px' }} />
                <p>Sin datos de volumen todavía</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
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
            loading || loadingChart ? <div className="skeleton" style={{ height: '220px' }} />
            : ejerciciosFiltrados.length === 0 ? (
              <div className="empty-state" style={{ height: '220px', padding: 0 }}>
                <TrendingUp style={{ width: '22px', height: '22px' }} />
                <p>Esta rutina no tiene ejercicios</p>
              </div>
            ) : progreso.length === 0 ? (
              <div className="empty-state" style={{ height: '220px', padding: 0 }}>
                <TrendingUp style={{ width: '22px', height: '22px' }} />
                <p>Sin datos para {nombreEjercicio}</p>
                <p className="empty-hint">Registra sesiones con peso para ver tu progreso</p>
              </div>
            ) : progreso.length === 1 ? (
              /* Una sola sesión: punto sobre ejes reales, sin número flotante */
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[{ fechaFmt: fmtFecha(progreso[0].fecha), peso_max: progreso[0].peso_max }]} margin={{ top: 20, right: 24, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                    <XAxis dataKey="fechaFmt" tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11, fontFamily: 'inherit' }} axisLine={false} tickLine={false}
                      domain={[Math.max(0, progreso[0].peso_max - 15), progreso[0].peso_max + 15]}
                      tickFormatter={v => `${v}kg`} />
                    <Line type="monotone" dataKey="peso_max" stroke="var(--accent)" strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 6, strokeWidth: 2, stroke: 'var(--surface-base)' }} />
                  </LineChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '11px', color: 'var(--text-disabled)', textAlign: 'center', margin: '4px 0 0' }}>
                  1 sesión registrada — sigue entrenando para ver la línea de progreso
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
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

        {/* Peso corporal */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale style={{ width: '12px', height: '12px', color: 'var(--text-tertiary)' }} />
              <p className="label" style={{ margin: 0 }}>Peso corporal</p>
            </div>
            <button onClick={() => router.push('/peso')}
              style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: 'inherit' }}>
              Ver todo →
            </button>
          </div>

          {/* Valor actual + delta */}
          {ultimoPeso && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: pesoHoyRegistrado ? '4px' : '10px' }}>
              <span className="num" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                {ultimoPeso.peso_kg}
                <span style={{ fontSize: '13px', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '3px' }}>kg</span>
              </span>
              {deltaPeso !== null && deltaPeso !== 0 && (
                <span style={{ fontSize: '12px', fontWeight: '500', color: deltaPeso < 0 ? 'var(--success)' : 'var(--error)', backgroundColor: deltaPeso < 0 ? 'var(--success-dim)' : 'var(--error-dim)', padding: '1px 6px', borderRadius: '4px' }}>
                  {deltaPeso > 0 ? '+' : ''}{deltaPeso} kg
                </span>
              )}
              {deltaPeso === 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>sin cambio</span>
              )}
            </div>
          )}
          {pesoHoyRegistrado && (
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 10px' }}>registrado hoy ✓</p>
          )}

          {/* Registro rápido si no hay dato de hoy */}
          {!pesoHoyRegistrado && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <input type="number" step="0.1" min="20" max="400" placeholder={ultimoPeso ? String(ultimoPeso.peso_kg) : 'kg de hoy'}
                value={pesoHoy} onChange={e => setPesoHoy(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') guardarPesoRapido() }}
                inputMode="decimal"
                style={{ flex: 1, backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '7px 10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', minWidth: 0 }}
              />
              <button onClick={guardarPesoRapido} disabled={guardandoPeso || !pesoHoy}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: pesoHoy ? 'var(--accent)' : 'var(--surface-raised)', color: pesoHoy ? '#0c0e12' : 'var(--text-disabled)', border: 'none', borderRadius: 'var(--r-md)', padding: '7px 10px', fontSize: '13px', cursor: pesoHoy ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'all var(--t-sm) var(--ease-out)', flexShrink: 0 }}>
                <Plus style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          )}

          {/* Sparkline mini */}
          {registrosPeso.length >= 2 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
              {registrosPeso.map(r => {
                const vals  = registrosPeso.map(x => x.peso_kg)
                const min   = Math.min(...vals); const max = Math.max(...vals)
                const range = max - min || 1
                const pct   = (r.peso_kg - min) / range
                const h     = 6 + pct * 32
                const isHoy = r.fecha === hoyStr
                return (
                  <div key={r.id} title={`${r.peso_kg} kg — ${fmtFecha(r.fecha)}`}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '100%', height: `${h}px`, backgroundColor: isHoy ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 25%, var(--surface-high))', borderRadius: '3px', transition: 'height 0.3s ease' }} />
                    {isHoy && <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '600' }}>{r.peso_kg}</span>}
                  </div>
                )
              })}
            </div>
          )}
          {!ultimoPeso && (
            <p style={{ fontSize: '12px', color: 'var(--text-disabled)', margin: 0 }}>Sin registros todavía</p>
          )}

          {/* ── Divider + Nota del día ── */}
          <hr className="divider" style={{ margin: '14px 0 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <StickyNote style={{ width: '11px', height: '11px', color: 'var(--text-tertiary)' }} />
            <p className="label" style={{ margin: 0, flex: 1 }}>Nota del día</p>
            {nota && <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>local</span>}
          </div>
          <textarea
            value={nota} onChange={e => { setNota(e.target.value); setNotaGuardada(false) }}
            placeholder="¿Cómo te sientes hoy? Energía, sueño..." rows={3}
            style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 10px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '8px', lineHeight: '1.5' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={guardarNota}
              style={{ padding: '4px 12px', fontSize: '11px', fontFamily: 'inherit', borderRadius: 'var(--r-sm)', backgroundColor: notaGuardada ? 'var(--success-dim)' : 'var(--surface-raised)', color: notaGuardada ? 'var(--success)' : 'var(--text-secondary)', border: `1px solid ${notaGuardada ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'var(--border-subtle)'}`, fontWeight: '500', transition: 'all 0.14s', cursor: 'pointer' }}>
              {notaGuardada ? '✓ Guardada' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ CONSTANCIA (dots + heatmap fusionados) ════════════════════════════ */}
      {!loading && heatmap.length > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: '16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p className="label" style={{ margin: 0 }}>Constancia</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>
                {totalSesVis} sesión{totalSesVis !== 1 ? 'es' : ''} {heatmapCompleto ? 'en 12 meses' : 'en 12 semanas'}
              </span>
              <button onClick={() => setHeatmapCompleto(h => !h)}
                style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {heatmapCompleto ? 'colapsar ▴' : 'ver año ▸'}
              </button>
            </div>
          </div>

          {/* Dots semana actual */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '16px' }}>
            {semanaActualDias.map(dia => (
              <div key={dia.nombre} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '9px', color: dia.isHoy ? 'var(--accent)' : 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: dia.isHoy ? '600' : '400' }}>{dia.nombre}</span>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: dia.entreno ? 'color-mix(in srgb, var(--accent) 20%, var(--surface-raised))' : dia.isFuture ? 'transparent' : 'var(--surface-high)',
                  border: dia.isHoy ? '2px solid var(--accent)' : dia.entreno ? '2px solid color-mix(in srgb, var(--accent) 50%, transparent)' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
                }}>
                  {dia.entreno && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />}
                </div>
              </div>
            ))}
          </div>

          <hr className="divider" style={{ margin: '0 0 14px' }} />

          {/* Heatmap */}
          <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 'max-content' }}>
              {/* Etiquetas meses */}
              <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '24px' }}>
                {semanasVis.map((_, si) => {
                  const ml = mesesVis.find(m => m.col === si)
                  return (
                    <div key={si} style={{ width: '13px', marginRight: '2px', flexShrink: 0 }}>
                      {ml && <span style={{ fontSize: '9px', color: 'var(--text-disabled)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{ml.label}</span>}
                    </div>
                  )
                })}
              </div>
              {/* Grid */}
              <div style={{ display: 'flex', gap: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px', paddingTop: '1px', width: '20px', flexShrink: 0 }}>
                  {DIAS_SEMANA.map((d, i) => (
                    <div key={d} style={{ height: '13px', display: 'flex', alignItems: 'center' }}>
                      {i % 2 === 0 && <span style={{ fontSize: '9px', color: 'var(--text-disabled)', letterSpacing: '0.04em' }}>{d}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {semanasVis.map((semana, si) => (
                    <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {semana.map((dia, di) => {
                        const isToday  = dia.fecha === hoy()
                        const isFuture = dia.fecha > hoy()
                        const bg = isFuture ? 'transparent'
                          : dia.count === 0 ? 'var(--surface-raised)'
                          : dia.count === 1 ? 'color-mix(in srgb, var(--accent) 18%, var(--surface-raised))'
                          : dia.count === 2 ? 'color-mix(in srgb, var(--accent) 40%, var(--surface-raised))'
                          : dia.count === 3 ? 'color-mix(in srgb, var(--accent) 62%, var(--surface-raised))'
                          : 'color-mix(in srgb, var(--accent) 88%, var(--surface-raised))'
                        const d = new Date(dia.fecha + 'T12:00:00')
                        const titulo = `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}${dia.count > 0 ? ` — ${dia.count} sesión${dia.count > 1 ? 'es' : ''}` : ''}`
                        return (
                          <div key={di} title={titulo}
                            onClick={() => dia.count > 0 && router.push('/historial')}
                            style={{ width: '13px', height: '13px', borderRadius: '3px', backgroundColor: bg, border: isToday ? '1.5px solid var(--accent)' : '1px solid transparent', boxSizing: 'border-box', transition: 'background-color 0.1s, transform 0.1s', cursor: dia.count > 0 ? 'pointer' : 'default' }}
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
            {['var(--surface-raised)', 'color-mix(in srgb, var(--accent) 18%, var(--surface-raised))', 'color-mix(in srgb, var(--accent) 40%, var(--surface-raised))', 'color-mix(in srgb, var(--accent) 62%, var(--surface-raised))', 'color-mix(in srgb, var(--accent) 88%, var(--surface-raised))'].map((bg, i) => (
              <div key={i} style={{ width: '11px', height: '11px', borderRadius: '2px', backgroundColor: bg }} />
            ))}
            <span style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>Más</span>
          </div>
        </div>
      )}

    </div>
  )
}
