'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, BicepsFlexed, Trophy, User, Scale, History, MoreHorizontal, X, Zap, LogOut } from 'lucide-react'

// 5 primary tabs always visible
const primaryItems = [
  { href: '/rutinas',   label: 'Rutinas',    icon: Dumbbell },
  { href: '/progreso',  label: 'Progreso',   icon: BicepsFlexed },
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/records',   label: 'PRs',        icon: Trophy },
  { href: '/perfil',    label: 'Perfil',     icon: User },
]

// Overflow items shown in the "Más" bottom sheet
const moreItems = [
  { href: '/peso',      label: 'Peso corporal', icon: Scale },
  { href: '/historial', label: 'Historial',     icon: History },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const navigate = (href: string) => {
    setSheetOpen(false)
    router.push(href)
  }

  // "Más" tab is active when current path is one of the overflow items
  const moreActive = moreItems.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))

  return (
    <>
      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'calc(var(--mobile-top) + env(safe-area-inset-top, 0px))',
        backgroundColor: 'var(--surface-deep)',
        borderBottom: '1px solid var(--border-faint)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 max(16px, env(safe-area-inset-right, 16px)) 0 max(16px, env(safe-area-inset-left, 16px))',
        paddingBottom: '10px',
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <button
          onClick={() => router.push('/rutinas')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div style={{ backgroundColor: 'var(--accent)', borderRadius: '6px', padding: '5px', display: 'flex' }}>
            <Zap style={{ width: '12px', height: '12px', color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>VoltTrack</span>
        </button>

        <button
          onClick={cerrarSesion}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '6px', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', transition: 'color var(--t-sm) var(--ease-out)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          aria-label="Cerrar sesión"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* ── Bottom nav ── */}
      <nav
        aria-label="Navegación principal"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backgroundColor: 'var(--surface-deep)',
          borderTop: '1px solid var(--border-faint)',
          display: 'flex',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft:  'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {primaryItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '3px', minHeight: '48px', padding: '8px 4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                fontFamily: 'inherit', transition: 'color var(--t-sm) var(--ease-out)',
                position: 'relative', touchAction: 'manipulation',
              }}
            >
              {active && (
                <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '2px', backgroundColor: 'var(--accent)', borderRadius: '0 0 2px 2px' }} />
              )}
              <Icon style={{ width: '19px', height: '19px' }} />
              <span style={{ fontSize: '11px', fontWeight: active ? '600' : '400', letterSpacing: '0.01em' }}>{item.label}</span>
            </button>
          )
        })}

        {/* "Más" tab */}
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '3px', minHeight: '48px', padding: '8px 4px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: moreActive ? 'var(--accent)' : 'var(--text-tertiary)',
            fontFamily: 'inherit', transition: 'color var(--t-sm) var(--ease-out)',
            position: 'relative', touchAction: 'manipulation',
          }}
        >
          {moreActive && (
            <span style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '2px', backgroundColor: 'var(--accent)', borderRadius: '0 0 2px 2px' }} />
          )}
          <MoreHorizontal style={{ width: '19px', height: '19px' }} />
          <span style={{ fontSize: '11px', fontWeight: moreActive ? '600' : '400', letterSpacing: '0.01em' }}>Más</span>
        </button>
      </nav>

      {/* ── Bottom sheet backdrop ── */}
      {sheetOpen && (
        <div
          onClick={() => setSheetOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Bottom sheet panel ── */}
      <div style={{
        position: 'fixed', left: 0, right: 0,
        bottom: sheetOpen ? 0 : '-100%',
        zIndex: 61,
        backgroundColor: 'var(--surface-base)',
        borderTop: '1px solid var(--border-faint)',
        borderRadius: '20px 20px 0 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        transition: 'bottom 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Handle + header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 8px' }}>
          <div style={{ width: '36px', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '10px' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>Más secciones</span>
          <button
            onClick={() => setSheetOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', display: 'flex', borderRadius: '6px' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 12px 12px' }}>
          {moreItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon   = item.icon
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 12px',
                  background: active ? 'var(--accent-dim, rgba(45,127,173,0.08))' : 'none',
                  border: 'none', cursor: 'pointer', borderRadius: '12px',
                  color: active ? 'var(--accent)' : 'var(--text-primary)',
                  fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background var(--t-sm) var(--ease-out)',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: active ? 'var(--accent)' : 'var(--surface-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: active ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: active ? '#fff' : 'var(--text-secondary)' }} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: active ? '600' : '500' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
