import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'

export default function Login() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-serif text-[28px] text-navy tracking-tight">Folio</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent mb-1 flex-shrink-0" />
        </div>
        <p className="text-[11px] text-text-lt uppercase tracking-[.08em] font-medium mb-7">
          CPA Client Portal
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-sm border border-border px-3 py-2 text-[13px] text-text outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e) }}
              className="w-full rounded-sm border border-border px-3 py-2 text-[13px] text-text outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-danger bg-danger-bg border border-danger-border rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="default" disabled={submitting} className="w-full mt-1 h-10">
            {submitting ? 'Signing in…' : 'Sign in →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
