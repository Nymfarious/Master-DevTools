import { 
  LayoutDashboard, 
  Rocket, 
  Network, 
  ScrollText, 
  GitBranch, 
  Shield, 
  Palette, 
  Bot, 
  Package, 
  Settings,
  FileJson,
  Workflow,
  Keyboard,
  Wand2,
  Archive,
  FlaskConical,
  ClipboardCheck,
  LucideIcon 
} from 'lucide-react';
import type { SectionId, DevToolsSection } from '@/types/devtools';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CATEGORIES FOR v3.0.0
// ═══════════════════════════════════════════════════════════════════════════

export interface SectionCategory {
  id: string;
  label: string;
  sections: DevToolsSection[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MONITORING SECTIONS (6 panels)
// ═══════════════════════════════════════════════════════════════════════════

export const MONITORING_SECTIONS: DevToolsSection[] = [
  {
    id: 'overview',
    label: 'App Launcher',
    icon: Rocket,
    description: 'Select an app to load its context',
    shortcut: '⌘1',
    phase: 1,
  },
  {
    id: 'logs',
    label: 'Event Logs',
    icon: ScrollText,
    description: 'Error console and warnings',
    shortcut: '⌘3',
    phase: 2,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: GitBranch,
    description: 'AI generation tracking',
    shortcut: '⌘4',
    phase: 2,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Edge functions and RLS',
    shortcut: '⌘5',
    phase: 3,
  },
  {
    id: 'apis',
    label: 'API Registry',
    icon: Network,
    description: 'All APIs with health checks',
    shortcut: '⌘6',
    phase: 2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TESTING SECTIONS (1 consolidated panel)
// ═══════════════════════════════════════════════════════════════════════════

export const TESTING_SECTIONS: DevToolsSection[] = [
  {
    id: 'testlab',
    label: 'Test Lab',
    icon: FlaskConical,
    description: 'Audio, Video, Data testing',
    shortcut: '⌘7',
    phase: 3,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE SECTIONS (7 panels including previously unlisted)
// ═══════════════════════════════════════════════════════════════════════════

export const REFERENCE_SECTIONS: DevToolsSection[] = [
  {
    id: 'styleguide',
    label: 'Style Guide',
    icon: Palette,
    description: 'Design tokens and patterns',
    shortcut: '⌘8',
    phase: 10,
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
    id: 'libraries',
    label: 'Libraries',
    icon: Package,
    description: 'Dependencies and versions',
    shortcut: '⌘9',
    phase: 4,
  },
  {
    id: 'tokens',
    label: 'UI Tokens',
    icon: Palette,
    description: 'Colors and typography',
    shortcut: '⌘0',
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
    shortcut: '⌘A',
    phase: 6,
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileJson,
    description: 'JSON inspector and validation',
    shortcut: '⌘\\',
    phase: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS SECTIONS (3 panels)
// ═══════════════════════════════════════════════════════════════════════════

export const TOOLS_SECTIONS: DevToolsSection[] = [
  {
    id: 'build-status',
    label: 'Build Status',
    icon: ClipboardCheck,
    description: 'Track feature completion and dev notes',
    shortcut: '⌘B',
    phase: 1,
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

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIZED SECTIONS (for Sidebar with headers)
// ═══════════════════════════════════════════════════════════════════════════

export const SECTION_CATEGORIES: SectionCategory[] = [
  { id: 'monitoring', label: 'Monitoring', sections: MONITORING_SECTIONS },
  { id: 'testing', label: 'Testing', sections: TESTING_SECTIONS },
  { id: 'reference', label: 'Reference', sections: REFERENCE_SECTIONS },
  { id: 'tools', label: 'Tools', sections: TOOLS_SECTIONS },
];

// ═══════════════════════════════════════════════════════════════════════════
// FLAT LIST (for compatibility)
// ═══════════════════════════════════════════════════════════════════════════

export const DEVTOOLS_SECTIONS: DevToolsSection[] = [
  ...MONITORING_SECTIONS,
  ...TESTING_SECTIONS,
  ...REFERENCE_SECTIONS,
  ...TOOLS_SECTIONS,
];

// Alias for v3.1.0
export const ALL_SECTIONS = DEVTOOLS_SECTIONS;

// Legacy exports for compatibility
export const MAIN_SECTIONS = DEVTOOLS_SECTIONS.slice(0, 7);
export const META_SECTIONS = DEVTOOLS_SECTIONS.slice(7);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getSectionById(id: SectionId): DevToolsSection | undefined {
  return DEVTOOLS_SECTIONS.find(section => section.id === id);
}

export function getSectionIcon(id: SectionId): LucideIcon | undefined {
  return getSectionById(id)?.icon;
}

export function getSectionPhase(id: SectionId): number {
  return getSectionById(id)?.phase ?? 1;
}
