import { NextResponse } from 'next/server'

// GET /api/auth/google  →  redirige al consent screen de Google
export async function GET() {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI // ej: https://tu-app.vercel.app/api/auth/google/callback

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google OAuth no configurado' }, { status: 500 })
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
