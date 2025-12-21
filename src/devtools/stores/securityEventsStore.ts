import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type SecurityEventType = 
  | 'auth_success' 
  | 'auth_failure' 
  | 'auth_logout' 
  | 'file_upload' 
  | 'file_delete' 
  | 'suspicious_activity' 
  | 'api_error' 
  | 'rate_limit';

export type SecuritySeverity = 'critical' | 'error' | 'warning' | 'info';

export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  timestamp: string;
  userId?: string;
  email?: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════════════════════

const initialEvents: SecurityEvent[] = [
  {
    id: 'sec-1',
    eventType: 'auth_success',
    severity: 'info',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    email: 'dev@echoverse.io',
  },
  {
    id: 'sec-2',
    eventType: 'auth_failure',
    severity: 'warning',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    email: 'unknown@test.com',
    details: { reason: 'Invalid credentials', attempts: 3 },
  },
  {
    id: 'sec-3',
    eventType: 'rate_limit',
    severity: 'error',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    details: { endpoint: '/api/generate', limit: 100, current: 150 },
  },
  {
    id: 'sec-4',
    eventType: 'suspicious_activity',
    severity: 'critical',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    details: { reason: 'Multiple failed logins from different IPs', ips: ['192.168.1.1', '10.0.0.5'] },
  },
  {
    id: 'sec-5',
    eventType: 'file_upload',
    severity: 'info',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    email: 'user@example.com',
    details: { filename: 'avatar.png', size: '2.4MB' },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface SecurityEventsState {
  events: SecurityEvent[];
  maxEvents: number;
  autoRefresh: boolean;
  
  // Actions
  addEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  
  // Getters
  getBySeverity: (severity: SecuritySeverity) => SecurityEvent[];
  getStats: () => {
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
  };
}

export const useSecurityEventsStore = create<SecurityEventsState>()((set, get) => ({
  events: initialEvents,
  maxEvents: 100,
  autoRefresh: false,

  addEvent: (event) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, state.maxEvents),
    }));
  },

  clearEvents: () => set({ events: [] }),

  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

  getBySeverity: (severity) => get().events.filter((e) => e.severity === severity),

  getStats: () => {
    const events = get().events;
    return {
      total: events.length,
      critical: events.filter((e) => e.severity === 'critical').length,
      errors: events.filter((e) => e.severity === 'error').length,
      warnings: events.filter((e) => e.severity === 'warning').length,
      info: events.filter((e) => e.severity === 'info').length,
    };
  },
}));
