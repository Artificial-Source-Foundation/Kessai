import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  subscriptionDialogOpen: boolean
  editingSubscriptionId: string | null

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openSubscriptionDialog: (editId?: string) => void
  closeSubscriptionDialog: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  subscriptionDialogOpen: false,
  editingSubscriptionId: null,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openSubscriptionDialog: (editId) =>
    set({
      subscriptionDialogOpen: true,
      editingSubscriptionId: editId || null,
    }),

  closeSubscriptionDialog: () =>
    set({
      subscriptionDialogOpen: false,
      editingSubscriptionId: null,
    }),
}))
