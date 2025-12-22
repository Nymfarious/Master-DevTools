import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SectionId, DevLogEntry, LogLevel, PipelineEvent, MiniDevConfig } from '../types/devtools';
import { useSettingsStore } from '@/devtools/stores/settingsStore';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DEVTOOLS STORE
// ═══════════════════════════════════════════════════════════════════════════

interface DevToolsState {
  // Drawer state
  isOpen: boolean;
  activeSection: SectionId;
  
  // App config
  config: MiniDevConfig | null;
  
  // Actions
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setActiveSection: (section: SectionId) => void;
  setConfig: (config: MiniDevConfig) => void;
}

export const useDevToolsStore = create<DevToolsState>()(
  persist(
    (set) => ({
      isOpen: false,
      activeSection: 'overview',
      config: null,

      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      setActiveSection: (section) => set({ activeSection: section }),
      setConfig: (config) => set({ config }),
    }),
    {
      name: 'mini-devtools-state',
      partialize: (state) => ({ 
        activeSection: state.activeSection,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// LOGS STORE - The Red Dot System
// ═══════════════════════════════════════════════════════════════════════════

interface LogsState {
  logs: DevLogEntry[];
  maxLogs: number;
  
  // Computed
  hasUnreadErrors: boolean;
  unreadCount: number;
  
  // Actions
  addLog: (level: LogLevel, message: string, context?: Record<string, unknown>, source?: string) => void;
  markAllRead: () => void;
  clearLogs: () => void;
  clearByLevel: (level: LogLevel) => void;
}

export const useDevLogsStore = create<LogsState>()((set) => ({
  logs: [],
  maxLogs: 200,
  hasUnreadErrors: false,
  unreadCount: 0,

  addLog: (level, message, context, source) => set((state) => {
    const newLog: DevLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      level,
      message,
      context,
      source,
      timestamp: new Date(),
      read: false,
    };
    
    const updatedLogs = [newLog, ...state.logs].slice(0, state.maxLogs);
    
    return { 
      logs: updatedLogs,
      hasUnreadErrors: updatedLogs.some(log => !log.read && (log.level === 'error' || log.level === 'warn')),
      unreadCount: updatedLogs.filter(log => !log.read).length,
    };
  }),

  markAllRead: () => set((state) => ({
    logs: state.logs.map(log => ({ ...log, read: true })),
    hasUnreadErrors: false,
    unreadCount: 0,
  })),

  clearLogs: () => set({ logs: [], hasUnreadErrors: false, unreadCount: 0 }),
  
  clearByLevel: (level) => set((state) => {
    const filtered = state.logs.filter(log => log.level !== level);
    return {
      logs: filtered,
      hasUnreadErrors: filtered.some(log => !log.read && (log.level === 'error' || log.level === 'warn')),
      unreadCount: filtered.filter(log => !log.read).length,
    };
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE STORE
// ═══════════════════════════════════════════════════════════════════════════

interface PipelineState {
  events: PipelineEvent[];
  maxEvents: number;
  
  // Actions
  addEvent: (event: Omit<PipelineEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  
  // Computed getters
  getStats: () => { total: number; success: number; failed: number; avgDuration: number };
  getRecentByStep: (step: PipelineEvent['step']) => PipelineEvent[];
}

export const usePipelineStore = create<PipelineState>()((set, get) => ({
  events: [],
  maxEvents: 100,

  addEvent: (eventData) => set((state) => {
    const newEvent: PipelineEvent = {
      ...eventData,
      id: `pipe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
    };
    
    return {
      events: [newEvent, ...state.events].slice(0, state.maxEvents),
    };
  }),

  clearEvents: () => set({ events: [] }),
  
  getStats: () => {
    const events = get().events;
    const total = events.length;
    const success = events.filter(e => e.success).length;
    const failed = total - success;
    const avgDuration = total > 0 
      ? events.reduce((sum, e) => sum + e.duration, 0) / total 
      : 0;
    
    return { total, success, failed, avgDuration };
  },
  
  getRecentByStep: (step) => {
    return get().events.filter(e => e.step === step).slice(0, 10);
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO STORE
// ═══════════════════════════════════════════════════════════════════════════

interface AudioState {
  muted: boolean;
  volumes: {
    master: number;
    music: number;
    sfx: number;
    narration: number;
  };
  
  // Actions
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setVolume: (channel: keyof AudioState['volumes'], value: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      volumes: {
        master: 80,
        music: 70,
        sfx: 100,
        narration: 90,
      },

      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      setVolume: (channel, value) => set((state) => ({
        volumes: { ...state.volumes, [channel]: Math.max(0, Math.min(100, value)) },
      })),
    }),
    {
      name: 'mini-devtools-audio',
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Global log function
// ═══════════════════════════════════════════════════════════════════════════

export const logDevEvent = (
  level: LogLevel, 
  message: string, 
  context?: Record<string, unknown>,
  source?: string
) => {
  useDevLogsStore.getState().addLog(level, message, context, source);
};

// Auto-intercept console errors (call this once at app init)
export const initializeErrorInterception = () => {
  // Make interception idempotent across HMR / multiple providers
  const FLAG = '__lovable_mini_devtools_error_interception_initialized__';
  const g = globalThis as unknown as Record<string, unknown>;
  if (g[FLAG]) return;
  g[FLAG] = true;

  const originalError = console.error;
  const originalWarn = console.warn;

  // Avoid state updates during render and avoid hard failures if logging throws
  const safeLog = (level: LogLevel, args: unknown[], source: string) => {
    // Check if error interception is enabled before logging
    const isEnabled = useSettingsStore.getState().settings.errorInterceptionEnabled;
    if (!isEnabled) return;

    const message = args
      .map((a) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');

    queueMicrotask(() => {
      try {
        logDevEvent(level, message, undefined, source);
      } catch {
        // noop
      }
    });
  };

  console.error = (...args) => {
    originalError.apply(console, args as never);
    safeLog('error', args, 'console.error');
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args as never);
    safeLog('warn', args, 'console.warn');
  };

  window.addEventListener('error', (event) => {
    const isEnabled = useSettingsStore.getState().settings.errorInterceptionEnabled;
    if (!isEnabled) return;

    queueMicrotask(() => {
      logDevEvent(
        'error',
        event.message,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        'window.onerror'
      );
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const isEnabled = useSettingsStore.getState().settings.errorInterceptionEnabled;
    if (!isEnabled) return;

    queueMicrotask(() => {
      logDevEvent('error', `Unhandled Promise Rejection: ${event.reason}`, undefined, 'promise');
    });
  });
};
