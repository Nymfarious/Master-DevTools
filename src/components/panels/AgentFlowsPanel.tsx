// Agent Flows Panel - Multi-agent workflow creator
// Uses flowchart components for visual agent workflow editing

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Plus, Bot, 
  Workflow, ArrowRight, Sparkles, MessageSquare, Settings2 
} from 'lucide-react';
import { FlowchartNode, ConnectionLine } from './flowchart';
import type { FlowNode, FlowEdge } from './flowchart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Agent-specific node types
type AgentNodeType = 'agent' | 'action' | 'decision' | 'input' | 'output';

interface AgentNode extends FlowNode {
  agentType?: AgentNodeType;
  model?: string;
  systemPrompt?: string;
}

// Initial agent workflow nodes
const initialAgentNodes: AgentNode[] = [
  {
    id: 'user-input',
    type: 'user',
    label: 'USER INPUT',
    position: { x: 60, y: 200 },
    agentType: 'input',
    ports: {
      inputs: [],
      outputs: [
        { id: 'query', label: 'query', type: 'string' },
        { id: 'context', label: 'context', type: 'object' },
      ],
    },
    style: { color: 'cyan', icon: 'user' },
  },
  {
    id: 'agent-router',
    type: 'function',
    label: 'ROUTER AGENT',
    position: { x: 300, y: 120 },
    agentType: 'agent',
    model: 'gemini-2.5-flash',
    systemPrompt: 'Analyze the user query and route to the appropriate specialist agent.',
    ports: {
      inputs: [
        { id: 'query', label: 'query', type: 'string' },
      ],
      outputs: [
        { id: 'research', label: 'research', type: 'object' },
        { id: 'creative', label: 'creative', type: 'object' },
        { id: 'code', label: 'code', type: 'object' },
      ],
    },
    style: { color: 'purple', icon: 'bot' },
  },
  {
    id: 'agent-research',
    type: 'function',
    label: 'RESEARCH AGENT',
    position: { x: 540, y: 40 },
    agentType: 'agent',
    model: 'gemini-2.5-pro',
    systemPrompt: 'Conduct thorough research and provide factual, well-sourced answers.',
    ports: {
      inputs: [
        { id: 'task', label: 'task', type: 'object' },
      ],
      outputs: [
        { id: 'result', label: 'result', type: 'object' },
      ],
    },
    style: { color: 'blue', icon: 'search' },
  },
  {
    id: 'agent-creative',
    type: 'function',
    label: 'CREATIVE AGENT',
    position: { x: 540, y: 180 },
    agentType: 'agent',
    model: 'gpt-5',
    systemPrompt: 'Generate creative content with imagination and style.',
    ports: {
      inputs: [
        { id: 'task', label: 'task', type: 'object' },
      ],
      outputs: [
        { id: 'result', label: 'result', type: 'object' },
      ],
    },
    style: { color: 'pink', icon: 'sparkles' },
  },
  {
    id: 'agent-coder',
    type: 'function',
    label: 'CODER AGENT',
    position: { x: 540, y: 320 },
    agentType: 'agent',
    model: 'gemini-2.5-flash',
    systemPrompt: 'Write clean, efficient code with proper documentation.',
    ports: {
      inputs: [
        { id: 'task', label: 'task', type: 'object' },
      ],
      outputs: [
        { id: 'code', label: 'code', type: 'string' },
      ],
    },
    style: { color: 'green', icon: 'code' },
  },
  {
    id: 'synthesizer',
    type: 'function',
    label: 'SYNTHESIZER',
    position: { x: 780, y: 180 },
    agentType: 'agent',
    model: 'gemini-2.5-flash',
    systemPrompt: 'Combine and format results from specialist agents into a coherent response.',
    ports: {
      inputs: [
        { id: 'research', label: 'research', type: 'object' },
        { id: 'creative', label: 'creative', type: 'object' },
        { id: 'code', label: 'code', type: 'string' },
      ],
      outputs: [
        { id: 'response', label: 'response', type: 'object' },
      ],
    },
    style: { color: 'amber', icon: 'merge' },
  },
  {
    id: 'output',
    type: 'user',
    label: 'FINAL OUTPUT',
    position: { x: 1000, y: 200 },
    agentType: 'output',
    ports: {
      inputs: [
        { id: 'response', label: 'response', type: 'object' },
      ],
      outputs: [],
    },
    style: { color: 'cyan', icon: 'message-square' },
  },
];

// Agent workflow connections
const initialAgentEdges: FlowEdge[] = [
  { id: 'e1', source: { nodeId: 'user-input', portId: 'query' }, target: { nodeId: 'agent-router', portId: 'query' } },
  { id: 'e2', source: { nodeId: 'agent-router', portId: 'research' }, target: { nodeId: 'agent-research', portId: 'task' } },
  { id: 'e3', source: { nodeId: 'agent-router', portId: 'creative' }, target: { nodeId: 'agent-creative', portId: 'task' } },
  { id: 'e4', source: { nodeId: 'agent-router', portId: 'code' }, target: { nodeId: 'agent-coder', portId: 'task' } },
  { id: 'e5', source: { nodeId: 'agent-research', portId: 'result' }, target: { nodeId: 'synthesizer', portId: 'research' } },
  { id: 'e6', source: { nodeId: 'agent-creative', portId: 'result' }, target: { nodeId: 'synthesizer', portId: 'creative' } },
  { id: 'e7', source: { nodeId: 'agent-coder', portId: 'code' }, target: { nodeId: 'synthesizer', portId: 'code' } },
  { id: 'e8', source: { nodeId: 'synthesizer', portId: 'response' }, target: { nodeId: 'output', portId: 'response' } },
];

// Port type colors matching flowchart
const portTypeColorMap: Record<string, string> = {
  string: '#3fb950',
  boolean: '#a371f7',
  number: '#58a6ff',
  object: '#d29922',
  event: '#f85149',
  any: '#8b949e',
};

// Available agent templates
const AGENT_TEMPLATES = [
  { id: 'router', label: 'Router', icon: Workflow, description: 'Routes queries to specialists' },
  { id: 'researcher', label: 'Researcher', icon: Bot, description: 'Conducts research' },
  { id: 'creative', label: 'Creative', icon: Sparkles, description: 'Generates creative content' },
  { id: 'coder', label: 'Coder', icon: Settings2, description: 'Writes code' },
  { id: 'synthesizer', label: 'Synthesizer', icon: MessageSquare, description: 'Combines results' },
];

export function AgentFlowsPanel() {
  const [zoom, setZoom] = useState(100);
  const [nodes, setNodes] = useState<AgentNode[]>(initialAgentNodes);
  const [edges] = useState<FlowEdge[]>(initialAgentEdges);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeDrag = useCallback((id: string, pos: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: pos } : n));
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  const handlePan = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;
    
    const handleMove = (me: MouseEvent) => {
      setPan({ x: me.clientX - startX, y: me.clientY - startY });
    };
    
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const getPortPosition = (nodeId: string, portId: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const ports = isOutput ? node.ports.outputs : node.ports.inputs;
    const portIndex = ports.findIndex(p => p.id === portId);
    const nodeWidth = 150;
    const headerHeight = 32;
    const portHeight = 18;
    
    return {
      x: node.position.x + (isOutput ? nodeWidth : 0),
      y: node.position.y + headerHeight + 8 + portIndex * portHeight + 6,
    };
  };

  const getEdgeColor = (edge: FlowEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source.nodeId);
    const port = sourceNode?.ports.outputs.find(p => p.id === edge.source.portId);
    return portTypeColorMap[port?.type || 'any'];
  };

  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <TooltipProvider>
      <div className="space-y-4 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <Workflow className="w-5 h-5 text-signal-purple" />
              Agent Flows
            </h1>
            <p className="text-sm text-muted-foreground">
              Design multi-agent workflows with visual connections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Zoom: {zoom}%</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(prev => Math.min(200, prev + 10))}>
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setZoom(prev => Math.max(50, prev - 10))}>
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleReset}>
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setNodes(initialAgentNodes)}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Agent Templates Bar */}
        <div className="flex items-center gap-2 p-2 terminal-glass rounded-lg">
          <span className="text-xs text-muted-foreground font-mono mr-2">Add Agent:</span>
          {AGENT_TEMPLATES.map(template => (
            <Tooltip key={template.id}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  <template.icon className="w-3 h-3" />
                  {template.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{template.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
            <Plus className="w-3 h-3" />
            Custom Agent
          </Button>
        </div>

        <div className="flex gap-4">
          {/* Canvas */}
          <div 
            ref={containerRef}
            className="relative flex-1 h-[420px] bg-terminal-bg border border-terminal-border rounded-lg overflow-hidden cursor-move grid-bg"
            onWheel={handleWheel}
            onMouseDown={handlePan}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                transformOrigin: '0 0',
              }}
              className="absolute inset-0"
            >
              {/* SVG Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                {edges.map(edge => {
                  const start = getPortPosition(edge.source.nodeId, edge.source.portId, true);
                  const end = getPortPosition(edge.target.nodeId, edge.target.portId, false);
                  return (
                    <ConnectionLine
                      key={edge.id}
                      startX={start.x}
                      startY={start.y}
                      endX={end.x}
                      endY={end.y}
                      color={getEdgeColor(edge)}
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(selectedNode === node.id && "ring-2 ring-signal-blue rounded-lg")}
                >
                  <FlowchartNode node={node} onDrag={handleNodeDrag} />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-terminal-surface/90 border border-terminal-border rounded p-2 text-[10px] font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Bot className="w-3 h-3 text-signal-purple" />
                  <span className="text-terminal-muted">Agent</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-signal-amber" />
                  <span className="text-terminal-muted">Data Flow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Inspector */}
          <div className="w-64 terminal-glass rounded-lg p-4 space-y-4">
            <h3 className="font-mono font-semibold text-foreground text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Node Inspector
            </h3>
            {selectedNodeData ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <p className="font-mono text-sm text-foreground">{selectedNodeData.label}</p>
                </div>
                {selectedNodeData.model && (
                  <div>
                    <label className="text-xs text-muted-foreground">Model</label>
                    <Badge variant="outline" className="text-[10px] mt-1">{selectedNodeData.model}</Badge>
                  </div>
                )}
                {selectedNodeData.systemPrompt && (
                  <div>
                    <label className="text-xs text-muted-foreground">System Prompt</label>
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                      {selectedNodeData.systemPrompt}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Inputs</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNodeData.ports.inputs.map(p => (
                      <Badge key={p.id} variant="outline" className="text-[10px]">{p.label}</Badge>
                    ))}
                    {selectedNodeData.ports.inputs.length === 0 && (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Outputs</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNodeData.ports.outputs.map(p => (
                      <Badge key={p.id} variant="outline" className="text-[10px]">{p.label}</Badge>
                    ))}
                    {selectedNodeData.ports.outputs.length === 0 && (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Click a node to inspect its properties</p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}