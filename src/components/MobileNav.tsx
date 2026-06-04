'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, Zap, LogOut, BicepsFlexed, Trophy, User, Scale } from 'lucide-react'

// 6 items that fit comfortably in the bottom bar
const navItems = [
  { href: '/progreso',  label: 'Progreso',  icon: BicepsFlexed },
  { href: '/rutinas',   label: 'Rutinas',   icon: Dumbbell },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/records',   label: 'PRs',       icon: Trophy },
  { href: '/perfil',    label: 'Perfil',    icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router   = useRouter()

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <>
      {/* Top bar — height grows to cover iOS notch / Dynamic Island */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        /* base height + safe-area-inset-top so content clears notch */
        height: 'calc(var(--mobile-top) + env(safe-area-inset-top, 0px))',
        backgroundColor: 'var(--surface-deep)',
        borderBottom: '1px solid var(--border-faint)',
        display: 'flex',
        alignItems: 'flex-end',   /* pin content to the bottom of the bar */
        justifyContent: 'space-between',
        /* horizontal padding respects landscape safe areas */
        padding: '0 max(16px, env(safe-area-inset-right, 16px)) 0 max(16px, env(safe-area-inset-left, 16px))',
        paddingBottom: '10px',
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
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
            <Zap style={{ width: '12px', height: '12px', color: '#ffffff' }} />
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
          /* Respect home-bar safe area on iPhones without clipping it */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft:  'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
                justifyContent: 'center',
                gap: '3px',
                /* min 48px tall for comfortable touch (Android 48dp / iOS 44pt) */
                minHeight: '48px',
                padding: '8px 4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                fontFamily: 'inherit',
                transition: 'color var(--t-sm) var(--ease-out)',
                position: 'relative',
                touchAction: 'manipulation',
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 0, left: '25%', right: '25%',
                  height: '2px',
                  backgroundColor: 'var(--accent)',
                  borderRadius: '0 0 2px 2px',
                }} />
              )}
              <Icon style={{ width: '19px', height: '19px' }} />
              {/* 11px — Apple HIG minimum for legible labels */}
              <span style={{ fontSize: '11px', fontWeight: active ? '600' : '400', letterSpacing: '0.01em' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
