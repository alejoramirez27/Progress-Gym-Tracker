import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

/** Epley 1RM formula */
function calc1RM(peso: number, reps: number): number {
  if (reps === 1) return peso
  return Math.round(peso * (1 + reps / 30) * 10) / 10
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  // Get all exercises of the user
  const { data: rutinas } = await supabase
    .from('rutina')
    .select('id_rutina')
    .eq('id_usuario', session.id)

  const ids_rutinas = (rutinas ?? []).map(r => r.id_rutina)
  if (ids_rutinas.length === 0) return NextResponse.json([])

  const { data: ejercicios } = await supabase
    .from('ejercicio')
    .select('id_ejercicio, nombre')
    .in('id_rutina', ids_rutinas)

  const ids_ejercicios = (ejercicios ?? []).map(e => e.id_ejercicio)
  if (ids_ejercicios.length === 0) return NextResponse.json([])

  // Get all series with weight and reps
  const { data: series } = await supabase
    .from('serie')
    .select('id_ejercicio, fecha, peso_kg, repeticiones')
    .in('id_ejercicio', ids_ejercicios)
    .not('peso_kg', 'is', null)
    .gt('repeticiones', 0)
    .order('fecha')

  if (!series || series.length === 0) return NextResponse.json([])

  // Group by exercise → by date → max 1RM per day
  type DayRM = { fecha: string; rm1: number }
  const porEjercicio: Record<string, DayRM[]> = {}
  const conteoEj: Record<string, number> = {}

  for (const s of series) {
    const rm = calc1RM(Number(s.peso_kg), s.repeticiones)
    if (!porEjercicio[s.id_ejercicio]) {
      porEjercicio[s.id_ejercicio] = []
      conteoEj[s.id_ejercicio] = 0
    }
    conteoEj[s.id_ejercicio]++
    // Max 1RM for that day
    const existing = porEjercicio[s.id_ejercicio].find(d => d.fecha === s.fecha)
    if (existing) {
      if (rm > existing.rm1) existing.rm1 = rm
    } else {
      porEjercicio[s.id_ejercicio].push({ fecha: s.fecha, rm1: rm })
    }
  }

  // Sort by series count and take top 3
  const top3 = Object.entries(conteoEj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id_ejercicio]) => {
      const ej = (ejercicios ?? []).find(e => e.id_ejercicio === id_ejercicio)
      return {
        id_ejercicio,
        nombre: ej?.nombre ?? '—',
        datos: (porEjercicio[id_ejercicio] ?? []).sort((a, b) => a.fecha.localeCompare(b.fecha)),
      }
    })

  return NextResponse.json(top3)
}
