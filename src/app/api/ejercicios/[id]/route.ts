import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// DELETE /api/ejercicios/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  // Eliminar primero las series que referencian este ejercicio
  await supabase.from('serie').delete().eq('id_ejercicio', id)

  const { error } = await supabase.from('ejercicio').delete().eq('id_ejercicio', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

// PATCH /api/ejercicios/:id → editar nombre y/o num_series
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
  if (body.nombre    !== undefined) updates.nombre     = body.nombre
  if (body.num_series !== undefined) updates.num_series = body.num_series

  const { data, error } = await supabase
    .from('ejercicio')
    .update(updates)
    .eq('id_ejercicio', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
