'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dumbbell, TrendingUp, Layers, Calendar, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats { totalRutinas: number; totalEjercicios: number; totalSeries: number; ultimaSesion: string | null }
interface Ejercicio { id_ejercicio: string; nombre: string }
interface PuntoProgreso { fecha: string; peso_max: number; reps: number }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [progreso, setProgreso]     = useState<PuntoProgreso[]>([])
  const [ejSeleccionado, setEjSeleccionado] = useState<string>('')
  const [loading, setLoading]       = useState(true)
  const [loadingChart, setLoadingChart] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setStats(d.stats); setEjercicios(d.ejercicios ?? [])
      if (d.ejercicios?.length > 0) setEjSeleccionado(d.ejercicios[0].id_ejercicio)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!ejSeleccionado) return
    setLoadingChart(true)
    fetch(`/api/dashboard?id_ejercicio=${ejSeleccionado}`).then(r => r.json()).then(d => {
      setProgreso(d.progreso ?? []); setLoadingChart(false)
    })
  }, [ejSeleccionado])

  const cards = stats ? [
    { label: 'Total Rutinas',      value: stats.totalRutinas,    icon: Dumbbell,    color: '#b1c9e1' },
    { label: 'Total Ejercicios',   value: stats.totalEjercicios, icon: TrendingUp,  color: '#7ad4a0' },
    { label: 'Series Acumuladas',  value: stats.totalSeries,     icon: Layers,      color: '#d4a07a' },
    { label: 'Última Sesión',      value: stats.ultimaSesion ? fmtFecha(stats.ultimaSesion) : '—', icon: Calendar, color: '#a07ad4' },
  ] : []

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>Evolución y métricas de tu entrenamiento</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: '100px', borderRadius: '12px', backgroundColor: '#1e2024' }} />) :
          cards.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, fontWeight: '500' }}>{c.label}</p>
                  <Icon style={{ width: '15px', height: '15px', color: c.color, opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: '28px', fontWeight: '500', color: c.color, margin: 0, letterSpacing: '-0.02em' }}>{c.value}</p>
              </div>
            )
          })
        }
      </div>

      {/* Gráfica de progreso */}
      <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '16px', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>Gráfica de Progreso</h2>
            <p style={{ fontSize: '12px', color: '#8d9197', marginTop: '4px', fontWeight: '300' }}>Evolución del peso máximo por sesión</p>
          </div>
          {ejercicios.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={ejSeleccionado}
                onChange={e => setEjSeleccionado(e.target.value)}
                style={{ backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px', padding: '8px 32px 8px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', outline: 'none' }}
              >
                {ejercicios.map(e => <option key={e.id_ejercicio} value={e.id_ejercicio}>{e.nombre}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#8d9197', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {loadingChart ? (
          <Skeleton style={{ height: '260px', borderRadius: '8px', backgroundColor: '#282a2e' }} />
        ) : progreso.length === 0 ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
            <TrendingUp style={{ width: '28px', height: '28px', color: '#43474c' }} />
            <p style={{ color: '#43474c', fontSize: '13px', margin: 0 }}>
              {ejercicios.length === 0 ? 'Registra series con peso para ver tu progreso' : 'Sin datos de peso para este ejercicio'}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={progreso.map(p => ({ ...p, fecha: fmtFecha(p.fecha) }))} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282a2e" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fill: '#8d9197', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8d9197', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}kg`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#282a2e', border: '1px solid #43474c', borderRadius: '8px', fontSize: '12px', color: '#e2e2e8' }}
                formatter={(val: number) => [`${val} kg`, 'Peso máx.']}
                labelStyle={{ color: '#8d9197', marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="peso_max" stroke="#b1c9e1" strokeWidth={2} dot={{ fill: '#b1c9e1', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#b1c9e1' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
