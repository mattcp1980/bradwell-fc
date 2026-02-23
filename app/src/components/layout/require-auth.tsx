import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

/**
 * Wraps routes that require an authenticated session.
 * Redirects unauthenticated users to /login while preserving the intended destination.
 * Shows nothing while the auth state is loading to avoid a flash of the login page.
 */
export function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
