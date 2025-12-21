import { 
  LayoutDashboard, 
  Rocket,
  Network, 
  ScrollText, 
  GitBranch, 
  Shield, 
  Database, 
  Palette, 
  Bot, 
  Volume2, 
  Film, 
  Package, 
  Settings,
  Workflow,
  FileJson,
  Keyboard,
  Wand2,
  Archive,
  LucideIcon 
} from 'lucide-react';
import type { SectionId, DevToolsSection } from '../types';

/**
 * All available DevTools sections
 * Used by both full and mini modes
 */
export const DEVTOOLS_SECTIONS: DevToolsSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    description: 'System status and quick stats',
    shortcut: '⌘1',
    phase: 1,
  },
  {
    id: 'apps',
    label: 'App Launcher',
    icon: Rocket,
    description: 'Jump to Echoverse apps',
    shortcut: '⌘2',
    phase: 2,
  },
  {
    id: 'apis',
    label: 'API Registry',
    icon: Network,
    description: 'API health and registry',
    shortcut: '⌘3',
    phase: 3,
  },
  {
    id: 'logs',
    label: 'Event Logs',
    icon: ScrollText,
    description: 'Real-time error and event logs',
    shortcut: '⌘4',
    phase: 3,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    description: 'Asset generation pipeline',
    shortcut: '⌘5',
    phase: 3,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'API keys and permissions',
    shortcut: '⌘6',
    phase: 4,
  },
  {
    id: 'data',
    label: 'Data & Test',
    icon: Database,
    description: 'Database tools and test data',
    shortcut: '⌘7',
    phase: 4,
  },
  {
    id: 'tokens',
    label: 'UI Tokens',
    icon: Palette,
    description: 'Design tokens and theme',
    shortcut: '⌘8',
    phase: 4,
  },
  {
    id: 'libraries',
    label: 'Libraries',
    icon: Package,
    description: 'Dependency management',
    shortcut: '⌘9',
    phase: 4,
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileJson,
    description: 'JSON content inspector',
    shortcut: '⌘0',
    phase: 5,
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: Volume2,
    description: 'Audio mixer and TTS controls',
    shortcut: '⌘A',
    phase: 5,
  },
  {
    id: 'flowchart',
    label: 'Flowchart',
    icon: Workflow,
    description: 'Visual node graph editor',
    shortcut: '⌘F',
    phase: 6,
  },
  {
    id: 'agents',
    label: 'MCP/Agents',
    icon: Bot,
    description: 'AI agent management',
    shortcut: '⌘G',
    phase: 6,
  },
  {
    id: 'video',
    label: 'Animation',
    icon: Film,
    description: 'Rive runtime debugger',
    shortcut: '⌘V',
    phase: 6,
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    icon: Keyboard,
    description: 'Keyboard shortcuts reference',
    shortcut: '⌘/',
    phase: 10,
  },
  {
    id: 'styleguide',
    label: 'Style Guide',
    icon: Palette,
    description: 'Design tokens and patterns',
    shortcut: '⌘;',
    phase: 10,
  },
  {
    id: 'generator',
    label: 'Generator',
    icon: Wand2,
    description: 'Panel code generator',
    phase: 10,
  },
  {
    id: 'export',
    label: 'Export',
    icon: Archive,
    description: 'Export logs and data',
    phase: 10,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'DevTools configuration',
    shortcut: '⌘,',
    phase: 7,
  },
];

/** Main navigation sections */
export const MAIN_SECTIONS = DEVTOOLS_SECTIONS.slice(0, 9);

/** Meta/settings sections */
export const META_SECTIONS = DEVTOOLS_SECTIONS.slice(9);

/**
 * Get section by ID
 */
export function getSectionById(id: SectionId): DevToolsSection | undefined {
  return DEVTOOLS_SECTIONS.find(section => section.id === id);
}

/**
 * Get section icon by ID
 */
export function getSectionIcon(id: SectionId): LucideIcon | undefined {
  return getSectionById(id)?.icon;
}

/**
 * Get section phase by ID
 */
export function getSectionPhase(id: SectionId): number {
  return getSectionById(id)?.phase ?? 1;
}

/**
 * Filter sections based on config
 */
export function getEnabledSections(
  enabled?: SectionId[],
  disabled?: SectionId[]
): DevToolsSection[] {
  return DEVTOOLS_SECTIONS.filter(section => {
    if (disabled?.includes(section.id)) return false;
    if (enabled && !enabled.includes(section.id)) return false;
    return true;
  });
}
