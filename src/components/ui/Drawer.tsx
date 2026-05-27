import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function Drawer({
  open, onClose, title, children,
  defaultWidth = 768,
  minWidth = 480,
  maxWidth = 1200,
}: DrawerProps) {
  const [width, setWidth] = useState(defaultWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return
      const delta = startX.current - ev.clientX
      const next = Math.min(maxWidth, Math.max(minWidth, startW.current + delta))
      setWidth(next)
    }
    function onUp() {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-40 bg-white shadow-2xl flex flex-col',
          'transition-transform duration-250 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute left-0 top-0 h-full w-4 cursor-col-resize group z-10 flex items-center justify-center"
        >
          <div className="absolute left-0 top-0 h-full w-[3px] bg-transparent group-hover:bg-accent/20 transition-colors rounded-r" />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-[3px] pointer-events-none select-none">
            <div className="flex flex-col gap-[4px]">
              {[0,1,2,3,4].map(i => <div key={i} className="w-[3px] h-[3px] rounded-full bg-accent/50" />)}
            </div>
            <div className="flex flex-col gap-[4px]">
              {[0,1,2,3,4].map(i => <div key={i} className="w-[3px] h-[3px] rounded-full bg-accent/50" />)}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-serif text-[20px] text-navy tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-lt hover:bg-surface hover:text-text transition-colors text-[18px]"
          >×</button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </>
  )
}
