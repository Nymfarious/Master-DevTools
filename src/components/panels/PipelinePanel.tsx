// Pipeline Panel - Enhanced v3.2.0 with Job Cards and Timeline
import { useState, useMemo } from 'react';
import { 
  GitBranch, RefreshCw, Sparkles, Filter, Trash2, 
  Upload, Settings, Scissors, Package, Download,
  Film, Eye, Layers, Bot, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PipelineJobCard, 
  PipelineJob, 
  PipelineStage,
  AIAgentStatus, 
  DEFAULT_AI_AGENTS 
} from '@/components/pipeline';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Stage configurations by app type
const PIPELINE_STAGES: Record<string, Omit<PipelineStage, 'status' | 'progress'>[]> = {
  'sprite-slicer': [
    { id: 'upload', label: 'Upload', icon: Upload, description: 'Upload sprite sheet' },
    { id: 'configure', label: 'Configure', icon: Settings, description: 'Set grid parameters' },
    { id: 'slice', label: 'Slice', icon: Scissors, description: 'Extract individual sprites' },
    { id: 'library', label: 'Library', icon: Package, description: 'Add to sprite library' },
    { id: 'export', label: 'Export', icon: Download, description: 'Export sprite pack' },
  ],
  'perfectframe': [
    { id: 'extraction', label: 'Extract', icon: Film, description: 'Extract video frames' },
    { id: 'analysis', label: 'Analyze', icon: Eye, description: 'AI frame analysis' },
    { id: 'clustering', label: 'Cluster', icon: Layers, description: 'Group similar frames' },
  ],
  'miku-studio': [
    { id: 'decomposition', label: 'Decompose', icon: Layers, description: 'Character decomposition' },
    { id: 'expression', label: 'Expression', icon: Sparkles, description: 'Generate expressions' },
    { id: 'export', label: 'Export', icon: Package, description: 'Prepare export files' },
  ],
};

// Generate mock jobs for demonstration
function generateMockJobs(): PipelineJob[] {
  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000);

  return [
    {
      id: 'job-001',
      name: 'character_sprites_v2.png',
      source: 'Sprite Slicer',
      sourceIcon: Scissors,
      stages: PIPELINE_STAGES['sprite-slicer'].map((s, i) => ({
        ...s,
        status: i < 2 ? 'complete' : i === 2 ? 'active' : 'pending',
        progress: i === 2 ? 65 : undefined,
      })) as PipelineStage[],
      currentStageIndex: 2,
      overallProgress: 65,
      status: 'processing',
      startedAt: fiveMinAgo,
      completedAt: null,
    },
    {
      id: 'job-002',
      name: 'gameplay_recording.mp4',
      source: 'PerfectFrame',
      sourceIcon: Film,
      stages: PIPELINE_STAGES['perfectframe'].map((s) => ({
        ...s,
        status: 'complete',
      })) as PipelineStage[],
      currentStageIndex: 2,
      overallProgress: 100,
      status: 'completed',
      startedAt: twentyMinAgo,
      completedAt: tenMinAgo,
    },
    {
      id: 'job-003',
      name: 'miku_model_expressions.psd',
      source: 'Miku Studio',
      sourceIcon: Sparkles,
      stages: PIPELINE_STAGES['miku-studio'].map((s, i) => ({
        ...s,
        status: i === 0 ? 'complete' : i === 1 ? 'failed' : 'pending',
      })) as PipelineStage[],
      currentStageIndex: 1,
      overallProgress: 35,
      status: 'failed',
      startedAt: tenMinAgo,
      completedAt: null,
      errorMessage: 'Expression generation failed: Model timeout after 30s. Rate limit may have been exceeded.',
    },
  ];
}

type StatusFilter = 'all' | 'processing' | 'completed' | 'failed';
type SourceFilter = 'all' | 'sprite-slicer' | 'perfectframe' | 'miku-studio';

export function PipelinePanel() {
  const [jobs, setJobs] = useState<PipelineJob[]>(generateMockJobs);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAgents, setShowAgents] = useState(true);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (statusFilter !== 'all' && job.status !== statusFilter) return false;
      if (sourceFilter !== 'all') {
        const sourceMap: Record<SourceFilter, string> = {
          'all': '',
          'sprite-slicer': 'Sprite Slicer',
          'perfectframe': 'PerfectFrame',
          'miku-studio': 'Miku Studio',
        };
        if (job.source !== sourceMap[sourceFilter]) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, sourceFilter]);

  // Sort: active first, then by timestamp
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (a.status === 'processing' && b.status !== 'processing') return -1;
      if (b.status === 'processing' && a.status !== 'processing') return 1;
      const aTime = a.startedAt?.getTime() || 0;
      const bTime = b.startedAt?.getTime() || 0;
      return bTime - aTime;
    });
  }, [filteredJobs]);

  // Stats
  const activeCount = jobs.filter(j => j.status === 'processing').length;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  // Actions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000)); // Simulate refresh
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleClearCompleted = () => {
    setJobs(jobs.filter(j => j.status !== 'completed'));
  };

  const handleRetry = (jobId: string) => {
    setJobs(jobs.map(j => 
      j.id === jobId 
        ? { ...j, status: 'processing' as const, errorMessage: undefined }
        : j
    ));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-semibold flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Pipeline Monitor
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated: {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Badge className="bg-primary/20 text-primary">
                {activeCount} Active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 gap-1.5"
            >
              <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
              disabled={completedCount === 0}
              className="h-8 gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Clear Completed
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="flex-1">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-6">All ({jobs.length})</TabsTrigger>
              <TabsTrigger value="processing" className="text-xs px-3 h-6">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs px-3 h-6">Completed ({completedCount})</TabsTrigger>
              <TabsTrigger value="failed" className="text-xs px-3 h-6">Failed ({failedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apps</SelectItem>
              <SelectItem value="sprite-slicer">Sprite Slicer</SelectItem>
              <SelectItem value="perfectframe">PerfectFrame</SelectItem>
              <SelectItem value="miku-studio">Miku Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Agents Section (Collapsible) */}
      <Collapsible open={showAgents} onOpenChange={setShowAgents} className="border-b border-border">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Agents</span>
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", showAgents && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 bg-muted/30">
            <AIAgentStatus agents={DEFAULT_AI_AGENTS} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Jobs List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="text-sm font-medium">No Active Pipelines</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Pipeline jobs from connected apps will appear here
              </p>
            </div>
          ) : (
            sortedJobs.map(job => (
              <PipelineJobCard
                key={job.id}
                job={job}
                onRetry={handleRetry}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
