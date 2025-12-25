// App Registry v3.2.0 - Echoverse apps configuration
import { LucideIcon } from 'lucide-react';
import { 
  Scissors, Music, Film, Layers, Mic, Video, BookOpen
} from 'lucide-react';

export type AppCategory = 'media' | 'audio' | 'creative' | 'utility';
export type AppStatus = 'ready' | 'development' | 'planned' | 'offline';

export interface EchoverseApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: AppCategory;
  urls: {
    github?: string;
    local?: string;
    production?: string;
    lovable?: string;
  };
  status: AppStatus;
  version?: string;
  features?: string[];
  apiDependencies?: string[];
  lastUpdated?: string;
}

export const ECHOVERSE_APPS: EchoverseApp[] = [
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
  },
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
  },
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
    features: ['Speech recognition', 'TTS', 'Voice commands'],
    apiDependencies: ['elevenlabs', 'web-speech'],
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
      lovable: 'https://lovable.dev/projects/3d6719e0-ca22-492d-95be-bb219b4eb4c1',
    },
    status: 'development',
    features: ['Story creation', 'Rich text editing', 'Media integration'],
  },
];

export const APP_CATEGORIES: Record<AppCategory, { label: string; color: string }> = {
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
export const getAppsByCategory = (category: AppCategory | 'all'): EchoverseApp[] => {
  if (category === 'all') return ECHOVERSE_APPS;
  return ECHOVERSE_APPS.filter(app => app.category === category);
};

// Helper to search apps
export const searchApps = (query: string): EchoverseApp[] => {
  const lower = query.toLowerCase();
  return ECHOVERSE_APPS.filter(app => 
    app.name.toLowerCase().includes(lower) ||
    app.description.toLowerCase().includes(lower) ||
    app.features?.some(f => f.toLowerCase().includes(lower))
  );
};
