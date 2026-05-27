import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const icons = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  error:   <XCircle className="w-4 h-4 text-danger" />,
  info:    <Info className="w-4 h-4 text-info" />,
}

export function ToastContainer() {
  const { toasts, dismissToast } = useUiStore()

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded bg-white border shadow-md',
            'min-w-[260px] max-w-sm pointer-events-auto animate-slide-up',
            t.type === 'success' && 'border-success-border',
            t.type === 'error'   && 'border-danger-border',
            t.type === 'info'    && 'border-info-border',
          )}
        >
          {icons[t.type]}
          <p className="text-[13px] text-text flex-1">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-text-lt hover:text-text transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
