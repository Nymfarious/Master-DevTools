// Pipeline Job Card - Individual job visualization
import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PipelineTimeline, PipelineStage } from './PipelineTimeline';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface PipelineJob {
  id: string;
  name: string;
  source: string;
  sourceIcon?: React.ComponentType<{ className?: string }>;
  stages: PipelineStage[];
  currentStageIndex: number;
  overallProgress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage?: string;
}

interface PipelineJobCardProps {
  job: PipelineJob;
  onRetry?: (jobId: string) => void;
  onCancel?: (jobId: string) => void;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground' },
  processing: { label: 'Processing', color: 'bg-primary/20 text-primary' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-500' },
};

export function PipelineJobCard({ job, onRetry, onCancel }: PipelineJobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[job.status];
  const currentStage = job.stages[job.currentStageIndex];
  const SourceIcon = job.sourceIcon || Sparkles;

  const getElapsedTime = () => {
    if (!job.startedAt) return null;
    const end = job.completedAt || new Date();
    const elapsed = Math.floor((end.getTime() - job.startedAt.getTime()) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className={cn(
      'transition-all',
      job.status === 'processing' && 'border-primary/50',
      job.status === 'failed' && 'border-red-500/50'
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <SourceIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate">{job.name}</h4>
                {job.status === 'processing' && currentStage && (
                  <p className="text-xs text-muted-foreground">
                    {currentStage.label}...
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-[10px]">
                {job.source}
              </Badge>
              <Badge className={cn('text-[10px]', status.color)}>
                {job.status === 'processing' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />
                )}
                {status.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Timeline */}
          <PipelineTimeline stages={job.stages} compact />

          {/* Progress */}
          {job.status !== 'pending' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{job.overallProgress}%</span>
              </div>
              <Progress value={job.overallProgress} className="h-1.5" />
            </div>
          )}

          {/* Timestamps */}
          {job.startedAt && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Started {formatDistanceToNow(job.startedAt, { addSuffix: true })}</span>
              </div>
              {getElapsedTime() && (
                <span>• Elapsed: {getElapsedTime()}</span>
              )}
            </div>
          )}

          {/* Error Message */}
          {job.status === 'failed' && job.errorMessage && (
            <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{job.errorMessage}</p>
            </div>
          )}

          {/* Expandable Details */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full h-7 text-xs">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" /> Less Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" /> More Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Job ID:</span>
                <span className="ml-1 font-mono">{job.id.slice(0, 8)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Stage:</span>
                <span className="ml-1">{job.currentStageIndex + 1}/{job.stages.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {(job.status === 'failed' || job.status === 'processing') && (
              <div className="flex gap-2 pt-2">
                {job.status === 'failed' && onRetry && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onRetry(job.id)}>
                    Retry
                  </Button>
                )}
                {job.status === 'processing' && onCancel && (
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onCancel(job.id)}>
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
