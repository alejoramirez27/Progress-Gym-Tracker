import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  // Validate type and size (max 5 MB)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type))
    return NextResponse.json({ error: 'Formato no válido. Usa JPG, PNG o WebP' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: 'La imagen no puede superar 5 MB' }, { status: 400 })

  const supabase = createServiceClient()

  const ext      = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const filePath = `${session.id}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  // Upload (upsert) to Supabase Storage bucket "avatars"
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Cache-bust so the browser doesn't show the old photo
  const urlWithBust = `${publicUrl}?t=${Date.now()}`

  // Save URL in usuario table
  const { error: dbError } = await supabase
    .from('usuario')
    .update({ foto_perfil: urlWithBust })
    .eq('id_usuario', session.id)

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ url: urlWithBust })
}

export async function DELETE() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServiceClient()

  // Try to remove both extensions
  await Promise.allSettled([
    supabase.storage.from('avatars').remove([`${session.id}.jpg`]),
    supabase.storage.from('avatars').remove([`${session.id}.png`]),
    supabase.storage.from('avatars').remove([`${session.id}.webp`]),
  ])

  await supabase.from('usuario').update({ foto_perfil: null }).eq('id_usuario', session.id)

  return NextResponse.json({ ok: true })
}
