import { SAVS, CUR_YEAR } from '../constants'
import type { ClientData } from '../types'
import { parseDollar } from '../utils'

// Returns the auto-computed amount for a savings key based on data from other tabs.
// Returns null if no auto value is available (meaning user must enter manually).
export function autoSavingsAmount(k: string, c: ClientData): number | null {
  const fr = (parseFloat(c.fr) || 0) / 100
  const sr = (parseFloat(c.sr) || 0) / 100
  const rate = fr + sr

  if (k === 'aug') {
    const augustaByYear = c.augustaByYear ?? {}
    const years = Object.keys(augustaByYear).sort((a, b) => Number(b) - Number(a))
    for (const yr of years) {
      const entry = augustaByYear[yr]
      if (entry?.savings) return parseDollar(entry.savings)
      if (entry?.rec && rate > 0) return Math.round(parseDollar(entry.rec) * rate)
    }
    return null
  }

  if (k === 'sOpt') {
    const oSal = parseDollar(c.payrollByYear?.[CUR_YEAR]?.oSal)
    const corpNet = parseDollar(c.corpNet)
    const corpAdj = parseDollar(c.corpAdj)
    if (!corpNet && !corpAdj) return null
    const distrib = Math.max(0, corpNet + corpAdj - oSal)
    return distrib > 0 ? Math.round(distrib * 0.9235 * 0.153 * 0.5) : 0
  }

  if (k === 'd401') {
    const k401 = parseDollar(c.retByYear?.[CUR_YEAR]?.k401)
    if (!k401 || !rate) return null
    return Math.round(k401 * rate)
  }

  if (k === 'ps') {
    const psO = parseDollar(c.retByYear?.[CUR_YEAR]?.psO)
    if (!psO || !rate) return null
    return Math.round(psO * rate)
  }

  if (k === 'db') {
    const dbO = parseDollar(c.retByYear?.[CUR_YEAR]?.dbO)
    if (!dbO || !rate) return null
    return Math.round(dbO * rate)
  }

  if (k === 'disc') {
    const discExp = parseDollar(c.discExp)
    if (!discExp || !rate) return null
    return Math.round(discExp * rate)
  }

  return null
}

export function calcSavings(c: ClientData): number {
  return SAVS.reduce((tot, r) => {
    const auto = autoSavingsAmount(r.k, c)
    const amount = auto !== null ? auto : parseDollar(c.sav[r.k]?.a)
    return tot + amount
  }, 0)
}

export interface SavingsRow {
  key: string
  name: string
  amount: number
  barPct: number   // relative to max (for bar width)
  totPct: number   // share of total
}

export function calcSavingsRows(c: ClientData): SavingsRow[] {
  const rows = SAVS.map(r => {
    const auto = autoSavingsAmount(r.k, c)
    const amount = auto !== null ? auto : parseDollar(c.sav[r.k]?.a)
    return { key: r.k, name: r.n, amount }
  }).filter(r => r.amount > 0).sort((a, b) => b.amount - a.amount)

  const total = rows.reduce((s, r) => s + r.amount, 0)
  const maxAmt = rows[0]?.amount ?? 1

  return rows.map(r => ({
    ...r,
    barPct: Math.round((r.amount / maxAmt) * 100),
    totPct: total > 0 ? Math.round((r.amount / total) * 100) : 0,
  }))
}
