import { useState, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Link2, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/store/uiStore'
import { Card, CardHeader, CardTitle, CardBody, Field, Button, Avatar } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { AVATAR_COLORS, MASTER_SETTINGS, CUR_YEAR } from '@/lib/constants'

export default function Settings() {
  const { user, profile, firm, loading } = useAuth()
  const { showToast } = useUiStore()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? AVATAR_COLORS[0])
  const [firmName, setFirmName] = useState(firm?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generateInvite = useCallback(async () => {
    if (!firm || !user) return
    const { data, error } = await supabase
      .from('invites')
      .insert({ firm_id: firm.id, created_by: user.id })
      .select('token')
      .single()
    if (error || !data) { showToast('Failed to generate invite', 'error'); return }
    const link = `${window.location.origin}/invite/${data.token}`
    setInviteLink(link)
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }, [firm, user, showToast])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_color: avatarColor })
      .eq('id', user.id)
    setSaving(false)
    if (error) showToast('Failed to save profile', 'error')
    else showToast('Profile saved')
  }

  async function saveFirm() {
    if (!firm) return
    setSaving(true)
    const { error } = await supabase
      .from('firms')
      .update({ name: firmName })
      .eq('id', firm.id)
    setSaving(false)
    if (error) showToast('Failed to save firm', 'error')
    else showToast('Firm settings saved')
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-text-lt hover:text-text transition-colors flex items-center gap-1.5 text-[13px]">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-[20px] text-navy tracking-tight">Folio</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent mb-0.5" />
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-[13px] text-text-lt hover:text-danger transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
        <h1 className="font-serif text-[28px] text-navy tracking-tight">Settings</h1>

        {/* Profile */}
        <Card accent>
          <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar name={displayName || user.email || '?'} size="lg" color={avatarColor} />
              <div>
                <p className="text-[13px] font-semibold text-text">{displayName || 'No name set'}</p>
                <p className="text-[12px] text-text-lt">{user.email}</p>
                <p className="text-[11px] text-text-lt mt-0.5 capitalize">{profile?.role ?? 'advisor'}</p>
              </div>
            </div>

            <Field label="Display name">
              <input className={inputCls} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </Field>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-2">Avatar color</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      background: c,
                      borderColor: avatarColor === c ? '#0f1e35' : 'transparent',
                      transform: avatarColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={saveProfile} disabled={saving} className="self-start">
              {saving ? 'Saving…' : 'Save profile'}
            </Button>
          </CardBody>
        </Card>

        {/* Firm */}
        {firm && (profile?.role === 'owner' || profile?.role === 'admin') && (
          <Card>
            <CardHeader><CardTitle>Firm Settings</CardTitle></CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Field label="Firm name">
                <input className={inputCls} value={firmName} onChange={e => setFirmName(e.target.value)} placeholder="Your firm name" />
              </Field>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-1">Plan</p>
                <span className="text-[13px] font-semibold text-navy capitalize">{firm.plan}</span>
              </div>
              <Button variant="primary" size="sm" onClick={saveFirm} disabled={saving} className="self-start">
                {saving ? 'Saving…' : 'Save firm settings'}
              </Button>

              <div className="border-t border-border pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-3">Invite Team Member</p>
                <p className="text-[13px] text-text-lt mb-3">Generate a link and send it to a colleague. They click it, create an account, and they're in.</p>
                <Button variant="default" size="sm" onClick={generateInvite} className="gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Generate invite link'}
                </Button>
                {inviteLink && (
                  <div className="mt-3 bg-surface rounded-sm border border-border px-3 py-2 text-[11px] text-text-lt font-mono break-all select-text cursor-text">
                    {inviteLink}
                  </div>
                )}
                <p className="text-[11px] text-text-lt mt-2">Links expire after 7 days and can only be used once.</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Master Tax Settings — read-only */}
        {(() => {
          const ms = MASTER_SETTINGS[CUR_YEAR] ?? MASTER_SETTINGS['2026']
          const rows: [string, string][] = [
            ['401(k) deferral limit', `$${ms.deferral.toLocaleString()}`],
            ['Catch-up age 50+', `$${ms.catchup50.toLocaleString()}`],
            ['Catch-up age 60–63', `$${ms.catchup6063.toLocaleString()}`],
            ['SS / FICA rate', `${(ms.ficaRate * 100).toFixed(1)}%`],
            ['SS wage base', `$${ms.ficaWageLimit.toLocaleString()}`],
            ['Medicare rate', `${(ms.medicareRate * 100).toFixed(2)}%`],
            ['Medicare addl. rate (>$200k)', `${(ms.medicareAdditionalRate * 100).toFixed(1)}%`],
            ['CA SDI rate', `${(ms.sdiRate * 100).toFixed(1)}%`],
          ]
          return (
            <Card>
              <CardHeader><CardTitle>Tax Constants — {CUR_YEAR}</CardTitle></CardHeader>
              <CardBody className="p-0">
                <table className="w-full text-[13px]">
                  <tbody>
                    {rows.map(([label, value], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}>
                        <td className="px-4 py-2.5 text-text-lt">{label}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-navy font-serif">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-4 py-3 text-[11px] text-text-lt border-t border-border">These values are set by the system administrator and apply to all salary schedule calculations.</p>
              </CardBody>
            </Card>
          )
        })()}

        {/* Account */}
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-text">Sign out of Folio</p>
                <p className="text-[12px] text-text-lt mt-0.5">You'll need to sign back in to access your clients.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
