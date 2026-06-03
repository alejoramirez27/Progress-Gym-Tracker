import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  // Obtener todas las series del usuario con contexto completo
  const { data: rutinas } = await supabase
    .from('rutina')
    .select('id_rutina, nombre')
    .eq('id_usuario', session.id)

  const ids_rutinas = (rutinas ?? []).map(r => r.id_rutina)

  const { data: ejercicios } = ids_rutinas.length > 0
    ? await supabase.from('ejercicio').select('id_ejercicio, nombre, id_rutina').in('id_rutina', ids_rutinas)
    : { data: [] }

  const ids_ejercicios = (ejercicios ?? []).map(e => e.id_ejercicio)

  const { data: sesiones } = await supabase
    .from('sesion')
    .select('id_sesion, fecha, id_rutina, notas')
    .eq('id_usuario', session.id)
    .order('fecha', { ascending: true })

  const { data: series } = ids_ejercicios.length > 0
    ? await supabase
        .from('serie')
        .select('id_sesion, id_ejercicio, numero_serie, peso_kg, repeticiones, rir, notas, fecha')
        .in('id_ejercicio', ids_ejercicios)
        .order('fecha', { ascending: true })
        .order('numero_serie')
    : { data: [] }

  // Mapas para joins
  const rutinaMap = Object.fromEntries((rutinas ?? []).map(r => [r.id_rutina, r.nombre]))
  const ejMap = Object.fromEntries((ejercicios ?? []).map(e => [e.id_ejercicio, e.nombre]))
  const sesionMap = Object.fromEntries((sesiones ?? []).map(s => [s.id_sesion, s]))

  // Generar CSV
  const headers = ['fecha', 'rutina', 'ejercicio', 'serie', 'peso_kg', 'repeticiones', 'rir', 'notas_serie', 'notas_sesion']
  const rows = (series ?? []).map(s => {
    const sesion = sesionMap[s.id_sesion]
    return [
      s.fecha ?? sesion?.fecha ?? '',
      rutinaMap[sesion?.id_rutina ?? ''] ?? '',
      ejMap[s.id_ejercicio] ?? '',
      s.numero_serie,
      s.peso_kg ?? '',
      s.repeticiones,
      s.rir ?? '',
      (s.notas ?? '').replace(/,/g, ';'),
      (sesion?.notas ?? '').replace(/,/g, ';'),
    ].join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const fecha = new Date().toISOString().split('T')[0]

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="volttrack_${fecha}.csv"`,
    },
  })
}
