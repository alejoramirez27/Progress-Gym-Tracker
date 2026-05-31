import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/sesiones → sesiones del usuario ordenadas por fecha desc
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('sesion')
    .select('id_sesion, fecha, notas, created_at, rutina:id_rutina(nombre)')
    .eq('id_usuario', session.id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/sesiones → crear sesión con todas sus series
// Body: { id_rutina, fecha, notas?, ejercicios_data: [{ id_ejercicio, series: [{ peso_kg, repeticiones, rir }] }] }
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { id_rutina, fecha, notas, ejercicios_data } = await request.json()

  if (!id_rutina || !fecha || !Array.isArray(ejercicios_data))
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })

  // 1. Crear la sesión
  const { data: sesion, error: errSesion } = await supabase
    .from('sesion')
    .insert({ id_rutina, id_usuario: session.id, fecha, notas: notas || null })
    .select()
    .single()

  if (errSesion || !sesion)
    return NextResponse.json({ error: errSesion?.message ?? 'Error al crear sesión' }, { status: 400 })

  // 2. Insertar todas las series que tengan al menos repeticiones
  const seriesRows = ejercicios_data.flatMap(
    (ej: { id_ejercicio: string; series: { peso_kg: string; repeticiones: string; rir: string; notas: string }[] }) =>
      ej.series
        .map((s, i) => ({ ...s, numero_serie: i + 1 }))
        .filter(s => s.repeticiones && Number(s.repeticiones) > 0)
        .map(s => ({
          id_sesion:    sesion.id_sesion,
          id_ejercicio: ej.id_ejercicio,
          numero_serie: s.numero_serie,
          peso_kg:      s.peso_kg      ? Number(s.peso_kg)      : null,
          repeticiones: Number(s.repeticiones),
          rir:          s.rir          ? Number(s.rir)          : null,
          notas:        s.notas        || null,
          fecha,
        }))
  )

  if (seriesRows.length > 0) {
    const { error: errSeries } = await supabase.from('serie').insert(seriesRows)
    if (errSeries) return NextResponse.json({ error: errSeries.message }, { status: 400 })
  }

  return NextResponse.json({ id_sesion: sesion.id_sesion }, { status: 201 })
}
