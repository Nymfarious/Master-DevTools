import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreaker {
  id: string;
  service: string;
  state: CircuitState;
  failures: number;
  maxFailures: number;
  lastFailure?: string;
  nextRetry?: string;
  cooldownMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════════════════════

const initialBreakers: CircuitBreaker[] = [
  { id: 'cb-1', service: 'Gemini API', state: 'closed', failures: 0, maxFailures: 5, cooldownMs: 30000 },
  { id: 'cb-2', service: 'Replicate', state: 'closed', failures: 2, maxFailures: 5, cooldownMs: 30000 },
  { id: 'cb-3', service: 'ElevenLabs', state: 'half-open', failures: 4, maxFailures: 5, cooldownMs: 30000, nextRetry: new Date(Date.now() + 15000).toISOString() },
  { id: 'cb-4', service: 'OpenAI', state: 'open', failures: 5, maxFailures: 5, cooldownMs: 30000, lastFailure: new Date().toISOString(), nextRetry: new Date(Date.now() + 30000).toISOString() },
  { id: 'cb-5', service: 'Supabase', state: 'closed', failures: 0, maxFailures: 3, cooldownMs: 60000 },
  { id: 'cb-6', service: 'Cloudinary', state: 'closed', failures: 1, maxFailures: 5, cooldownMs: 30000 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface CircuitBreakerState {
  breakers: CircuitBreaker[];
  
  // Actions
  resetBreaker: (id: string) => void;
  recordFailure: (id: string) => void;
  recordSuccess: (id: string) => void;
  updateBreaker: (id: string, updates: Partial<CircuitBreaker>) => void;
  
  // Getters
  getByState: (state: CircuitState) => CircuitBreaker[];
  getStats: () => {
    total: number;
    closed: number;
    open: number;
    halfOpen: number;
  };
}

export const useCircuitBreakerStore = create<CircuitBreakerState>()((set, get) => ({
  breakers: initialBreakers,

  resetBreaker: (id) => {
    set((state) => ({
      breakers: state.breakers.map((b) =>
        b.id === id
          ? { ...b, state: 'closed' as CircuitState, failures: 0, lastFailure: undefined, nextRetry: undefined }
          : b
      ),
    }));
  },

  recordFailure: (id) => {
    set((state) => ({
      breakers: state.breakers.map((b) => {
        if (b.id !== id) return b;
        const newFailures = b.failures + 1;
        const shouldOpen = newFailures >= b.maxFailures;
        return {
          ...b,
          failures: newFailures,
          state: shouldOpen ? 'open' : b.state,
          lastFailure: new Date().toISOString(),
          nextRetry: shouldOpen ? new Date(Date.now() + b.cooldownMs).toISOString() : undefined,
        };
      }),
    }));
  },

  recordSuccess: (id) => {
    set((state) => ({
      breakers: state.breakers.map((b) =>
        b.id === id
          ? { ...b, state: 'closed' as CircuitState, failures: Math.max(0, b.failures - 1) }
          : b
      ),
    }));
  },

  updateBreaker: (id, updates) => {
    set((state) => ({
      breakers: state.breakers.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }));
  },

  getByState: (state) => get().breakers.filter((b) => b.state === state),

  getStats: () => {
    const breakers = get().breakers;
    return {
      total: breakers.length,
      closed: breakers.filter((b) => b.state === 'closed').length,
      open: breakers.filter((b) => b.state === 'open').length,
      halfOpen: breakers.filter((b) => b.state === 'half-open').length,
    };
  },
}));
