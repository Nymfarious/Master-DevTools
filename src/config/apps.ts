// App Registry v3.4.0 - Appverse apps configuration with health & devtools
import { LucideIcon } from 'lucide-react';
import { 
  Scissors, Music, Film, Layers, Mic, Video, BookOpen, Search, Terminal
} from 'lucide-react';

export type AppCategory = 'media' | 'audio' | 'creative' | 'utility' | 'research' | 'devtools';
export type AppStatus = 'ready' | 'development' | 'planned' | 'offline';

// Backend service types this app may depend on
export type BackendService = 'database' | 'auth' | 'storage' | 'realtime';

// DevTools panel types available for apps
export type DevToolsPanel = 'logs' | 'audio' | 'video' | 'data' | 'pipeline' | 'content' | 'media';

export interface AppHealthConfig {
  localPort?: number;
  healthEndpoint?: string;
  requiredServices?: BackendService[];
}

export interface AppDevToolsConfig {
  panels?: DevToolsPanel[];
  customPanels?: string[];
}

export interface AppverseApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AppCategory;
  urls: {
    github?: string;
    local?: string;
    production?: string;
  };
  status: AppStatus;
  version?: string;
  features?: string[];
  apiDependencies?: string[];
  lastUpdated?: string;
  healthConfig?: AppHealthConfig;
  devToolsConfig?: AppDevToolsConfig;
}

// Legacy export for backwards compatibility
export type EchoverseApp = AppverseApp;

export const APPVERSE_APPS: AppverseApp[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // DEVTOOLS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'master-devtools',
    name: 'Master DevTools',
    description: 'Unified monitoring and control center for all Appverse applications',
    icon: Terminal,
    category: 'devtools',
    urls: {
      github: 'https://github.com/Nymfarious/Master-DevTools',
      local: 'http://localhost:8080',
      production: 'https://nymfarious.github.io/Master-DevTools/',
    },
    status: 'ready',
    version: '3.4.0',
    features: ['App monitoring', 'API registry', 'Pipeline tracking', 'Unified auth'],
    apiDependencies: ['supabase'],
    lastUpdated: '2024-12-29',
    healthConfig: {
      localPort: 8080,
      requiredServices: ['database', 'auth'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'pipeline'],
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESEARCH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'proveit',
    name: 'ProveIt',
    description: 'Personal fact-checker & media bias tracker with reading analytics',
    icon: Search,
    category: 'research',
    urls: {
      github: 'https://github.com/Nymfarious/ProveIt',
      local: 'http://localhost:5180',
      production: 'https://nymfarious.github.io/ProveIt/',
    },
    status: 'ready',
    version: '2.3.3',
    features: ['Fact-checking', 'Bias tracking', 'Reading analytics', 'Export reports'],
    apiDependencies: ['supabase', 'newsdata', 'gemini'],
    lastUpdated: '2024-12-29',
    healthConfig: {
      localPort: 5180,
      requiredServices: ['database', 'auth'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'pipeline'],
      customPanels: ['bias-analytics', 'fact-check-queue'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'juniper',
    name: 'Juniper Voice Assistant',
    description: 'Voice-controlled assistant with TTS and speech recognition',
    icon: Mic,
    category: 'audio',
    urls: {
      github: 'https://github.com/Nymfarious/Juniper-Voice-Assistant',
      local: 'http://localhost:5177',
      production: 'https://nymfarious.github.io/Juniper-Voice-Assistant/',
    },
    status: 'ready',
    version: '1.0.0',
    features: ['Speech recognition', 'TTS', 'Voice commands', 'ElevenLabs integration'],
    apiDependencies: ['elevenlabs', 'web-speech'],
    lastUpdated: '2024-12-29',
    healthConfig: {
      localPort: 5177,
    },
    devToolsConfig: {
      panels: ['logs', 'audio'],
    },
  },
  {
    id: 'ddrummer',
    name: 'dDrummer Rhythm Studio',
    description: 'Rhythm training app with beat detection and practice modes',
    icon: Music,
    category: 'audio',
    urls: {
      github: 'https://github.com/Nymfarious/ddrummer-rhythm-studio',
      local: 'http://localhost:5176',
    },
    status: 'development',
    features: ['Beat detection', 'Practice modes', 'Metronome'],
    apiDependencies: ['supabase', 'web-audio'],
    healthConfig: {
      localPort: 5176,
      requiredServices: ['database'],
    },
    devToolsConfig: {
      panels: ['logs', 'audio', 'data'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIA
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sprite-slicer',
    name: 'Sprite Slicer Studio',
    description: 'Slice sprite sheets into individual assets with grid tools, tagging, and batch export',
    icon: Scissors,
    category: 'media',
    urls: {
      github: 'https://github.com/Nymfarious/Sprite-Slicer-Studio-v4_5',
      local: 'http://localhost:5173',
      production: 'https://nymfarious.github.io/Sprite-Slicer-Studio-v4_5/',
    },
    status: 'ready',
    version: '4.5',
    features: ['Grid slicing', 'Freeform select', 'Tag management', 'ZIP export', 'Testing dashboard'],
    apiDependencies: ['supabase'],
    lastUpdated: '2024-12-22',
    healthConfig: {
      localPort: 5173,
      requiredServices: ['database', 'storage'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'media'],
    },
  },
  {
    id: 'perfectframe-ai',
    name: 'FramePerfect AI',
    description: 'Extract, analyze, and curate video frames with Gemini AI quality grading',
    icon: Film,
    category: 'media',
    urls: {
      github: 'https://github.com/Nymfarious/FramePerfect-AI',
      local: 'http://localhost:5174',
    },
    status: 'ready',
    version: '1.0',
    features: ['Frame extraction', 'AI analysis', 'Quality grading', 'Batch enhance'],
    apiDependencies: ['gemini'],
    lastUpdated: '2024-12-22',
    healthConfig: {
      localPort: 5174,
      requiredServices: ['storage'],
    },
    devToolsConfig: {
      panels: ['logs', 'video', 'pipeline'],
    },
  },
  {
    id: 'video-extractor',
    name: 'Video Extractor',
    description: 'Extract and process video frames with timeline editing',
    icon: Video,
    category: 'media',
    urls: {
      github: 'https://github.com/Nymfarious/C-dmedia-pipeline',
      local: 'http://localhost:5178',
    },
    status: 'development',
    features: ['Timeline editing', 'Frame export', 'Batch processing'],
    healthConfig: {
      localPort: 5178,
      requiredServices: ['storage'],
    },
    devToolsConfig: {
      panels: ['logs', 'video', 'pipeline', 'media'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATIVE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'miku-live-layer',
    name: 'Miku Live Layer Studio',
    description: 'VTuber asset creator with AI image decomposition and expression generation',
    icon: Layers,
    category: 'creative',
    urls: {
      github: 'https://github.com/Nymfarious/A-miku-studio-v1',
      local: 'http://localhost:5175',
    },
    status: 'development',
    version: '0.1',
    features: ['Image decomposition', 'Expression generation', 'Layer export'],
    apiDependencies: ['supabase', 'gemini'],
    healthConfig: {
      localPort: 5175,
      requiredServices: ['database', 'storage'],
    },
    devToolsConfig: {
      panels: ['logs', 'media', 'pipeline'],
    },
  },
  {
    id: 'storybook-builder',
    name: 'Storybook Builder',
    description: 'Create and organize interactive storybooks with rich text and media',
    icon: BookOpen,
    category: 'creative',
    urls: {
      github: 'https://github.com/Nymfarious/Storybook-Builder',
      local: 'http://localhost:5179',
    },
    status: 'development',
    features: ['Story creation', 'Rich text editing', 'Media integration'],
    apiDependencies: ['supabase'],
    healthConfig: {
      localPort: 5179,
      requiredServices: ['database', 'storage'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'content', 'media'],
    },
  },
];

// Legacy export for backwards compatibility
export const ECHOVERSE_APPS = APPVERSE_APPS;

export const APP_CATEGORIES: Record<AppCategory, { label: string; color: string }> = {
  devtools: { label: 'DevTools', color: 'bg-emerald-500' },
  research: { label: 'Research', color: 'bg-amber-500' },
  media: { label: 'Media', color: 'bg-blue-500' },
  audio: { label: 'Audio', color: 'bg-purple-500' },
  creative: { label: 'Creative', color: 'bg-pink-500' },
  utility: { label: 'Utility', color: 'bg-gray-500' },
};

export const APP_STATUS_STYLES: Record<AppStatus, { label: string; color: string; bg: string }> = {
  ready: { label: 'Ready', color: 'text-green-400', bg: 'bg-green-500/20' },
  development: { label: 'In Dev', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  planned: { label: 'Planned', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  offline: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/20' },
};

// Helper to get apps by category
export const getAppsByCategory = (category: AppCategory | 'all'): AppverseApp[] => {
  if (category === 'all') return APPVERSE_APPS;
  return APPVERSE_APPS.filter(app => app.category === category);
};

// Helper to search apps
export const searchApps = (query: string): AppverseApp[] => {
  const lower = query.toLowerCase();
  return APPVERSE_APPS.filter(app => 
    app.name.toLowerCase().includes(lower) ||
    app.description.toLowerCase().includes(lower) ||
    app.features?.some(f => f.toLowerCase().includes(lower))
  );
};

// Helper to get app by ID
export const getAppById = (id: string): AppverseApp | undefined => {
  return APPVERSE_APPS.find(app => app.id === id);
};
