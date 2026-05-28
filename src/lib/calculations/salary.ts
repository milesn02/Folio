import { ACTIVE_SETTINGS, SAL_LIMITS, FREQ_PERIODS } from '../constants'
import type { SalaryScheduleEntry, SalCalcResult, PeriodCalc } from '../types'
import { parseDollar } from '../utils'

function calcWageLimited(grossPer: number, ytdPrev: number, rate: number, limit: number): number {
  if (ytdPrev >= limit) return 0
  const remaining = limit - ytdPrev
  return Math.round(Math.min(grossPer, remaining) * rate * 100) / 100
}

function calcMedicare(grossPer: number, ytdPrev: number, baseRate: number, addlRate: number, threshold: number): number {
  const ytdAfter = ytdPrev + grossPer
  if (ytdAfter <= threshold) {
    return Math.round(grossPer * baseRate * 100) / 100
  }
  if (ytdPrev >= threshold) {
    return Math.round(grossPer * (baseRate + addlRate) * 100) / 100
  }
  // crosses threshold this period
  const below = threshold - ytdPrev
  const above = grossPer - below
  return Math.round((below * baseRate + above * (baseRate + addlRate)) * 100) / 100
}

export function calcPeriods(d: SalaryScheduleEntry, year: string): PeriodCalc[] {
  const ms = ACTIVE_SETTINGS[year] ?? ACTIVE_SETTINGS['2026']
  const lim = SAL_LIMITS[year] ?? SAL_LIMITS['2026']
  const periods = FREQ_PERIODS[d.freq] ?? 12
  const gross = parseDollar(d.gross)
  const grossPer = gross / periods
  const isCa = (d.state ?? 'CA') === 'CA'
  const isTrad = d.deferralType !== 'Roth'

  let deferLim = lim.deferral
  if ((d as { catchupAlt?: boolean }).catchupAlt) deferLim += lim.catchupAlt
  else if (d.catchup) deferLim += lim.catchup

  const deferRaw = parseDollar(d.deferral)
  const deferral = Math.min(deferRaw, deferLim)
  const tradDeferPer = isTrad ? deferral / periods : 0
  const rothDeferPer = isTrad ? 0 : deferral / periods

  const fedWHTot = parseDollar(d.fedWHPer)
  const stateWHTot = parseDollar(d.stateWHPer)
  const localWHTot = parseDollar(d.localWHPer)
  const fedWHPer = fedWHTot / periods
  const stateWHPer = stateWHTot / periods
  const localWHPer = localWHTot / periods

  const result: PeriodCalc[] = []
  let ytdGross = 0

  for (let i = 0; i < periods; i++) {
    const ss = calcWageLimited(grossPer, ytdGross, ms.ficaRate, ms.ficaWageLimit)
    const medicare = calcMedicare(grossPer, ytdGross, ms.medicareRate, ms.medicareAdditionalRate, ms.medicareThreshold)
    const sdi = isCa ? calcWageLimited(grossPer, ytdGross, ms.sdiRate, ms.sdiWageLimit) : 0
    const net = grossPer - tradDeferPer - rothDeferPer - fedWHPer - ss - medicare - stateWHPer - localWHPer - sdi

    result.push({
      period: i + 1,
      gross: Math.round(grossPer * 100) / 100,
      tradDefer: Math.round(tradDeferPer * 100) / 100,
      rothDefer: Math.round(rothDeferPer * 100) / 100,
      fedWH: Math.round(fedWHPer * 100) / 100,
      ss: Math.round(ss * 100) / 100,
      medicare: Math.round(medicare * 100) / 100,
      stateWH: Math.round(stateWHPer * 100) / 100,
      localWH: Math.round(localWHPer * 100) / 100,
      sdi: Math.round(sdi * 100) / 100,
      net: Math.round(net * 100) / 100,
    })

    ytdGross += grossPer
  }

  return result
}

export function calcSal(d: SalaryScheduleEntry, year: string): SalCalcResult {
  const lim = SAL_LIMITS[year] ?? SAL_LIMITS['2026']
  const periods = FREQ_PERIODS[d.freq] ?? 12
  const gross = parseDollar(d.gross)
  const grossPer = gross / periods
  const isTrad = d.deferralType !== 'Roth'

  let deferLim = lim.deferral
  if ((d as { catchupAlt?: boolean }).catchupAlt) deferLim += lim.catchupAlt
  else if (d.catchup) deferLim += lim.catchup

  const deferRaw = parseDollar(d.deferral)
  const deferral = Math.min(deferRaw, deferLim)
  const tradDefer = isTrad ? deferral : 0
  const rothDefer = isTrad ? 0 : deferral

  const fedTaxable = gross - tradDefer
  const fedWHTot = parseDollar(d.fedWHPer)
  const stateWHTot = parseDollar(d.stateWHPer)
  const localWHTot = parseDollar(d.localWHPer)
  const fedWHPer = fedWHTot / periods
  const stateWHPer = stateWHTot / periods
  const localWHPer = localWHTot / periods

  const periodCalcs = calcPeriods(d, year)
  const ssTax    = periodCalcs.reduce((s, p) => s + p.ss, 0)
  const medTax   = periodCalcs.reduce((s, p) => s + p.medicare, 0)
  const sdiTax   = periodCalcs.reduce((s, p) => s + p.sdi, 0)
  const ficaTot  = ssTax + medTax

  const net = gross - tradDefer - rothDefer - fedWHTot - ficaTot - stateWHTot - localWHTot - sdiTax

  // SS stop period (first period where ss = 0 after having been > 0)
  const ssStopIdx = periodCalcs.findIndex((p, i) => i > 0 && p.ss === 0)
  const ssStopMonth = ssStopIdx > 0 ? Math.ceil((ssStopIdx / periods) * 12) : null

  return {
    periods,
    gross,
    grossPer,
    tradDefer,
    tradDeferPer: tradDefer / periods,
    rothDefer,
    rothDeferPer: rothDefer / periods,
    fedTaxable,
    fedTaxablePer: fedTaxable / periods,
    fedWHPer,
    fedWHTot,
    ssTax,
    ssTaxPer: periodCalcs[0]?.ss ?? 0,
    medTax,
    medTaxPer: periodCalcs[0]?.medicare ?? 0,
    ficaTot,
    stateWHPer,
    stateWHTot,
    localWHPer,
    localWHTot,
    sdiTax,
    sdiTaxPer: periodCalcs[0]?.sdi ?? 0,
    net,
    netPer: periodCalcs[0]?.net ?? 0,
    deferLim,
    deferRaw,
    overLimit: deferRaw > deferLim,
    ssStopMonth,
    periodCalcs,
  }
}
