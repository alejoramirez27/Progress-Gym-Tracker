import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/progreso/ultimos-pesos?id_rutina=XXX
// Returns last session weights per exercise: { [id_ejercicio]: [{peso_kg, repeticiones}] }
export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({})

  const { searchParams } = new URL(request.url)
  const id_rutina = searchParams.get('id_rutina')
  if (!id_rutina) return NextResponse.json({})

  const supabase = createServiceClient()

  // Verify ownership
  const { data: rutina } = await supabase
    .from('rutina')
    .select('id_rutina')
    .eq('id_rutina', id_rutina)
    .eq('id_usuario', session.id)
    .single()

  if (!rutina) return NextResponse.json({})

  // Get exercises for this rutina
  const { data: ejercicios } = await supabase
    .from('ejercicio')
    .select('id_ejercicio')
    .eq('id_rutina', id_rutina)

  const ids = (ejercicios ?? []).map(e => e.id_ejercicio)
  if (ids.length === 0) return NextResponse.json({})

  // Get the most recent session for this rutina
  const { data: ultimaSesion } = await supabase
    .from('sesion')
    .select('id_sesion')
    .eq('id_rutina', id_rutina)
    .order('fecha', { ascending: false })
    .limit(1)
    .single()

  if (!ultimaSesion) return NextResponse.json({})

  // Get all series from that session ordered by exercise and serie number
  const { data: series } = await supabase
    .from('serie')
    .select('id_ejercicio, peso_kg, repeticiones, numero_serie')
    .in('id_ejercicio', ids)
    .eq('id_sesion', ultimaSesion.id_sesion)
    .order('numero_serie')

  const resultado: Record<string, { peso_kg: number; repeticiones: number }[]> = {}
  for (const s of series ?? []) {
    if (!resultado[s.id_ejercicio]) resultado[s.id_ejercicio] = []
    resultado[s.id_ejercicio].push({
      peso_kg:      Number(s.peso_kg)    || 0,
      repeticiones: Number(s.repeticiones) || 0,
    })
  }

  return NextResponse.json(resultado)
}
