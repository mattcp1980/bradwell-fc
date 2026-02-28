import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/types'

interface AuthState {
  user: User | null
  role: UserRole | null  // null = authenticated but no recognised role
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const navigate = useNavigate()
  const [state, setState] = useState<Omit<AuthState, 'signOut'>>({
    user: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(user: User) {
    // Role is determined by the club_officials record matching the signed-in email.
    // If no matching record exists, the user has no access to protected areas.
    const { data } = await supabase
      .from('club_officials')
      .select('role')
      .eq('email', user.email ?? '')
      .single()

    const official = data as { role: UserRole } | null

    setState({
      user,
      role: official?.role ?? null,
      loading: false,
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return { ...state, signOut }
}
