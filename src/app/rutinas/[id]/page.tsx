'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react'

interface Ejercicio { id_ejercicio: string; nombre: string; orden: number }
interface Serie {
  id_serie: string; numero_serie: number; peso_kg: number | null
  repeticiones: number; rir: number | null; descanso_seg: number | null; notas: string | null; fecha: string
}

export default function RutinaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [ejercicios, setEjercicios]     = useState<Ejercicio[]>([])
  const [loading, setLoading]           = useState(true)
  const [expandido, setExpandido]       = useState<string | null>(null)
  const [series, setSeries]             = useState<Record<string, Serie[]>>({})
  const [mostrarFormEj, setMostrarFormEj] = useState(false)
  const [nombreEj, setNombreEj]         = useState('')
  const [guardandoEj, setGuardandoEj]   = useState(false)

  // Form nueva serie
  const [ejercicioActivo, setEjercicioActivo] = useState<string | null>(null)
  const [peso, setPeso]           = useState('')
  const [reps, setReps]           = useState('')
  const [rir, setRir]             = useState('')
  const [descanso, setDescanso]   = useState('')
  const [notas, setNotas]         = useState('')
  const [guardandoSerie, setGuardandoSerie] = useState(false)

  const cargarEjercicios = () => {
    setLoading(true)
    fetch(`/api/ejercicios?id_rutina=${id}`)
      .then(r => r.json())
      .then(d => { setEjercicios(d); setLoading(false) })
  }

  const cargarSeries = (id_ejercicio: string) => {
    fetch(`/api/series?id_ejercicio=${id_ejercicio}`)
      .then(r => r.json())
      .then(d => setSeries(p => ({ ...p, [id_ejercicio]: d })))
  }

  useEffect(() => { cargarEjercicios() }, [id])

  const toggleEjercicio = (id_ej: string) => {
    if (expandido === id_ej) { setExpandido(null); setEjercicioActivo(null) }
    else {
      setExpandido(id_ej)
      setEjercicioActivo(null)
      if (!series[id_ej]) cargarSeries(id_ej)
    }
  }

  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardandoEj(true)
    const res  = await fetch('/api/ejercicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rutina: id, nombre: nombreEj, orden: ejercicios.length + 1 }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoEj(false); return }
    toast.success(`"${nombreEj}" agregado`)
    setNombreEj(''); setMostrarFormEj(false); setGuardandoEj(false)
    cargarEjercicios()
  }

  const eliminarEjercicio = async (ej: Ejercicio) => {
    if (!confirm(`¿Eliminar "${ej.nombre}" y todas sus series?`)) return
    const res = await fetch(`/api/ejercicios/${ej.id_ejercicio}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success(`"${ej.nombre}" eliminado`)
    cargarEjercicios()
  }

  const registrarSerie = async (e: React.FormEvent, id_ejercicio: string) => {
    e.preventDefault()
    setGuardandoSerie(true)
    const seriesActuales = series[id_ejercicio] ?? []
    const ultimaSerie   = seriesActuales.filter(s => s.fecha === new Date().toISOString().split('T')[0])
    const res = await fetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_ejercicio,
        numero_serie: ultimaSerie.length + 1,
        peso_kg:      peso      ? Number(peso)     : null,
        repeticiones: Number(reps),
        rir:          rir       ? Number(rir)       : null,
        descanso_seg: descanso  ? Number(descanso)  : null,
        notas:        notas     || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setGuardandoSerie(false); return }
    toast.success('Serie registrada')
    setPeso(''); setReps(''); setRir(''); setDescanso(''); setNotas('')
    setGuardandoSerie(false); setEjercicioActivo(null)
    cargarSeries(id_ejercicio)
  }

  const eliminarSerie = async (id_serie: string, id_ejercicio: string) => {
    const res = await fetch(`/api/series/${id_serie}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Error al eliminar serie'); return }
    toast.success('Serie eliminada')
    cargarSeries(id_ejercicio)
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#09090b', padding: '32px 24px', maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/rutinas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: '4px' }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Ejercicios</h1>
            <p style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>Registra tus series, peso y RIR</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setMostrarFormEj(f => !f)} variant={mostrarFormEj ? 'outline' : 'default'}>
          {mostrarFormEj ? <><X style={{ width: '13px', height: '13px' }} /> Cancelar</> : <><Plus style={{ width: '13px', height: '13px' }} /> Ejercicio</>}
        </Button>
      </div>

      {/* Form nuevo ejercicio */}
      {mostrarFormEj && (
        <form onSubmit={crearEjercicio} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Nombre del ejercicio *</Label>
            <Input value={nombreEj} onChange={e => setNombreEj(e.target.value)} placeholder="ej: Press banca, Sentadilla..." required />
          </div>
          <Button type="submit" disabled={guardandoEj}>{guardandoEj ? 'Guardando...' : 'Agregar'}</Button>
        </form>
      )}

      {/* Lista ejercicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: '64px', borderRadius: '12px' }} />)}

        {!loading && ejercicios.length === 0 && (
          <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px' }}>Sin ejercicios todavía</p>
            <p style={{ color: '#27272a', fontSize: '12px', marginTop: '4px' }}>Agrega tu primer ejercicio con el botón de arriba</p>
          </div>
        )}

        {!loading && ejercicios.map(ej => (
          <div key={ej.id_ejercicio} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>

            {/* Cabecera ejercicio */}
            <div
              onClick={() => toggleEjercicio(ej.id_ejercicio)}
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {expandido === ej.id_ejercicio
                  ? <ChevronDown style={{ width: '15px', height: '15px', color: '#52525b' }} />
                  : <ChevronRight style={{ width: '15px', height: '15px', color: '#52525b' }} />
                }
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{ej.nombre}</p>
                {series[ej.id_ejercicio] && (
                  <span style={{ fontSize: '11px', color: '#52525b' }}>
                    {series[ej.id_ejercicio].length} serie{series[ej.id_ejercicio].length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); eliminarEjercicio(ej) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#3f3f46' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#b84444')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}
              >
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Detalle expandido */}
            {expandido === ej.id_ejercicio && (
              <div style={{ borderTop: '1px solid #1c1c1f', padding: '20px' }}>

                {/* Series registradas */}
                {(series[ej.id_ejercicio] ?? []).length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '10px', color: '#3f3f46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                      Series registradas hoy
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {series[ej.id_ejercicio]
                        .filter(s => s.fecha === new Date().toISOString().split('T')[0])
                        .map(serie => (
                          <div key={serie.id_serie} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0d0d0f', borderRadius: '8px', padding: '10px 14px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: '#3f3f46', fontFamily: 'var(--font-geist-mono)' }}>S{serie.numero_serie}</span>
                              {serie.peso_kg && <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', fontFamily: 'var(--font-geist-mono)' }}>{serie.peso_kg}kg</span>}
                              <span style={{ fontSize: '13px', color: '#71717a', fontFamily: 'var(--font-geist-mono)' }}>{serie.repeticiones} reps</span>
                              {serie.rir !== null && <span style={{ fontSize: '11px', color: '#22c55e', backgroundColor: '#14532d22', padding: '2px 6px', borderRadius: '4px' }}>RIR {serie.rir}</span>}
                              {serie.descanso_seg && <span style={{ fontSize: '11px', color: '#52525b' }}>{serie.descanso_seg}s descanso</span>}
                            </div>
                            <button
                              onClick={() => eliminarSerie(serie.id_serie, ej.id_ejercicio)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3f3f46' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#b84444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}
                            >
                              <Trash2 style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Botón / Form nueva serie */}
                {ejercicioActivo !== ej.id_ejercicio ? (
                  <Button size="sm" variant="outline" onClick={() => setEjercicioActivo(ej.id_ejercicio)} style={{ width: '100%' }}>
                    <Plus style={{ width: '13px', height: '13px' }} /> Registrar serie
                  </Button>
                ) : (
                  <form onSubmit={e => registrarSerie(e, ej.id_ejercicio)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#52525b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Nueva serie</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Label style={{ fontSize: '11px' }}>Peso (kg)</Label>
                        <Input type="number" step="0.5" min="0" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ej: 80" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Label style={{ fontSize: '11px' }}>Repeticiones *</Label>
                        <Input type="number" min="1" value={reps} onChange={e => setReps(e.target.value)} placeholder="ej: 10" required />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Label style={{ fontSize: '11px' }}>RIR (0–5)</Label>
                        <Input type="number" min="0" max="5" value={rir} onChange={e => setRir(e.target.value)} placeholder="ej: 2" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Label style={{ fontSize: '11px' }}>Descanso (seg)</Label>
                        <Input type="number" min="0" value={descanso} onChange={e => setDescanso(e.target.value)} placeholder="ej: 90" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <Label style={{ fontSize: '11px' }}>Notas</Label>
                      <Input value={notas} onChange={e => setNotas(e.target.value)} placeholder="ej: Buen control excéntrico..." />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEjercicioActivo(null)}>Cancelar</Button>
                      <Button type="submit" size="sm" disabled={guardandoSerie}>{guardandoSerie ? 'Guardando...' : 'Guardar serie'}</Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
