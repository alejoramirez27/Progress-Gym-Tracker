'use client'
import { useRef, useState } from 'react'
import { Share2, Download, X } from 'lucide-react'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'

interface Serie  { numero_serie: number; peso_kg: number | null; repeticiones: number; rir: number | null }
interface EjDet  { nombre: string; series: Serie[] }
interface Props  {
  fecha: string
  rutina: string
  ejercicios: EjDet[]
  onClose: () => void
}

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function calcVolumen(ejercicios: EjDet[]) {
  return ejercicios.reduce((total, ej) =>
    total + ej.series.reduce((t, s) => t + (s.peso_kg ?? 0) * s.repeticiones, 0), 0)
}

function fmtKg(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n).toLocaleString('es-CO')} kg`
}

export default function ShareSessionCard({ fecha, rutina, ejercicios, onClose }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const volumen    = calcVolumen(ejercicios)
  const totalSeries = ejercicios.reduce((t, ej) => t + ej.series.length, 0)

  async function handleShare() {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const blob    = await (await fetch(dataUrl)).blob()
      const file    = new File([blob], 'volttrack-sesion.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Mi sesión en VoltTrack' })
      } else {
        // Fallback: download
        const a = document.createElement('a')
        a.href  = dataUrl
        a.download = `volttrack-${fecha}.png`
        a.click()
        toast.success('Imagen guardada')
      }
    } catch {
      toast.error('No se pudo generar la imagen')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}
    onClick={onClose}
    >
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Card a exportar */}
        <div ref={cardRef} style={{
          backgroundColor: '#0d1117',
          borderRadius: '20px',
          padding: '28px 24px 24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: '#f0f6fc',
          overflow: 'hidden',
        }}>
          {/* Header branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #2d7fad, #5ab4e8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '800', color: '#fff',
              }}>⚡</div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#f0f6fc', letterSpacing: '-0.02em' }}>VoltTrack</span>
            </div>
            <span style={{ fontSize: '11px', color: '#8b949e', fontWeight: '500' }}>volttrack.app</span>
          </div>

          {/* Fecha + rutina */}
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#2d7fad', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
            {fmtFecha(fecha)}
          </p>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f0f6fc', margin: '0 0 20px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {rutina}
          </h2>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Volumen', value: fmtKg(volumen) },
              { label: 'Series', value: String(totalSeries) },
              { label: 'Ejercicios', value: String(ejercicios.length) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, backgroundColor: '#161b22', borderRadius: '10px', padding: '10px 12px',
              }}>
                <p style={{ fontSize: '17px', fontWeight: '700', color: '#f0f6fc', margin: '0 0 2px', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
                <p style={{ fontSize: '10px', color: '#8b949e', margin: 0, fontWeight: '500' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Ejercicios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ejercicios.slice(0, 6).map((ej, i) => {
              const pesoMax = Math.max(...ej.series.filter(s => s.peso_kg != null).map(s => Number(s.peso_kg)), 0)
              const totalReps = ej.series.reduce((t, s) => t + s.repeticiones, 0)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: i < ejercicios.slice(0, 6).length - 1 ? '10px' : 0,
                  borderBottom: i < ejercicios.slice(0, 6).length - 1 ? '1px solid #21262d' : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#f0f6fc', margin: '0 0 2px' }}>{ej.nombre}</p>
                    <p style={{ fontSize: '11px', color: '#8b949e', margin: 0 }}>{ej.series.length} series · {totalReps} reps</p>
                  </div>
                  {pesoMax > 0 && (
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#5ab4e8', fontVariantNumeric: 'tabular-nums' }}>
                      {pesoMax} <span style={{ fontSize: '10px', fontWeight: '400', color: '#8b949e' }}>kg</span>
                    </span>
                  )}
                </div>
              )
            })}
            {ejercicios.length > 6 && (
              <p style={{ fontSize: '11px', color: '#8b949e', margin: 0, textAlign: 'center' }}>
                + {ejercicios.length - 6} ejercicios más
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #21262d', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#8b949e', margin: 0 }}>Registrado con VoltTrack · 100% gratis</p>
          </div>
        </div>

        {/* Botones acción */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleShare}
            disabled={busy}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '13px', borderRadius: '12px',
              backgroundColor: '#2d7fad', color: '#fff',
              border: 'none', cursor: busy ? 'wait' : 'pointer',
              fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
              opacity: busy ? 0.7 : 1, transition: 'opacity 0.15s',
            }}
          >
            {busy ? 'Generando…' : <><Share2 style={{ width: '15px', height: '15px' }} /> Compartir</>}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '13px 16px', borderRadius: '12px',
              backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
