import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/series?id_ejercicio=xxx
export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id_ejercicio = searchParams.get('id_ejercicio')
  if (!id_ejercicio) return NextResponse.json({ error: 'id_ejercicio requerido' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('serie')
    .select('*')
    .eq('id_ejercicio', id_ejercicio)
    .order('fecha', { ascending: false })
    .order('numero_serie')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/series
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()
  const { id_ejercicio, numero_serie, peso_kg, repeticiones, rir, descanso_seg, notas } = await request.json()

  if (!id_ejercicio || !repeticiones)
    return NextResponse.json({ error: 'id_ejercicio y repeticiones son obligatorios' }, { status: 400 })

  const { data, error } = await supabase
    .from('serie')
    .insert([{
      id_ejercicio,
      numero_serie: numero_serie ?? 1,
      peso_kg:      peso_kg      ?? null,
      repeticiones,
      rir:          rir          ?? null,
      descanso_seg: descanso_seg ?? null,
      notas:        notas        ?? null,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
