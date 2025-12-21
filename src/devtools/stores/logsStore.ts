import { create } from 'zustand';
import type { LogLevel, DevLogEntry } from '../types';

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
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    originalError.apply(console, args);
    const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    logEvent('error', message, undefined, 'console.error');
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    logEvent('warn', message, undefined, 'console.warn');
  };

  // Global error handler
  window.addEventListener('error', (event) => {
    logEvent('error', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, 'window.onerror');
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logEvent('error', `Unhandled Promise Rejection: ${event.reason}`, undefined, 'promise');
  });
};
