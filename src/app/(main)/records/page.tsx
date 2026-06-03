'use client'
import { useEffect, useState } from 'react'
import { Trophy, ChevronDown, ChevronRight, Dumbbell } from 'lucide-react'

interface PR { peso_max: number; repeticiones: number; fecha: string }
interface Ejercicio { id_ejercicio: string; nombre: string; pr: PR | null }
interface Rutina { id_rutina: string; nombre: string; dia_semana: string | null; ejercicios: Ejercicio[] }

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function RecordsPage() {
  const [rutinas, setRutinas]   = useState<Rutina[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/records').then(r => r.json()).then(d => {
      const lista: Rutina[] = Array.isArray(d) ? d : []
      setRutinas(lista)
      setExpanded(new Set())
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

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
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
            <span className="num" style={{ fontSize: '24px', fontWeight: '500', color: 'var(--accent)', letterSpacing: '-0.03em' }}>{totalPRs}</span>
            <span className="label">de {totalEj} ejerc.</span>
          </div>
        )}
      </div>

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

      <div className="stagger-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!loading && rutinas.map(rutina => {
          const prCount = rutina.ejercicios.filter(e => e.pr).length
          const isOpen  = expanded.has(rutina.id_rutina)
          return (
            <div key={rutina.id_rutina} className="card" style={{ overflow: 'hidden' }}>
              {/* Rutina header */}
              <button
                onClick={() => toggle(rutina.id_rutina)}
                style={{
                  width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'background-color var(--t-sm) var(--ease-out)',
                }}
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
                  <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>
                    {prCount}/{rutina.ejercicios.length}
                  </span>
                </div>
              </button>

              {/* Exercise rows */}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <Trophy style={{ width: '11px', height: '11px', color: '#d4a07a', flexShrink: 0, marginBottom: '-1px' }} />
                              <span className="num" style={{ fontSize: '17px', fontWeight: '500', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{ej.pr.peso_max}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>kg</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '2px' }}>× {ej.pr.repeticiones}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-disabled)', minWidth: '60px', textAlign: 'right' }}>
                              {fmtFecha(ej.pr.fecha)}
                            </span>
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
    </div>
  )
}
