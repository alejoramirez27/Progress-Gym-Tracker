'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RegistroPeso { id: string; fecha: string; peso_kg: number; notas: string | null }

function hoy() { return new Date().toISOString().split('T')[0] }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function fmtFechaLarga(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PesoPage() {
  const [registros, setRegistros] = useState<RegistroPeso[]>([])
  const [loading, setLoading]     = useState(true)
  const [peso, setPeso]           = useState('')
  const [fecha, setFecha]         = useState(hoy())
  const [notas, setNotas]         = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setForm]    = useState(false)

  const cargar = () => {
    setLoading(true)
    fetch('/api/peso-corporal').then(r => r.json()).then(d => {
      setRegistros(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }
  useEffect(() => { cargar() }, [])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!peso || parseFloat(peso) <= 0) { toast.error('Ingresa un peso válido'); return }
    setGuardando(true)
    const res = await fetch('/api/peso-corporal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, peso_kg: parseFloat(peso), notas: notas.trim() || null }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardando(false); return }
    toast.success('Peso registrado')
    setPeso(''); setNotas(''); setFecha(hoy()); setForm(false); setGuardando(false)
    cargar()
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este registro?')) return
    const res = await fetch(`/api/peso-corporal?id=${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success('Registro eliminado')
    cargar()
  }

  // Stats
  const ordenados = [...registros].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const ultimo    = registros[0]
  const primero   = ordenados[0]
  const diferencia = ultimo && primero && ultimo.id !== primero.id
    ? Math.round((ultimo.peso_kg - primero.peso_kg) * 10) / 10
    : null
  const minPeso = ordenados.length ? Math.min(...ordenados.map(r => r.peso_kg)) : null
  const maxPeso = ordenados.length ? Math.max(...ordenados.map(r => r.peso_kg)) : null

  // Datos para gráfica (últimos 30)
  const datoChart = ordenados.slice(-30).map(r => ({ fecha: fmtFecha(r.fecha), peso: r.peso_kg }))

  const inp: React.CSSProperties = {
    backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', borderRadius: 'var(--r-md)',
    padding: '8px 11px', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Peso Corporal
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Evolución de tu peso en el tiempo
          </p>
        </div>
        <button
          onClick={() => setForm(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: mostrarForm ? 'var(--surface-raised)' : 'var(--accent)', color: mostrarForm ? 'var(--text-secondary)' : '#0c0e12', border: mostrarForm ? '1px solid var(--border-default)' : 'none', borderRadius: 'var(--r-md)', padding: '8px 14px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus style={{ width: '13px', height: '13px' }} /> Registrar
        </button>
      </div>

      {/* Form */}
      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ padding: '18px', marginBottom: '16px' }}>
          <p className="label" style={{ margin: '0 0 12px' }}>Nuevo registro</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label">Peso (kg) *</label>
              <input
                style={inp} type="number" step="0.1" min="20" max="400"
                placeholder="75.5" value={peso}
                onChange={e => setPeso(e.target.value)}
                inputMode="decimal" required autoFocus
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="label">Fecha</label>
              <input style={inp} type="date" value={fecha} onChange={e => setFecha(e.target.value)} max={hoy()} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
            <label className="label">Nota (opcional)</label>
            <input style={inp} placeholder="Ej: En ayunas, tras desayunar..." value={notas} onChange={e => setNotas(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={guardando}
              style={{ backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[80, 240, 60, 60, 60].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      )}

      {!loading && registros.length === 0 && (
        <div className="card empty-state">
          <Scale style={{ width: '26px', height: '26px' }} />
          <p>Sin registros todavía</p>
          <p className="empty-hint">Registra tu peso diariamente para ver tu evolución</p>
          <button onClick={() => setForm(true)}
            style={{ marginTop: '8px', backgroundColor: 'var(--accent)', color: '#0c0e12', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
            Primer registro
          </button>
        </div>
      )}

      {!loading && registros.length > 0 && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            {[
              {
                label: 'Último',
                value: `${ultimo?.peso_kg}`,
                unit: 'kg',
                sub: ultimo ? fmtFechaLarga(ultimo.fecha) : '—',
                accent: true,
              },
              {
                label: 'Mínimo',
                value: minPeso !== null ? `${minPeso}` : '—',
                unit: minPeso !== null ? 'kg' : '',
                sub: 'registrado',
                accent: false,
              },
              {
                label: 'Cambio',
                value: diferencia !== null ? `${diferencia > 0 ? '+' : ''}${diferencia}` : '—',
                unit: diferencia !== null ? 'kg' : '',
                sub: diferencia !== null ? (diferencia > 0 ? 'ganado' : diferencia < 0 ? 'perdido' : 'sin cambio') : 'insuficiente',
                accent: false,
                color: diferencia !== null ? (diferencia < 0 ? 'var(--success)' : diferencia > 0 ? 'var(--error)' : 'var(--text-secondary)') : 'var(--text-secondary)',
              },
            ].map((stat, i) => (
              <div key={i} style={{ backgroundColor: 'var(--surface-card)', padding: '14px 12px', textAlign: 'center' }}>
                <p className="label" style={{ margin: '0 0 4px' }}>{stat.label}</p>
                <p className="num" style={{ fontSize: '20px', fontWeight: '700', color: stat.color ?? (stat.accent ? 'var(--accent)' : 'var(--text-primary)'), margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                  {stat.value}<span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '300' }}>{stat.unit ? ` ${stat.unit}` : ''}</span>
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-disabled)', margin: 0 }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Gráfica */}
          {datoChart.length >= 2 && (
            <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                Evolución — últimos {datoChart.length} registros
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={datoChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: 'var(--text-disabled)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-disabled)' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                    formatter={(v: unknown) => [`${v} kg`, 'Peso']}
                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone" dataKey="peso"
                    stroke="var(--accent)" strokeWidth={2}
                    dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historial */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-faint)', backgroundColor: 'var(--surface-raised)' }}>
              <p className="label" style={{ margin: 0 }}>Historial ({registros.length})</p>
            </div>
            <div className="stagger-list">
              {registros.map((r, idx) => {
                const prev = registros[idx + 1]
                const diff = prev ? Math.round((r.peso_kg - prev.peso_kg) * 10) / 10 : null
                return (
                  <div key={r.id}>
                    {idx > 0 && <hr className="divider" />}
                    <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="num" style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            {r.peso_kg} kg
                          </span>
                          {diff !== null && diff !== 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '500', color: diff < 0 ? 'var(--success)' : 'var(--error)', backgroundColor: diff < 0 ? 'var(--success-dim)' : 'var(--error-dim)', borderRadius: '4px', padding: '1px 5px' }}>
                              {diff > 0 ? <TrendingUp style={{ width: '10px', height: '10px' }} /> : <TrendingDown style={{ width: '10px', height: '10px' }} />}
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          )}
                          {diff === 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: 'var(--text-disabled)', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', padding: '1px 5px' }}>
                              <Minus style={{ width: '10px', height: '10px' }} />
                              sin cambio
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                          {fmtFechaLarga(r.fecha)}
                          {r.notas && <span style={{ color: 'var(--text-disabled)' }}> · {r.notas}</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => eliminar(r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 'var(--r-sm)', color: 'var(--text-disabled)', transition: 'color var(--t-sm) var(--ease-out), background-color var(--t-sm) var(--ease-out)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'var(--error-dim)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-disabled)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                        aria-label="Eliminar"
                      >
                        <Trash2 style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
