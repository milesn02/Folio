import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import InviteSignup from './pages/InviteSignup'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={400}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/invite/:token" element={<InviteSignup />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
