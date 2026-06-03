import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const id_sesion = searchParams.get('id_sesion')

  // Detalle + comparación con sesión anterior
  if (id_sesion) {
    const { data: sesion } = await supabase
      .from('sesion')
      .select('id_sesion, fecha, notas, id_rutina, rutina:id_rutina(nombre)')
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

    const current = (ejercicios ?? [])
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map(ej => ({
        nombre: ej.nombre,
        id_ejercicio: ej.id_ejercicio,
        series: (series ?? []).filter(s => s.id_ejercicio === ej.id_ejercicio),
      }))

    // Sesión anterior de la misma rutina
    let anterior: { id_ejercicio: string; peso_max: number; fecha: string }[] = []
    if (sesion.id_rutina) {
      const { data: sesionAnt } = await supabase
        .from('sesion')
        .select('id_sesion, fecha')
        .eq('id_rutina', sesion.id_rutina)
        .eq('id_usuario', session.id)
        .lt('fecha', sesion.fecha)
        .order('fecha', { ascending: false })
        .limit(1)
        .single()

      if (sesionAnt) {
        const { data: seriesAnt } = await supabase
          .from('serie')
          .select('id_ejercicio, peso_kg, repeticiones')
          .eq('id_sesion', sesionAnt.id_sesion)
          .not('peso_kg', 'is', null)

        const porEj: Record<string, number> = {}
        for (const s of seriesAnt ?? []) {
          const p = Number(s.peso_kg)
          if (!porEj[s.id_ejercicio] || p > porEj[s.id_ejercicio]) porEj[s.id_ejercicio] = p
        }
        anterior = Object.entries(porEj).map(([id_ejercicio, peso_max]) => ({
          id_ejercicio, peso_max, fecha: sesionAnt.fecha
        }))
      }
    }

    return NextResponse.json({ current, anterior })
  }

  // Lista de sesiones del usuario
  const { data: sesiones, error } = await supabase
    .from('sesion')
    .select('id_sesion, fecha, notas, id_rutina, rutina:id_rutina(nombre)')
    .eq('id_usuario', session.id)
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids_sesion = (sesiones ?? []).map(s => s.id_sesion)
  const { data: series } = ids_sesion.length > 0
    ? await supabase.from('serie').select('id_sesion, id_ejercicio').in('id_sesion', ids_sesion)
    : { data: [] }

  const result = (sesiones ?? []).map(s => {
    const seriesDeSesion = (series ?? []).filter(sr => sr.id_sesion === s.id_sesion)
    const ejUnicos = new Set(seriesDeSesion.map(sr => sr.id_ejercicio)).size
    return {
      id_sesion:      s.id_sesion,
      id_rutina:      s.id_rutina,
      fecha:          s.fecha,
      nombre_rutina:  (s.rutina as unknown as { nombre: string } | null)?.nombre ?? '—',
      num_ejercicios: ejUnicos,
      num_series:     seriesDeSesion.length,
    }
  })

  return NextResponse.json(result)
}
