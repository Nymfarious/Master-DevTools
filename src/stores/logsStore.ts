import { create } from 'zustand';
import type { LogLevel, DevLogEntry } from '@/types/devtools';

interface LogsState {
  logs: DevLogEntry[];
  maxLogs: number;
  hasUnreadErrors: boolean;
  unreadCount: number;
  
  // Actions
  addLog: (level: LogLevel, message: string, context?: Record<string, unknown>, source?: string) => void;
  markAllRead: () => void;
  clearLogs: () => void;
  clearByLevel: (level: LogLevel) => void;
}

export const useLogsStore = create<LogsState>()((set, get) => ({
  logs: [
    {
      id: 'log-1',
      level: 'info',
      message: 'System initialized successfully',
      timestamp: new Date(Date.now() - 60000),
      read: true,
      source: 'system',
    },
    {
      id: 'log-2',
      level: 'success',
      message: 'Connected to Supabase',
      timestamp: new Date(Date.now() - 45000),
      read: true,
      source: 'database',
    },
    {
      id: 'log-3',
      level: 'warn',
      message: 'API rate limit approaching (80%)',
      timestamp: new Date(Date.now() - 30000),
      read: false,
      source: 'api-registry',
    },
  ],
  maxLogs: 200,
  hasUnreadErrors: true,
  unreadCount: 1,

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
    const hasUnread = updatedLogs.some(log => !log.read && (log.level === 'error' || log.level === 'warn'));
    
    return { 
      logs: updatedLogs,
      hasUnreadErrors: hasUnread,
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

// Helper function to add logs from anywhere
export const logEvent = (
  level: LogLevel, 
  message: string, 
  context?: Record<string, unknown>,
  source?: string
) => {
  useLogsStore.getState().addLog(level, message, context, source);
};
