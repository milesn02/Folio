import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

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
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #1a3f28 0%, #204d31 55%, #265c3a 100%)' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(200,169,110,0.08), transparent 60%)' }}
      />

      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif text-[32px] text-white tracking-tight leading-none">Folio</span>
            <div className="w-[6px] h-[6px] rounded-full bg-accent flex-shrink-0 mb-1" />
          </div>
          <p className="text-[11px] text-white/30 uppercase tracking-[.12em] font-semibold">
            Tax Advisory Platform
          </p>
        </div>

        <div className="space-y-6">
          {[
            { label: 'Client Snapshot', desc: 'Every number, strategy, and deadline in one view.' },
            { label: 'Salary Schedules', desc: 'Model optimal S-Corp compensation in seconds.' },
            { label: 'Client-Ready PDFs', desc: 'Send polished summaries that show your value.' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex gap-3">
              <div className="w-[3px] rounded-full bg-accent/50 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white/80">{label}</p>
                <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-white/20 uppercase tracking-[.08em]">
          Secure · Encrypted · Advisor-only access
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <span className="font-serif text-[28px] text-white tracking-tight">Folio</span>
              <div className="w-[5px] h-[5px] rounded-full bg-accent flex-shrink-0" />
            </div>
          </div>

          <div
            className="rounded-xl p-8 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)' }}
          >
            <h1 className="font-serif text-[22px] text-navy tracking-tight mb-1">Sign in</h1>
            <p className="text-xs text-text-lt mb-7">Access your firm's advisory workspace.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@firm.com"
                  required
                  autoFocus
                  className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-all"
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
                  className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-all"
                />
              </div>

              {error && (
                <p className="text-[12px] text-danger bg-danger-bg border border-danger-border rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-1 h-10 rounded-md bg-navy text-white text-[13px] font-semibold hover:bg-navy/85 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {submitting ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-white/25 mt-5">
            Contact your firm administrator for access.
          </p>
        </div>
      </div>
    </div>
  )
}
