import Sidebar from '@/components/Sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', flex: 1, padding: '40px 48px', maxWidth: '1000px' }}>
        {children}
      </main>
    </div>
  )
}
