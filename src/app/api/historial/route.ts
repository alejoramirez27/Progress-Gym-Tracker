import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const fecha = searchParams.get('fecha')

  // Obtener rutinas del usuario
  const { data: rutinas } = await supabase
    .from('rutina').select('id_rutina, nombre').eq('id_usuario', session.id)
  const ids_rutinas = rutinas?.map(r => r.id_rutina) ?? []
  if (ids_rutinas.length === 0) return NextResponse.json([])

  const { data: ejercicios } = await supabase
    .from('ejercicio').select('id_ejercicio, id_rutina, nombre').in('id_rutina', ids_rutinas)
  const ids_ejercicios = ejercicios?.map(e => e.id_ejercicio) ?? []
  if (ids_ejercicios.length === 0) return NextResponse.json([])

  // Si piden el detalle de una fecha
  if (fecha) {
    const { data: series } = await supabase
      .from('serie')
      .select('*')
      .eq('fecha', fecha)
      .in('id_ejercicio', ids_ejercicios)
      .order('numero_serie')

    // Agrupar por ejercicio
    const porEjercicio: Record<string, { nombre: string; series: typeof series }> = {}
    for (const serie of series ?? []) {
      const ej = ejercicios?.find(e => e.id_ejercicio === serie.id_ejercicio)
      if (!ej) continue
      if (!porEjercicio[serie.id_ejercicio]) porEjercicio[serie.id_ejercicio] = { nombre: ej.nombre, series: [] }
      porEjercicio[serie.id_ejercicio].series!.push(serie)
    }
    return NextResponse.json(Object.values(porEjercicio))
  }

  // Sesiones agrupadas por fecha
  const { data: series } = await supabase
    .from('serie')
    .select('fecha, id_ejercicio')
    .in('id_ejercicio', ids_ejercicios)
    .order('fecha', { ascending: false })

  const porFecha: Record<string, { fecha: string; num_ejercicios: number; num_series: number; nombre_rutina: string }> = {}
  for (const s of series ?? []) {
    if (!porFecha[s.fecha]) {
      const ej = ejercicios?.find(e => e.id_ejercicio === s.id_ejercicio)
      const rutina = rutinas?.find(r => r.id_rutina === ej?.id_rutina)
      porFecha[s.fecha] = { fecha: s.fecha, num_ejercicios: 0, num_series: 0, nombre_rutina: rutina?.nombre ?? '—' }
    }
    porFecha[s.fecha].num_series++
  }

  // Contar ejercicios únicos por fecha
  const ejPorFecha: Record<string, Set<string>> = {}
  for (const s of series ?? []) {
    if (!ejPorFecha[s.fecha]) ejPorFecha[s.fecha] = new Set()
    ejPorFecha[s.fecha].add(s.id_ejercicio)
  }
  for (const fecha in porFecha) {
    porFecha[fecha].num_ejercicios = ejPorFecha[fecha]?.size ?? 0
  }

  return NextResponse.json(Object.values(porFecha).sort((a, b) => b.fecha.localeCompare(a.fecha)))
}
