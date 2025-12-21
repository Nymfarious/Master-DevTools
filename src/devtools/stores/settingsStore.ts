import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = 'user' | 'admin' | 'developer' | 'tester';
export type ExpandIconStyle = 'chevron' | 'plusminus' | 'dots';

export interface DevToolsSettings {
  // Display
  masterVisibility: boolean;
  compactMode: boolean;
  
  // Features
  enableHealthChecks: boolean;
  enablePipelineMonitor: boolean;
  enableAgentConsole: boolean;
  enableTestLab: boolean;
  
  // Overrides
  mockApiResponses: boolean;
  verboseLogging: boolean;
  guestUploadOverride: boolean;
  guestModeEnabled: boolean; // Guest Mode - bypass auth for testing
  
  // Security
  blockSignups: boolean;
  
  // Role
  currentRole: UserRole;
  
  // UI Preferences
  expandIconStyle: ExpandIconStyle;
  
  // Resource Mode
  lowResourceMode: boolean;
  
  // Monitoring
  fpsMonitoringEnabled: boolean;
}

const defaultSettings: DevToolsSettings = {
  masterVisibility: true,
  compactMode: false,
  enableHealthChecks: true,
  enablePipelineMonitor: true,
  enableAgentConsole: true,
  enableTestLab: true,
  mockApiResponses: false,
  verboseLogging: false,
  guestUploadOverride: false,
  guestModeEnabled: false, // Guest mode OFF by default
  blockSignups: false,
  currentRole: 'developer',
  expandIconStyle: 'chevron',
  lowResourceMode: true, // Default ON to save resources
  fpsMonitoringEnabled: false, // Default OFF to save resources
};

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface SettingsState {
  settings: DevToolsSettings;
  updateSettings: (updates: Partial<DevToolsSettings>) => void;
  resetSettings: () => void;
  setRole: (role: UserRole) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      
      resetSettings: () => set({ settings: defaultSettings }),
      
      setRole: (role) =>
        set((state) => ({
          settings: { ...state.settings, currentRole: role },
        })),
    }),
    { name: 'devtools-settings' }
  )
);
