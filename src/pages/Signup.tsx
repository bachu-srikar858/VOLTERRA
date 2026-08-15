import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, User } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { useSEO } from '@/lib/seo'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function Signup() {
  useSEO('Join VOLTERRA', 'Create a free VOLTERRA account for wishlists, order tracking and early access to new drops.')
  const { refreshSession, toast } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await api.signUp(email, password, name.trim())
      await refreshSession()
      toast('Welcome to VOLTERRA — let\'s get moving')
      navigate('/account')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    if (!isSupabaseConfigured) {
      toast('Google sign-up requires Supabase configuration. Use email sign-up instead.', 'error')
      return
    }
    await api.signInWithGoogle()
  }

  return (
    <AuthShell
      title="Join VOLTERRA"
      subtitle="Create a free account for wishlists, order tracking and early access to drops."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-volt-black underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={google}
        className="flex w-full items-center justify-center gap-3 border border-volt-line py-3.5 text-sm font-semibold transition-colors hover:border-volt-black"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <div className="my-6 flex items-center gap-4 text-xs text-volt-graphite/50">
        <span className="h-px flex-1 bg-volt-line" aria-hidden />
        or
        <span className="h-px flex-1 bg-volt-line" aria-hidden />
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" id="su-name" error={error ? ' ' : undefined}>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-volt-graphite/40" />
            <Input id="su-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Smith" className="pl-10" />
          </div>
        </Field>
        <Field label="Email" id="su-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-volt-graphite/40" />
            <Input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" />
          </div>
        </Field>
        <Field label="Password" id="su-password" error={error}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-volt-graphite/40" />
            <Input id="su-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="pl-10" />
          </div>
        </Field>
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-volt-graphite/50">
          By joining you agree to the VOLTERRA Terms of Use and Privacy Policy.
          <br />
          Demo mode: accounts are stored locally in your browser.
        </p>
      </form>
    </AuthShell>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
}
