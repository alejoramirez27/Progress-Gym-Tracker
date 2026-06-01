'use client'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, LayoutDashboard, History, LogOut, Zap, BicepsFlexed, Trophy } from 'lucide-react'

const navItems = [
  { href: '/rutinas',   label: 'Rutinas',    icon: Dumbbell },
  { href: '/progreso',  label: 'Progreso',   icon: BicepsFlexed },
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/historial', label: 'Historial',  icon: History },
  { href: '/records',   label: 'PRs',        icon: Trophy },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const cerrarSesion = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside style={{
      width: '220px', minWidth: '220px', height: '100vh',
      backgroundColor: '#0c0e12', borderRight: '1px solid #43474c',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid #1e2024' }}>
        <div onClick={() => router.push('/rutinas')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{ backgroundColor: '#b1c9e1', borderRadius: '8px', padding: '6px', display: 'flex' }}>
            <Zap style={{ width: '16px', height: '16px', color: '#0c0e12' }} />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#e2e2e8', letterSpacing: '-0.01em' }}>VoltTrack</p>
            <p style={{ fontSize: '10px', color: '#8d9197', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Performance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon   = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                backgroundColor: active ? '#1e2024' : 'transparent',
                color: active ? '#b1c9e1' : '#8d9197',
                fontSize: '13px', fontWeight: active ? '500' : '400',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#1a1c20' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {item.label}
              {active && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#b1c9e1' }} />}
            </button>
          )
        })}
      </nav>

      {/* Cerrar sesión */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e2024' }}>
        <button
          onClick={cerrarSesion}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px', border: 'none',
            cursor: 'pointer', width: '100%', textAlign: 'left',
            backgroundColor: 'transparent', color: '#8d9197',
            fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1c20'; e.currentTarget.style.color = '#e2e2e8' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#8d9197' }}
        >
          <LogOut style={{ width: '15px', height: '15px' }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
