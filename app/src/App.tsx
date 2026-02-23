import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/public-layout'
import { RequireAuth } from '@/components/layout/require-auth'
import { HomePage } from '@/pages/public/home-page'
import { FixturesPage } from '@/pages/public/fixtures-page'
import { NewsPage } from '@/pages/public/news-page'
import { ParentsPage } from '@/pages/public/parents-page'
import { ParentDashboard } from '@/pages/parent/parent-dashboard'
import { AdminDashboard } from '@/pages/admin/admin-dashboard'
import { LoginPage } from '@/pages/public/login-page'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/portal" element={<ParentDashboard />} />
      </Route>

      {/* Auth-guarded routes — redirect to /login if not authenticated */}
      <Route element={<PublicLayout />}>
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}
