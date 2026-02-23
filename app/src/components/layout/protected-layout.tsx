import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types'

interface ProtectedLayoutProps {
  requiredRole: UserRole
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  public: 0,
  parent: 1,
  official: 2,
}

export function ProtectedLayout({ requiredRole }: ProtectedLayoutProps) {
  const { user, role, loading } = useAuth()

  if (loading) return null

  if (!user || role === null) {
    return <Navigate to="/login" replace />
  }

  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
