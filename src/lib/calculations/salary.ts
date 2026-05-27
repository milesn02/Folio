import { SAL_LIMITS, FREQ_PERIODS } from '../constants'
import type { SalaryScheduleEntry, SalCalcResult } from '../types'
import { parseDollar } from '../utils'

export function calcSal(d: SalaryScheduleEntry, year: string): SalCalcResult {
  const lim = SAL_LIMITS[year] ?? SAL_LIMITS['2025']
  const periods = FREQ_PERIODS[d.freq] ?? 12
  const gross = parseDollar(d.gross)
  const isTrad = d.deferralType !== 'Roth'

  let deferLim = lim.deferral
  if (d.catchupAlt) deferLim += lim.catchupAlt
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

  const ssWage = Math.min(gross, lim.ssWage)
  const ssTax = ssWage * 0.062
  const medTax = gross * 0.0145
  const addMed = Math.max(0, gross - 200000) * 0.009
  const ficaTot = ssTax + medTax + addMed

  const net = gross - tradDefer - rothDefer - fedWHTot - ficaTot - stateWHTot - localWHTot
  const ssStopMonth = gross > lim.ssWage ? Math.ceil((lim.ssWage / gross) * 12) : null

  return {
    periods,
    gross,
    grossPer: gross / periods,
    tradDefer,
    tradDeferPer: tradDefer / periods,
    rothDefer,
    rothDeferPer: rothDefer / periods,
    fedTaxable,
    fedTaxablePer: fedTaxable / periods,
    fedWHPer,
    fedWHTot,
    ssTax,
    ssTaxPer: ssTax / periods,
    medTax: medTax + addMed,
    medTaxPer: (medTax + addMed) / periods,
    ficaTot,
    stateWHPer,
    stateWHTot,
    localWHPer,
    localWHTot,
    net,
    netPer: net / periods,
    deferLim,
    deferRaw,
    overLimit: deferRaw > deferLim,
    ssStopMonth,
  }
}
