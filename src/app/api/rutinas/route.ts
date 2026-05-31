import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/rutinas → ordenadas por campo orden
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rutina')
    .select('*')
    .eq('id_usuario', session.id)
    .order('orden', { ascending: true, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/rutinas → crear rutina
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { nombre, descripcion, grupos, dia_semana } = await request.json()

  if (!nombre) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

  // Calcular el siguiente orden disponible
  const { data: existing } = await supabase
    .from('rutina').select('orden').eq('id_usuario', session.id).order('orden', { ascending: false }).limit(1)
  const nextOrden = ((existing?.[0]?.orden) ?? 0) + 1

  const { data, error } = await supabase
    .from('rutina')
    .insert([{ id_usuario: session.id, nombre, descripcion: descripcion ?? null, grupos: grupos ?? null, dia_semana: dia_semana ?? null, orden: nextOrden }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
