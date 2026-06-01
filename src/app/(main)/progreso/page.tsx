'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, CheckCircle2, Dumbbell, Target, AlertTriangle } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Rutina    { id_rutina: string; nombre: string }
interface Ejercicio { id_ejercicio: string; nombre: string; num_series: number; orden: number }
interface SerieInput { peso_kg: string; repeticiones: string; rir: string }
interface EjConSeries { ejercicio: Ejercicio; series: SerieInput[] }

function hoy() {
  return new Date().toISOString().split('T')[0]
}
function fmtFechaLarga(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function serieVacia(): SerieInput {
  return { peso_kg: '', repeticiones: '', rir: '' }
}

export default function ProgresoPage() {
  const router   = useRouter()
  const isMobile = useIsMobile()

  const [rutinas, setRutinas]   = useState<Rutina[]>([])
  const [rutinaId, setRutinaId] = useState('')
  const [fecha, setFecha]       = useState(hoy())
  const [notas, setNotas]       = useState('')
  const [ejConSeries, setEjConSeries] = useState<EjConSeries[]>([])
  const [loadingEj, setLoadingEj]     = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [guardado, setGuardado]       = useState(false)

  // Detectar si hay datos sin guardar
  const tieneCambios = ejConSeries.some(ej =>
    ej.series.some(s => s.peso_kg.trim() !== '' || s.repeticiones.trim() !== '')
  )

  // Advertir al cerrar/recargar si hay datos sin guardar
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (tieneCambios && !guardado) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [tieneCambios, guardado])

  // Cargar rutinas del usuario
  useEffect(() => {
    fetch('/api/rutinas').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) {
        setRutinas(d)
        setRutinaId(d[0].id_rutina)
      }
    })
  }, [])

  // Cuando cambia la rutina seleccionada, cargar sus ejercicios
  useEffect(() => {
    if (!rutinaId) return
    setLoadingEj(true)
    setGuardado(false)
    fetch(`/api/ejercicios?id_rutina=${rutinaId}`)
      .then(r => r.json())
      .then((data: Ejercicio[]) => {
        const lista = Array.isArray(data) ? data : []
        setEjConSeries(lista.map(ej => ({
          ejercicio: ej,
          series: Array.from({ length: Math.max(ej.num_series ?? 1, 1) }, serieVacia),
        })))
        setLoadingEj(false)
      })
  }, [rutinaId])

  const updateSerie = (ejIdx: number, sIdx: number, campo: keyof SerieInput, val: string) => {
    setEjConSeries(prev => {
      const next = [...prev]
      next[ejIdx] = {
        ...next[ejIdx],
        series: next[ejIdx].series.map((s, i) => i === sIdx ? { ...s, [campo]: val } : s),
      }
      return next
    })
  }

  const guardarSesion = async () => {
    // Validar que al menos un ejercicio tenga al menos una serie con reps
    const hayDatos = ejConSeries.some(ej => ej.series.some(s => s.repeticiones.trim() !== ''))
    if (!hayDatos) {
      toast.error('Registra al menos una serie con repeticiones')
      return
    }

    setGuardando(true)
    const res = await fetch('/api/sesiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_rutina: rutinaId,
        fecha,
        notas: notas.trim() || null,
        ejercicios_data: ejConSeries.map(ej => ({
          id_ejercicio: ej.ejercicio.id_ejercicio,
          series: ej.series,
        })),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al guardar')
      setGuardando(false)
      return
    }
    setGuardado(true)
    setGuardando(false)
    toast.success('¡Sesión registrada!')
  }

  const inputSerie = {
    backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8',
    borderRadius: '6px', padding: '7px 8px', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', textAlign: 'center' as const, width: '100%', boxSizing: 'border-box' as const,
  }

  if (guardado) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
        <CheckCircle2 style={{ width: '52px', height: '52px', color: '#7ad4a0' }} />
        <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#e2e2e8', margin: 0 }}>Sesión guardada</h2>
        <p style={{ fontSize: '14px', color: '#8d9197', margin: 0, fontWeight: '300' }}>
          {rutinas.find(r => r.id_rutina === rutinaId)?.nombre} · {fmtFechaLarga(fecha)}
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={() => { setGuardado(false); setEjConSeries(prev => prev.map(ej => ({ ...ej, series: Array.from({ length: ej.ejercicio.num_series }, serieVacia) }))) }}
            style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', color: '#c3c7cd', cursor: 'pointer', fontFamily: 'inherit' }}>
            Nueva sesión
          </button>
          <button
            onClick={() => router.push('/historial')}
            style={{ backgroundColor: '#b1c9e1', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '500', color: '#0c0e12', cursor: 'pointer', fontFamily: 'inherit' }}>
            Ver historial
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>
          Registrar Sesión
        </h1>
        <p style={{ fontSize: '14px', color: '#8d9197', marginTop: '6px', fontWeight: '300' }}>
          Llena los pesos y reps de hoy
        </p>
      </div>

      {/* Selector de rutina + fecha */}
      <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          {/* Rutina */}
          <div>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Rutina
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={rutinaId}
                onChange={e => setRutinaId(e.target.value)}
                style={{ width: '100%', backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px', padding: '9px 32px 9px 12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none', outline: 'none' }}
              >
                {rutinas.map(r => <option key={r.id_rutina} value={r.id_rutina}>{r.nombre}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#8d9197', pointerEvents: 'none' }} />
            </div>
          </div>
          {/* Fecha */}
          <div>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Fecha
            </label>
            <input
              type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              style={{ width: '100%', backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Ejercicios */}
      {loadingEj ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '120px', backgroundColor: '#1e2024', borderRadius: '12px', border: '1px solid #43474c' }} />
          ))}
        </div>
      ) : ejConSeries.length === 0 ? (
        <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '56px', textAlign: 'center' }}>
          <Dumbbell style={{ width: '28px', height: '28px', color: '#43474c', margin: '0 auto 12px' }} />
          <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Esta rutina no tiene ejercicios</p>
          <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>
            Agrégalos en la sección <strong style={{ color: '#8d9197' }}>Rutinas</strong>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ejConSeries.map((item, ejIdx) => (
            <div key={item.ejercicio.id_ejercicio}
              style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', overflow: 'hidden' }}>

              {/* Cabecera ejercicio */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #282a2e', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '600', minWidth: '20px' }}>
                  {String(item.ejercicio.orden ?? ejIdx + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', margin: 0, flex: 1 }}>
                  {item.ejercicio.nombre}
                </p>
                <span style={{ fontSize: '11px', color: '#7ab8d4', backgroundColor: '#1a2f3a', padding: '2px 8px', borderRadius: '20px' }}>
                  {item.series.length} series
                </span>
              </div>

              {/* Tabla de series */}
              <div style={{ padding: '14px 20px' }}>
                {/* Header columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <span />
                  {['Peso (kg)', 'Reps *', 'RIR'].map(h => (
                    <span key={h} style={{ fontSize: '10px', color: '#43474c', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{h}</span>
                  ))}
                </div>
                {/* Filas de series */}
                {item.series.map((serie, sIdx) => (
                  <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#8d9197', fontWeight: '600', textAlign: 'center' }}>S{sIdx + 1}</span>
                    <input
                      type="number" step="0.5" min="0" placeholder="80"
                      value={serie.peso_kg}
                      onChange={e => updateSerie(ejIdx, sIdx, 'peso_kg', e.target.value)}
                      style={inputSerie}
                      onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                      onBlur={e => e.target.style.borderColor = '#43474c'}
                    />
                    <input
                      type="number" step="1" min="1" placeholder="10" required
                      value={serie.repeticiones}
                      onChange={e => updateSerie(ejIdx, sIdx, 'repeticiones', e.target.value)}
                      style={inputSerie}
                      onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                      onBlur={e => e.target.style.borderColor = '#43474c'}
                    />
                    <input
                      type="number" step="1" min="0" max="5" placeholder="2"
                      value={serie.rir}
                      onChange={e => updateSerie(ejIdx, sIdx, 'rir', e.target.value)}
                      style={inputSerie}
                      onFocus={e => e.target.style.borderColor = '#b1c9e1'}
                      onBlur={e => e.target.style.borderColor = '#43474c'}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Notas de sesión */}
          <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '16px 20px' }}>
            <label style={{ fontSize: '11px', color: '#8d9197', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Notas de la sesión (opcional)
            </label>
            <textarea
              value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="ej: Buena sesión, subí peso en press banca..."
              rows={2}
              style={{ width: '100%', backgroundColor: '#282a2e', border: '1px solid #43474c', color: '#e2e2e8', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#b1c9e1'}
              onBlur={e => e.target.style.borderColor = '#43474c'}
            />
          </div>

          {/* Banner: cambios sin guardar */}
          {tieneCambios && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e2a14', border: '1px solid #3a5a1a', borderRadius: '8px', padding: '10px 14px' }}>
              <AlertTriangle style={{ width: '14px', height: '14px', color: '#a3c96a', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#a3c96a', margin: 0, fontWeight: '300' }}>
                Tienes series sin guardar — guarda la sesión antes de salir
              </p>
            </div>
          )}

          {/* Botón guardar */}
          <button
            onClick={guardarSesion}
            disabled={guardando}
            style={{
              width: '100%', backgroundColor: guardando ? '#282a2e' : '#b1c9e1',
              color: guardando ? '#8d9197' : '#0c0e12', border: 'none', borderRadius: '10px',
              padding: '14px', fontSize: '14px', fontWeight: '500', cursor: guardando ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <Target style={{ width: '16px', height: '16px' }} />
            {guardando ? 'Guardando sesión...' : 'Guardar sesión'}
          </button>
        </div>
      )}
    </div>
  )
}
