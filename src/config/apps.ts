// App Registry v3.4.1 - Appverse apps configuration with health, devtools & todos
// UPDATED: Added todos field for hover card status display
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

// NEW: Todo tracking for app cards
export interface AppTodos {
  inDev?: string[];              // Currently being built
  wishlist?: string[];           // Future ideas
  blocked?: string[];            // Waiting on something
  recentlyCompleted?: string[];  // Just finished (for changelog feel)
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
  todos?: AppTodos;  // NEW
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
    version: '3.4.1',
    features: ['App monitoring', 'API registry', 'Pipeline tracking', 'Unified auth', 'Todo hover cards'],
    apiDependencies: ['supabase'],
    lastUpdated: '2024-12-30',
    healthConfig: {
      localPort: 8080,
      requiredServices: ['database', 'auth'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'pipeline'],
    },
    todos: {
      recentlyCompleted: [
        'App card todo hover feature',
        'Version sync across apps',
      ],
      inDev: [
        'Cross-app localStorage viewer',
        'Remote DevTools commands',
      ],
      wishlist: [
        'Unified SSO between all apps',
        'Real-time app health WebSocket',
        'Deployment status from GitHub Actions',
      ],
    },
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESEARCH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'proveit',
    name: 'ProveIt',
    description: 'Personal fact-checker & media bias tracker with AI-powered analysis',
    icon: Search,
    category: 'research',
    urls: {
      github: 'https://github.com/Nymfarious/ProveIt',
      local: 'http://localhost:5180',
      production: 'https://nymfarious.github.io/ProveIt/',
    },
    status: 'ready',
    version: '3.4.2',  // FIXED: Was 2.3.3
    features: [
      'Fact-checking (Gemini AI)',
      'Media authenticity checker',
      'Bias tracking',
      'Reading analytics',
      'Research Mode (beta)',
      'Founding documents library',
      'SCOTUS case analysis',
    ],
    apiDependencies: ['supabase', 'newsdata', 'gemini'],
    lastUpdated: '2024-12-30',
    healthConfig: {
      localPort: 5180,
      requiredServices: ['database', 'auth'],
    },
    devToolsConfig: {
      panels: ['logs', 'data', 'pipeline'],
      customPanels: ['bias-analytics', 'fact-check-queue'],
    },
    todos: {
      recentlyCompleted: [
        'Remove all contractions from UI',
        '7-day test data generator',
        'API key storage clarity',
      ],
      inDev: [
        'Vision API for image analysis (v3.5.0)',
        'Live source aggregation for Research Mode',
      ],
      wishlist: [
        'Practice paywall integration',
        'Week-over-week score comparison',
        'PDF export for reports',
        'Browser extension',
        'Juniper voice integration',
      ],
      blocked: [
        'Spectral audio analysis - awaiting API support',
      ],
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
    todos: {
      inDev: [
        'ProveIt fact-check voice commands',
        'Wake word detection',
      ],
      wishlist: [
        'Multiple voice personas',
        'Conversation memory',
        'Smart home integration',
      ],
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
    todos: {
      inDev: [
        'BPM detection accuracy',
        'Practice session recording',
      ],
      wishlist: [
        'MIDI input support',
        'Drum kit visualizer',
        'Lesson library',
      ],
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
    todos: {
      recentlyCompleted: [
        'OAuth login (Discord, GitHub, Google)',
        'Supabase storage integration',
      ],
      inDev: [
        'Animation preview panel',
        'Batch rename tool',
      ],
      wishlist: [
        'AI-powered auto-slice detection',
        'Sprite animation timeline',
      ],
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
    todos: {
      inDev: [
        'Batch processing queue',
        'Quality threshold presets',
      ],
      wishlist: [
        'Scene detection',
        'Face blur for privacy',
      ],
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
    todos: {
      inDev: [
        'Timeline scrubber',
        'Keyframe markers',
      ],
      wishlist: [
        'Audio waveform display',
        'Export to GIF',
      ],
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
    todos: {
      inDev: [
        'Layer separation AI',
        'Expression keyframe editor',
      ],
      wishlist: [
        'Live2D export',
        'Lip sync automation',
        'OBS integration',
      ],
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
    todos: {
      inDev: [
        'Chapter navigation',
        'Image placement tools',
      ],
      wishlist: [
        'AI illustration generation',
        'Voice narration (Juniper)',
        'EPUB export',
      ],
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

// NEW: Helper to get apps with pending todos
export const getAppsWithTodos = (): AppverseApp[] => {
  return APPVERSE_APPS.filter(app => 
    app.todos?.inDev?.length || 
    app.todos?.wishlist?.length || 
    app.todos?.blocked?.length
  );
};
