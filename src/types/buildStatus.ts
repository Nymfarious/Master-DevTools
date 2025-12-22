// Build Status Types
// Tracks feature completion, notes, and dependencies

export type FeatureStatus = 'complete' | 'partial' | 'stub' | 'bug' | 'planned';
export type Priority = 'P1' | 'P2' | 'P3' | 'V2';

export interface BuildFeature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  category: string;
  version?: string;
  notes?: string;
}

export interface DevNote {
  id: string;
  content: string;
  createdAt: number;
  resolved: boolean;
  priority?: Priority;
}

export interface DependencyItem {
  id: string;
  name: string;
  type: 'api' | 'library' | 'service';
  status: 'active' | 'degraded' | 'offline' | 'unknown';
  required: boolean;
  fallback?: string;
}

export const STATUS_STYLES: Record<FeatureStatus, { label: string; color: string; bg: string }> = {
  complete: { label: 'Complete', color: 'text-green-400', bg: 'bg-green-500/20' },
  partial: { label: 'Partial', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  stub: { label: 'Stub', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  bug: { label: 'Bug', color: 'text-red-400', bg: 'bg-red-500/20' },
  planned: { label: 'Planned', color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export const PRIORITY_STYLES: Record<Priority, { color: string; bg: string }> = {
  P1: { color: 'text-red-400', bg: 'bg-red-500/20' },
  P2: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  P3: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  V2: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

export const DEPENDENCY_STATUS_STYLES: Record<DependencyItem['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-500' },
  degraded: { label: 'Degraded', color: 'bg-yellow-500' },
  offline: { label: 'Offline', color: 'bg-red-500' },
  unknown: { label: 'Unknown', color: 'bg-muted-foreground' },
};
