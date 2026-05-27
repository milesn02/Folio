import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'

interface InviteRow {
  id: string
  firm_id: string
  firms: { name: string }
}

const inputCls = 'w-full rounded-sm border border-border px-3 py-2 text-[13px] text-text outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors'

export default function InviteSignup() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [invite, setInvite] = useState<InviteRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setInvalid(true); setLoading(false); return }
    supabase
      .from('invites')
      .select('id, firm_id, firms(name)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) setInvalid(true)
        else setInvite(data as unknown as InviteRow)
        setLoading(false)
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!invite) return
    setError('')
    setSubmitting(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ firm_id: invite.firm_id, display_name: name, role: 'advisor' })
        .eq('id', data.user.id)

      await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id)
    }

    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-white/60 text-[13px]">Loading…</div>
    </div>
  )

  if (invalid) return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex items-baseline gap-1.5 mb-6 justify-center">
          <span className="font-serif text-[28px] text-navy tracking-tight">Folio</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent mb-1 flex-shrink-0" />
        </div>
        <p className="text-[14px] font-semibold text-text mb-2">Invalid invite link</p>
        <p className="text-[13px] text-text-lt">This link has expired or already been used. Ask your firm admin to send a new one.</p>
      </div>
    </div>
  )

  const firmName = invite?.firms?.name ?? 'your firm'

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-serif text-[28px] text-navy tracking-tight">Folio</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent mb-1 flex-shrink-0" />
        </div>
        <p className="text-[11px] text-text-lt uppercase tracking-[.08em] font-medium mb-1">
          CPA Client Portal
        </p>
        <p className="text-[12px] text-accent font-semibold mb-7">
          You've been invited to join {firmName}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Jane Smith" required className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com" required className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} className={inputCls} />
          </div>

          {error && (
            <p className="text-[12px] text-danger bg-danger-bg border border-danger-border rounded px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="default" disabled={submitting} className="w-full mt-1 h-10">
            {submitting ? 'Creating account…' : 'Create account →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
