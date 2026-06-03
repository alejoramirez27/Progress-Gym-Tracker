'use client'
import { useEffect, useState } from 'react'
import { Trophy, ChevronDown, ChevronRight, Dumbbell, Share2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface PR { peso_max: number; repeticiones: number; fecha: string }
interface Ejercicio { id_ejercicio: string; nombre: string; pr: PR | null }
interface Rutina { id_rutina: string; nombre: string; dia_semana: string | null; ejercicios: Ejercicio[] }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function calc1RM(peso: number, reps: number): number {
  if (reps === 1) return peso
  return Math.round(peso * (1 + reps / 30))
}

function compartirPR(nombre: string, pr: PR) {
  const texto = `🏆 Nuevo PR en ${nombre}\n⚖️ ${pr.peso_max} kg × ${pr.repeticiones} reps\n💪 1RM estimado: ${calc1RM(pr.peso_max, pr.repeticiones)} kg\n📅 ${fmtFecha(pr.fecha)}\n\n#VoltTrack #GymProgress`
  if (navigator.share) {
    navigator.share({ text: texto }).catch(() => {})
  } else {
    navigator.clipboard.writeText(texto)
    toast.success('PR copiado al portapapeles')
  }
}

export default function RecordsPage() {
  const [rutinas, setRutinas]   = useState<Rutina[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [busqueda, setBusqueda] = useState('')
  const [vistaPlana, setVistaPlana] = useState(false)

  useEffect(() => {
    fetch('/api/records').then(r => r.json()).then(d => {
      setRutinas(Array.isArray(d) ? d : [])
      setLoading(false)
    })
  }, [])

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }

  const totalPRs = rutinas.reduce((acc, r) => acc + r.ejercicios.filter(e => e.pr).length, 0)
  const totalEj  = rutinas.reduce((acc, r) => acc + r.ejercicios.length, 0)

  // Vista plana de todos los ejercicios con PR filtrados por búsqueda
  const todosConPR = rutinas.flatMap(r =>
    r.ejercicios
      .filter(e => e.pr)
      .map(e => ({ ...e, rutina: r.nombre }))
  ).filter(e => busqueda === '' || e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.rutina.toLowerCase().includes(busqueda.toLowerCase()))
  .sort((a, b) => calc1RM(b.pr!.peso_max, b.pr!.repeticiones) - calc1RM(a.pr!.peso_max, a.pr!.repeticiones))

  const rutinasFiltradas = rutinas.map(r => ({
    ...r,
    ejercicios: r.ejercicios.filter(e =>
      busqueda === '' ||
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  })).filter(r => r.ejercicios.length > 0)

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            Récords Personales
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Peso máximo histórico por ejercicio
          </p>
        </div>
        {!loading && totalPRs > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span className="num" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent)', letterSpacing: '-0.03em' }}>{totalPRs}</span>
            <span className="label">de {totalEj} ejerc.</span>
          </div>
        )}
      </div>

      {/* Buscador + toggle vista */}
      {!loading && rutinas.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              type="text" placeholder="Buscar ejercicio..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 32px 8px 32px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', display: 'flex' }}>
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>
          <button onClick={() => setVistaPlana(v => !v)}
            style={{ padding: '8px 12px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 'var(--r-md)', border: 'none', backgroundColor: vistaPlana ? 'var(--accent)' : 'var(--surface-raised)', color: vistaPlana ? '#0c0e12' : 'var(--text-secondary)', fontWeight: vistaPlana ? '500' : '400', whiteSpace: 'nowrap' }}>
            Top 1RM
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[120, 80, 100].map((h, i) => <div key={i} className="skeleton" style={{ height: `${h}px` }} />)}
        </div>
      )}

      {!loading && rutinas.length === 0 && (
        <div className="card empty-state">
          <Trophy style={{ width: '26px', height: '26px' }} />
          <p>Sin récords todavía</p>
          <p className="empty-hint">Registra sesiones con peso en Progreso para ver tus PRs</p>
        </div>
      )}

      {/* Vista plana: ranking por 1RM */}
      {!loading && vistaPlana && (
        <div className="card" style={{ overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-faint)', backgroundColor: 'var(--surface-raised)' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ranking por 1RM estimado</p>
          </div>
          {todosConPR.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-disabled)', margin: 0 }}>Sin resultados</p>
            </div>
          )}
          {todosConPR.map((ej, idx) => (
            <div key={ej.id_ejercicio}>
              {idx > 0 && <hr className="divider" />}
              <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', color: idx < 3 ? '#d4a07a' : 'var(--text-disabled)', fontWeight: '600', minWidth: '20px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>{ej.rutina}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p className="num" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)', margin: 0, letterSpacing: '-0.03em' }}>{calc1RM(ej.pr!.peso_max, ej.pr!.repeticiones)}<span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '300' }}> kg</span></p>
                    <p style={{ fontSize: '10px', color: 'var(--text-disabled)', margin: 0 }}>1RM est.</p>
                  </div>
                  <button onClick={() => compartirPR(ej.nombre, ej.pr!)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '5px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                  >
                    <Share2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista por rutina */}
      {!loading && !vistaPlana && (
        <div className="stagger-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rutinasFiltradas.map(rutina => {
            const prCount = rutina.ejercicios.filter(e => e.pr).length
            const isOpen  = expanded.has(rutina.id_rutina)
            return (
              <div key={rutina.id_rutina} className="card" style={{ overflow: 'hidden' }}>
                <button
                  onClick={() => toggle(rutina.id_rutina)}
                  style={{ width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color var(--t-sm) var(--ease-out)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isOpen
                      ? <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent)' }} />
                      : <ChevronRight style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />}
                    <div style={{ backgroundColor: 'var(--surface-high)', borderRadius: 'var(--r-sm)', padding: '6px', display: 'flex' }}>
                      <Dumbbell style={{ width: '13px', height: '13px', color: 'var(--accent)' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{rutina.nombre}</span>
                      {rutina.dia_semana && (
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{rutina.dia_semana}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {prCount > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy style={{ width: '11px', height: '11px', color: '#d4a07a' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{prCount}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{prCount}/{rutina.ejercicios.length}</span>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border-faint)' }}>
                    {rutina.ejercicios.map((ej, idx) => (
                      <div key={ej.id_ejercicio}>
                        {idx > 0 && <hr className="divider" />}
                        <div style={{ padding: '11px 16px 11px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '13px', color: ej.pr ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ej.nombre}
                          </span>
                          {ej.pr ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                  <Trophy style={{ width: '11px', height: '11px', color: '#d4a07a', flexShrink: 0, marginBottom: '-1px' }} />
                                  <span className="num" style={{ fontSize: '17px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{ej.pr.peso_max}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>kg × {ej.pr.repeticiones}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '500' }}>
                                    1RM ~{calc1RM(ej.pr.peso_max, ej.pr.repeticiones)} kg
                                  </span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{fmtFecha(ej.pr.fecha)}</span>
                                </div>
                              </div>
                              <button onClick={e => { e.stopPropagation(); compartirPR(ej.nombre, ej.pr!) }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: '5px', borderRadius: 'var(--r-xs)', transition: 'color var(--t-sm) var(--ease-out)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                              >
                                <Share2 style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>Sin datos</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
