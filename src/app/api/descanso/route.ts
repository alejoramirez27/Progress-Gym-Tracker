import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET → devuelve los días de descanso del usuario (array de números JS: 0=Dom, 1=Lun, … 6=Sáb)
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('usuario')
    .select('dias_descanso')
    .eq('id_usuario', session.id)
    .single()

  const dias: number[] = data?.dias_descanso
    ? data.dias_descanso.split(',').map(Number).filter((n: number) => !isNaN(n))
    : []

  return NextResponse.json({ dias })
}

// PUT → guarda los días de descanso
export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { dias } = await request.json() as { dias: number[] }

  if (!Array.isArray(dias)) return NextResponse.json({ error: 'días inválidos' }, { status: 400 })

  const supabase = createServiceClient()
  const valor = dias.length > 0 ? dias.join(',') : null

  const { error } = await supabase
    .from('usuario')
    .update({ dias_descanso: valor })
    .eq('id_usuario', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, dias })
}
