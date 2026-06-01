'use client'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Dumbbell, ChevronDown, ChevronRight } from 'lucide-react'

interface PR {
  peso_max:     number
  repeticiones: number
  fecha:        string
}
interface Ejercicio {
  id_ejercicio: string
  nombre:       string
  pr:           PR | null
}
interface Rutina {
  id_rutina:  string
  nombre:     string
  dia_semana: string | null
  ejercicios: Ejercicio[]
}

function fmtFecha(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function RecordsPage() {
  const [rutinas, setRutinas]   = useState<Rutina[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/records')
      .then(r => r.json())
      .then(d => {
        const lista: Rutina[] = Array.isArray(d) ? d : []
        setRutinas(lista)
        // Expandir todas por defecto
        setExpanded(new Set(lista.map(r => r.id_rutina)))
        setLoading(false)
      })
  }, [])

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalPRs = rutinas.reduce((acc, r) => acc + r.ejercicios.filter(e => e.pr).length, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.01em', margin: 0 }}>
            Récords Personales
          </h1>
          {!loading && totalPRs > 0 && (
            <span style={{ backgroundColor: '#1a2f3a', color: '#7ab8d4', fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
              {totalPRs} PR{totalPRs !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p style={{ fontSize: '14px', color: '#8d9197', margin: 0, fontWeight: '300' }}>
          Peso máximo histórico por ejercicio
        </p>
      </div>

      {/* Skeletons */}
      {loading && Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} style={{ height: '160px', borderRadius: '12px', backgroundColor: '#1e2024', marginBottom: '12px' }} />
      ))}

      {/* Sin datos */}
      {!loading && rutinas.length === 0 && (
        <div style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', padding: '64px', textAlign: 'center' }}>
          <Trophy style={{ width: '32px', height: '32px', color: '#43474c', margin: '0 auto 16px' }} />
          <p style={{ color: '#8d9197', fontSize: '14px', margin: 0 }}>Sin récords todavía</p>
          <p style={{ color: '#43474c', fontSize: '13px', marginTop: '6px', fontWeight: '300' }}>
            Registra sesiones con peso en <strong style={{ color: '#8d9197' }}>Progreso</strong> para ver tus PRs
          </p>
        </div>
      )}

      {/* Lista de rutinas con sus ejercicios */}
      {!loading && rutinas.map(rutina => (
        <div key={rutina.id_rutina}
          style={{ backgroundColor: '#1e2024', border: '1px solid #43474c', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>

          {/* Cabecera rutina (clickable) */}
          <div
            onClick={() => toggle(rutina.id_rutina)}
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#282a2e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {expanded.has(rutina.id_rutina)
                ? <ChevronDown style={{ width: '15px', height: '15px', color: '#b1c9e1', flexShrink: 0 }} />
                : <ChevronRight style={{ width: '15px', height: '15px', color: '#8d9197', flexShrink: 0 }} />
              }
              <div style={{ backgroundColor: '#282a2e', borderRadius: '8px', padding: '7px', display: 'flex' }}>
                <Dumbbell style={{ width: '14px', height: '14px', color: '#b1c9e1' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#e2e2e8', margin: 0 }}>{rutina.nombre}</p>
                {rutina.dia_semana && (
                  <p style={{ fontSize: '11px', color: '#8d9197', margin: '2px 0 0', fontWeight: '300' }}>{rutina.dia_semana}</p>
                )}
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#43474c', fontWeight: '300' }}>
              {rutina.ejercicios.filter(e => e.pr).length}/{rutina.ejercicios.length} con PR
            </span>
          </div>

          {/* Ejercicios */}
          {expanded.has(rutina.id_rutina) && (
            <div style={{ borderTop: '1px solid #282a2e' }}>
              {rutina.ejercicios.map((ejercicio, idx) => (
                <div key={ejercicio.id_ejercicio}
                  style={{
                    padding: '14px 20px 14px 52px',
                    borderBottom: idx < rutina.ejercicios.length - 1 ? '1px solid #282a2e' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                  }}>

                  {/* Nombre ejercicio */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#c3c7cd', margin: 0, fontWeight: '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ejercicio.nombre}
                    </p>
                  </div>

                  {/* PR o sin datos */}
                  {ejercicio.pr ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      {/* Trofeo + peso */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy style={{ width: '13px', height: '13px', color: '#d4a07a' }} />
                        <span style={{ fontSize: '18px', fontWeight: '500', color: '#e2e2e8', letterSpacing: '-0.02em' }}>
                          {ejercicio.pr.peso_max}
                        </span>
                        <span style={{ fontSize: '12px', color: '#8d9197', fontWeight: '300' }}>kg</span>
                        <span style={{ fontSize: '12px', color: '#43474c', marginLeft: '2px' }}>
                          × {ejercicio.pr.repeticiones} reps
                        </span>
                      </div>
                      {/* Fecha */}
                      <span style={{ fontSize: '11px', color: '#43474c', fontWeight: '300' }}>
                        {fmtFecha(ejercicio.pr.fecha)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#43474c', fontWeight: '300', flexShrink: 0 }}>
                      Sin datos
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
