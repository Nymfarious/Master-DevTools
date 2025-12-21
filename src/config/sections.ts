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
  FileJson,
  Workflow,
  Keyboard,
  Wand2,
  Archive,
  LucideIcon 
} from 'lucide-react';
import type { SectionId, DevToolsSection } from '@/types/devtools';

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
    phase: 1,
  },
  {
    id: 'apis',
    label: 'API Registry',
    icon: Network,
    description: 'All APIs with health checks',
    shortcut: '⌘3',
    phase: 2,
  },
  {
    id: 'logs',
    label: 'Event Logs',
    icon: ScrollText,
    description: 'Error console and warnings',
    shortcut: '⌘4',
    phase: 2,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    description: 'AI generation tracking',
    shortcut: '⌘5',
    phase: 2,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Edge functions and RLS',
    shortcut: '⌘6',
    phase: 3,
  },
  {
    id: 'data',
    label: 'Data & Test',
    icon: Database,
    description: 'Seed data, cache controls',
    shortcut: '⌘7',
    phase: 3,
  },
  {
    id: 'tokens',
    label: 'UI Tokens',
    icon: Palette,
    description: 'Colors and typography',
    shortcut: '⌘8',
    phase: 3,
  },
  {
    id: 'flowchart',
    label: 'Flowchart',
    icon: Workflow,
    description: 'Node-graph architecture view',
    shortcut: '⌘F',
    phase: 6,
  },
  {
    id: 'agents',
    label: 'MCP/Agents',
    icon: Bot,
    description: 'AI agent management',
    shortcut: '⌘9',
    phase: 6,
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: Volume2,
    description: 'Sound system controls',
    shortcut: '⌘0',
    phase: 5,
  },
  {
    id: 'video',
    label: 'Animation',
    icon: Film,
    description: 'Rive and animation debug',
    shortcut: '⌘-',
    phase: 6,
  },
  {
    id: 'libraries',
    label: 'Libraries',
    icon: Package,
    description: 'Dependencies and versions',
    shortcut: '⌘=',
    phase: 4,
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileJson,
    description: 'JSON inspector and validation',
    shortcut: '⌘\\',
    phase: 5,
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
    phase: 1,
  },
];

export const MAIN_SECTIONS = DEVTOOLS_SECTIONS.slice(0, 9);
export const META_SECTIONS = DEVTOOLS_SECTIONS.slice(9);

export function getSectionById(id: SectionId): DevToolsSection | undefined {
  return DEVTOOLS_SECTIONS.find(section => section.id === id);
}

export function getSectionIcon(id: SectionId): LucideIcon | undefined {
  return getSectionById(id)?.icon;
}

export function getSectionPhase(id: SectionId): number {
  return getSectionById(id)?.phase ?? 1;
}
