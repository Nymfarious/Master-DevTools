import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLogsStore } from '@/stores/logsStore';
import { usePipelineStore } from '@/stores/pipelineStore';
import { 
  Bot, Send, Copy, Clock, CheckCircle, Timer, Sparkles, ArrowUpDown, GripHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════════════════════════════════════════

interface Agent {
  id: string;
  name: string;
  description: string;
  provider: string;
  status: 'online' | 'offline' | 'planned' | 'error';
  avgResponseTime: number;
  usageCount: number;
}

const agents: Agent[] = [
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

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AgentCard({ agent, onTest }: { agent: Agent; onTest: () => void }) {
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
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs h-7"
        disabled={agent.status !== 'online'}
        onClick={onTest}
      >
        Test
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════

export function AgentsPanel() {
  const [selectedAgent, setSelectedAgent] = useState('story-illustrator');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'provider'>('name');
  const { addLog } = useLogsStore();
  const { addEvent } = usePipelineStore();

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') {
        const statusOrder = { online: 0, planned: 1, offline: 2, error: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (sortBy === 'provider') return a.provider.localeCompare(b.provider);
      return 0;
    });
  }, [sortBy]);

  const sendPrompt = async () => {
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent || agent.status !== 'online' || !prompt.trim()) return;

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    addLog('info', `Sending prompt to ${agent.name}...`, undefined, 'agents-panel');

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, agent.avgResponseTime));

    const elapsed = Date.now() - startTime;
    setDuration(elapsed);

    // Generate mock response based on agent type
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

    // Log to pipeline
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
    setPrompt('Test prompt for ' + agents.find(a => a.id === agentId)?.name);
  };

  return (
    <div className="h-full flex flex-col">
      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Registered Agents - Upper Section */}
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
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onTest={() => handleTestAgent(agent.id)} 
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        {/* Draggable Handle */}
        <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/20 transition-colors">
          <div className="flex items-center justify-center h-full">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

        {/* Prompt Console - Lower Section */}
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
                      {agents.filter(a => a.status === 'online').map(a => (
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
                  <Button 
                    onClick={sendPrompt} 
                    disabled={isLoading || !prompt.trim()}
                    size="sm"
                    className="gap-2"
                  >
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
                    Est: ~{((agents.find(a => a.id === selectedAgent)?.avgResponseTime || 0) / 1000).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Response */}
            {response && (
              <div className="dev-card mt-2">
                <div className="section-header">
                  <CheckCircle className="w-3 h-3 text-signal-green" />
                  <span>Response</span>
                  <span className="ml-auto text-signal-green text-[10px]">
                    Completed in {duration}ms
                  </span>
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
    </div>
  );
}
