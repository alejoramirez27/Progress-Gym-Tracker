import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_ejercicio = searchParams.get('id_ejercicio')

  // Rutinas del usuario
  const { data: rutinas } = await supabase
    .from('rutina')
    .select('id_rutina, nombre')
    .eq('id_usuario', session.id)
    .order('nombre')

  const ids_rutinas = rutinas?.map(r => r.id_rutina) ?? []

  // Todos los ejercicios del usuario (con id_rutina para agrupar en frontend)
  const { data: ejercicios } = ids_rutinas.length > 0
    ? await supabase
        .from('ejercicio')
        .select('id_ejercicio, nombre, id_rutina')
        .in('id_rutina', ids_rutinas)
        .order('nombre')
    : { data: [] }

  const ids_ejercicios = ejercicios?.map(e => e.id_ejercicio) ?? []

  // Stats
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

    // Agrupar por fecha: peso máximo del día + reps de esa serie
    const porFecha: Record<string, { peso_max: number; reps: number }> = {}
    for (const s of series ?? []) {
      if (!porFecha[s.fecha] || (s.peso_kg ?? 0) > porFecha[s.fecha].peso_max) {
        porFecha[s.fecha] = { peso_max: Number(s.peso_kg), reps: s.repeticiones }
      }
    }
    progreso = Object.entries(porFecha).map(([fecha, v]) => ({ fecha, ...v }))
  }

  return NextResponse.json({
    stats: {
      totalRutinas:    rutinas?.length    ?? 0,
      totalEjercicios: ejercicios?.length ?? 0,
      totalSeries:     totalSeries        ?? 0,
      ultimaSesion:    ultimaFecha?.[0]?.fecha ?? null,
    },
    rutinas:    rutinas    ?? [],
    ejercicios: ejercicios ?? [],
    progreso,
  })
}
