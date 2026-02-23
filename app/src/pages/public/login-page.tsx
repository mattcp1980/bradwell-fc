import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import clubBadge from '@/assets/club-badge.jpg'

export function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already authenticated — send straight to admin
  if (!authLoading && user) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/admin' },
    })

    setSubmitting(false)

    if (authError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Club branding */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={clubBadge}
            alt="Bradwell FC badge"
            className="w-20 h-20 rounded-full shadow-xl border-4 border-primary/40 mb-4"
          />
          <h1 className="font-heading text-2xl uppercase tracking-widest text-secondary-foreground">
            Bradwell FC
          </h1>
          <p className="text-secondary-foreground/50 text-sm mt-1 tracking-wide uppercase font-heading">
            Staff Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-background/5 border border-white/10 rounded-xl p-8 shadow-2xl backdrop-blur-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-lg text-secondary-foreground uppercase tracking-wide mb-2">
                Check your email
              </h2>
              <p className="text-secondary-foreground/60 text-sm leading-relaxed">
                We've sent a login link to{' '}
                <span className="text-secondary-foreground font-medium">{email}</span>.
                Click the link to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="mt-6 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-lg text-secondary-foreground uppercase tracking-wide mb-1">
                Sign in
              </h2>
              <p className="text-secondary-foreground/50 text-sm mb-6">
                Enter your email and we'll send you a magic link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-secondary-foreground/70 uppercase text-xs tracking-wider"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-secondary-foreground placeholder:text-secondary-foreground/30 focus-visible:ring-primary"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    'Send login link'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-secondary-foreground/30 text-xs mt-6">
          Only authorised club staff can sign in.
        </p>
      </div>
    </div>
  )
}
