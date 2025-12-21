// Flowchart Helpers - ~50 lines
// Color mappings and icon utilities

import { Terminal, Book, Heart, Music, GitBranch, Map, Database } from 'lucide-react';
import type { PortType, NodeType } from './flowchartTypes';

export const portColors: Record<PortType, string> = {
  string: 'bg-signal-green',
  boolean: 'bg-signal-blue',
  number: 'bg-signal-red',
  object: 'bg-signal-purple',
  event: 'bg-signal-amber',
  any: 'bg-foreground',
};

export const nodeColors: Record<NodeType, string> = {
  app: 'border-signal-blue',
  service: 'border-signal-green',
  database: 'border-signal-purple',
  api: 'border-signal-amber',
  function: 'border-signal-cyan',
  user: 'border-pink-500',
};

export const iconMap: Record<string, typeof Terminal> = {
  terminal: Terminal,
  book: Book,
  heart: Heart,
  music: Music,
  'git-branch': GitBranch,
  map: Map,
  database: Database,
};

export const portTypeColorMap: Record<PortType, string> = {
  string: 'hsl(130, 55%, 48%)',
  boolean: 'hsl(212, 100%, 67%)',
  number: 'hsl(3, 92%, 62%)',
  object: 'hsl(267, 88%, 71%)',
  event: 'hsl(41, 73%, 48%)',
  any: 'hsl(0, 0%, 95%)',
};
