import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/peso-corporal → últimas 90 entradas de peso corporal
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('peso_corporal')
    .select('id, fecha, peso_kg, notas')
    .eq('id_usuario', session.id)
    .order('fecha', { ascending: false })
    .limit(90)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/peso-corporal → registrar peso del día
// Body: { fecha, peso_kg, notas? }
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { fecha, peso_kg, notas } = await request.json()

  if (!fecha || peso_kg == null) {
    return NextResponse.json({ error: 'fecha y peso_kg requeridos' }, { status: 400 })
  }

  const pesoNum = parseFloat(peso_kg)
  if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 500) {
    return NextResponse.json({ error: 'Peso inválido' }, { status: 400 })
  }

  // Upsert: si ya existe entrada del día, actualizar
  const { data, error } = await supabase
    .from('peso_corporal')
    .upsert(
      { id_usuario: session.id, fecha, peso_kg: pesoNum, notas: notas ?? null },
      { onConflict: 'id_usuario,fecha' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/peso-corporal?id=xxx
export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('peso_corporal')
    .delete()
    .eq('id', id)
    .eq('id_usuario', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
