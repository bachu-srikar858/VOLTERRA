import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useSEO } from '@/lib/seo'

export default function ForgotPassword() {
  useSEO('Reset Password', 'Reset your VOLTERRA account password.')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email linked to your account and we'll send you a reset link."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-volt-black underline-offset-4 hover:underline">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="border border-volt-line bg-volt-smoke/60 p-6 text-center">
          <MailCheck className="mx-auto size-8 text-volt-orange" />
          <p className="mt-3 text-sm font-semibold">Check your inbox</p>
          <p className="mt-1 text-sm text-volt-graphite/70">
            If an account exists for <strong>{email}</strong>, a password reset link is on its way.
          </p>
          {!import.meta.env.VITE_SUPABASE_URL && (
            <p className="mt-4 text-xs text-volt-graphite/50">
              Demo mode: no email is actually sent. Return to sign-in when you're ready.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" id="fp-email" error={error}>
            <Input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
