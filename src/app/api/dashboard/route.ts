import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_ejercicio = searchParams.get('id_ejercicio')

  // Stats generales
  const { data: rutinas } = await supabase
    .from('rutina').select('id_rutina').eq('id_usuario', session.id)

  const ids_rutinas = rutinas?.map(r => r.id_rutina) ?? []

  const { data: ejercicios } = ids_rutinas.length > 0
    ? await supabase.from('ejercicio').select('id_ejercicio').in('id_rutina', ids_rutinas)
    : { data: [] }

  const ids_ejercicios = ejercicios?.map(e => e.id_ejercicio) ?? []

  const { count: totalSeries } = ids_ejercicios.length > 0
    ? await supabase.from('serie').select('*', { count: 'exact', head: true }).in('id_ejercicio', ids_ejercicios)
    : { count: 0 }

  const { data: ultimaFecha } = ids_ejercicios.length > 0
    ? await supabase.from('serie').select('fecha').in('id_ejercicio', ids_ejercicios).order('fecha', { ascending: false }).limit(1)
    : { data: [] }

  // Lista de ejercicios para el selector de gráfica
  const { data: listaEjercicios } = ids_ejercicios.length > 0
    ? await supabase.from('ejercicio').select('id_ejercicio, nombre').in('id_ejercicio', ids_ejercicios).order('nombre')
    : { data: [] }

  // Datos de progreso por ejercicio
  let progreso: { fecha: string; peso_max: number; reps: number }[] = []
  if (id_ejercicio && ids_ejercicios.includes(id_ejercicio)) {
    const { data: series } = await supabase
      .from('serie')
      .select('fecha, peso_kg, repeticiones')
      .eq('id_ejercicio', id_ejercicio)
      .not('peso_kg', 'is', null)
      .order('fecha')

    // Agrupar por fecha: peso máximo del día
    const porFecha: Record<string, { peso_max: number; reps: number }> = {}
    for (const s of series ?? []) {
      const key = s.fecha
      if (!porFecha[key] || (s.peso_kg ?? 0) > porFecha[key].peso_max) {
        porFecha[key] = { peso_max: Number(s.peso_kg), reps: s.repeticiones }
      }
    }
    progreso = Object.entries(porFecha).map(([fecha, v]) => ({ fecha, ...v }))
  }

  return NextResponse.json({
    stats: {
      totalRutinas:    rutinas?.length      ?? 0,
      totalEjercicios: ejercicios?.length   ?? 0,
      totalSeries:     totalSeries          ?? 0,
      ultimaSesion:    ultimaFecha?.[0]?.fecha ?? null,
    },
    ejercicios: listaEjercicios ?? [],
    progreso,
  })
}
