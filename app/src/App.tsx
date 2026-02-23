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
      {/* Public routes — no auth required */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/fixtures" element={<FixturesPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/parents" element={<ParentsPage />} />
      </Route>

      {/* Standalone full-screen login — no header/footer */}
      <Route path="/login" element={<LoginPage />} />

      {/* Coach portal — admin and coach roles */}
      <Route element={<PublicLayout />}>
        <Route element={<RequireAuth allowedRoles={['admin', 'coach']} />}>
          <Route path="/portal" element={<ParentDashboard />} />
        </Route>
      </Route>

      {/* Admin dashboard — admin role only */}
      <Route element={<PublicLayout />}>
        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  )
}
