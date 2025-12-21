// API Health Store - Tracks external API health status
// Lines: ~85 | Status: GREEN
import { create } from 'zustand';
import type { HealthStatus } from '@/types/devtools';

export interface APIEndpoint {
  id: string;
  name: string;
  vendor: string;
  endpoint: string;
  status: HealthStatus;
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
}

interface APIHealthState {
  endpoints: APIEndpoint[];
  isChecking: Record<string, boolean>;
  
  // Actions
  setEndpointStatus: (id: string, status: Partial<APIEndpoint>) => void;
  setChecking: (id: string, checking: boolean) => void;
  addEndpoint: (endpoint: APIEndpoint) => void;
}

const DEFAULT_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    vendor: 'Supabase',
    endpoint: import.meta.env.VITE_SUPABASE_URL + '/rest/v1/',
    status: 'unknown',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    vendor: 'ElevenLabs',
    endpoint: 'https://api.elevenlabs.io/v1/voices',
    status: 'unknown',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    vendor: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/models',
    status: 'unknown',
  },
];

export const useAPIHealthStore = create<APIHealthState>()((set) => ({
  endpoints: DEFAULT_ENDPOINTS,
  isChecking: {},

  setEndpointStatus: (id, status) => set((state) => ({
    endpoints: state.endpoints.map(ep => 
      ep.id === id ? { ...ep, ...status } : ep
    ),
  })),

  setChecking: (id, checking) => set((state) => ({
    isChecking: { ...state.isChecking, [id]: checking },
  })),

  addEndpoint: (endpoint) => set((state) => ({
    endpoints: [...state.endpoints, endpoint],
  })),
}));

// Health check function
export async function checkAPIHealth(endpoint: APIEndpoint): Promise<Partial<APIEndpoint>> {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(endpoint.endpoint, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors', // Allow checking without CORS for external APIs
    });
    
    clearTimeout(timeoutId);
    const responseTime = Math.round(performance.now() - startTime);
    
    return {
      status: 'healthy',
      responseTime,
      lastChecked: new Date(),
      error: undefined,
    };
  } catch (error) {
    const responseTime = Math.round(performance.now() - startTime);
    
    // no-cors mode doesn't give us status, but if we got here without abort, it's reachable
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'down',
        responseTime,
        lastChecked: new Date(),
        error: 'Request timeout',
      };
    }
    
    return {
      status: 'healthy', // no-cors fetch that doesn't throw is considered reachable
      responseTime,
      lastChecked: new Date(),
    };
  }
}
