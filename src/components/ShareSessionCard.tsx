'use client'
import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
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
function calcVolumen(ejs: EjDet[]) {
  return ejs.reduce((t, ej) => t + ej.series.reduce((s, r) => s + (r.peso_kg ?? 0) * r.repeticiones, 0), 0)
}
function fmtKg(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n).toLocaleString('es-CO')} kg`
}

export default function ShareSessionCard({ fecha, rutina, ejercicios, onClose }: Props) {
  const exportRef   = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const volumen     = calcVolumen(ejercicios)
  const totalSeries = ejercicios.reduce((t, ej) => t + ej.series.length, 0)

  async function handleShare() {
    if (!exportRef.current) return
    setBusy(true)
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `volttrack-${fecha}.png`
      a.click()
      toast.success('Imagen descargada')
    } catch {
      toast.error('No se pudo generar la imagen')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      backgroundColor: 'var(--surface-base)',
      overflowY: 'auto',
      animation: 'share-enter 0.28s cubic-bezier(0.32,0.72,0,1) both',
    }}>
      <style>{`
        @keyframes share-enter {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes share-enter { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>

      {/* Header sticky */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: 'var(--surface-base)',
        borderBottom: '1px solid var(--border-faint)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <button
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', padding: '4px 0' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rutina}</p>
        </div>
        <button
          onClick={handleShare}
          disabled={busy}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '20px',
            backgroundColor: 'var(--accent)', color: '#fff',
            border: 'none', cursor: busy ? 'wait' : 'pointer',
            fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
            opacity: busy ? 0.7 : 1, transition: 'opacity 0.15s', flexShrink: 0,
          }}
        >
          <Download style={{ width: '13px', height: '13px' }} />
          {busy ? 'Generando…' : 'Descargar'}
        </button>
      </div>

      {/* Contenido visible + div que se exporta */}
      <div style={{ padding: '20px 16px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
            {fmtFecha(fecha)}
          </p>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>{rutina}</h3>
        </div>

        {/* Chips de stats */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--surface-raised))', borderRadius: '20px', padding: '5px 12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{fmtKg(volumen)}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>volumen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-raised)', borderRadius: '20px', padding: '5px 12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{totalSeries} series</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--surface-raised)', borderRadius: '20px', padding: '5px 12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{ejercicios.length} ejercicios</span>
          </div>
        </div>

        {/* Lista ejercicios */}
        <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '14px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Ejercicios</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ejercicios.map((ej, i) => {
              const pesoMax   = Math.max(...ej.series.filter(s => s.peso_kg != null).map(s => Number(s.peso_kg)), 0)
              const totalReps = ej.series.reduce((t, s) => t + s.repeticiones, 0)
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: '8px',
                  backgroundColor: 'var(--surface-raised)',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px' }}>{ej.nombre}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{ej.series.length} series · {totalReps} reps</p>
                  </div>
                  {pesoMax > 0 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent)' }}>{pesoMax}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>kg</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Div oculto que se exporta como imagen — usa colores hardcoded para html-to-image */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={exportRef} style={{
          width: '390px',
          backgroundColor: '#e8edf2',
          padding: '28px 24px 24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: '#0f172a',
        }}>
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #2d7fad, #5ab4e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>VoltTrack</span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>volttrack.app</span>
          </div>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#2d7fad', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>{fmtFecha(fecha)}</p>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{rutina}</h2>
          {/* Stats chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { icon: '💪', val: fmtKg(volumen), lbl: 'volumen' },
              { icon: null, val: `${totalSeries}`, lbl: 'series' },
              { icon: null, val: `${ejercicios.length}`, lbl: 'ejercicios' },
            ].map(({ icon, val, lbl }) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: lbl === 'volumen' ? '#bfdbfe' : '#dde3ea', borderRadius: '20px', padding: '5px 12px' }}>
                {icon && <span style={{ fontSize: '12px' }}>{icon}</span>}
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{val}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{lbl}</span>
              </div>
            ))}
          </div>
          {/* Ejercicios */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <p style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Ejercicios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ejercicios.slice(0, 7).map((ej, i) => {
                const pesoMax   = Math.max(...ej.series.filter(s => s.peso_kg != null).map(s => Number(s.peso_kg)), 0)
                const totalReps = ej.series.reduce((t, s) => t + s.repeticiones, 0)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#dde3ea' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', margin: '0 0 1px' }}>{ej.nombre}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{ej.series.length} series · {totalReps} reps</p>
                    </div>
                    {pesoMax > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#2d7fad' }}>{pesoMax}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>kg</span>
                      </div>
                    )}
                  </div>
                )
              })}
              {ejercicios.length > 7 && (
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0', textAlign: 'center' }}>+ {ejercicios.length - 7} ejercicios más</p>
              )}
            </div>
          </div>
          {/* Footer */}
          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Registrado con VoltTrack · 100% gratis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
