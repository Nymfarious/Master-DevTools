// Error Store v3.2.0 - Persistent error logging with typed errors
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ErrorLogEntry, ErrorType } from '@/types/error';

const MAX_ERRORS = 100;

interface ErrorStore {
  errors: ErrorLogEntry[];
  hasUnreadErrors: boolean;
  
  // Actions
  logError: (type: ErrorType, message: string, details?: string, source?: string) => void;
  togglePin: (id: string) => void;
  deleteError: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearErrors: () => void;
  clearReadErrors: () => void;
  setAISuggestion: (id: string, suggestion: string) => void;
  setAnalyzing: (id: string, analyzing: boolean) => void;
}

export const useErrorStore = create<ErrorStore>()(
  persist(
    (set, get) => ({
      errors: [],
      hasUnreadErrors: false,

      logError: (type, message, details, source) => {
        const newError: ErrorLogEntry = {
          id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          type,
          message,
          details,
          source,
          pinned: false,
          read: false,
        };

        set(state => ({
          errors: [newError, ...state.errors].slice(0, MAX_ERRORS),
          hasUnreadErrors: true,
        }));
      },

      togglePin: (id) => set(state => ({
        errors: state.errors.map(err =>
          err.id === id ? { ...err, pinned: !err.pinned } : err
        ),
      })),

      deleteError: (id) => set(state => ({
        errors: state.errors.filter(err => err.id !== id),
        hasUnreadErrors: state.errors.filter(e => e.id !== id).some(e => !e.read),
      })),

      markAsRead: (id) => set(state => ({
        errors: state.errors.map(err =>
          err.id === id ? { ...err, read: true } : err
        ),
        hasUnreadErrors: state.errors.some(e => e.id !== id && !e.read),
      })),

      markAllAsRead: () => set(state => ({
        errors: state.errors.map(err => ({ ...err, read: true })),
        hasUnreadErrors: false,
      })),

      clearErrors: () => set({ errors: [], hasUnreadErrors: false }),

      clearReadErrors: () => set(state => ({
        errors: state.errors.filter(err => !err.read || err.pinned),
      })),

      setAISuggestion: (id, suggestion) => set(state => ({
        errors: state.errors.map(err =>
          err.id === id ? { ...err, aiSuggestion: suggestion, isAnalyzing: false } : err
        ),
      })),

      setAnalyzing: (id, analyzing) => set(state => ({
        errors: state.errors.map(err =>
          err.id === id ? { ...err, isAnalyzing: analyzing } : err
        ),
      })),
    }),
    {
      name: 'master-devtools-errors',
    }
  )
);

// Selector for sorted errors (pinned first, then by timestamp)
export const selectSortedErrors = (state: ErrorStore) => 
  [...state.errors].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });
