import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types'

interface RequireAuthProps {
  /** Roles permitted to access this route. Admin always has access to coach routes too. */
  allowedRoles: UserRole[]
}

/**
 * Wraps routes that require an authenticated session with a specific role.
 * - Redirects unauthenticated users to /login
 * - Redirects authenticated users without the required role to /login
 * - Shows nothing while auth state is loading to avoid a flash
 * - Admin role implicitly satisfies any allowedRoles check
 */
export function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, role, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  // Admin can access everything (coach routes included)
  const permitted = role === 'admin' || (!!role && allowedRoles.includes(role))
  if (!permitted) return <Navigate to="/login" replace />

  return <Outlet />
}
