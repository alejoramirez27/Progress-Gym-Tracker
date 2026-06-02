'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, CheckCircle2, Dumbbell, BicepsFlexed, AlertTriangle } from 'lucide-react'

interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; num_series: number; orden: number }
interface SerieInput { peso_kg: string; repeticiones: string; rir: string }
interface EjConSeries { ejercicio: Ejercicio; series: SerieInput[] }

function hoy() { return new Date().toISOString().split('T')[0] }
function fmtFechaLarga(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}
function serieVacia(): SerieInput { return { peso_kg: '', repeticiones: '', rir: '' } }

const inp: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-sm)',
  padding: '7px 6px', fontSize: '13px', fontFamily: 'inherit',
  outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box',
}

export default function ProgresoPage() {
  const router = useRouter()

  const [rutinas, setRutinas]           = useState<Rutina[]>([])
  const [rutinaId, setRutinaId]         = useState('')
  const [fecha, setFecha]               = useState(hoy())
  const [notas, setNotas]               = useState('')
  const [ejConSeries, setEjConSeries]   = useState<EjConSeries[]>([])
  const [loadingEj, setLoadingEj]       = useState(false)
  const [guardando, setGuardando]       = useState(false)
  const [guardado, setGuardado]         = useState(false)

  const tieneCambios = ejConSeries.some(ej => ej.series.some(s => s.peso_kg.trim() !== '' || s.repeticiones.trim() !== ''))

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (tieneCambios && !guardado) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [tieneCambios, guardado])

  useEffect(() => {
    fetch('/api/rutinas').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) { setRutinas(d); setRutinaId(d[0].id_rutina) }
    })
  }, [])

  useEffect(() => {
    if (!rutinaId) return
    setLoadingEj(true); setGuardado(false)
    fetch(`/api/ejercicios?id_rutina=${rutinaId}`).then(r => r.json()).then((data: Ejercicio[]) => {
      const lista = Array.isArray(data) ? data : []
      setEjConSeries(lista.map(ej => ({ ejercicio: ej, series: Array.from({ length: Math.max(ej.num_series ?? 1, 1) }, serieVacia) })))
      setLoadingEj(false)
    })
  }, [rutinaId])

  const updateSerie = (ejIdx: number, sIdx: number, campo: keyof SerieInput, val: string) => {
    setEjConSeries(prev => {
      const next = [...prev]
      next[ejIdx] = { ...next[ejIdx], series: next[ejIdx].series.map((s, i) => i === sIdx ? { ...s, [campo]: val } : s) }
      return next
    })
  }

  const guardarSesion = async () => {
    const hayDatos = ejConSeries.some(ej => ej.series.some(s => s.repeticiones.trim() !== ''))
    if (!hayDatos) { toast.error('Registra al menos una serie con repeticiones'); return }
    setGuardando(true)
    const res = await fetch('/api/sesiones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rutina: rutinaId, fecha, notas: notas.trim() || null, ejercicios_data: ejConSeries.map(ej => ({ id_ejercicio: ej.ejercicio.id_ejercicio, series: ej.series })) }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuardando(false); return }
    setGuardado(true); setGuardando(false)
    toast.success('Sesión registrada')
  }

  if (guardado) {
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--success-dim)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: '50%', padding: '16px', display: 'flex' }}>
          <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--success)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>Sesión guardada</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {rutinas.find(r => r.id_rutina === rutinaId)?.nombre} · {fmtFechaLarga(fecha)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => { setGuardado(false); setEjConSeries(prev => prev.map(ej => ({ ...ej, series: Array.from({ length: ej.ejercicio.num_series }, serieVacia) }))) }}
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Nueva sesión
          </button>
          <button
            onClick={() => router.push('/historial')}
            style={{ backgroundColor: 'var(--accent)', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 16px', fontSize: '13px', fontWeight: '500', color: '#0c0e12', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Ver historial
          </button>
        </div>
      </div>
    )
  }

  const selStyle: React.CSSProperties = { width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 28px 8px 11px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', outline: 'none', boxSizing: 'border-box' }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Registrar Sesión</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Registra los pesos y reps de hoy</p>
      </div>

      {/* Rutina + fecha */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="label" htmlFor="p-rutina" style={{ display: 'block', marginBottom: '6px' }}>Rutina</label>
            <div style={{ position: 'relative' }}>
              <select id="p-rutina" value={rutinaId} onChange={e => setRutinaId(e.target.value)} style={selStyle}>
                {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="p-fecha" style={{ display: 'block', marginBottom: '6px' }}>Fecha</label>
            <input id="p-fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 11px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Exercises */}
      {loadingEj ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[100, 80, 100].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      ) : ejConSeries.length === 0 ? (
        <div className="card empty-state">
          <Dumbbell style={{ width: '26px', height: '26px' }} />
          <p>Esta rutina no tiene ejercicios</p>
          <p className="empty-hint">Agrégalos en la sección <strong>Rutinas</strong></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ejConSeries.map((item, ejIdx) => (
            <div key={item.ejercicio.id_ejercicio} className="card" style={{ overflow: 'hidden' }}>
              {/* Exercise header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--surface-raised)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)', fontWeight: '600', minWidth: '18px', fontVariantNumeric: 'tabular-nums' }}>
                  {String(item.ejercicio.orden ?? ejIdx + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, flex: 1, letterSpacing: '-0.01em' }}>
                  {item.ejercicio.nombre}
                </p>
                <span className="tag tag-accent">{item.series.length} series</span>
              </div>

              {/* Series table */}
              <div style={{ padding: '12px 16px' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <span />
                  {['Peso (kg)', 'Reps *', 'RIR'].map(h => (
                    <span key={h} className="label" style={{ textAlign: 'center' }}>{h}</span>
                  ))}
                </div>
                {/* Series rows */}
                {item.series.map((serie, sIdx) => (
                  <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', marginBottom: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>S{sIdx + 1}</span>
                    <input type="number" step="0.5" min="0" placeholder="80" value={serie.peso_kg}
                      onChange={e => updateSerie(ejIdx, sIdx, 'peso_kg', e.target.value)} style={inp} />
                    <input type="number" step="1" min="1" placeholder="10" value={serie.repeticiones}
                      onChange={e => updateSerie(ejIdx, sIdx, 'repeticiones', e.target.value)} style={inp} />
                    <input type="number" step="1" min="0" max="5" placeholder="2" value={serie.rir}
                      onChange={e => updateSerie(ejIdx, sIdx, 'rir', e.target.value)} style={inp} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <label className="label" htmlFor="p-notas" style={{ display: 'block', marginBottom: '7px' }}>Notas de la sesión (opcional)</label>
            <textarea id="p-notas" value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Buena sesión, subí peso en press banca..." rows={2}
              style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {/* Warning banner */}
          {tieneCambios && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--warning-dim)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
              <AlertTriangle style={{ width: '13px', height: '13px', color: 'var(--warning)', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: 'var(--warning)', margin: 0 }}>
                Tienes series sin guardar — guarda la sesión antes de salir
              </p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={guardarSesion} disabled={guardando}
            style={{ width: '100%', backgroundColor: guardando ? 'var(--surface-high)' : 'var(--accent)', color: guardando ? 'var(--text-secondary)' : '#0c0e12', border: 'none', borderRadius: 'var(--r-lg)', padding: '13px', fontSize: '14px', fontWeight: '500', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <BicepsFlexed style={{ width: '15px', height: '15px' }} />
            {guardando ? 'Guardando sesión...' : 'Guardar sesión'}
          </button>
        </div>
      )}
    </div>
  )
}
