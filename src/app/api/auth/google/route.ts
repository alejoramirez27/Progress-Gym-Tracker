import { NextResponse } from 'next/server'

// GET /api/auth/google  →  redirige al consent screen de Google
export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID no configurado' }, { status: 500 })
  }

  // Construir redirect_uri dinámicamente desde el origin real de la petición
  // Así siempre coincide con lo que llega, sin depender de un env var extra
  const { origin } = new URL(request.url)
  const redirectUri = `${origin}/api/auth/google/callback`

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
