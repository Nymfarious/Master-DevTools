// Flowchart Data - ~120 lines
// Mock data for flowchart views

import type { FlowNode, FlowEdge, FlowchartView } from './flowchartTypes';

export const flowchartViews: FlowchartView[] = [
  { id: 'echoverse-apps', label: 'Echoverse Apps' },
  { id: 'auth-flow', label: 'Auth Flow' },
  { id: 'pipeline-flow', label: 'AI Pipeline' },
  { id: 'data-model', label: 'Data Model' },
];

export const echoversNodes: FlowNode[] = [
  {
    id: 'master-devtools',
    type: 'app',
    label: 'MASTER DEVTOOLS',
    position: { x: 80, y: 180 },
    ports: {
      inputs: [],
      outputs: [
        { id: 'api', label: 'api', type: 'object' },
        { id: 'auth', label: 'auth', type: 'object' },
        { id: 'db', label: 'db', type: 'object' },
        { id: 'events', label: 'events', type: 'event' },
      ],
    },
    style: { color: 'purple', icon: 'terminal' },
  },
  {
    id: 'storybook',
    type: 'app',
    label: 'STORYBOOK',
    position: { x: 360, y: 60 },
    ports: {
      inputs: [
        { id: 'devtools', label: 'devtools', type: 'object' },
        { id: 'auth', label: 'auth', type: 'object' },
      ],
      outputs: [
        { id: 'stories', label: 'stories', type: 'object' },
      ],
    },
    style: { color: 'blue', icon: 'book' },
  },
  {
    id: 'little-sister',
    type: 'app',
    label: 'LITTLE SISTER',
    position: { x: 360, y: 200 },
    ports: {
      inputs: [
        { id: 'auth', label: 'auth', type: 'object' },
        { id: 'db', label: 'db', type: 'object' },
      ],
      outputs: [
        { id: 'health', label: 'health', type: 'object' },
      ],
    },
    style: { color: 'pink', icon: 'heart' },
  },
  {
    id: 'drummer',
    type: 'app',
    label: 'DRUMMER',
    position: { x: 360, y: 340 },
    ports: {
      inputs: [
        { id: 'auth', label: 'auth', type: 'object' },
        { id: 'audio', label: 'audio', type: 'object' },
      ],
      outputs: [
        { id: 'beats', label: 'beats', type: 'event' },
      ],
    },
    style: { color: 'amber', icon: 'music' },
  },
  {
    id: 'ged-builder',
    type: 'app',
    label: 'GED BUILDER',
    position: { x: 600, y: 130 },
    ports: {
      inputs: [
        { id: 'auth', label: 'auth', type: 'object' },
      ],
      outputs: [
        { id: 'trees', label: 'trees', type: 'object' },
      ],
    },
    style: { color: 'green', icon: 'git-branch' },
  },
  {
    id: 'history-discovery',
    type: 'app',
    label: 'HISTORY DISCOVERY',
    position: { x: 600, y: 280 },
    ports: {
      inputs: [
        { id: 'auth', label: 'auth', type: 'object' },
        { id: 'maps', label: 'maps', type: 'object' },
      ],
      outputs: [
        { id: 'timelines', label: 'timelines', type: 'object' },
      ],
    },
    style: { color: 'cyan', icon: 'map' },
  },
  {
    id: 'supabase',
    type: 'service',
    label: 'SUPABASE',
    position: { x: 80, y: 400 },
    ports: {
      inputs: [],
      outputs: [
        { id: 'auth', label: 'auth', type: 'object' },
        { id: 'db', label: 'database', type: 'object' },
        { id: 'realtime', label: 'realtime', type: 'event' },
      ],
    },
    style: { color: 'green', icon: 'database' },
  },
];

export const echoversEdges: FlowEdge[] = [
  { id: 'e1', source: { nodeId: 'master-devtools', portId: 'api' }, target: { nodeId: 'storybook', portId: 'devtools' } },
  { id: 'e2', source: { nodeId: 'supabase', portId: 'auth' }, target: { nodeId: 'storybook', portId: 'auth' } },
  { id: 'e3', source: { nodeId: 'supabase', portId: 'auth' }, target: { nodeId: 'little-sister', portId: 'auth' } },
  { id: 'e4', source: { nodeId: 'supabase', portId: 'db' }, target: { nodeId: 'little-sister', portId: 'db' } },
  { id: 'e5', source: { nodeId: 'supabase', portId: 'auth' }, target: { nodeId: 'drummer', portId: 'auth' } },
  { id: 'e6', source: { nodeId: 'supabase', portId: 'auth' }, target: { nodeId: 'ged-builder', portId: 'auth' } },
  { id: 'e7', source: { nodeId: 'supabase', portId: 'auth' }, target: { nodeId: 'history-discovery', portId: 'auth' } },
];
