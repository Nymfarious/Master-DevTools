// App Context Store - Tracks the currently loaded Echoverse app
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EchoverseApp } from '@/config/apps';

interface AppContextState {
  selectedAppId: string | null;
  loadedAppId: string | null;
  loadedApp: EchoverseApp | null;
  isLoading: boolean;
  
  // Actions
  selectApp: (appId: string | null) => void;
  loadApp: (app: EchoverseApp) => Promise<void>;
  clearApp: () => void;
}

export const useAppContextStore = create<AppContextState>()(
  persist(
    (set) => ({
      selectedAppId: null,
      loadedAppId: null,
      loadedApp: null,
      isLoading: false,

      selectApp: (appId) => set({ selectedAppId: appId }),

      loadApp: async (app) => {
        set({ isLoading: true });
        // Simulate loading delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        set({
          loadedAppId: app.id,
          loadedApp: app,
          selectedAppId: app.id,
          isLoading: false,
        });
      },

      clearApp: () => set({
        loadedAppId: null,
        loadedApp: null,
        selectedAppId: null,
      }),
    }),
    {
      name: 'devtools-app-context',
      partialize: (state) => ({
        loadedAppId: state.loadedAppId,
        // We don't persist loadedApp since it contains React components (icons)
        // It will be re-hydrated from the apps config on next load
      }),
    }
  )
);
