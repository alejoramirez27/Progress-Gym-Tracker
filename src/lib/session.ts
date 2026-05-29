import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('gym_session')?.value
  if (!raw) return null
  try { return JSON.parse(raw) as { id: string; nombre: string; email: string } }
  catch { return null }
}
