import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: React.ReactNode
}

export function Modal({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive, onConfirm, onCancel, children,
}: ModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => confirmRef.current?.focus(), 50)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        className={cn(
          'bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6',
          'animate-fade-in',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-text">{title}</h2>
            {description && <p className="text-sm text-text-lt mt-1">{description}</p>}
          </div>
          <button onClick={onCancel} className="text-text-lt hover:text-text ml-4 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {children && <div className="mb-5">{children}</div>}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            ref={confirmRef}
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
