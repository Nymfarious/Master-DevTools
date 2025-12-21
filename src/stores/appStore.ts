import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SectionId } from '@/types/devtools';

interface AppState {
  activeSection: SectionId;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  
  // Actions
  setActiveSection: (section: SectionId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeSection: 'overview',
      sidebarCollapsed: false,
      commandPaletteOpen: false,

      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'devtools-app-state',
      partialize: (state) => ({ 
        activeSection: state.activeSection,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
