import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET /api/auth/google/callback  →  Google redirige aquí con ?code=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  const loginUrl = new URL('/login', request.url)

  if (error || !code) {
    loginUrl.searchParams.set('error', 'google_cancelled')
    return NextResponse.redirect(loginUrl)
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI!

  // 1. Intercambiar code → access_token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    loginUrl.searchParams.set('error', 'token_exchange')
    return NextResponse.redirect(loginUrl)
  }

  const { access_token } = await tokenRes.json()

  // 2. Obtener info del usuario de Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })

  if (!userRes.ok) {
    loginUrl.searchParams.set('error', 'userinfo')
    return NextResponse.redirect(loginUrl)
  }

  const googleUser: { email: string; name: string; id: string } = await userRes.json()

  // 3. Buscar o crear usuario en Supabase
  const supabase = createServiceClient()

  let usuario = null

  const { data: existente } = await supabase
    .from('usuario')
    .select('id_usuario, nombre, email')
    .eq('email', googleUser.email.toLowerCase())
    .single()

  if (existente) {
    usuario = existente
  } else {
    // Crear usuario nuevo (sin password porque usa Google)
    const { data: nuevo } = await supabase
      .from('usuario')
      .insert({
        nombre:   googleUser.name,
        email:    googleUser.email.toLowerCase(),
        password: `google_${googleUser.id}`, // placeholder, nunca se usa para login directo
      })
      .select('id_usuario, nombre, email')
      .single()

    usuario = nuevo
  }

  if (!usuario) {
    loginUrl.searchParams.set('error', 'db_error')
    return NextResponse.redirect(loginUrl)
  }

  // 4. Crear cookie de sesión
  const cookieStore = await cookies()
  cookieStore.set('gym_session', JSON.stringify({
    id:     usuario.id_usuario,
    nombre: usuario.nombre,
    email:  usuario.email,
  }), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  })

  return NextResponse.redirect(new URL('/rutinas', request.url))
}
