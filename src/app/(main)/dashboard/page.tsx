'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, TrendingUp, Layers, Calendar, ChevronDown, Info } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Stats      { totalRutinas: number; totalEjercicios: number; totalSeries: number; ultimaSesion: string | null }
interface Rutina     { id_rutina: string; nombre: string }
interface Ejercicio  { id_ejercicio: string; nombre: string; id_rutina: string }
interface PuntoProgreso { fecha: string; peso_max: number; reps: number }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

const selectStyle = {
  backgroundColor: '#1e2024', border: '1px solid #43474c', color: '#e2e2e8',
  borderRadius: '8px', padding: '8px 32px 8px 12px', fontSize: '13px',
  cursor: 'pointer', fontFamily: 'inherit', appearance: 'none' as const, outline: 'none', width: '100%',
}

export default function DashboardPage() {
  const isMobile = useIsMobile()

  const [stats, setStats]           = useState<Stats | null>(null)
  const [rutinas, setRutinas]       = useState<Rutina[]>([])
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [progreso, setProgreso]     = useState<PuntoProgreso[]>([])

  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<string>('')
  const [ejSeleccionado, setEjSeleccionado]         = useState<string>('')

  const [loading, setLoading]           = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)

  // Ejercicios filtrados por rutina seleccionada
  const ejerciciosFiltrados = rutinaSeleccionada
    ? ejercicios.filter(e => e.id_rutina === rutinaSeleccionada)
    : ejercicios

  // Carga inicial: stats + rutinas + ejercicios
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setStats(d.stats)
      setRutinas(d.rutinas ?? [])
      setEjercicios(d.ejercicios ?? [])

      // Seleccionar primera rutina y primer ejercicio
      if (d.rutinas?.length > 0) {
        const primeraRutina = d.rutinas[0].id_rutina
        setRutinaSeleccionada(primeraRutina)
        const ejDeRutina = (d.ejercicios ?? []).filter((e: Ejercicio) => e.id_rutina === primeraRutina)
        if (ejDeRutina.length > 0) setEjSeleccionado(ejDeRutina[0].id_ejercicio)
      }
      setLoading(false)
    })
  }, [])

  // Cuando cambia la rutina, seleccionar primer ejercicio de esa rutina
  const onRutinaChange = (id: string) => {
    setRutinaSeleccionada(id)
    const ejDeRutina = ejercicios.filter(e => e.id_rutina === id)
    setEjSeleccionado(ejDeRutina.length > 0 ? ejDeRutina[0].id_ejercicio : '')
    setProgreso([])
  }

  // Cargar progreso cuando cambia el ejercicio
  useEffect(() => {
    if (!ejSeleccionado) return
    setLoadingChart(true)
    fetch(`/api/dashboard?id_ejercicio=${ejSeleccionado}`).then(r => r.json()).then(d => {
      setProgreso(d.progreso ?? [])
      setLoadingChart(false)
    })
  }, [ejSeleccionado])

  const cards = stats ? [
    { label: 'Rutinas',         value: stats.totalRutinas,    icon: Dumbbell,   color: '#b1c9e1' },
    { label: 'Ejercicios',      value: stats.totalEjercicios, icon: TrendingUp, color: '#7ad4a0' },
    { label: 'Series totales',  value: stats.totalSeries,     icon: Layers,     color: '#d4a07a' },
    { label: 'Última sesión',   value: stats.ultimaSesion ? fmtFecha(stats.ultimaSesion) : '—', icon: Calendar, color: '#a07ad4' },
  ] : []

  const nombreEjercicio = ejercicios.find(e => e.id_ejercicio === ejSeleccionado)?.nombre ?? ''

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>Evolución y métricas de tu entrenamiento</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: '96px', borderRadius: '12px', backgroundColor: '#1e2024' }} />)
          : cards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, fontWeight: '500' }}>{c.label}</p>
                  <Icon style={{ width: '14px', height: '14px', color: c.color, opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: '26px', fontWeight: '500', color: c.color, margin: 0, letterSpacing: '-0.02em' }}>{c.value}</p>
              </div>
            )
          })
        }
      </div>

      {/* Gráfica */}
      <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '16px', padding: isMobile ? '20px 16px' : '28px 32px' }}>
        {/* Header gráfica */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>Progreso de Peso</h2>
              <p style={{ fontSize: '12px', color: '#8d9197', marginTop: '4px', margin: '4px 0 0', fontWeight: '300' }}>
                Peso máximo registrado por sesión — en kg
              </p>
            </div>
          </div>

          {/* Filtros rutina + ejercicio */}
          {!loading && rutinas.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              {/* Selector de rutina */}
              <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '10px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Rutina
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={rutinaSeleccionada} onChange={e => onRutinaChange(e.target.value)} style={selectStyle}>
                    {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#8d9197', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Selector de ejercicio */}
              <div style={{ position: 'relative', flex: 1, minWidth: '140px' }}>
                <label style={{ fontSize: '10px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Ejercicio
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={ejSeleccionado}
                    onChange={e => setEjSeleccionado(e.target.value)}
                    disabled={ejerciciosFiltrados.length === 0}
                    style={{ ...selectStyle, opacity: ejerciciosFiltrados.length === 0 ? 0.5 : 1 }}
                  >
                    {ejerciciosFiltrados.length === 0
                      ? <option>Sin ejercicios</option>
                      : ejerciciosFiltrados.map(e => <option key={e.id_ejercicio} value={e.id_ejercicio}>{e.nombre}</option>)
                    }
                  </select>
                  <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#8d9197', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        {loading || loadingChart ? (
          <Skeleton style={{ height: '240px', borderRadius: '8px', backgroundColor: '#282a2e' }} />
        ) : ejerciciosFiltrados.length === 0 ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
            <TrendingUp style={{ width: '28px', height: '28px', color: '#43474c' }} />
            <p style={{ color: '#43474c', fontSize: '13px', margin: 0 }}>Esta rutina no tiene ejercicios todavía</p>
          </div>
        ) : progreso.length === 0 ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
            <TrendingUp style={{ width: '28px', height: '28px', color: '#43474c' }} />
            <p style={{ color: '#43474c', fontSize: '13px', margin: 0 }}>Sin datos de peso para {nombreEjercicio}</p>
            <p style={{ color: '#43474c', fontSize: '12px', margin: 0, fontWeight: '300' }}>Registra series con peso para ver tu progreso</p>
          </div>
        ) : progreso.length === 1 ? (
          /* Un solo punto — no alcanza para línea, se muestra stat */
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16181c', border: '1px solid #282a2e', borderRadius: '10px', padding: '16px 24px' }}>
              <Info style={{ width: '14px', height: '14px', color: '#8d9197', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#8d9197', margin: 0, fontWeight: '300' }}>
                Solo hay una sesión registrada. Entrena más veces para ver la línea de progreso.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '36px', fontWeight: '500', color: '#b1c9e1', margin: 0, letterSpacing: '-0.02em' }}>{progreso[0].peso_max} <span style={{ fontSize: '16px', fontWeight: '300', color: '#8d9197' }}>kg</span></p>
              <p style={{ fontSize: '12px', color: '#8d9197', marginTop: '4px', fontWeight: '300' }}>{fmtFecha(progreso[0].fecha)} · {progreso[0].reps} reps</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={progreso.map(p => ({ ...p, fechaFmt: fmtFecha(p.fecha) }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282a2e" vertical={false} />
              <XAxis dataKey="fechaFmt" tick={{ fill: '#8d9197', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8d9197', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}kg`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '8px', fontSize: '12px', color: '#e2e2e8' }}
                formatter={(val, name) => name === 'peso_max' ? [`${val} kg`, 'Peso máx.'] : [`${val} reps`, 'Repeticiones']}
                labelStyle={{ color: '#8d9197', marginBottom: '6px', fontSize: '11px' }}
              />
              <Line
                type="monotone" dataKey="peso_max" stroke="#b1c9e1" strokeWidth={2}
                dot={{ fill: '#b1c9e1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#b1c9e1', stroke: '#111318', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
