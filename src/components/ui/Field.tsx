import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor?: string
  required?: boolean
}

export function Field({ label, htmlFor, required, className, children, ...props }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// Shared input class
export const inputCls = [
  'w-full rounded-md border border-border/80 bg-white px-3 py-[7px] text-sm text-text',
  'placeholder:text-text-xs outline-none shadow-xs',
  'hover:border-border-dk',
  'focus:border-accent/70 focus:ring-2 focus:ring-accent/15 focus:shadow-glow-accent',
  'transition-all duration-150',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface',
].join(' ')

function formatCommas(v: unknown): string {
  const raw = String(v ?? '').replace(/[$,]/g, '').trim()
  if (raw === '') return ''
  const n = parseFloat(raw)
  if (isNaN(n)) return raw
  return Math.round(n).toLocaleString()
}

// Dollar-prefixed input — shows commas when blurred, raw digits while typing
export function DollarInput({
  className, value, onChange, onBlur, onFocus, ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const focused = useRef(false)
  const [display, setDisplay] = useState(() => formatCommas(value))

  useEffect(() => {
    if (!focused.current) setDisplay(formatCommas(value))
  }, [value])

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    focused.current = true
    setDisplay(String(value ?? '').replace(/[$,]/g, '').trim())
    onFocus?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    focused.current = false
    setDisplay(formatCommas(value))
    onBlur?.(e)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(e.target.value)
    onChange?.(e)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-text-lt pointer-events-none select-none">$</span>
      <input
        className={cn(inputCls, 'pl-6', className)}
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    </div>
  )
}
