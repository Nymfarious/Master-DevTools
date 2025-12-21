// Flowchart Types - ~40 lines
// Shared type definitions for the flowchart system

export type PortType = 'string' | 'boolean' | 'number' | 'object' | 'event' | 'any';
export type NodeType = 'app' | 'service' | 'database' | 'api' | 'function' | 'user';

export interface Port {
  id: string;
  label: string;
  type: PortType;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  ports: { inputs: Port[]; outputs: Port[] };
  style?: { color?: string; icon?: string };
}

export interface FlowEdge {
  id: string;
  source: { nodeId: string; portId: string };
  target: { nodeId: string; portId: string };
}

export interface FlowchartView {
  id: string;
  label: string;
}
