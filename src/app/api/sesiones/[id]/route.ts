import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET /api/sesiones/:id → detalle de una sesión con sus series agrupadas por ejercicio
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  // Verificar que la sesión pertenece al usuario
  const { data: sesion, error: errSesion } = await supabase
    .from('sesion')
    .select('id_sesion, fecha, notas, rutina:id_rutina(nombre)')
    .eq('id_sesion', id)
    .eq('id_usuario', session.id)
    .single()

  if (errSesion || !sesion)
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })

  // Series de esta sesión con nombre del ejercicio
  const { data: series } = await supabase
    .from('serie')
    .select('id_serie, id_ejercicio, numero_serie, peso_kg, repeticiones, rir, notas')
    .eq('id_sesion', id)
    .order('id_ejercicio')
    .order('numero_serie')

  // Ejercicios involucrados
  const ids_ej = [...new Set((series ?? []).map(s => s.id_ejercicio))]
  const { data: ejercicios } = ids_ej.length > 0
    ? await supabase.from('ejercicio').select('id_ejercicio, nombre, orden').in('id_ejercicio', ids_ej)
    : { data: [] }

  // Agrupar series por ejercicio
  const porEjercicio = (ejercicios ?? [])
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map(ej => ({
      nombre: ej.nombre,
      series: (series ?? []).filter(s => s.id_ejercicio === ej.id_ejercicio),
    }))

  return NextResponse.json({ sesion, ejercicios: porEjercicio })
}

// DELETE /api/sesiones/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('sesion')
    .delete()
    .eq('id_sesion', id)
    .eq('id_usuario', session.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
