import { Outlet } from 'react-router-dom'
import { Header } from './header'
import { Footer } from './footer'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
