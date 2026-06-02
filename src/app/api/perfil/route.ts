import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, email, created_at')
    .eq('id_usuario', session.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { nombre } = await request.json()

  if (!nombre?.trim()) return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })

  const { data, error } = await supabase
    .from('usuario')
    .update({ nombre: nombre.trim() })
    .eq('id_usuario', session.id)
    .select('id_usuario, nombre, email')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Actualizar cookie de sesión
  const cookieStore = await cookies()
  cookieStore.set('gym_session', JSON.stringify({ id: session.id, nombre: data.nombre, email: data.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json(data)
}
