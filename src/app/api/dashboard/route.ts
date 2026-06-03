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

  // Progreso por ejercicio
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

  // Volumen total por sesión
  let volumen: { fecha: string; volumen: number; sesiones: number }[] = []
  let heatmap: { fecha: string; count: number }[] = []

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
      .slice(-30)

    // Heatmap — últimos 365 días (alineado al lunes de la semana actual)
    const activeDates = new Set(Object.keys(porFechaVol))
    const hoyD = new Date()
    // Ir al domingo más lejano que cubra 365 días
    const diasAtras = 364
    const inicio = new Date(hoyD)
    inicio.setDate(hoyD.getDate() - diasAtras)
    // Retroceder hasta el lunes de esa semana
    const diaSemana = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1
    inicio.setDate(inicio.getDate() - diaSemana)

    const totalDias = Math.ceil((hoyD.getTime() - inicio.getTime()) / 86400000) + 1
    heatmap = Array.from({ length: totalDias }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      const fecha = d.toISOString().split('T')[0]
      return { fecha, count: activeDates.has(fecha) ? (porFechaVol[fecha]?.sesiones.size ?? 1) : 0 }
    })
  } else {
    // Heatmap vacío — 365 días
    const hoyD = new Date()
    const inicio = new Date(hoyD)
    inicio.setDate(hoyD.getDate() - 364)
    const diaSemana = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1
    inicio.setDate(inicio.getDate() - diaSemana)
    const totalDias = Math.ceil((hoyD.getTime() - inicio.getTime()) / 86400000) + 1
    heatmap = Array.from({ length: totalDias }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      return { fecha: d.toISOString().split('T')[0], count: 0 }
    })
  }

  // Racha
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
      let streak = 0; let mejorStreak = 0; let prev: string | null = null
      for (const f of fechasUnicas) {
        if (prev === null) { streak = 1; mejorStreak = 1 }
        else {
          const diff = (new Date(prev).getTime() - new Date(f).getTime()) / 86400000
          if (diff === 1) { streak++; if (streak > mejorStreak) mejorStreak = streak }
          else streak = 1
        }
        prev = f
      }
      rachaActual = fechasUnicas[0] === hoy || fechasUnicas[0] === ayer ? streak : 0
      rachaMejor = mejorStreak
    }
  }

  // Sesiones esta semana vs semana anterior
  const hoyDate = new Date()
  const lunesEstaSeamana = new Date(hoyDate)
  lunesEstaSeamana.setDate(hoyDate.getDate() - hoyDate.getDay() + (hoyDate.getDay() === 0 ? -6 : 1))
  lunesEstaSeamana.setHours(0,0,0,0)
  const lunesSemanaPasada = new Date(lunesEstaSeamana)
  lunesSemanaPasada.setDate(lunesEstaSeamana.getDate() - 7)

  const semanaActualFechas = heatmap.filter(d => d.fecha >= lunesEstaSeamana.toISOString().split('T')[0])
  const semanaPasadaFechas = heatmap.filter(d => {
    const f = d.fecha
    return f >= lunesSemanaPasada.toISOString().split('T')[0] && f < lunesEstaSeamana.toISOString().split('T')[0]
  })
  const sesionesEstaSemana = semanaActualFechas.filter(d => d.count > 0).length
  const sesionesSemanaPasada = semanaPasadaFechas.filter(d => d.count > 0).length

  return NextResponse.json({
    stats: {
      totalRutinas:    rutinas?.length    ?? 0,
      totalEjercicios: ejercicios?.length ?? 0,
      totalSeries:     totalSeries        ?? 0,
      ultimaSesion:    ultimaFecha?.[0]?.fecha ?? null,
      rachaActual,
      rachaMejor,
      sesionesEstaSemana,
      sesionesSemanaPasada,
    },
    rutinas:    rutinas    ?? [],
    ejercicios: ejercicios ?? [],
    progreso,
    volumen,
    heatmap,
  })
}
