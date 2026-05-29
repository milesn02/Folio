import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'


export default function Login() {
  const { user, loading } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
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
    <div className="min-h-[100dvh] flex">

      {/* ── Left: brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between flex-shrink-0 p-12 relative"
        style={{ width: '42%', background: 'linear-gradient(160deg, #1a3f28 0%, #0f2318 100%)' }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
            opacity: 0.04,
          }}
        />

        {/* Ambient glow — gold, top-right */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '420px', height: '420px',
            top: '-15%', right: '-15%',
            background: 'radial-gradient(circle, rgba(200,169,110,0.10) 0%, transparent 68%)',
            animation: 'ambient-drift 13s ease-in-out infinite',
          }}
        />
        {/* Ambient glow — green, bottom-left */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '340px', height: '340px',
            bottom: '0%', left: '-8%',
            background: 'radial-gradient(circle, rgba(38,92,58,0.55) 0%, transparent 68%)',
            animation: 'ambient-drift-2 17s ease-in-out infinite',
          }}
        />

        {/* Wordmark */}
        <div className="relative" style={{ animation: 'enter 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif text-white leading-none" style={{ fontSize: '40px', letterSpacing: '-1px' }}>
              Folio
            </span>
            <div className="rounded-full bg-accent flex-shrink-0" style={{ width: '7px', height: '7px', marginBottom: '6px' }} />
          </div>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
            Tax Advisory Platform
          </p>
        </div>

        {/* Editorial statement — centered in the remaining space */}
        <div className="relative flex-1 flex items-center" style={{ animation: 'enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both' }}>
          <p
            className="font-serif leading-[1.12]"
            style={{ fontSize: '38px', color: 'rgba(255,255,255,0.42)', letterSpacing: '-0.75px' }}
          >
            Know every<br />
            number.<br />
            Show every<br />
            result.
          </p>
        </div>

        {/* Footer */}
        <p className="relative text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.2)', animation: 'enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
          Secure · Encrypted · Advisor access only
        </p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#f8f9f6' }}>
        <div className="w-full" style={{ maxWidth: '360px', animation: 'enter 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Mobile-only wordmark */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="font-serif leading-none" style={{ fontSize: '32px', letterSpacing: '-0.5px', color: '#1a3f28' }}>
              Folio
            </span>
            <div className="rounded-full bg-accent flex-shrink-0" style={{ width: '6px', height: '6px', marginBottom: '4px' }} />
          </div>

          <h1 className="font-sans font-semibold text-text mb-1" style={{ fontSize: '22px', letterSpacing: '-0.3px' }}>
            Sign in
          </h1>
          <p className="text-[13px] text-text-lt mb-8">
            Access your advisory workspace.
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
                placeholder="you@firm.com"
                required
                autoFocus
                style={{ height: '44px' }}
                className="w-full rounded-[10px] border border-border bg-surface px-4 text-[14px] text-text placeholder:text-text-xs outline-none transition-all hover:border-border-dk focus:border-accent/70 focus:ring-2 focus:ring-accent/15"
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
                style={{ height: '44px' }}
                className="w-full rounded-[10px] border border-border bg-surface px-4 text-[14px] text-text placeholder:text-text-xs outline-none transition-all hover:border-border-dk focus:border-accent/70 focus:ring-2 focus:ring-accent/15"
              />
            </div>

            {error && (
              <p className="text-[12px] text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-1 font-semibold text-white bg-navy hover:bg-navy-md rounded-[10px] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ height: '46px', fontSize: '14px' }}
            >
              {submitting ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="text-center mt-7 text-[11px] text-text-xs">
            Contact your administrator for access.
          </p>
        </div>
      </div>

    </div>
  )
}
