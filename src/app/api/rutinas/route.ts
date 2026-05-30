import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/rutinas → rutinas del usuario en sesión
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rutina')
    .select('*')
    .eq('id_usuario', session.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/rutinas → crear rutina
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { nombre, descripcion, grupos } = await request.json()

  if (!nombre) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

  const { data, error } = await supabase
    .from('rutina')
    .insert([{ id_usuario: session.id, nombre, descripcion: descripcion ?? null, grupos: grupos ?? null }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
