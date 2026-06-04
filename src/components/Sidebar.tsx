'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, LogOut, Zap, BicepsFlexed, Trophy, User, Scale } from 'lucide-react'

const navItems = [
  { href: '/rutinas',   label: 'Rutinas',    icon: Dumbbell },
  { href: '/progreso',  label: 'Progreso',   icon: BicepsFlexed },
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/historial', label: 'Historial',  icon: History },
  { href: '/records',   label: 'PRs',        icon: Trophy },
  { href: '/peso',      label: 'Peso',       icon: Scale },
  { href: '/perfil',    label: 'Perfil',     icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <aside style={{
      width: '100%',
      height: '100dvh',
      backgroundColor: 'var(--surface-deep)',
      borderRight: '1px solid var(--border-faint)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Logo */}
      <div
        onClick={() => router.push('/rutinas')}
        style={{
          padding: '20px 16px 18px',
          borderBottom: '1px solid var(--border-faint)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'opacity var(--t-sm) var(--ease-out)',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{
          backgroundColor: 'var(--accent)',
          borderRadius: 'var(--r-md)',
          padding: '6px',
          display: 'flex',
          flexShrink: 0,
        }}>
          <Zap style={{ width: '14px', height: '14px', color: '#0c0e12' }} />
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            VoltTrack
          </p>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>
            Performance
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Navegación principal" style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: 'var(--r-md)',
                border: `1px solid ${active ? 'color-mix(in srgb, var(--accent) 22%, var(--border-subtle))' : 'var(--border-faint)'}`,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                backgroundColor: active
                  ? 'color-mix(in srgb, var(--accent) 7%, var(--surface-raised))'
                  : 'var(--surface-raised)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: active ? '500' : '400',
                fontFamily: 'inherit',
                transition: 'background-color var(--t-sm) var(--ease-out), color var(--t-sm) var(--ease-out), border-color var(--t-sm) var(--ease-out)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-high)'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-raised)'
                  e.currentTarget.style.borderColor = 'var(--border-faint)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon style={{ width: '14px', height: '14px', flexShrink: 0, opacity: active ? 1 : 0.6 }} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border-faint)' }}>
        <button
          onClick={cerrarSesion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border-faint)',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            backgroundColor: 'var(--surface-raised)',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
            fontFamily: 'inherit',
            transition: 'background-color var(--t-sm) var(--ease-out), color var(--t-sm) var(--ease-out), border-color var(--t-sm) var(--ease-out)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--error) 8%, var(--surface-raised))'
            e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--error) 30%, var(--border-subtle))'
            e.currentTarget.style.color = 'var(--error)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--surface-raised)'
            e.currentTarget.style.borderColor = 'var(--border-faint)'
            e.currentTarget.style.color = 'var(--text-tertiary)'
          }}
        >
          <LogOut style={{ width: '14px', height: '14px', opacity: 0.6 }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
