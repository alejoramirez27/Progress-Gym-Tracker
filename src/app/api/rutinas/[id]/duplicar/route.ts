import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// POST /api/rutinas/:id/duplicar
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  // Obtener rutina original
  const { data: rutina } = await supabase
    .from('rutina').select('*').eq('id_rutina', id).eq('id_usuario', session.id).single()
  if (!rutina) return NextResponse.json({ error: 'Rutina no encontrada' }, { status: 404 })

  // Calcular siguiente orden
  const { data: existing } = await supabase
    .from('rutina').select('orden').eq('id_usuario', session.id).order('orden', { ascending: false }).limit(1)
  const nextOrden = ((existing?.[0]?.orden) ?? 0) + 1

  // Crear copia de la rutina
  const { data: nueva, error: errRutina } = await supabase
    .from('rutina')
    .insert({
      id_usuario:  session.id,
      nombre:      `${rutina.nombre} (copia)`,
      descripcion: rutina.descripcion,
      grupos:      rutina.grupos,
      dia_semana:  rutina.dia_semana,
      orden:       nextOrden,
    })
    .select()
    .single()

  if (errRutina || !nueva) return NextResponse.json({ error: errRutina?.message }, { status: 400 })

  // Copiar ejercicios
  const { data: ejercicios } = await supabase
    .from('ejercicio').select('*').eq('id_rutina', id).order('orden')

  if (ejercicios && ejercicios.length > 0) {
    await supabase.from('ejercicio').insert(
      ejercicios.map(ej => ({
        id_rutina:   nueva.id_rutina,
        nombre:      ej.nombre,
        num_series:  ej.num_series,
        orden:       ej.orden,
        descripcion: ej.descripcion,
      }))
    )
  }

  return NextResponse.json(nueva, { status: 201 })
}
