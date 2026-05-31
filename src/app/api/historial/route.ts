import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_sesion = searchParams.get('id_sesion')

  // Detalle de una sesión específica
  if (id_sesion) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') ?? ''}/api/sesiones/${id_sesion}`,
    )
    // Usamos directamente supabase para evitar loop de fetch interno
    const { data: sesion } = await supabase
      .from('sesion')
      .select('id_sesion, fecha, notas, rutina:id_rutina(nombre)')
      .eq('id_sesion', id_sesion)
      .eq('id_usuario', session.id)
      .single()

    if (!sesion) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const { data: series } = await supabase
      .from('serie')
      .select('id_serie, id_ejercicio, numero_serie, peso_kg, repeticiones, rir, notas')
      .eq('id_sesion', id_sesion)
      .order('numero_serie')

    const ids_ej = [...new Set((series ?? []).map(s => s.id_ejercicio))]
    const { data: ejercicios } = ids_ej.length > 0
      ? await supabase.from('ejercicio').select('id_ejercicio, nombre, orden').in('id_ejercicio', ids_ej)
      : { data: [] }

    const porEjercicio = (ejercicios ?? [])
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map(ej => ({
        nombre: ej.nombre,
        series: (series ?? []).filter(s => s.id_ejercicio === ej.id_ejercicio),
      }))

    return NextResponse.json(porEjercicio)
  }

  // Lista de sesiones del usuario
  const { data: sesiones, error } = await supabase
    .from('sesion')
    .select('id_sesion, fecha, notas, rutina:id_rutina(nombre)')
    .eq('id_usuario', session.id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Contar series por sesión
  const ids_sesion = (sesiones ?? []).map(s => s.id_sesion)
  const { data: series } = ids_sesion.length > 0
    ? await supabase
        .from('serie')
        .select('id_sesion, id_ejercicio')
        .in('id_sesion', ids_sesion)
    : { data: [] }

  const result = (sesiones ?? []).map(s => {
    const seriesDeSesion = (series ?? []).filter(sr => sr.id_sesion === s.id_sesion)
    const ejUnicos = new Set(seriesDeSesion.map(sr => sr.id_ejercicio)).size
    return {
      id_sesion:      s.id_sesion,
      fecha:          s.fecha,
      nombre_rutina:  (s.rutina as unknown as { nombre: string } | null)?.nombre ?? '—',
      num_ejercicios: ejUnicos,
      num_series:     seriesDeSesion.length,
    }
  })

  return NextResponse.json(result)
}
