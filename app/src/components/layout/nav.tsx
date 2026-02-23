import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function Nav() {
  const { user, role } = useAuth()

  return (
    <nav>
      <Link to="/">Bradwell FC</Link>
      <Link to="/fixtures">Fixtures</Link>
      <Link to="/news">News</Link>
      {user && role === 'parent' && <Link to="/portal">My Portal</Link>}
      {user && role === 'official' && <Link to="/admin">Admin</Link>}
      {!user && <Link to="/login">Log in</Link>}
    </nav>
  )
}
