'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Dumbbell, BicepsFlexed, AlertTriangle, Plus, Minus, X, CalendarDays } from 'lucide-react'

interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; num_series: number; orden: number }
interface SerieInput { peso_kg: string; repeticiones: string; rir: string; notas: string }
interface EjConSeries { ejercicio: Ejercicio; series: SerieInput[] }

/** Fecha actual en Colombia (UTC-5, sin horario de verano) */
function hoy() {
  const col = new Date(Date.now() - 5 * 60 * 60 * 1000)
  return col.toISOString().split('T')[0]
}
function fmtFechaLarga(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}
function serieVacia(): SerieInput { return { peso_kg: '', repeticiones: '', rir: '', notas: '' } }

// ── Conversión de unidades ──────────────────────────────────────────────────
const KG_TO_LB = 2.20462
const LB_TO_KG = 0.453592

type Unidad = 'kg' | 'lb'

/** Convierte kg almacenados a la unidad de display */
function kgADisplay(kg: number, u: Unidad): number {
  if (u === 'lb') return Math.round(kg * KG_TO_LB * 10) / 10
  return kg
}

/** Convierte el valor ingresado por el usuario a kg para guardar */
function inputAKg(val: number, u: Unidad): number {
  if (u === 'lb') return Math.round(val * LB_TO_KG * 1000) / 1000
  return val
}


// ── Custom DatePicker ──────────────────────────────────────────────────────
const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_ES  = ['L','M','X','J','V','S','D']

function DatePicker({ value, onChange, max }: { value: string; onChange: (v: string) => void; max?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const parsed = value ? new Date(value + 'T12:00:00') : new Date()
  const [view, setView] = useState({ year: parsed.getFullYear(), month: parsed.getMonth() })

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00')
      setView({ year: d.getFullYear(), month: d.getMonth() })
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const display = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Seleccionar fecha'

  // Build days grid (Mon-first)
  const firstDay    = new Date(view.year, view.month, 1)
  const lastDay     = new Date(view.year, view.month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7 // Mon = 0

  const cells: (Date | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(view.year, view.month, d))

  const todayStr = hoy()

  const prevM = () => setView(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() } })
  const nextM = () => setView(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() } })

  const pick = (day: Date) => {
    const str = day.toISOString().split('T')[0]
    if (max && str > max) return
    onChange(str)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left',
          backgroundColor: 'var(--surface-input)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border-subtle)'}`,
          boxShadow: open ? '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)' : 'none',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          borderRadius: 'var(--r-md)', padding: '8px 11px', fontSize: '13px',
          fontFamily: 'inherit', cursor: 'pointer',
          transition: 'border-color var(--t-sm), box-shadow var(--t-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
          boxSizing: 'border-box',
        }}
      >
        <span>{display}</span>
        <CalendarDays style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          zIndex: 300, padding: '14px', minWidth: '240px',
          animation: 'fadeUp 0.12s var(--ease-out) both',
        }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button onClick={prevM} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px', borderRadius: 'var(--r-sm)', display: 'flex', transition: 'color var(--t-sm)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {MESES_ES[view.month]} {view.year}
            </span>
            <button onClick={nextM} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px', borderRadius: 'var(--r-sm)', display: 'flex', transition: 'color var(--t-sm)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
            {DIAS_ES.map(d => (
              <span key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '500', color: 'var(--text-disabled)', letterSpacing: '0.05em', padding: '3px 0' }}>{d}</span>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <span key={`e-${i}`} />
              const str   = day.toISOString().split('T')[0]
              const isSel = str === value
              const isHoy = str === todayStr
              const isOff = max ? str > max : false
              return (
                <button key={str} onClick={() => pick(day)} disabled={isOff}
                  style={{
                    padding: '6px 0', borderRadius: '6px', border: 'none',
                    cursor: isOff ? 'default' : 'pointer',
                    fontSize: '12px', fontFamily: 'inherit', textAlign: 'center',
                    backgroundColor: isSel ? 'var(--accent)' : isHoy ? 'var(--accent-dim)' : 'transparent',
                    color: isSel ? '#0c0e12' : isHoy ? 'var(--accent)' : isOff ? 'var(--text-disabled)' : 'var(--text-primary)',
                    fontWeight: isSel || isHoy ? '600' : '400',
                    transition: 'background-color var(--t-xs)',
                  }}
                  onMouseEnter={e => { if (!isSel && !isOff) e.currentTarget.style.backgroundColor = 'var(--surface-high)' }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.backgroundColor = isSel ? 'var(--accent)' : isHoy ? 'var(--accent-dim)' : 'transparent' }}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Hoy shortcut */}
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-faint)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { onChange(todayStr); setOpen(false) }}
              style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', padding: '2px 4px' }}>
              Hoy
            </button>
          </div>
        </div>
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
  const [notasEj, setNotasEj]             = useState<Set<number>>(new Set())
  const [mostrarModal, setMostrarModal]   = useState(false)
  const [plantillaUsada, setPlantilla]    = useState(false)
  const [ultimosPesos, setUltimosPesos]   = useState<Record<string, { peso_kg: number; repeticiones: number }[]>>({})
  // Post-session summary stats
  const [resumen, setResumen] = useState<{ totalSeries: number; volumen: number; nuevosPRs: string[] } | null>(null)
  // Unidad por ejercicio: { [id_ejercicio]: 'kg' | 'lb' }
  const [unidades, setUnidades] = useState<Record<string, Unidad>>({})

  // ── Custom numpad ──────────────────────────────────────────────────────────
  type NumpadField = 'peso_kg' | 'repeticiones' | 'rir'
  const [numpadTarget, setNumpadTarget] = useState<{ ejIdx: number; sIdx: number; field: NumpadField; label: string } | null>(null)
  const [numpadValue, setNumpadValue]   = useState('')

  function openNumpad(ejIdx: number, sIdx: number, field: NumpadField, currentVal: string) {
    setNumpadTarget({ ejIdx, sIdx, field, label: field === 'peso_kg' ? 'Peso' : field === 'repeticiones' ? 'Reps' : 'RIR' })
    setNumpadValue(currentVal)
  }

  function numpadPress(key: string) {
    setNumpadValue(prev => {
      if (key === '⌫') return prev.slice(0, -1)
      if (key === 'C') return ''
      if (key === '.') {
        if (prev.includes('.')) return prev
        return prev === '' ? '0.' : prev + '.'
      }
      if (prev === '0' && key !== '.') return key
      return prev + key
    })
  }

  function numpadConfirm() {
    if (!numpadTarget) return
    updateSerie(numpadTarget.ejIdx, numpadTarget.sIdx, numpadTarget.field, numpadValue)
    setNumpadTarget(null)
  }

  const getUnidad = (id: string): Unidad => unidades[id] ?? 'kg'

  const toggleUnidadEj = (id: string) => {
    const currentU = getUnidad(id)
    const nextU: Unidad = currentU === 'lb' ? 'kg' : 'lb'

    // Convertir los valores ya ingresados en los inputs de ese ejercicio
    setEjConSeries(prev => prev.map(ej => {
      if (ej.ejercicio.id_ejercicio !== id) return ej
      return {
        ...ej,
        series: ej.series.map(s => {
          const val = parseFloat(s.peso_kg)
          if (isNaN(val) || s.peso_kg.trim() === '') return s
          const converted = nextU === 'lb'
            ? Math.round(val * KG_TO_LB * 10) / 10   // kg → lb
            : Math.round(val * LB_TO_KG * 10) / 10   // lb → kg
          return { ...s, peso_kg: String(converted) }
        }),
      }
    }))

    setUnidades(prev => ({ ...prev, [id]: nextU }))
  }

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
      fetch(`/api/ejercicios?id_rutina=${rutinaId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/progreso/ultimos-pesos?id_rutina=${rutinaId}`).then(r => r.json()).catch(() => ({})),
    ]).then(([ejData, pesosData]: [Ejercicio[], Record<string, { peso_kg: number; repeticiones: number }[]>]) => {
      const lista = Array.isArray(ejData) ? ejData : []
      setEjConSeries(lista.map(ej => ({ ejercicio: ej, series: Array.from({ length: Math.max(ej.num_series ?? 1, 1) }, serieVacia) })))
      setUltimosPesos(pesosData ?? {})
      setNotasEj(new Set())
      setLoadingEj(false)
    }).catch(() => setLoadingEj(false))
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

    // Calcular resumen y convertir unidades antes de guardar
    let totalSeries = 0
    let volumen = 0
    const nuevosPRs: string[] = []

    // Construir datos con pesos siempre en kg para la API
    const ejerciciosParaApi = ejConSeries.map(ej => {
      const u = getUnidad(ej.ejercicio.id_ejercicio)
      const prevMax = ultimosPesos[ej.ejercicio.id_ejercicio]?.[0]?.peso_kg ?? 0
      let maxEjSesion = 0
      const seriesConvertidas = ej.series.map(s => {
        const pInput = parseFloat(s.peso_kg)
        const r = parseInt(s.repeticiones)
        const pKg = !isNaN(pInput) ? inputAKg(pInput, u) : 0
        if (!isNaN(pInput) && !isNaN(r) && r > 0) {
          totalSeries++
          volumen += pKg * r
          if (pKg > maxEjSesion) maxEjSesion = pKg
        }
        return { ...s, peso_kg: !isNaN(pInput) ? String(Math.round(pKg * 1000) / 1000) : s.peso_kg }
      })
      if (maxEjSesion > 0 && maxEjSesion > prevMax) nuevosPRs.push(ej.ejercicio.nombre)
      return { id_ejercicio: ej.ejercicio.id_ejercicio, series: seriesConvertidas }
    })

    const res = await fetch('/api/sesiones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rutina: rutinaId, fecha, notas: notas.trim() || null, ejercicios_data: ejerciciosParaApi }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuardando(false); return }
    setResumen({ totalSeries, volumen: Math.round(volumen), nuevosPRs })
    setGuardado(true); setGuardando(false)
  }

  if (guardado) {
    const hasPRs = resumen && resumen.nuevosPRs.length > 0

    // 28 confetti pieces: varied shapes/colors/positions/speeds
    const CONFETTI = [
      { emoji: '🟡', x: 8,  delay: 0,    dur: 1.4 },
      { emoji: '🔵', x: 18, delay: 0.07, dur: 1.2 },
      { emoji: '🟢', x: 28, delay: 0.14, dur: 1.5 },
      { emoji: '🔴', x: 38, delay: 0.05, dur: 1.3 },
      { emoji: '🟠', x: 48, delay: 0.18, dur: 1.1 },
      { emoji: '🟣', x: 58, delay: 0.03, dur: 1.6 },
      { emoji: '🟡', x: 68, delay: 0.12, dur: 1.2 },
      { emoji: '🔵', x: 78, delay: 0.09, dur: 1.4 },
      { emoji: '🔴', x: 88, delay: 0.16, dur: 1.3 },
      { emoji: '🟢', x: 14, delay: 0.22, dur: 1.0 },
      { emoji: '🟠', x: 24, delay: 0.28, dur: 1.5 },
      { emoji: '🟣', x: 34, delay: 0.20, dur: 1.2 },
      { emoji: '🟡', x: 44, delay: 0.25, dur: 1.4 },
      { emoji: '🔵', x: 54, delay: 0.08, dur: 1.1 },
      { emoji: '🟢', x: 64, delay: 0.30, dur: 1.3 },
      { emoji: '🔴', x: 74, delay: 0.15, dur: 1.6 },
      { emoji: '🟠', x: 84, delay: 0.24, dur: 1.0 },
      { emoji: '🟣', x: 92, delay: 0.11, dur: 1.5 },
    ]

    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '24px 16px' }}>
        <style>{`
          @keyframes confetti-burst {
            0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
            70%  { opacity: 1; }
            100% { transform: translateY(-160px) rotate(720deg) scale(0.3); opacity: 0; }
          }
          @keyframes pop-in {
            0%   { transform: scale(0.3); opacity: 0; }
            55%  { transform: scale(1.3); }
            75%  { transform: scale(0.9); }
            100% { transform: scale(1);   opacity: 1; }
          }
          @keyframes trophy-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(240,180,40,0.4), 0 0 0 0 rgba(240,180,40,0.2); }
            50%       { box-shadow: 0 0 0 14px rgba(240,180,40,0.15), 0 0 0 28px rgba(240,180,40,0.06); }
          }
          @keyframes slide-up {
            0%   { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0);    opacity: 1; }
          }
          @keyframes pr-row-in {
            0%   { transform: translateX(-12px); opacity: 0; }
            100% { transform: translateX(0);     opacity: 1; }
          }
          @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; }
          }
        `}</style>

        {/* Confetti — only when PRs */}
        {hasPRs && CONFETTI.map((c, i) => (
          <span key={i} style={{
            position: 'absolute',
            bottom: '35%',
            left: `${c.x}%`,
            fontSize: '16px',
            animation: `confetti-burst ${c.dur}s ease-out ${c.delay}s both`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}>{c.emoji}</span>
        ))}

        {/* Hero icon — trophy for PR, checkmark otherwise */}
        {hasPRs ? (
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(240,180,40,0.12)',
            border: '2px solid rgba(240,180,40,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            animation: 'pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both, trophy-glow 2s ease-in-out 0.6s infinite',
          }}>🏆</div>
        ) : (
          <div style={{
            backgroundColor: 'var(--success-dim)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)',
            borderRadius: '50%', padding: '16px', display: 'flex',
            animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <CheckCircle2 style={{ width: '36px', height: '36px', color: 'var(--success)' }} />
          </div>
        )}

        {/* Title */}
        <div style={{ animation: 'slide-up 0.4s ease 0.2s both' }}>
          {hasPRs ? (
            <>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#b8860b', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                ¡Nuevo récord personal!
              </p>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {resumen!.nuevosPRs.length === 1 ? '¡Lo superaste!' : `¡${resumen!.nuevosPRs.length} PRs en una sesión!`}
              </h2>
            </>
          ) : (
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              ¡Sesión guardada!
            </h2>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {rutinas.find(r => r.id_rutina === rutinaId)?.nombre} · {fmtFechaLarga(fecha)}
          </p>
        </div>

        {/* PR list — golden cards */}
        {hasPRs && (
          <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {resumen!.nuevosPRs.map((nombre, i) => (
              <div key={nombre} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: 'rgba(240,180,40,0.08)',
                border: '1px solid rgba(240,180,40,0.3)',
                borderRadius: 'var(--r-lg)',
                padding: '10px 14px',
                animation: `pr-row-in 0.35s ease ${0.35 + i * 0.1}s both`,
              }}>
                <span style={{ fontSize: '18px' }}>🥇</span>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>{nombre}</p>
              </div>
            ))}
          </div>
        )}

        {/* Stats summary */}
        {resumen && (
          <div style={{ animation: 'slide-up 0.4s ease 0.4s both', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxWidth: '320px' }}>
            <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>{resumen.totalSeries}</p>
              <p className="label" style={{ margin: 0 }}>Series</p>
            </div>
            <div style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                {resumen.volumen >= 1000 ? `${(resumen.volumen / 1000).toFixed(1)}t` : `${resumen.volumen}`}
              </p>
              <p className="label" style={{ margin: 0 }}>Volumen kg</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', animation: 'slide-up 0.4s ease 0.55s both' }}>
          <button
            onClick={() => { setGuardado(false); setEjConSeries(prev => prev.map(ej => ({ ...ej, series: Array.from({ length: ej.ejercicio.num_series }, serieVacia) }))) }}
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)', padding: '9px 18px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Nueva sesión
          </button>
          <button
            onClick={() => router.push(hasPRs ? '/records' : '/historial')}
            style={{ backgroundColor: hasPRs ? '#b8860b' : 'var(--accent)', border: 'none', borderRadius: 'var(--r-md)', padding: '9px 18px', fontSize: '13px', fontWeight: '600', color: '#ffffff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {hasPRs ? 'Ver mis PRs →' : 'Ver historial'}
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
            <DatePicker value={fecha} onChange={setFecha} max={hoy()} />
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
          {ejConSeries.map((item, ejIdx) => {
            const u = getUnidad(item.ejercicio.id_ejercicio)
            return (
            <div key={item.ejercicio.id_ejercicio} className="card" style={{ overflow: 'hidden' }}>
              {/* Exercise header */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-raised)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-disabled)', fontWeight: '600', minWidth: '18px', fontVariantNumeric: 'tabular-nums' }}>
                  {String(item.ejercicio.orden ?? ejIdx + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, flex: 1, letterSpacing: '-0.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.ejercicio.nombre}
                </p>
                {ultimosPesos[item.ejercicio.id_ejercicio]?.length > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-disabled)', backgroundColor: 'var(--surface-high)', borderRadius: '4px', padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    ↩ {kgADisplay(ultimosPesos[item.ejercicio.id_ejercicio][0].peso_kg, u)} {u}
                  </span>
                )}
                {/* Toggle kg/lb por ejercicio */}
                <button
                  onClick={() => toggleUnidadEj(item.ejercicio.id_ejercicio)}
                  title="Cambiar unidad"
                  style={{ display: 'flex', alignItems: 'center', padding: '2px', backgroundColor: 'var(--surface-high)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', gap: 0 }}
                >
                  {(['kg', 'lb'] as Unidad[]).map(opt => (
                    <span key={opt} style={{
                      padding: '2px 7px', fontSize: '10px', lineHeight: '1.4',
                      color: u === opt ? '#0c0e12' : 'var(--text-disabled)',
                      backgroundColor: u === opt ? 'var(--accent)' : 'transparent',
                      borderRadius: u === opt ? '4px' : '0',
                      fontWeight: u === opt ? '600' : '400',
                      transition: 'all 0.12s',
                    }}>{opt}</span>
                  ))}
                </button>
                <button
                  onClick={() => toggleNotasEj(ejIdx)}
                  style={{ fontSize: '11px', color: notasEj.has(ejIdx) ? 'var(--accent)' : 'var(--text-disabled)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', flexShrink: 0 }}
                >
                  notas
                </button>
                <span className="tag tag-accent" style={{ flexShrink: 0 }}>{item.series.length}s</span>
              </div>

              {/* Series table */}
              <div style={{ padding: '12px 16px' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <span />
                  {[`Peso (${u})`, 'Reps *', 'RIR'].map(h => (
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
                      {/* Numpad-driven inputs — readOnly to suppress native keyboard */}
                      <input readOnly
                        placeholder={antSerie && antSerie.peso_kg > 0 ? String(kgADisplay(antSerie.peso_kg, u)) : (u === 'lb' ? '176' : '80')}
                        value={numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'peso_kg' ? numpadValue : serie.peso_kg}
                        onClick={() => openNumpad(ejIdx, sIdx, 'peso_kg', serie.peso_kg)}
                        style={{ ...inp, caretColor: 'transparent', cursor: 'pointer',
                          outline: numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'peso_kg' ? '2px solid var(--accent)' : inp.outline }} />
                      <input readOnly
                        placeholder={antSerie && antSerie.repeticiones > 0 ? String(antSerie.repeticiones) : '10'}
                        value={numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'repeticiones' ? numpadValue : serie.repeticiones}
                        onClick={() => openNumpad(ejIdx, sIdx, 'repeticiones', serie.repeticiones)}
                        style={{ ...inp, caretColor: 'transparent', cursor: 'pointer',
                          outline: numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'repeticiones' ? '2px solid var(--accent)' : inp.outline }} />
                      <input readOnly
                        placeholder="2" value={numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'rir' ? numpadValue : serie.rir}
                        onClick={() => openNumpad(ejIdx, sIdx, 'rir', serie.rir)}
                        style={{ ...inp, caretColor: 'transparent', cursor: 'pointer',
                          outline: numpadTarget?.ejIdx === ejIdx && numpadTarget?.sIdx === sIdx && numpadTarget?.field === 'rir' ? '2px solid var(--accent)' : inp.outline }} />
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
            )
          })}

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

      {/* ── Custom Numpad ─────────────────────────────────────────────────── */}
      {numpadTarget && (
        <>
          {/* Backdrop */}
          <div
            onClick={numpadConfirm}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 300 }}
          />
          {/* Numpad panel */}
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 301,
            backgroundColor: 'var(--surface-card)',
            borderTop: '1px solid var(--border-default)',
            borderRadius: '20px 20px 0 0',
            padding: '16px 12px 32px',
            animation: 'slide-up-numpad 0.22s cubic-bezier(0.32,0.72,0,1) both',
          }}>
            <style>{`
              @keyframes slide-up-numpad {
                from { transform: translateY(100%); }
                to   { transform: translateY(0); }
              }
            `}</style>

            {/* Handle + label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-default)', margin: '0 auto 0 0' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {numpadTarget.label}
              </span>
              <button onClick={() => setNumpadTarget(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px 6px', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>

            {/* Value display */}
            <div style={{
              backgroundColor: 'var(--surface-input)', border: '1.5px solid var(--accent)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '14px',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {numpadValue || <span style={{ color: 'var(--text-disabled)' }}>0</span>}
              </span>
            </div>

            {/* Keys grid */}
            {(() => {
              const isDecimal = numpadTarget.field === 'peso_kg'
              const rows: string[][] = [
                ['7', '8', '9'],
                ['4', '5', '6'],
                ['1', '2', '3'],
                [isDecimal ? '.' : 'C', '0', '⌫'],
              ]
              const btnStyle = (key: string): React.CSSProperties => ({
                height: '60px',
                borderRadius: '12px',
                border: 'none',
                fontSize: key === '⌫' ? '20px' : '22px',
                fontWeight: key === '⌫' || key === 'C' ? '400' : '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: key === '⌫' ? 'color-mix(in srgb, var(--error) 12%, var(--surface-raised))' :
                                 key === 'C'  ? 'var(--surface-raised)' :
                                               'var(--surface-raised)',
                color: key === '⌫' ? 'var(--error)' : 'var(--text-primary)',
                letterSpacing: '-0.01em',
              })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {rows.map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {row.map(key => (
                        <button key={key} style={btnStyle(key)} onClick={() => numpadPress(key)}>
                          {key}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Confirm button */}
            <button
              onClick={numpadConfirm}
              style={{ width: '100%', height: '56px', backgroundColor: 'var(--accent)', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', color: '#0c0e12', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}
            >
              Listo ✓
            </button>
          </div>
        </>
      )}

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
