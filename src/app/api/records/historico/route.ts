import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const id_ejercicio = req.nextUrl.searchParams.get('id_ejercicio')
  if (!id_ejercicio) return NextResponse.json({ error: 'Falta id_ejercicio' }, { status: 400 })

  const supabase = createServiceClient()

  // Verify the exercise belongs to the user
  const { data: ej } = await supabase
    .from('ejercicio')
    .select('id_ejercicio, nombre, id_rutina')
    .eq('id_ejercicio', id_ejercicio)
    .single()

  if (!ej) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const { data: rutina } = await supabase
    .from('rutina')
    .select('id_rutina')
    .eq('id_rutina', ej.id_rutina)
    .eq('id_usuario', session.id)
    .single()

  if (!rutina) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 })

  // Get all series for this exercise ordered by date
  const { data: series } = await supabase
    .from('serie')
    .select('peso_kg, repeticiones, fecha')
    .eq('id_ejercicio', id_ejercicio)
    .not('peso_kg', 'is', null)
    .order('fecha', { ascending: true })

  if (!series || series.length === 0) return NextResponse.json([])

  // Group by date: keep only the max weight per day
  const byDate: Record<string, { peso_kg: number; repeticiones: number; fecha: string }> = {}
  for (const s of series) {
    const fecha = s.fecha.split('T')[0]
    const peso  = Number(s.peso_kg)
    if (!byDate[fecha] || peso > byDate[fecha].peso_kg) {
      byDate[fecha] = { peso_kg: peso, repeticiones: s.repeticiones, fecha }
    }
  }

  const puntos = Object.values(byDate).sort((a, b) => a.fecha.localeCompare(b.fecha))
  return NextResponse.json(puntos)
}
