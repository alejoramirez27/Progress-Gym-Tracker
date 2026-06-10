'use client'
import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

export default function PushNotifications() {
  const [supported, setSupported]   = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setSupported(true)
    setPermission(Notification.permission)

    navigator.serviceWorker.register('/sw.js').catch(() => {})

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    })
  }, [])

  if (!supported) return null

  async function toggle() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
          await sub.unsubscribe()
        }
        setSubscribed(false)
        toast.success('Notificaciones desactivadas')
      } else {
        const perm = await Notification.requestPermission()
        setPermission(perm)
        if (perm !== 'granted') {
          toast.error('Permiso denegado. Actívalas desde los ajustes del navegador.')
          return
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub),
        })
        setSubscribed(true)
        toast.success('Notificaciones activadas — te avisaremos si tu racha está en riesgo')
      }
    } catch {
      toast.error('No se pudo cambiar las notificaciones')
    } finally {
      setLoading(false)
    }
  }

  if (permission === 'denied') return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px', borderRadius: 'var(--r-md)',
        border: `1px solid ${subscribed ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'}`,
        backgroundColor: subscribed ? 'color-mix(in srgb, var(--accent) 8%, var(--surface-raised))' : 'var(--surface-raised)',
        color: subscribed ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: '13px', fontWeight: '500', fontFamily: 'inherit',
        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.15s',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {subscribed
        ? <><Bell style={{ width: '14px', height: '14px' }} /> Notificaciones activas</>
        : <><BellOff style={{ width: '14px', height: '14px' }} /> Activar notificaciones</>
      }
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const arr     = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer
}
