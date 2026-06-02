'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, BicepsFlexed, Plus, Minus } from 'lucide-react'

interface SerieInput { peso_kg: string; repeticiones: string; rir: string; notas: string }
interface EjSeries { id_ejercicio: string; nombre: string; series: SerieInput[] }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

const inp: React.CSSProperties = {
  backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)', borderRadius: 'var(--r-sm)',
  padding: '7px 6px', fontSize: '13px', fontFamily: 'inherit',
  outline: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box',
}

export default function EditarSesionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [fecha, setFecha]       = useState('')
  const [rutina, setRutina]     = useState('')
  const [notas, setNotas]       = useState('')
  const [ejercicios, setEj]     = useState<EjSeries[]>([])
  const [loading, setLoading]   = useState(true)
  const [guardando, setGuard]   = useState(false)

  useEffect(() => {
    fetch(`/api/sesiones/${id}`).then(r => r.json()).then(d => {
      if (d.error) { toast.error('Sesión no encontrada'); router.push('/historial'); return }
      setFecha(d.sesion.fecha)
      setRutina((d.sesion.rutina as { nombre: string } | null)?.nombre ?? '—')
      setNotas(d.sesion.notas ?? '')
      setEj(d.ejercicios.map((ej: { nombre: string; series: { id_serie: string; id_ejercicio: string; numero_serie: number; peso_kg: number | null; repeticiones: number; rir: number | null; notas: string | null }[] }) => ({
        id_ejercicio: ej.series[0]?.id_ejercicio ?? '',
        nombre: ej.nombre,
        series: ej.series.map(s => ({
          peso_kg:      s.peso_kg != null ? String(s.peso_kg) : '',
          repeticiones: String(s.repeticiones),
          rir:          s.rir != null ? String(s.rir) : '',
          notas:        s.notas ?? '',
        })),
      })))
      setLoading(false)
    })
  }, [id, router])

  const updateSerie = (ejIdx: number, sIdx: number, campo: keyof SerieInput, val: string) => {
    setEj(prev => prev.map((ej, i) => i !== ejIdx ? ej : {
      ...ej,
      series: ej.series.map((s, j) => j !== sIdx ? s : { ...s, [campo]: val }),
    }))
  }

  const addSerie = (ejIdx: number) => {
    setEj(prev => prev.map((ej, i) => i !== ejIdx ? ej : {
      ...ej,
      series: [...ej.series, { peso_kg: '', repeticiones: '', rir: '', notas: '' }],
    }))
  }

  const removeSerie = (ejIdx: number) => {
    setEj(prev => prev.map((ej, i) => i !== ejIdx ? ej : {
      ...ej,
      series: ej.series.length > 1 ? ej.series.slice(0, -1) : ej.series,
    }))
  }

  const guardar = async () => {
    setGuard(true)
    const res = await fetch(`/api/sesiones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notas: notas.trim() || null,
        ejercicios_data: ejercicios.map(ej => ({ id_ejercicio: ej.id_ejercicio, series: ej.series })),
      }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); setGuard(false); return }
    toast.success('Sesión actualizada')
    router.push('/historial')
  }

  if (loading) return (
    <div className="page-enter">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[60, 100, 80].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
      </div>
    </div>
  )

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => router.push('/historial')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: 'var(--r-sm)', display: 'flex', transition: 'color var(--t-sm) var(--ease-out)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <ArrowLeft style={{ width: '15px', height: '15px' }} />
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Historial</span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Editar sesión</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          {rutina} · {fmtFecha(fecha)}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ejercicios.map((ej, ejIdx) => (
          <div key={ej.id_ejercicio || ejIdx} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-faint)', backgroundColor: 'var(--surface-raised)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{ej.nombre}</p>
              <span className="tag tag-accent">{ej.series.length} series</span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <span />
                {['Peso (kg)', 'Reps', 'RIR'].map(h => <span key={h} className="label" style={{ textAlign: 'center' }}>{h}</span>)}
              </div>
              {ej.series.map((s, sIdx) => (
                <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr', gap: '6px', marginBottom: '5px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>S{sIdx + 1}</span>
                  <input type="number" step="0.5" min="0" placeholder="80" value={s.peso_kg} onChange={e => updateSerie(ejIdx, sIdx, 'peso_kg', e.target.value)} style={inp} />
                  <input type="number" step="1" min="1" placeholder="10" value={s.repeticiones} onChange={e => updateSerie(ejIdx, sIdx, 'repeticiones', e.target.value)} style={inp} />
                  <input type="number" step="1" min="0" max="5" placeholder="2" value={s.rir} onChange={e => updateSerie(ejIdx, sIdx, 'rir', e.target.value)} style={inp} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button onClick={() => addSerie(ejIdx)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '11px', backgroundColor: 'color-mix(in srgb, var(--accent) 8%, var(--surface-raised))', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                  <Plus style={{ width: '10px', height: '10px' }} /> Serie
                </button>
                {ej.series.length > 1 && (
                  <button onClick={() => removeSerie(ejIdx)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', fontSize: '11px', backgroundColor: 'transparent', color: 'var(--text-disabled)', border: '1px solid var(--border-faint)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Minus style={{ width: '10px', height: '10px' }} /> Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="card" style={{ padding: '14px 16px' }}>
          <label className="label" style={{ display: 'block', marginBottom: '7px' }}>Notas de la sesión</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
            placeholder="Opcional..."
            style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <button onClick={guardar} disabled={guardando}
          style={{ width: '100%', backgroundColor: guardando ? 'var(--surface-high)' : 'var(--accent)', color: guardando ? 'var(--text-secondary)' : '#0c0e12', border: 'none', borderRadius: 'var(--r-lg)', padding: '13px', fontSize: '14px', fontWeight: '500', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <BicepsFlexed style={{ width: '15px', height: '15px' }} />
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
