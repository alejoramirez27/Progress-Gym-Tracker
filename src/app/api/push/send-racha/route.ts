import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

function fechaColombia(): string {
  const now = new Date()
  const col = new Date(now.getTime() - 5 * 60 * 60 * 1000)
  return col.toISOString().split('T')[0]
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const hoy = fechaColombia()

  // Usuarios con racha >= 3 que NO entrenaron hoy
  const { data: rachas } = await supabase.rpc('usuarios_racha_en_riesgo', { p_fecha: hoy })
  if (!rachas?.length) return NextResponse.json({ sent: 0 })

  const ids = rachas.map((r: { id_usuario: string }) => r.id_usuario)

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('id_usuario', ids)

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  const dead: string[] = []

  await Promise.all(subs.map(async (s) => {
    const racha = rachas.find((r: { id_usuario: string; racha: number }) => r.id_usuario === s.id_usuario)?.racha ?? 0
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({
          title: `⚡ Tu racha de ${racha} días está en riesgo`,
          body: 'Entrena hoy para mantenerla. ¡Tú puedes!',
          url: '/progreso',
        })
      )
      sent++
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode
      if (status === 410 || status === 404) dead.push(s.endpoint)
    }
  }))

  // Limpiar suscripciones expiradas
  if (dead.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', dead)
  }

  return NextResponse.json({ sent })
}
