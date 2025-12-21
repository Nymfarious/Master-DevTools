import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SectionId, DevToolsConfig } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// DEVTOOLS STATE
// ═══════════════════════════════════════════════════════════════════════════

interface DevToolsState {
  /** Whether drawer/panel is open */
  isOpen: boolean;
  
  /** Whether drawer is pinned (prevents backdrop click close) */
  isPinned: boolean;
  
  /** Currently active section */
  activeSection: SectionId;
  
  /** Current configuration */
  config: DevToolsConfig | null;
  
  /** Actions */
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setActiveSection: (section: SectionId) => void;
  setConfig: (config: DevToolsConfig) => void;
  togglePin: () => void;
}

export const useDevToolsStore = create<DevToolsState>()(
  persist(
    (set) => ({
      isOpen: false,
      isPinned: false,
      activeSection: 'overview',
      config: null,

      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      setActiveSection: (section) => set({ activeSection: section }),
      setConfig: (config) => set({ config }),
      togglePin: () => set((state) => ({ isPinned: !state.isPinned })),
    }),
    {
      name: 'devtools-state',
      partialize: (state) => ({ 
        activeSection: state.activeSection,
        isPinned: state.isPinned,
      }),
    }
  )
);
