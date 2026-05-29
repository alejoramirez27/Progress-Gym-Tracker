import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createServiceClient()
  const { email, password } = await request.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 })

  const { data: usuario, error } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, email')
    .eq('email', email.toLowerCase().trim())
    .eq('password', password)
    .single()

  if (error || !usuario)
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })

  const cookieStore = await cookies()
  cookieStore.set('gym_session', JSON.stringify({
    id: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  return NextResponse.json({ ok: true, nombre: usuario.nombre })
}
