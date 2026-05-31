import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/rutinas/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('rutina').select('*').eq('id_rutina', id).eq('id_usuario', session.id).single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

// DELETE /api/rutinas/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const { error } = await supabase.from('rutina').delete().eq('id_rutina', id).eq('id_usuario', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// PATCH /api/rutinas/:id → editar campos o actualizar orden
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (body.nombre      !== undefined) updates.nombre      = body.nombre
  if (body.descripcion !== undefined) updates.descripcion = body.descripcion ?? null
  if (body.grupos      !== undefined) updates.grupos      = body.grupos ?? null
  if (body.dia_semana  !== undefined) updates.dia_semana  = body.dia_semana ?? null
  if (body.orden       !== undefined) updates.orden       = body.orden

  const { data, error } = await supabase
    .from('rutina').update(updates).eq('id_rutina', id).eq('id_usuario', session.id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
