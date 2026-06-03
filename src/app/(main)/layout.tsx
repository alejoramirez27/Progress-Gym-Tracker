import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import LoadingBar from '@/components/LoadingBar'

// Server Component — CSS handles responsive, no SSR flash
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <LoadingBar />
      <div className="app-sidebar-wrap">
        <Sidebar />
      </div>
      <main className="app-main">
        {children}
      </main>
      <div className="app-mobile-nav">
        <MobileNav />
      </div>
    </div>
  )
}
