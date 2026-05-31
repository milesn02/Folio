import { ToastContainer } from '@/components/ui'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:rounded-md focus:bg-navy focus:text-white focus:text-[13px] focus:font-medium"
      >
        Skip to content
      </a>
      {children}
      <ToastContainer />
    </div>
  )
}
