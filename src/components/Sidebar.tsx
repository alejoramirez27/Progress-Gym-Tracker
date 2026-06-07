'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, LogOut, Zap, BicepsFlexed, Trophy, User, Scale } from 'lucide-react'

const navItems = [
  { href: '/rutinas',   label: 'Rutinas',    icon: Dumbbell,        key2: 'r' },
  { href: '/progreso',  label: 'Progreso',   icon: BicepsFlexed,    key2: 'p' },
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard, key2: 'd' },
  { href: '/historial', label: 'Historial',  icon: History,         key2: 'h' },
  { href: '/records',   label: 'PRs',        icon: Trophy,          key2: 'k' },
  { href: '/peso',      label: 'Peso',       icon: Scale,           key2: 'w' },
  { href: '/perfil',    label: 'Perfil',     icon: User,            key2: 'u' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const [tooltipY, setTooltipY]       = useState(0)

  // Keyboard navigation: press G then a key to navigate
  useEffect(() => {
    let waitingForKey = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (!waitingForKey) {
        if (e.key === 'g') {
          waitingForKey = true
          timer = setTimeout(() => { waitingForKey = false }, 1500)
        }
      } else {
        waitingForKey = false
        if (timer) clearTimeout(timer)
        const match = navItems.find(i => i.key2 === e.key)
        if (match) { e.preventDefault(); router.push(match.href) }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

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
          <Zap style={{ width: '14px', height: '14px', color: '#ffffff' }} />
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
      {/* Floating tooltip */}
      {hoveredHref && (
        <div style={{
          position: 'fixed',
          left: '228px',
          top: tooltipY,
          transform: 'translateY(-50%)',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          padding: '5px 10px',
          fontSize: '12px',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          zIndex: 200,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          animation: 'fadeUp 0.12s ease both',
        }}>
          {navItems.find(i => i.href === hoveredHref)?.label}
          <kbd style={{
            fontSize: '10px',
            color: 'var(--text-disabled)',
            backgroundColor: 'var(--surface-raised)',
            padding: '2px 5px',
            borderRadius: '3px',
            border: '1px solid var(--border-faint)',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.03em',
          }}>
            g {navItems.find(i => i.href === hoveredHref)?.key2}
          </kbd>
        </div>
      )}

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
                const rect = e.currentTarget.getBoundingClientRect()
                setHoveredHref(item.href)
                setTooltipY(rect.top + rect.height / 2)
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-raised)'
                  e.currentTarget.style.borderColor = 'var(--border-faint)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
                setHoveredHref(null)
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
