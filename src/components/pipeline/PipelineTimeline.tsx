// Pipeline Timeline - Horizontal stage visualization
import { Check, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface PipelineStage {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'active' | 'complete' | 'failed';
  progress?: number;
  description?: string;
}

interface PipelineTimelineProps {
  stages: PipelineStage[];
  onStageClick?: (stageId: string) => void;
  compact?: boolean;
}

const statusStyles = {
  pending: {
    node: 'bg-muted border-border text-muted-foreground',
    line: 'bg-border',
  },
  active: {
    node: 'bg-primary/20 border-primary text-primary animate-pulse',
    line: 'bg-primary/50',
  },
  complete: {
    node: 'bg-green-500/20 border-green-500 text-green-500',
    line: 'bg-green-500',
  },
  failed: {
    node: 'bg-red-500/20 border-red-500 text-red-500',
    line: 'bg-red-500/50',
  },
};

export function PipelineTimeline({ stages, onStageClick, compact = false }: PipelineTimelineProps) {
  const nodeSize = compact ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = compact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <TooltipProvider>
      <div className="flex items-center w-full">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const style = statusStyles[stage.status];
          const isLast = index === stages.length - 1;

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              {/* Stage Node */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onStageClick?.(stage.id)}
                    className={cn(
                      'rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                      nodeSize,
                      style.node,
                      onStageClick && 'hover:scale-110 cursor-pointer'
                    )}
                  >
                    {stage.status === 'complete' ? (
                      <Check className={iconSize} />
                    ) : stage.status === 'failed' ? (
                      <X className={iconSize} />
                    ) : (
                      <Icon className={iconSize} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium">{stage.label}</p>
                  {stage.description && (
                    <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                  )}
                  {stage.status === 'active' && stage.progress !== undefined && (
                    <p className="text-xs mt-1">{stage.progress}% complete</p>
                  )}
                </TooltipContent>
              </Tooltip>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-1 relative">
                  <div className="h-0.5 bg-border w-full" />
                  <div
                    className={cn('h-0.5 absolute top-0 left-0 transition-all', style.line)}
                    style={{
                      width:
                        stage.status === 'complete'
                          ? '100%'
                          : stage.status === 'active' && stage.progress
                          ? `${stage.progress}%`
                          : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels (non-compact mode) */}
      {!compact && (
        <div className="flex items-start w-full mt-2">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;
            return (
              <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                <div className="w-10 text-center shrink-0">
                  <span className="text-[10px] text-muted-foreground leading-tight block">
                    {stage.label}
                  </span>
                  {stage.status === 'active' && stage.progress !== undefined && (
                    <span className="text-[10px] text-primary font-medium">{stage.progress}%</span>
                  )}
                </div>
                {!isLast && <div className="flex-1 mx-1" />}
              </div>
            );
          })}
        </div>
      )}
    </TooltipProvider>
  );
}
