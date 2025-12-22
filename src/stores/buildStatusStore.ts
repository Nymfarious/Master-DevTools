// Build Status Store - Tracks feature completion and dev notes
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BuildFeature, DevNote, DependencyItem, FeatureStatus, Priority } from '@/types/buildStatus';

interface BuildStatusStore {
  features: BuildFeature[];
  notes: DevNote[];
  dependencies: DependencyItem[];
  
  // Feature actions
  updateFeatureStatus: (id: string, status: FeatureStatus) => void;
  
  // Note actions
  addNote: (content: string, priority?: Priority) => void;
  toggleNoteResolved: (id: string) => void;
  deleteNote: (id: string) => void;
  
  // Computed
  getCompletionPercentage: () => number;
  getActiveNotes: () => DevNote[];
  getResolvedNotes: () => DevNote[];
  getFeaturesByCategory: () => Record<string, BuildFeature[]>;
}

// Initial feature data for Master DevTools
const INITIAL_FEATURES: BuildFeature[] = [
  // Monitoring
  { id: 'overview', name: 'Overview Panel', description: 'System health and status', status: 'complete', category: 'Monitoring' },
  { id: 'app-launcher', name: 'App Launcher', description: 'Echoverse app connections', status: 'complete', category: 'Monitoring' },
  { id: 'event-logs', name: 'Event Logs', description: 'Error tracking with types', status: 'complete', category: 'Monitoring' },
  { id: 'pipeline', name: 'Pipeline Monitor', description: 'Multi-stage job tracking', status: 'partial', category: 'Monitoring' },
  { id: 'media-monitor', name: 'Media Monitor', description: 'Audio/Video/TTS status', status: 'stub', category: 'Monitoring' },
  { id: 'security', name: 'Security Panel', description: 'Edge functions, RLS, secrets', status: 'complete', category: 'Monitoring' },
  { id: 'api-registry', name: 'API Registry', description: 'Service status tracking', status: 'complete', category: 'Monitoring' },
  
  // Testing
  { id: 'test-lab', name: 'Test Lab', description: 'Audio/Video/TTS/Data testing', status: 'partial', category: 'Testing' },
  
  // Reference
  { id: 'style-guide', name: 'Style Guide', description: 'Design system reference', status: 'complete', category: 'Reference' },
  { id: 'shortcuts', name: 'Shortcuts Panel', description: 'Keyboard shortcuts', status: 'complete', category: 'Reference' },
  { id: 'libraries', name: 'Libraries Panel', description: 'Dependencies list', status: 'complete', category: 'Reference' },
  
  // Tools
  { id: 'generator', name: 'Panel Generator', description: 'Create new panels', status: 'complete', category: 'Tools' },
  { id: 'export', name: 'Export Panel', description: 'Export logs and data', status: 'partial', category: 'Tools' },
  { id: 'settings', name: 'Settings Panel', description: 'App preferences', status: 'complete', category: 'Tools' },
  { id: 'build-status', name: 'Build Status', description: 'Track feature completion', status: 'complete', category: 'Tools' },
];

const INITIAL_DEPENDENCIES: DependencyItem[] = [
  { id: 'supabase', name: 'Supabase', type: 'service', status: 'active', required: true },
  { id: 'gemini', name: 'Gemini AI', type: 'api', status: 'unknown', required: false, fallback: 'Manual analysis' },
  { id: 'elevenlabs', name: 'ElevenLabs', type: 'api', status: 'unknown', required: false, fallback: 'Browser TTS' },
  { id: 'replicate', name: 'Replicate', type: 'api', status: 'unknown', required: false },
];

export const useBuildStatusStore = create<BuildStatusStore>()(
  persist(
    (set, get) => ({
      features: INITIAL_FEATURES,
      notes: [],
      dependencies: INITIAL_DEPENDENCIES,

      updateFeatureStatus: (id, status) => set(state => ({
        features: state.features.map(f => 
          f.id === id ? { ...f, status } : f
        ),
      })),

      addNote: (content, priority) => set(state => ({
        notes: [{
          id: `note-${Date.now()}`,
          content,
          createdAt: Date.now(),
          resolved: false,
          priority,
        }, ...state.notes],
      })),

      toggleNoteResolved: (id) => set(state => ({
        notes: state.notes.map(n =>
          n.id === id ? { ...n, resolved: !n.resolved } : n
        ),
      })),

      deleteNote: (id) => set(state => ({
        notes: state.notes.filter(n => n.id !== id),
      })),

      getCompletionPercentage: () => {
        const features = get().features;
        const complete = features.filter(f => f.status === 'complete').length;
        return Math.round((complete / features.length) * 100);
      },

      getActiveNotes: () => get().notes.filter(n => !n.resolved),
      getResolvedNotes: () => get().notes.filter(n => n.resolved),
      
      getFeaturesByCategory: () => {
        const features = get().features;
        return features.reduce((acc, feature) => {
          if (!acc[feature.category]) {
            acc[feature.category] = [];
          }
          acc[feature.category].push(feature);
          return acc;
        }, {} as Record<string, BuildFeature[]>);
      },
    }),
    {
      name: 'master-devtools-build-status',
    }
  )
);
