import { ToastContainer } from '@/components/ui'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans text-text">
      {children}
      <ToastContainer />
    </div>
  )
}
