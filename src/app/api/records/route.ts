import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  // Obtener todas las rutinas del usuario
  const { data: rutinas } = await supabase
    .from('rutina')
    .select('id_rutina, nombre, dia_semana, orden')
    .eq('id_usuario', session.id)
    .order('orden', { ascending: true, nullsFirst: false })

  const ids_rutinas = (rutinas ?? []).map(r => r.id_rutina)
  if (ids_rutinas.length === 0) return NextResponse.json([])

  // Obtener todos los ejercicios de esas rutinas
  const { data: ejercicios } = await supabase
    .from('ejercicio')
    .select('id_ejercicio, nombre, id_rutina, orden')
    .in('id_rutina', ids_rutinas)
    .order('orden')

  const ids_ejercicios = (ejercicios ?? []).map(e => e.id_ejercicio)
  if (ids_ejercicios.length === 0) return NextResponse.json([])

  // Obtener todas las series con peso de esos ejercicios
  const { data: series } = await supabase
    .from('serie')
    .select('id_ejercicio, peso_kg, repeticiones, fecha')
    .in('id_ejercicio', ids_ejercicios)
    .not('peso_kg', 'is', null)
    .order('fecha', { ascending: false })

  // Calcular PR por ejercicio (máximo peso; en caso de empate, más reps)
  const prPorEjercicio: Record<string, {
    peso_max: number
    repeticiones: number
    fecha: string
  }> = {}

  for (const s of series ?? []) {
    const actual = prPorEjercicio[s.id_ejercicio]
    const peso   = Number(s.peso_kg)
    if (!actual || peso > actual.peso_max || (peso === actual.peso_max && s.repeticiones > actual.repeticiones)) {
      prPorEjercicio[s.id_ejercicio] = {
        peso_max:     peso,
        repeticiones: s.repeticiones,
        fecha:        s.fecha,
      }
    }
  }

  // Ordenar rutinas por día de semana
  const ORDEN_DIA: Record<string, number> = {
    'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
    'Viernes': 5, 'Sábado': 6, 'Domingo': 7,
  }
  const rutinasOrdenadas = (rutinas ?? []).sort((a, b) => {
    const dA = a.dia_semana ? (ORDEN_DIA[a.dia_semana] ?? 8) : 9
    const dB = b.dia_semana ? (ORDEN_DIA[b.dia_semana] ?? 8) : 9
    if (dA !== dB) return dA - dB
    return (a.orden ?? 99) - (b.orden ?? 99)
  })

  // Agrupar ejercicios por rutina, adjuntando su PR
  const resultado = rutinasOrdenadas.map(rutina => ({
    id_rutina:  rutina.id_rutina,
    nombre:     rutina.nombre,
    dia_semana: rutina.dia_semana,
    ejercicios: (ejercicios ?? [])
      .filter(e => e.id_rutina === rutina.id_rutina)
      .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
      .map(e => ({
        id_ejercicio: e.id_ejercicio,
        nombre:       e.nombre,
        pr: prPorEjercicio[e.id_ejercicio] ?? null,
      })),
  })).filter(r => r.ejercicios.length > 0)

  return NextResponse.json(resultado)
}
