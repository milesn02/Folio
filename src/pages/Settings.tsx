import { useState, useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Link2, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/store/uiStore'
import { Card, CardHeader, CardTitle, CardBody, Field, Button, Avatar } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { AVATAR_COLORS, MASTER_SETTINGS, CUR_YEAR, DISPLAY_YEARS } from '@/lib/constants'
import type { MasterSettings } from '@/lib/constants'
import { setActiveTaxSettings } from '@/lib/constants'

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

  const [taxYear, setTaxYear] = useState(CUR_YEAR)
  const [taxEdits, setTaxEdits] = useState<Record<string, Record<string, string>>>({})
  const [taxSaving, setTaxSaving] = useState(false)

  function getTaxVal(key: keyof MasterSettings): string {
    const override = taxEdits[taxYear]?.[key]
    if (override !== undefined) return override
    const stored = (firm?.tax_settings as Record<string, Record<string, number>> | undefined)?.[taxYear]?.[key as string]
    if (stored !== undefined) return String(stored)
    return String(MASTER_SETTINGS[taxYear]?.[key] ?? MASTER_SETTINGS['2026'][key])
  }

  function setTaxVal(key: keyof MasterSettings, val: string) {
    setTaxEdits(prev => ({
      ...prev,
      [taxYear]: { ...(prev[taxYear] ?? {}), [key]: val },
    }))
  }

  async function saveTaxSettings() {
    if (!firm) return
    setTaxSaving(true)
    const existing = (firm.tax_settings ?? {}) as Record<string, Record<string, number>>
    const yearEdits = taxEdits[taxYear] ?? {}
    const merged: Record<string, number> = {
      ...(existing[taxYear] ?? {}),
      ...Object.fromEntries(Object.entries(yearEdits).map(([k, v]) => [k, parseFloat(v)])),
    }
    const updated = { ...existing, [taxYear]: merged }
    const { error } = await supabase.from('firms').update({ tax_settings: updated }).eq('id', firm.id)
    setTaxSaving(false)
    if (error) { showToast('Failed to save tax settings', 'error'); return }
    setActiveTaxSettings(updated)
    setTaxEdits(prev => ({ ...prev, [taxYear]: {} }))
    showToast('Tax settings saved')
  }

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

        {/* Tax Constants */}
        {firm && (profile?.role === 'owner' || profile?.role === 'admin') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Tax Constants</CardTitle>
                <div className="flex gap-1">
                  {DISPLAY_YEARS.map(y => (
                    <button key={y} onClick={() => setTaxYear(y)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${taxYear === y ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border hover:border-navy/30'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-0 p-0">
              {([
                ['deferral',               '401(k) deferral limit',          'dollar'],
                ['catchup50',              'Catch-up age 50+',                'dollar'],
                ['catchup6063',            'Catch-up age 60–63',              'dollar'],
                ['ficaRate',               'SS / FICA rate',                  'rate'],
                ['ficaWageLimit',          'SS wage base',                    'dollar'],
                ['medicareRate',           'Medicare rate',                   'rate'],
                ['medicareAdditionalRate', 'Medicare addl. rate (>$200k)',    'rate'],
                ['medicareThreshold',      'Medicare addl. threshold',        'dollar'],
                ['sdiRate',                'CA SDI rate',                     'rate'],
              ] as [keyof MasterSettings, string, 'dollar' | 'rate'][]).map(([key, label, kind], i) => (
                <div key={key} className={`flex items-center gap-4 px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-surface/50'}`}>
                  <span className="text-[13px] text-text-lt flex-1">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {kind === 'dollar' && <span className="text-[12px] text-text-lt">$</span>}
                    <input
                      className="w-24 text-right border border-border rounded px-2 py-1 text-[13px] font-semibold text-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
                      value={getTaxVal(key)}
                      onChange={e => setTaxVal(key, e.target.value)}
                    />
                    {kind === 'rate' && <span className="text-[12px] text-text-lt">× 1  (e.g. 0.062)</span>}
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-3">
                <p className="text-[11px] text-text-lt">Changes apply to all salary schedule calculations for this firm.</p>
                <Button variant="primary" size="sm" onClick={saveTaxSettings} disabled={taxSaving}>
                  {taxSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

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
