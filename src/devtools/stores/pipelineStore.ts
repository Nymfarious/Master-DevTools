import { create } from 'zustand';
import type { PipelineEvent, PipelineStep } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE STATE
// ═══════════════════════════════════════════════════════════════════════════

interface PipelineState {
  events: PipelineEvent[];
  maxEvents: number;
  
  /** Actions */
  addEvent: (event: Omit<PipelineEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  
  /** Computed getters */
  getStats: () => { total: number; success: number; failed: number; avgDuration: number };
  getRecentByStep: (step: PipelineStep) => PipelineEvent[];
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

/**
 * Record a pipeline event
 * Convenience function for logging pipeline activity
 */
export const recordPipelineEvent = (
  event: Omit<PipelineEvent, 'id' | 'timestamp'>
) => {
  usePipelineStore.getState().addEvent(event);
};
