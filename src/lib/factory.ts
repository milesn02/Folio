import { SKS, SAVS, YEARS } from './constants'
import type {
  ClientData, StrategyMap, SavingsMap, PayData,
  RetirementYear, PayrollYear, EntityPayData, RothYear,
} from './types'

export function mkPayData(): PayData {
  return {
    cFed: '', cCA: '',
    q1f: '', q1a: false, q1v: false,
    q1c: '', q1ca: false, q1cv: false,
    q2f: '', q2a: false, q2v: false,
    q2c: '', q2ca: false, q2cv: false,
    q3f: '', q3a: false, q3v: false,
    q3c: '', q3ca: false, q3cv: false,
    q4f: '', q4a: false, q4v: false,
    q4c: '', q4ca: false, q4cv: false,
    q1f26: '', q1f26a: false, q1f26v: false, q1f26acct: '',
    q2f26: '', q2f26a: false, q2f26v: false, q2f26acct: '',
    q3f26: '', q3f26a: false, q3f26v: false, q3f26acct: '',
    q4f26: '', q4f26a: false, q4f26v: false, q4f26acct: '',
    q1c26: '', q1c26a: false, q1c26v: false, q1c26acct: '',
    q2c26: '', q2c26a: false, q2c26v: false, q2c26acct: '',
    q3c26: '', q3c26a: false, q3c26v: false, q3c26acct: '',
    q4c26: '', q4c26a: false, q4c26v: false, q4c26acct: '',
  }
}

export function mkEntityPayData(): EntityPayData {
  return {
    xQ1: '', xQ1a: false, xQ1v: false,
    xQ2: '', xQ2a: false, xQ2v: false,
    xQ3: '', xQ3a: false, xQ3v: false,
    xQ4: '', xQ4a: false, xQ4v: false,
    pJ: '',  pJa: false,  pJv: false,
    pD: '',  pDa: false,  pDv: false,
  }
}

export function mkRetYear(): RetirementYear {
  return {
    oSal: '', fWH: '', cWH: '', k401: '', k401t: 'Traditional',
    psO: '', dbO: '', psS: '', dbS: '', psE: '', dbE: '',
    pre: '', preD: '', ext: 'N', s26: '', k26: '', cu26: '',
  }
}

export function mkPayrollYear(): PayrollYear {
  return { oSal: '', fWH: '', cWH: '', k401: '', k401t: 'Traditional', family: [] }
}

export function mkRothYear(): RothYear {
  return {
    contribAmt: '', contribDate: '', contribDone: false,
    convAmt: '', convDate: '', convDone: false,
    institution: '', acct: '',
    spouseContribAmt: '', spouseContribDate: '', spouseContribDone: false,
    spouseConvAmt: '', spouseConvDate: '', spouseConvDone: false,
    spouseInstitution: '', spouseAcct: '',
    notes: '',
  }
}

export function mkClientData(key: string): ClientData {
  const strat = {} as StrategyMap
  SKS.forEach(k => { strat[k] = { y: false, n: false, d: '' } })

  const sav = {} as SavingsMap
  SAVS.forEach(r => { sav[r.k] = { a: '', y: false, n: false } })

  const payByYear: Record<string, PayData> = {}
  YEARS.forEach(y => { payByYear[y] = mkPayData() })

  const retByYear: Record<string, RetirementYear> = {}
  YEARS.forEach(y => { retByYear[y] = mkRetYear() })

  const payrollByYear: Record<string, PayrollYear> = {}
  YEARS.forEach(y => { payrollByYear[y] = mkPayrollYear() })

  const rothByYear: Record<string, RothYear> = {}
  YEARS.forEach(y => { rothByYear[y] = mkRothYear() })

  return {
    key,
    name: '',
    entities: [{ name: '', type: 'S-Corporation', state: 'CA', payData: mkEntityPayData() }],
    adv: '', mgr: '', filing: 'Single', fr: '', sr: '',
    strat, sav, payByYear, retByYear, payrollByYear, rothByYear,
  }
}
