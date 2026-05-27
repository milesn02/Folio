import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UiStore {
  sidebarCollapsed: boolean
  notesOpen: boolean
  toasts: Toast[]

  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openNotes: () => void
  closeNotes: () => void

  showToast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  notesOpen: false,
  toasts: [],

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  openNotes: () => set({ notesOpen: true }),
  closeNotes: () => set({ notesOpen: false }),

  showToast: (message, type = 'success') => {
    const id = crypto.randomUUID()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },

  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
