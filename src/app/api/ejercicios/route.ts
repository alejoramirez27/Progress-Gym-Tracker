import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/ejercicios?id_rutina=xxx
export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id_rutina = searchParams.get('id_rutina')
  if (!id_rutina) return NextResponse.json({ error: 'id_rutina requerido' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('ejercicio')
    .select('*')
    .eq('id_rutina', id_rutina)
    .order('orden')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/ejercicios
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { id_rutina, nombre, orden, num_series } = body

    if (!id_rutina || !nombre)
      return NextResponse.json({ error: 'id_rutina y nombre son obligatorios' }, { status: 400 })

    const { data, error } = await supabase
      .from('ejercicio')
      .insert([{ id_rutina, nombre, orden: orden ?? 1, num_series: num_series ?? 3 }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating ejercicio:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in POST /api/ejercicios:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
