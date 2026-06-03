'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function LoadingBar() {
  const pathname = usePathname()
  const [width, setWidth]   = useState(0)
  const [visible, setVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  useEffect(() => {
    clearTimers()
    setVisible(true)
    setWidth(15)
    timers.current = [
      setTimeout(() => setWidth(55), 80),
      setTimeout(() => setWidth(80), 220),
      setTimeout(() => setWidth(100), 420),
      setTimeout(() => { setVisible(false); setWidth(0) }, 680),
    ]
    return clearTimers
  }, [pathname])

  if (!visible) return null
  return (
    <div style={{
      position:  'fixed',
      top:       0,
      left:      0,
      zIndex:    9999,
      height:    '2px',
      width:     `${width}%`,
      backgroundColor: 'var(--accent)',
      transition: width === 15 ? 'none' : 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 0 8px var(--accent)',
      pointerEvents: 'none',
      borderRadius: '0 2px 2px 0',
    }} />
  )
}
