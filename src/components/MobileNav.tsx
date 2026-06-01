'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, Zap, LogOut, Target, Trophy } from 'lucide-react'

const navItems = [
  { href: '/rutinas',   label: 'Rutinas',   icon: Dumbbell },
  { href: '/progreso',  label: 'Progreso',  icon: Target },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/records',   label: 'PRs',       icon: Trophy },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router   = useRouter()

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '52px',
        backgroundColor: '#0c0e12', borderBottom: '1px solid #1e2024',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ backgroundColor: '#b1c9e1', borderRadius: '6px', padding: '5px', display: 'flex' }}>
            <Zap style={{ width: '13px', height: '13px', color: '#0c0e12' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#e2e2e8', margin: 0, letterSpacing: '-0.01em' }}>VoltTrack</p>
        </div>
        <button
          onClick={cerrarSesion}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d9197', padding: '6px', display: 'flex', alignItems: 'center' }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0c0e12', borderTop: '1px solid #1e2024',
        display: 'flex', zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '4px', padding: '10px 0', background: 'none', border: 'none',
                cursor: 'pointer', color: active ? '#b1c9e1' : '#43474c',
                fontFamily: 'inherit', transition: 'color 0.15s',
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '10px', fontWeight: active ? '500' : '400', letterSpacing: '0.03em' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}
