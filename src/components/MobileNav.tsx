'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, Zap, LogOut, BicepsFlexed, Trophy } from 'lucide-react'

const navItems = [
  { href: '/rutinas',   label: 'Rutinas',   icon: Dumbbell },
  { href: '/progreso',  label: 'Progreso',  icon: BicepsFlexed },
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
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--mobile-top)',
        backgroundColor: 'var(--surface-deep)',
        borderBottom: '1px solid var(--border-faint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => router.push('/rutinas')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{
            backgroundColor: 'var(--accent)',
            borderRadius: '6px',
            padding: '5px',
            display: 'flex',
          }}>
            <Zap style={{ width: '12px', height: '12px', color: '#0c0e12' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            VoltTrack
          </span>
        </button>

        <button
          onClick={cerrarSesion}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '6px',
            borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center',
            transition: 'color var(--t-sm) var(--ease-out)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          aria-label="Cerrar sesión"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Bottom nav */}
      <nav
        aria-label="Navegación principal"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backgroundColor: 'var(--surface-deep)',
          borderTop: '1px solid var(--border-faint)',
          display: 'flex',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '10px 0 8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                fontFamily: 'inherit',
                transition: 'color var(--t-sm) var(--ease-out)',
                position: 'relative',
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 0, left: '20%', right: '20%',
                  height: '2px',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '0 0 2px 2px',
                }} />
              )}
              <Icon style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '9.5px', fontWeight: active ? '500' : '400', letterSpacing: '0.02em' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
