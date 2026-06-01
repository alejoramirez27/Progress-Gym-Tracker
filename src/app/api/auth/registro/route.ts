import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = createServiceClient()
  const { nombre, email, password } = await request.json()

  if (!nombre?.trim() || !email?.trim() || !password)
    return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 })

  if (password.length < 6)
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })

  // Verificar si el email ya existe
  const { data: existente } = await supabase
    .from('usuario')
    .select('id_usuario')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existente)
    return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 })

  // Crear usuario
  const { data: usuario, error } = await supabase
    .from('usuario')
    .insert({
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      password,
    })
    .select('id_usuario, nombre, email')
    .single()

  if (error || !usuario)
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })

  // Crear sesión automáticamente al registrarse
  const cookieStore = await cookies()
  cookieStore.set('gym_session', JSON.stringify({
    id: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true, nombre: usuario.nombre })
}
