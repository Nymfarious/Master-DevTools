// Agent Flows Panel - Multi-agent workflow creator with registered agents
// Combines workflow editor + MCP/Agents functionality

import { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Plus, Bot, 
  Workflow, ArrowRight, Sparkles, MessageSquare, Settings2,
  Send, Copy, Clock, CheckCircle, Timer, ArrowUpDown, GripHorizontal,
  Search, Code, Merge, X
} from 'lucide-react';
import { FlowchartNode, ConnectionLine } from './flowchart';
import type { FlowNode, FlowEdge } from './flowchart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import { useLogsStore } from '@/stores/logsStore';
import { usePipelineStore } from '@/stores/pipelineStore';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AgentNodeType = 'agent' | 'action' | 'decision' | 'input' | 'output';

interface AgentNode extends FlowNode {
  agentType?: AgentNodeType;
  model?: string;
  systemPrompt?: string;
}

interface RegisteredAgent {
  id: string;
  name: string;
  description: string;
  provider: string;
  status: 'online' | 'offline' | 'planned' | 'error';
  avgResponseTime: number;
  usageCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

// Registered agents (from MCP/Agents)
const registeredAgents: RegisteredAgent[] = [
  {
    id: 'story-illustrator',
    name: 'Story Illustrator',
    description: 'Generates images for storybook pages',
    provider: 'Gemini 2.5 + Replicate',
    status: 'online',
    avgResponseTime: 3200,
    usageCount: 1247,
  },
  {
    id: 'grammar-guardian',
    name: 'Grammar Guardian',
    description: 'Checks and corrects text for grammar issues',
    provider: 'Claude 3.5',
    status: 'online',
    avgResponseTime: 800,
    usageCount: 892,
  },
  {
    id: 'voice-narrator',
    name: 'Voice Narrator',
    description: 'Generates TTS narration for pages',
    provider: 'ElevenLabs',
    status: 'online',
    avgResponseTime: 2100,
    usageCount: 456,
  },
  {
    id: 'timeline-weaver',
    name: 'Timeline Weaver',
    description: 'Organizes story events chronologically',
    provider: 'GPT-4',
    status: 'offline',
    avgResponseTime: 1500,
    usageCount: 0,
  },
  {
    id: 'character-designer',
    name: 'Character Designer',
    description: 'Creates character profiles and portraits',
    provider: 'Claude + Firefly',
    status: 'planned',
    avgResponseTime: 0,
    usageCount: 0,
  },
];

// Site Map Nodes for Sprite-Slicer-Studio
const siteMapNodes: AgentNode[] = [
  {
    id: 'page-index',
    type: 'user',
    label: '/ (Index)',
    position: { x: 60, y: 120 },
    ports: {
      inputs: [],
      outputs: [
        { id: 'to-dashboard', label: 'dashboard', type: 'string' },
        { id: 'to-auth', label: 'auth', type: 'string' },
        { id: 'to-demo', label: 'demo', type: 'string' },
      ],
    },
    style: { color: 'cyan', icon: 'home' },
  },
  {
    id: 'page-dashboard',
    type: 'function',
    label: '/dashboard',
    position: { x: 300, y: 40 },
    ports: {
      inputs: [{ id: 'from-index', label: 'from', type: 'string' }],
      outputs: [
        { id: 'panels', label: 'panels', type: 'object' },
      ],
    },
    style: { color: 'purple', icon: 'layout' },
  },
  {
    id: 'page-auth',
    type: 'function',
    label: '/auth',
    position: { x: 300, y: 140 },
    ports: {
      inputs: [{ id: 'from-index', label: 'from', type: 'string' }],
      outputs: [
        { id: 'login', label: 'login', type: 'boolean' },
        { id: 'signup', label: 'signup', type: 'boolean' },
      ],
    },
    style: { color: 'green', icon: 'lock' },
  },
  {
    id: 'page-demo',
    type: 'function',
    label: '/demo',
    position: { x: 300, y: 240 },
    ports: {
      inputs: [{ id: 'from-index', label: 'from', type: 'string' }],
      outputs: [
        { id: 'components', label: 'preview', type: 'object' },
      ],
    },
    style: { color: 'amber', icon: 'play' },
  },
  {
    id: 'page-404',
    type: 'user',
    label: '/* (404)',
    position: { x: 540, y: 180 },
    ports: {
      inputs: [{ id: 'any', label: 'any route', type: 'any' }],
      outputs: [],
    },
    style: { color: 'red', icon: 'alert' },
  },
];

const siteMapEdges: FlowEdge[] = [
  { id: 'e-idx-dash', source: { nodeId: 'page-index', portId: 'to-dashboard' }, target: { nodeId: 'page-dashboard', portId: 'from-index' } },
  { id: 'e-idx-auth', source: { nodeId: 'page-index', portId: 'to-auth' }, target: { nodeId: 'page-auth', portId: 'from-index' } },
  { id: 'e-idx-demo', source: { nodeId: 'page-index', portId: 'to-demo' }, target: { nodeId: 'page-demo', portId: 'from-index' } },
];

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
      inputs: [{ id: 'query', label: 'query', type: 'string' }],
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
      inputs: [{ id: 'task', label: 'task', type: 'object' }],
      outputs: [{ id: 'result', label: 'result', type: 'object' }],
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
      inputs: [{ id: 'task', label: 'task', type: 'object' }],
      outputs: [{ id: 'result', label: 'result', type: 'object' }],
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
      inputs: [{ id: 'task', label: 'task', type: 'object' }],
      outputs: [{ id: 'code', label: 'code', type: 'string' }],
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
      outputs: [{ id: 'response', label: 'response', type: 'object' }],
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
      inputs: [{ id: 'response', label: 'response', type: 'object' }],
      outputs: [],
    },
    style: { color: 'cyan', icon: 'message-square' },
  },
];

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

const portTypeColorMap: Record<string, string> = {
  string: '#3fb950',
  boolean: '#a371f7',
  number: '#58a6ff',
  object: '#d29922',
  event: '#f85149',
  any: '#8b949e',
};

// Agent templates with icon components
const AGENT_TEMPLATES = [
  { id: 'router', label: 'Router', icon: Workflow, description: 'Routes queries to specialists', model: 'gemini-2.5-flash', color: 'purple' },
  { id: 'researcher', label: 'Researcher', icon: Search, description: 'Conducts research', model: 'gemini-2.5-pro', color: 'blue' },
  { id: 'creative', label: 'Creative', icon: Sparkles, description: 'Generates creative content', model: 'gpt-5', color: 'pink' },
  { id: 'coder', label: 'Coder', icon: Code, description: 'Writes code', model: 'gemini-2.5-flash', color: 'green' },
  { id: 'synthesizer', label: 'Synthesizer', icon: Merge, description: 'Combines results', model: 'gemini-2.5-flash', color: 'amber' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AgentCard({ agent, onTest }: { agent: RegisteredAgent; onTest: () => void }) {
  const statusConfig = {
    online: { color: 'status-light--green', label: 'Online' },
    offline: { color: 'status-light--red', label: 'Offline' },
    planned: { color: 'status-light--amber', label: 'Planned' },
    error: { color: 'status-light--red', label: 'Error' },
  };
  const { color, label } = statusConfig[agent.status];

  return (
    <div className="dev-card flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={cn('status-light mt-1.5', color)} />
        <div>
          <h4 className="font-mono font-semibold text-sm text-foreground">{agent.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-terminal-muted font-mono">
            <span>Provider: {agent.provider}</span>
            <span>Status: {label}</span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="text-xs h-7" disabled={agent.status !== 'online'} onClick={onTest}>
        Test
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════

export function AgentFlowsPanel() {
  // Workflow state
  const [zoom, setZoom] = useState(100);
  const [nodes, setNodes] = useState<AgentNode[]>(initialAgentNodes);
  const [edges, setEdges] = useState<FlowEdge[]>(initialAgentEdges);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'workflow' | 'sitemap'>('workflow');
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom agent dialog state
  const [customAgentOpen, setCustomAgentOpen] = useState(false);
  const [customAgentName, setCustomAgentName] = useState('');
  const [customAgentModel, setCustomAgentModel] = useState('gemini-2.5-flash');
  const [customAgentPrompt, setCustomAgentPrompt] = useState('');

  // Agent console state
  const [selectedAgent, setSelectedAgent] = useState('story-illustrator');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'provider'>('name');

  const { addLog } = useLogsStore();
  const { addEvent } = usePipelineStore();

  const sortedAgents = useMemo(() => {
    return [...registeredAgents].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') {
        const statusOrder = { online: 0, planned: 1, offline: 2, error: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (sortBy === 'provider') return a.provider.localeCompare(b.provider);
      return 0;
    });
  }, [sortBy]);

  // Get current nodes/edges based on view
  const currentNodes = activeView === 'sitemap' ? siteMapNodes : nodes;
  const currentEdges = activeView === 'sitemap' ? siteMapEdges : edges;

  const handleNodeDrag = useCallback((id: string, pos: { x: number; y: number }) => {
    if (activeView === 'sitemap') return; // Site map is read-only
    setNodes(prev => prev.map(n => n.id === id ? { ...n, position: pos } : n));
  }, [activeView]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  const handlePan = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current) return;
    const startX = e.clientX - pan.x;
    const startY = e.clientY - pan.y;
    const handleMove = (me: MouseEvent) => setPan({ x: me.clientX - startX, y: me.clientY - startY });
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const getPortPosition = (nodeId: string, portId: string, isOutput: boolean) => {
    const node = currentNodes.find(n => n.id === nodeId);
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
    const sourceNode = currentNodes.find(n => n.id === edge.source.nodeId);
    const port = sourceNode?.ports.outputs.find(p => p.id === edge.source.portId);
    return portTypeColorMap[port?.type || 'any'];
  };

  const handleReset = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  // Add agent from template
  const addAgentFromTemplate = (templateId: string) => {
    const template = AGENT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newId = `agent-${templateId}-${Date.now()}`;
    const maxX = Math.max(...nodes.map(n => n.position.x), 0);
    
    const newNode: AgentNode = {
      id: newId,
      type: 'function',
      label: `${template.label.toUpperCase()} AGENT`,
      position: { x: maxX + 200, y: 150 },
      agentType: 'agent',
      model: template.model,
      systemPrompt: template.description,
      ports: {
        inputs: [{ id: 'task', label: 'task', type: 'object' }],
        outputs: [{ id: 'result', label: 'result', type: templateId === 'coder' ? 'string' : 'object' }],
      },
      style: { color: template.color, icon: templateId },
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newId);
    toast.success(`Added ${template.label} Agent`);
  };

  // Add custom agent
  const handleAddCustomAgent = () => {
    if (!customAgentName.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    const newId = `agent-custom-${Date.now()}`;
    const maxX = Math.max(...nodes.map(n => n.position.x), 0);

    const newNode: AgentNode = {
      id: newId,
      type: 'function',
      label: customAgentName.toUpperCase(),
      position: { x: maxX + 200, y: 150 },
      agentType: 'agent',
      model: customAgentModel,
      systemPrompt: customAgentPrompt || 'Custom agent',
      ports: {
        inputs: [{ id: 'input', label: 'input', type: 'object' }],
        outputs: [{ id: 'output', label: 'output', type: 'object' }],
      },
      style: { color: 'blue', icon: 'bot' },
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newId);
    setCustomAgentOpen(false);
    setCustomAgentName('');
    setCustomAgentPrompt('');
    toast.success(`Added Custom Agent: ${customAgentName}`);
  };

  // Send prompt to agent
  const sendPrompt = async () => {
    const agent = registeredAgents.find(a => a.id === selectedAgent);
    if (!agent || agent.status !== 'online' || !prompt.trim()) return;

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();
    addLog('info', `Sending prompt to ${agent.name}...`, undefined, 'agents-panel');

    await new Promise(resolve => setTimeout(resolve, agent.avgResponseTime));

    const elapsed = Date.now() - startTime;
    setDuration(elapsed);

    const mockResponse: Record<string, unknown> = {
      status: 'success',
      agent: agent.name,
      model: agent.provider,
      duration_ms: elapsed,
      tokens_used: Math.floor(Math.random() * 2000) + 500,
    };

    if (agent.id === 'story-illustrator') {
      mockResponse.image_url = 'https://placeholder.com/generated.png';
    } else if (agent.id === 'grammar-guardian') {
      mockResponse.corrected_text = prompt;
      mockResponse.corrections = 0;
    } else if (agent.id === 'voice-narrator') {
      mockResponse.audio_url = 'https://placeholder.com/audio.mp3';
      mockResponse.duration_sec = 12.5;
    }

    setResponse(mockResponse);
    setIsLoading(false);

    addEvent({
      id: crypto.randomUUID(),
      step: 'custom',
      provider: 'custom',
      duration_ms: elapsed,
      success: true,
      metadata: { agent: agent.id, prompt_length: prompt.length },
      created_at: new Date(),
    });

    addLog('success', `${agent.name} responded in ${elapsed}ms`, undefined, 'agents-panel');
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      toast.success('Response copied to clipboard');
    }
  };

  const handleTestAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setPrompt('Test prompt for ' + registeredAgents.find(a => a.id === agentId)?.name);
  };

  const selectedNodeData = currentNodes.find(n => n.id === selectedNode);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <Tabs defaultValue="workflow" className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                  <Bot className="w-5 h-5 text-signal-purple" />
                  Agent Flows
                </h1>
                <p className="text-sm text-muted-foreground">
                  Design multi-agent workflows & manage registered agents
                </p>
              </div>
              <TabsList className="h-8">
                <TabsTrigger value="workflow" className="text-xs h-7">Workflow Editor</TabsTrigger>
                <TabsTrigger value="agents" className="text-xs h-7">Registered Agents</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Workflow Editor Tab */}
          <TabsContent value="workflow" className="flex-1 flex flex-col space-y-4 mt-0">
            {/* View Toggle & Zoom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeView === 'workflow' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveView('workflow')}
                >
                  Agent Workflow
                </Button>
                <Button
                  variant={activeView === 'sitemap' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setActiveView('sitemap')}
                >
                  Site Map
                </Button>
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
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => { setNodes(initialAgentNodes); setEdges(initialAgentEdges); }}>
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Agent Templates Bar (only in workflow view) */}
            {activeView === 'workflow' && (
              <div className="flex items-center gap-2 p-2 terminal-glass rounded-lg">
                <span className="text-xs text-muted-foreground font-mono mr-2">Add Agent:</span>
                {AGENT_TEMPLATES.map(template => (
                  <Tooltip key={template.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => addAgentFromTemplate(template.id)}
                      >
                        <template.icon className="w-3 h-3" />
                        {template.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">{template.description}</p>
                      <p className="text-[10px] text-muted-foreground">Model: {template.model}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setCustomAgentOpen(true)}>
                  <Plus className="w-3 h-3" />
                  Custom Agent
                </Button>
              </div>
            )}

            <div className="flex gap-4 flex-1 min-h-0">
              {/* Canvas */}
              <div
                ref={containerRef}
                className="relative flex-1 bg-terminal-bg border border-terminal-border rounded-lg overflow-hidden cursor-move grid-bg"
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
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    {currentEdges.map(edge => {
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
                  {currentNodes.map(node => (
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
                      <span className="text-terminal-muted">{activeView === 'sitemap' ? 'Page' : 'Agent'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-signal-amber" />
                      <span className="text-terminal-muted">{activeView === 'sitemap' ? 'Route' : 'Data Flow'}</span>
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
                        <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{selectedNodeData.systemPrompt}</p>
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
          </TabsContent>

          {/* Registered Agents Tab */}
          <TabsContent value="agents" className="flex-1 mt-0">
            <ResizablePanelGroup direction="vertical" className="flex-1 h-full">
              <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                <div className="h-full flex flex-col">
                  <div className="section-header flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3" />
                      <span>Registered Agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'status' | 'provider')}>
                        <SelectTrigger className="h-6 w-24 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name" className="text-xs">Name</SelectItem>
                          <SelectItem value="status" className="text-xs">Status</SelectItem>
                          <SelectItem value="provider" className="text-xs">Provider</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 pr-3 pb-2">
                      {sortedAgents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} onTest={() => handleTestAgent(agent.id)} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors">
                <div className="flex items-center justify-center h-full">
                  <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
              </ResizableHandle>

              <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                <div className="h-full flex flex-col p-2">
                  <div className="dev-card flex-1 flex flex-col">
                    <div className="section-header">
                      <Sparkles className="w-3 h-3" />
                      <span>Prompt Console</span>
                    </div>
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">Agent:</span>
                        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                          <SelectTrigger className="w-[200px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {registeredAgents.filter(a => a.status === 'online').map(a => (
                              <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        placeholder="Enter your prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-1 min-h-[80px] text-sm font-mono bg-background resize-none"
                      />

                      <div className="flex items-center justify-between">
                        <Button onClick={sendPrompt} disabled={isLoading || !prompt.trim()} size="sm" className="gap-2">
                          {isLoading ? (
                            <>
                              <Timer className="w-3 h-3 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Send Prompt
                            </>
                          )}
                        </Button>
                        <span className="text-xs text-muted-foreground font-mono">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Est: ~{((registeredAgents.find(a => a.id === selectedAgent)?.avgResponseTime || 0) / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {response && (
                    <div className="dev-card mt-2">
                      <div className="section-header">
                        <CheckCircle className="w-3 h-3 text-signal-green" />
                        <span>Response</span>
                        <span className="ml-auto text-signal-green text-[10px]">Completed in {duration}ms</span>
                      </div>
                      <pre className="bg-background p-3 rounded text-xs font-mono text-signal-cyan overflow-x-auto max-h-32">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={copyResponse}>
                          <Copy className="w-3 h-3" />
                          Copy Response
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
        </Tabs>

        {/* Custom Agent Dialog */}
        <Dialog open={customAgentOpen} onOpenChange={setCustomAgentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Create Custom Agent
              </DialogTitle>
              <DialogDescription>
                Define a new custom agent with your own configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Data Validator"
                  value={customAgentName}
                  onChange={(e) => setCustomAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-model">Model</Label>
                <Select value={customAgentModel} onValueChange={setCustomAgentModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                    <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                    <SelectItem value="claude-3.5">Claude 3.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-prompt">System Prompt</Label>
                <Textarea
                  id="agent-prompt"
                  placeholder="Describe what this agent should do..."
                  value={customAgentPrompt}
                  onChange={(e) => setCustomAgentPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomAgentOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCustomAgent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
