'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, CheckCircle2, Dumbbell, BicepsFlexed, AlertTriangle, Plus, Minus, Timer, X } from 'lucide-react'

interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; num_series: number; orden: number }
interface SerieInput { peso_kg: string; repeticiones: string; rir: string; notas: string }
interface EjConSeries { ejercicio: Ejercicio; series: SerieInput[] }

function hoy() { return new Date().toISOString().split('T')[0] }
function fmtFechaLarga(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}
function serieVacia(): SerieInput { return { peso_kg: '', repeticiones: '', rir: '', notas: '' } }

const TIMER_OPCIONES = [60, 90, 120, 180]

function RestTimer({ onClose }: { onClose: () => void }) {
  const [duracion, setDuracion] = useState(90)
  const [restante, setRestante] = useState(90)
  const [activo, setActivo] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const iniciar = useCallback((seg: number) => {
    setDuracion(seg)
    setRestante(seg)
    setActivo(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setActivo(false)
          toast.success('¡Descanso terminado!', { duration: 3000 })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Arrancar automáticamente con 90s al montar
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRestante(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setActivo(false)
          toast.success('¡Descanso terminado!', { duration: 3000 })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const pct = (restante / duracion) * 100
  const mins = Math.floor(restante / 60)
  const secs = restante % 60

  return (
    <div style={{
      position: 'fixed',
      /* Sit above the bottom nav bar + home-bar safe area on iOS */
      bottom: 'calc(var(--mobile-bot) + env(safe-area-inset-bottom, 0px) + 12px)',
      right: 'max(16px, env(safe-area-inset-right, 16px))',
      zIndex: 100,
      backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)',
      borderRadius: '14px', padding: '16px', width: '220px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Timer style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-primary)' }}>Descanso</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', display: 'flex' }}>
          <X style={{ width: '13px', height: '13px' }} />
        </button>
      </div>

      {/* Opciones de tiempo */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {TIMER_OPCIONES.map(s => (
          <button key={s} onClick={() => iniciar(s)}
            style={{
              flex: 1, padding: '5px 0', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: '6px', border: 'none',
              backgroundColor: duracion === s && activo ? 'var(--accent)' : 'var(--surface-raised)',
              color: duracion === s && activo ? '#0c0e12' : 'var(--text-secondary)',
              fontWeight: duracion === s && activo ? '600' : '400',
            }}
          >
            {s >= 60 ? `${s / 60}m` : `${s}s`}
          </button>
        ))}
      </div>

      {/* Display */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <p className="num" style={{ fontSize: '36px', fontWeight: '700', color: restante === 0 ? 'var(--success)' : 'var(--text-primary)', margin: 0, letterSpacing: '-0.04em' }}>
          {`${mins}:${String(secs).padStart(2, '0')}`}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-disabled)', margin: '4px 0 0' }}>
          {activo ? 'descansando...' : restante === 0 ? '¡listo!' : 'pausado'}
        </p>
        {/* Progress bar */}
        <div style={{ height: '3px', backgroundColor: 'var(--surface-high)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: restante === 0 ? 'var(--success)' : 'var(--accent)', borderRadius: '2px', transition: 'width 1s linear' }} />
        </div>
      </div>

      {activo && (
        <button onClick={() => { setActivo(false); if (intervalRef.current) clearInterval(intervalRef.current) }}
          style={{ width: '100%', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '7px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>
          Pausar
        </button>
      )}
    </div>
  )
}

const inp: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-sm)',
  /* padding intentionally compact; mobile font-size override in globals.css */
  padding: '8px 6px', fontSize: '14px', fontFamily: 'inherit',
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
  const [mostrarTimer, setMostrarTimer]   = useState(false)
  const [notasEj, setNotasEj]             = useState<Set<number>>(new Set())
  const [mostrarModal, setMostrarModal]   = useState(false)
  const [plantillaUsada, setPlantilla]    = useState(false)
  const [ultimosPesos, setUltimosPesos]   = useState<Record<string, { peso_kg: number; repeticiones: number }[]>>({})
  // Post-session summary stats
  const [resumen, setResumen] = useState<{ totalSeries: number; volumen: number; nuevosPRs: string[] } | null>(null)

  const tieneCambios = ejConSeries.some(ej => ej.series.some(s => s.peso_kg.trim() !== '' || s.repeticiones.trim() !== ''))

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (tieneCambios && !guardado) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [tieneCambios, guardado])

  useEffect(() => {
    fetch('/api/rutinas').then(r => r.json()).then(d => {
      if (!Array.isArray(d) || d.length === 0) return
      setRutinas(d)

      // Cargar plantilla de "repetir sesión" si existe
      const raw = localStorage.getItem('repeat_session')
      if (raw) {
        try {
          const plantilla = JSON.parse(raw)
          localStorage.removeItem('repeat_session')
          const rutinaMatch = d.find((r: Rutina) => r.id_rutina === plantilla.id_rutina)
          if (rutinaMatch) {
            setRutinaId(plantilla.id_rutina)
            // Los ejercicios los cargamos manualmente desde la plantilla
            fetch(`/api/ejercicios?id_rutina=${plantilla.id_rutina}`).then(r => r.json()).then((data: Ejercicio[]) => {
              const lista = Array.isArray(data) ? data : []
              const merged = lista.map(ej => {
                const ejPlantilla = plantilla.ejercicios.find((p: { id_ejercicio: string }) => p.id_ejercicio === ej.id_ejercicio)
                return {
                  ejercicio: ej,
                  series: ejPlantilla?.series ?? Array.from({ length: Math.max(ej.num_series ?? 1, 1) }, serieVacia),
                }
              })
              setEjConSeries(merged)
              setLoadingEj(false)
              setPlantilla(true)
              toast.success(`Plantilla cargada: ${plantilla.nombre_rutina}`)
            })
            return
          }
        } catch { /* ignorar */ }
      }

      setRutinaId(d[0].id_rutina)
    })
  }, [])

  useEffect(() => {
    if (!rutinaId || plantillaUsada) return
    setLoadingEj(true); setGuardado(false)
    Promise.all([
      fetch(`/api/ejercicios?id_rutina=${rutinaId}`).then(r => r.json()),
      fetch(`/api/progreso/ultimos-pesos?id_rutina=${rutinaId}`).then(r => r.json()),
    ]).then(([ejData, pesosData]: [Ejercicio[], Record<string, { peso_kg: number; repeticiones: number }[]>]) => {
      const lista = Array.isArray(ejData) ? ejData : []
      setEjConSeries(lista.map(ej => ({ ejercicio: ej, series: Array.from({ length: Math.max(ej.num_series ?? 1, 1) }, serieVacia) })))
      setUltimosPesos(pesosData ?? {})
      setNotasEj(new Set())
      setLoadingEj(false)
    })
  }, [rutinaId, plantillaUsada])

  const updateSerie = (ejIdx: number, sIdx: number, campo: keyof SerieInput, val: string) => {
    setEjConSeries(prev => {
      const next = [...prev]
      next[ejIdx] = { ...next[ejIdx], series: next[ejIdx].series.map((s, i) => i === sIdx ? { ...s, [campo]: val } : s) }
      return next
    })
  }

  const addSerie = (ejIdx: number) => {
    setEjConSeries(prev => {
      const next = [...prev]
      const last = next[ejIdx].series[next[ejIdx].series.length - 1]
      // Pre-fill con los valores de la última serie
      next[ejIdx] = { ...next[ejIdx], series: [...next[ejIdx].series, { ...last, notas: '' }] }
      return next
    })
  }

  const removeSerie = (ejIdx: number) => {
    setEjConSeries(prev => {
      const next = [...prev]
      if (next[ejIdx].series.length <= 1) return prev
      next[ejIdx] = { ...next[ejIdx], series: next[ejIdx].series.slice(0, -1) }
      return next
    })
  }

  const toggleNotasEj = (ejIdx: number) => {
    setNotasEj(prev => {
      const next = new Set(prev)
      next.has(ejIdx) ? next.delete(ejIdx) : next.add(ejIdx)
      return next
    })
  }

  const guardarSesion = async () => {
    const hayDatos = ejConSeries.some(ej => ej.series.some(s => s.repeticiones.trim() !== ''))
    if (!hayDatos) { toast.error('Registra al menos una serie con repeticiones'); return }
    setGuardando(true)

    // Calcular resumen antes de guardar
    let totalSeries = 0
    let volumen = 0
    const nuevosPRs: string[] = []
    for (const ej of ejConSeries) {
      const prevMax = ultimosPesos[ej.ejercicio.id_ejercicio]?.[0]?.peso_kg ?? 0
      let maxEjSesion = 0
      for (const s of ej.series) {
        const p = parseFloat(s.peso_kg)
        const r = parseInt(s.repeticiones)
        if (!isNaN(p) && !isNaN(r) && r > 0) {
          totalSeries++
          volumen += p * r
          if (p > maxEjSesion) maxEjSesion = p
        }
      }
      if (maxEjSesion > 0 && maxEjSesion > prevMax) {
        nuevosPRs.push(ej.ejercicio.nombre)
      }
    }

    const res = await fetch('/api/sesiones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rutina: rutinaId, fecha, notas: notas.trim() || null, ejercicios_data: ejConSeries.map(ej => ({ id_ejercicio: ej.ejercicio.id_ejercicio, series: ej.series })) }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuardando(false); return }
    setResumen({ totalSeries, volumen: Math.round(volumen), nuevosPRs })
    setGuardado(true); setGuardando(false)
  }

  if (guardado) {
    const confettiItems = ['🟡','🔵','🟢','🔴','🟠','🟣']
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes confetti-fall {
            0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(-120px) rotate(360deg) scale(0.5); opacity: 0; }
          }
          @keyframes pop-in {
            0%   { transform: scale(0.5); opacity: 0; }
            60%  { transform: scale(1.2); }
            100% { transform: scale(1);   opacity: 1; }
          }
          @keyframes slide-up {
            0%   { transform: translateY(16px); opacity: 0; }
            100% { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        {/* Confetti particles */}
        {confettiItems.map((c, i) => (
          <span key={i} style={{
            position: 'absolute',
            bottom: '40%',
            left: `${15 + i * 13}%`,
            fontSize: '18px',
            animation: `confetti-fall 1.2s ease-out ${i * 0.08}s both`,
            pointerEvents: 'none',
          }}>{c}</span>
        ))}

        <div style={{ backgroundColor: 'var(--success-dim)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: '50%', padding: '16px', display: 'flex', animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--success)' }} />
        </div>
        <div style={{ animation: 'slide-up 0.4s ease 0.15s both' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>¡Sesión guardada!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {rutinas.find(r => r.id_rutina === rutinaId)?.nombre} · {fmtFechaLarga(fecha)}
          </p>
        </div>

        {/* Resumen de la sesión */}
        {resumen && (
          <div style={{ animation: 'slide-up 0.4s ease 0.3s both', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '14px 16px', textAlign: 'center' }}>
                <p className="num" style={{ fontSize: '26px', fontWeight: '700', color: 'var(--accent)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>{resumen.totalSeries}</p>
                <p className="label" style={{ margin: 0 }}>Series</p>
              </div>
              <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '14px 16px', textAlign: 'center' }}>
                <p className="num" style={{ fontSize: '26px', fontWeight: '700', color: 'var(--accent)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>{resumen.volumen >= 1000 ? `${(resumen.volumen/1000).toFixed(1)}t` : `${resumen.volumen}`}</p>
                <p className="label" style={{ margin: 0 }}>Volumen kg</p>
              </div>
            </div>
            {resumen.nuevosPRs.length > 0 && (
              <div style={{ backgroundColor: 'color-mix(in srgb, var(--success) 8%, var(--surface-card))', border: '1px solid color-mix(in srgb, var(--success) 25%, transparent)', borderRadius: 'var(--r-lg)', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏆 {resumen.nuevosPRs.length} PR{resumen.nuevosPRs.length > 1 ? 's' : ''} nuevo{resumen.nuevosPRs.length > 1 ? 's' : ''}</p>
                {resumen.nuevosPRs.map(nombre => (
                  <p key={nombre} style={{ fontSize: '12px', color: 'var(--text-primary)', margin: '2px 0 0' }}>· {nombre}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', animation: 'slide-up 0.4s ease 0.45s both' }}>
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
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Registrar Sesión</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Registra los pesos y reps de hoy</p>
        </div>
        <button
          onClick={() => setMostrarTimer(t => !t)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px',
            backgroundColor: mostrarTimer ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-card))' : 'var(--surface-raised)',
            border: `1px solid ${mostrarTimer ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px',
            color: mostrarTimer ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <Timer style={{ width: '12px', height: '12px' }} />
          Timer
        </button>
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
                {ultimosPesos[item.ejercicio.id_ejercicio]?.length > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-disabled)', backgroundColor: 'var(--surface-high)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap' }}>
                    ↩ {ultimosPesos[item.ejercicio.id_ejercicio][0].peso_kg} kg
                  </span>
                )}
                <button
                  onClick={() => toggleNotasEj(ejIdx)}
                  style={{ fontSize: '11px', color: notasEj.has(ejIdx) ? 'var(--accent)' : 'var(--text-disabled)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 'var(--r-sm)', fontFamily: 'inherit' }}
                >
                  notas
                </button>
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
                {item.series.map((serie, sIdx) => {
                  const pesosAnt = ultimosPesos[item.ejercicio.id_ejercicio] ?? []
                  const antSerie = pesosAnt[sIdx] ?? pesosAnt[pesosAnt.length - 1] ?? null
                  return (
                  <div key={sIdx} style={{ marginBottom: notasEj.has(ejIdx) ? '8px' : '5px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>S{sIdx + 1}</span>
                      {/* inputMode="decimal" shows numeric pad WITH decimal key on iOS */}
                      <input type="number" step="0.5" min="0" inputMode="decimal"
                        placeholder={antSerie && antSerie.peso_kg > 0 ? String(antSerie.peso_kg) : '80'}
                        value={serie.peso_kg}
                        onChange={e => updateSerie(ejIdx, sIdx, 'peso_kg', e.target.value)} style={inp} />
                      <input type="number" step="1" min="1" inputMode="numeric"
                        placeholder={antSerie && antSerie.repeticiones > 0 ? String(antSerie.repeticiones) : '10'}
                        value={serie.repeticiones}
                        onChange={e => updateSerie(ejIdx, sIdx, 'repeticiones', e.target.value)} style={inp} />
                      <input type="number" step="1" min="0" max="5" inputMode="numeric" placeholder="2" value={serie.rir}
                        onChange={e => updateSerie(ejIdx, sIdx, 'rir', e.target.value)} style={inp} />
                    </div>
                    {notasEj.has(ejIdx) && (
                      <div style={{ marginTop: '4px', paddingLeft: '34px' }}>
                        <input
                          type="text" placeholder={`Nota serie ${sIdx + 1}...`} value={serie.notas}
                          onChange={e => updateSerie(ejIdx, sIdx, 'notas', e.target.value)}
                          style={{ ...inp, textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}
                        />
                      </div>
                    )}
                  </div>
                  )
                })}

                {/* Add/remove serie buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button
                    onClick={() => addSerie(ejIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '11px', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, var(--surface-raised))', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
                  >
                    <Plus style={{ width: '10px', height: '10px' }} /> Serie
                  </button>
                  {item.series.length > 1 && (
                    <button
                      onClick={() => removeSerie(ejIdx)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '11px', backgroundColor: 'transparent', color: 'var(--text-disabled)', border: '1px solid var(--border-faint)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <Minus style={{ width: '10px', height: '10px' }} /> Quitar
                    </button>
                  )}
                </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: 'var(--warning-dim)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle style={{ width: '13px', height: '13px', color: 'var(--warning)', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: 'var(--warning)', margin: 0 }}>Series sin guardar</p>
              </div>
              <button onClick={() => setMostrarModal(true)}
                style={{ fontSize: '11px', fontWeight: '600', color: 'var(--warning)', background: 'none', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-sm)', padding: '4px 8px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                ¿Salir?
              </button>
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

      {/* Rest Timer */}
      {mostrarTimer && <RestTimer onClose={() => setMostrarTimer(false)} />}

      {/* Modal confirmación salir */}
      {mostrarModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: 'var(--warning-dim)', borderRadius: '50%', padding: '8px', display: 'flex' }}>
                <AlertTriangle style={{ width: '18px', height: '18px', color: 'var(--warning)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                ¿Salir sin guardar?
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: '1.5' }}>
              Tienes series registradas que se perderán si sales ahora.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setMostrarModal(false)}
                style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                Quedarse
              </button>
              <button onClick={() => router.push('/historial')}
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--error)', border: 'none', borderRadius: 'var(--r-md)', fontSize: '13px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
                Salir igual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
