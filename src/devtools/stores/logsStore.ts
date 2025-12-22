import { create } from 'zustand';
import type { LogLevel, DevLogEntry } from '../types';
import { useSettingsStore } from './settingsStore';

// ═══════════════════════════════════════════════════════════════════════════
// LOGS STATE
// ═══════════════════════════════════════════════════════════════════════════

interface LogsState {
  logs: DevLogEntry[];
  maxLogs: number;
  
  /** Computed states */
  hasUnreadErrors: boolean;
  unreadCount: number;
  
  /** Actions */
  addLog: (level: LogLevel, message: string, context?: Record<string, unknown>, source?: string) => void;
  markAllRead: () => void;
  clearLogs: () => void;
  clearByLevel: (level: LogLevel) => void;
}

export const useLogsStore = create<LogsState>()((set, get) => ({
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
// HELPER: Global log function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log an event to DevTools
 * Can be called from anywhere in the app
 */
export const logEvent = (
  level: LogLevel, 
  message: string, 
  context?: Record<string, unknown>,
  source?: string
) => {
  useLogsStore.getState().addLog(level, message, context, source);
};

/**
 * Initialize error interception
 * Call once at app startup to capture console errors
 */
export const initializeErrorInterception = () => {
  // Make interception idempotent across HMR / multiple providers
  const FLAG = '__lovable_devtools_error_interception_initialized__';
  const g = globalThis as unknown as Record<string, unknown>;
  if (g[FLAG]) return;
  g[FLAG] = true;

  const originalError = console.error;
  const originalWarn = console.warn;

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

    // Defer to avoid Zustand updates during React render/commit
    queueMicrotask(() => {
      try {
        logEvent(level, message, undefined, source);
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
      logEvent(
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
      logEvent('error', `Unhandled Promise Rejection: ${event.reason}`, undefined, 'promise');
    });
  });
};
