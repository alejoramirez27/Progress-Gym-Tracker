import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_ejercicio = searchParams.get('id_ejercicio')

  const ORDEN_DIA: Record<string, number> = {
    'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
    'Viernes': 5, 'Sábado': 6, 'Domingo': 7,
  }

  const { data: rutinasRaw } = await supabase
    .from('rutina')
    .select('id_rutina, nombre, dia_semana, orden')
    .eq('id_usuario', session.id)
    .order('orden', { ascending: true, nullsFirst: false })

  const rutinas = (rutinasRaw ?? []).sort((a, b) => {
    const diaA = a.dia_semana ? (ORDEN_DIA[a.dia_semana] ?? 8) : 9
    const diaB = b.dia_semana ? (ORDEN_DIA[b.dia_semana] ?? 8) : 9
    if (diaA !== diaB) return diaA - diaB
    return (a.orden ?? 99) - (b.orden ?? 99)
  })

  const ids_rutinas = rutinas?.map(r => r.id_rutina) ?? []

  const { data: ejercicios } = ids_rutinas.length > 0
    ? await supabase
        .from('ejercicio')
        .select('id_ejercicio, nombre, id_rutina, orden')
        .in('id_rutina', ids_rutinas)
        .order('orden')
    : { data: [] }

  const ids_ejercicios = ejercicios?.map(e => e.id_ejercicio) ?? []

  const { count: totalSeries } = ids_ejercicios.length > 0
    ? await supabase.from('serie').select('*', { count: 'exact', head: true }).in('id_ejercicio', ids_ejercicios)
    : { count: 0 }

  const { data: ultimaFecha } = ids_ejercicios.length > 0
    ? await supabase.from('serie').select('fecha').in('id_ejercicio', ids_ejercicios).order('fecha', { ascending: false }).limit(1)
    : { data: [] }

  // Progreso por ejercicio específico
  let progreso: { fecha: string; peso_max: number; reps: number }[] = []
  if (id_ejercicio && ids_ejercicios.includes(id_ejercicio)) {
    const { data: series } = await supabase
      .from('serie')
      .select('fecha, peso_kg, repeticiones')
      .eq('id_ejercicio', id_ejercicio)
      .not('peso_kg', 'is', null)
      .order('fecha')

    const porFecha: Record<string, { peso_max: number; reps: number }> = {}
    for (const s of series ?? []) {
      if (!porFecha[s.fecha] || (s.peso_kg ?? 0) > porFecha[s.fecha].peso_max) {
        porFecha[s.fecha] = { peso_max: Number(s.peso_kg), reps: s.repeticiones }
      }
    }
    progreso = Object.entries(porFecha).map(([fecha, v]) => ({ fecha, ...v }))
  }

  // Volumen total por sesión (peso * reps, agrupado por sesión/fecha)
  let volumen: { fecha: string; volumen: number; sesiones: number }[] = []
  if (ids_ejercicios.length > 0) {
    const { data: todasSeries } = await supabase
      .from('serie')
      .select('id_sesion, fecha, peso_kg, repeticiones')
      .in('id_ejercicio', ids_ejercicios)
      .not('peso_kg', 'is', null)
      .order('fecha')

    const porFechaVol: Record<string, { vol: number; sesiones: Set<string> }> = {}
    for (const s of todasSeries ?? []) {
      if (!porFechaVol[s.fecha]) porFechaVol[s.fecha] = { vol: 0, sesiones: new Set() }
      porFechaVol[s.fecha].vol += (Number(s.peso_kg) * s.repeticiones)
      if (s.id_sesion) porFechaVol[s.fecha].sesiones.add(s.id_sesion)
    }
    volumen = Object.entries(porFechaVol)
      .map(([fecha, v]) => ({ fecha, volumen: Math.round(v.vol), sesiones: v.sesiones.size }))
      .slice(-30) // últimos 30 puntos
  }

  // Racha de entrenamiento
  let rachaActual = 0
  let rachaMejor = 0
  if (ids_ejercicios.length > 0) {
    const { data: fechasSeries } = await supabase
      .from('serie')
      .select('fecha')
      .in('id_ejercicio', ids_ejercicios)
      .order('fecha', { ascending: false })

    const fechasUnicas = [...new Set((fechasSeries ?? []).map(s => s.fecha))].sort((a, b) => b.localeCompare(a))

    if (fechasUnicas.length > 0) {
      const hoy = new Date().toISOString().split('T')[0]
      const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      let streak = 0
      let mejorStreak = 0
      let prev: string | null = null

      for (const f of fechasUnicas) {
        if (prev === null) {
          if (f === hoy || f === ayer) { streak = 1; mejorStreak = 1 }
          else { mejorStreak = 1 }
        } else {
          const diff = (new Date(prev).getTime() - new Date(f).getTime()) / 86400000
          if (diff === 1) { streak++; if (streak > mejorStreak) mejorStreak = streak }
          else { streak = 1 }
        }
        prev = f
      }
      rachaActual = fechasUnicas[0] === hoy || fechasUnicas[0] === ayer ? streak : 0
      rachaMejor = mejorStreak
    }
  }

  return NextResponse.json({
    stats: {
      totalRutinas:    rutinas?.length    ?? 0,
      totalEjercicios: ejercicios?.length ?? 0,
      totalSeries:     totalSeries        ?? 0,
      ultimaSesion:    ultimaFecha?.[0]?.fecha ?? null,
      rachaActual,
      rachaMejor,
    },
    rutinas:    rutinas    ?? [],
    ejercicios: ejercicios ?? [],
    progreso,
    volumen,
  })
}
