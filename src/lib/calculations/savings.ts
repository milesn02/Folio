import { SAVS, CUR_YEAR, ACTIVE_SETTINGS } from '../constants'
import type { ClientData } from '../types'
import { parseDollar } from '../utils'

// Returns the auto-computed amount for a savings key based on data from other tabs.
// Returns null if no auto value is available (meaning user must enter manually).
export function autoSavingsAmount(k: string, c: ClientData, year = CUR_YEAR): number | null {
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
    const oSal = parseDollar(c.payrollByYear?.[year]?.oSal)
    const corpNet = parseDollar(c.corpNet)
    const corpAdj = parseDollar(c.corpAdj)
    if (!corpNet && !corpAdj) return null
    const distrib = Math.max(0, corpNet + corpAdj - oSal)
    if (distrib <= 0) return 0
    // FICA avoided on distributions: SS (12.4% combined) up to wage base, Medicare (2.9%) always
    const ms = ACTIVE_SETTINGS[year] ?? ACTIVE_SETTINGS['2026']
    const ssRemaining = Math.max(0, ms.ficaWageLimit - oSal)
    const ssSavings = Math.min(distrib, ssRemaining) * (ms.ficaRate * 2)
    const medicareSavings = distrib * (ms.medicareRate * 2)
    return Math.round(ssSavings + medicareSavings)
  }

  if (k === 'd401') {
    const k401 = parseDollar(c.retByYear?.[year]?.k401)
    if (!k401 || !rate) return null
    return Math.round(k401 * rate)
  }

  if (k === 'ps') {
    const ret = c.retByYear?.[year]
    const total = parseDollar(ret?.psO) + parseDollar(ret?.psS) + parseDollar(ret?.psE)
    if (!total || !rate) return null
    return Math.round(total * rate)
  }

  if (k === 'db') {
    const ret = c.retByYear?.[year]
    const total = parseDollar(ret?.dbO) + parseDollar(ret?.dbS) + parseDollar(ret?.dbE)
    if (!total || !rate) return null
    return Math.round(total * rate)
  }

  if (k === 'disc') {
    const discExp = parseDollar(c.discExp)
    if (!discExp || !rate) return null
    return Math.round(discExp * rate)
  }

  return null
}

export function calcSavings(c: ClientData, year = CUR_YEAR): number {
  return SAVS.reduce((tot, r) => {
    const auto = autoSavingsAmount(r.k, c, year)
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

export function calcSavingsRows(c: ClientData, year = CUR_YEAR): SavingsRow[] {
  const rows = SAVS.map(r => {
    const auto = autoSavingsAmount(r.k, c, year)
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
