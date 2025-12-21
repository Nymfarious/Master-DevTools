// Pipeline Store - Tracks AI generation events
// Lines: ~75 | Status: GREEN
import { create } from 'zustand';

export interface PipelineEvent {
  id: string;
  step: string;
  provider: string;
  duration_ms: number;
  success: boolean;
  error?: string;
  asset_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

interface PipelineState {
  events: PipelineEvent[];
  isLoading: boolean;
  filter: {
    provider: string | null;
    success: boolean | null;
  };
  
  // Actions
  addEvent: (event: PipelineEvent) => void;
  setEvents: (events: PipelineEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setFilter: (filter: Partial<PipelineState['filter']>) => void;
  clearEvents: () => void;
}

export const usePipelineStore = create<PipelineState>()((set) => ({
  events: [],
  isLoading: false,
  filter: {
    provider: null,
    success: null,
  },

  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].slice(0, 100), // Keep last 100
  })),

  setEvents: (events) => set({ events }),
  
  setLoading: (loading) => set({ isLoading: loading }),

  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),

  clearEvents: () => set({ events: [] }),
}));

// Demo data generator
export function generateDemoPipelineEvent(): PipelineEvent {
  const providers = ['OpenAI', 'ElevenLabs', 'Anthropic', 'Stability AI'];
  const steps = ['text-generation', 'speech-synthesis', 'image-generation', 'embedding'];
  const provider = providers[Math.floor(Math.random() * providers.length)];
  const step = steps[Math.floor(Math.random() * steps.length)];
  const success = Math.random() > 0.15;
  
  return {
    id: crypto.randomUUID(),
    step,
    provider,
    duration_ms: Math.round(100 + Math.random() * 2000),
    success,
    error: success ? undefined : 'Rate limit exceeded',
    asset_id: success ? `asset_${crypto.randomUUID().slice(0, 8)}` : undefined,
    metadata: { model: 'gpt-4o', tokens: Math.round(Math.random() * 500) },
    created_at: new Date(),
  };
}
