'use client'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {!isMobile && <Sidebar />}
      <main style={{
        marginLeft: isMobile ? '0' : '220px',
        flex: 1,
        padding: isMobile ? '68px 16px 88px' : '40px 48px',
        maxWidth: isMobile ? '100%' : '1000px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {children}
      </main>
      {isMobile && <MobileNav />}
    </div>
  )
}
