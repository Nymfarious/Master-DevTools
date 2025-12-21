import { create } from 'zustand';
import type { HealthStatus } from '@/types/devtools';

interface ServiceStatus {
  status: HealthStatus;
  message?: string;
  responseTime?: number;
}

interface SystemState {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  systemHealth: {
    api: ServiceStatus;
    database: ServiceStatus;
    auth: ServiceStatus;
  };
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  activeSessions: number;
  
  // Actions
  setConnectionStatus: (status: SystemState['connectionStatus']) => void;
  setServiceHealth: (service: keyof SystemState['systemHealth'], status: ServiceStatus) => void;
  incrementUptime: () => void;
  setMemory: (memory: SystemState['memory']) => void;
  setActiveSessions: (count: number) => void;
}

export const useSystemStore = create<SystemState>()((set) => ({
  connectionStatus: 'connected',
  systemHealth: {
    api: { status: 'healthy', message: 'All endpoints responding' },
    database: { status: 'healthy', message: 'Connected to Supabase' },
    auth: { status: 'healthy', message: 'Auth service active' },
  },
  uptime: 0,
  memory: {
    used: 124,
    total: 512,
  },
  activeSessions: 1,

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setServiceHealth: (service, status) => set((state) => ({
    systemHealth: {
      ...state.systemHealth,
      [service]: status,
    },
  })),
  incrementUptime: () => set((state) => ({ uptime: state.uptime + 1 })),
  setMemory: (memory) => set({ memory }),
  setActiveSessions: (count) => set({ activeSessions: count }),
}));
