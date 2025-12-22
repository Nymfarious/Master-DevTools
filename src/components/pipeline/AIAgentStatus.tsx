// AI Agent Status - Shows status of AI agents powering pipelines
import { Bot, User, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: 'dormant' | 'waking' | 'active';
  color: string;
}

interface AIAgentStatusProps {
  agents: AIAgent[];
}

const statusConfig = {
  dormant: {
    icon: Zap,
    label: 'Standby',
    nodeClass: 'bg-muted border-border text-muted-foreground',
    animation: '',
  },
  waking: {
    icon: User,
    label: 'Awaiting',
    nodeClass: 'border-primary/70 text-primary/70',
    animation: 'animate-pulse',
  },
  active: {
    icon: Bot,
    label: 'Active',
    nodeClass: 'border-primary text-primary',
    animation: 'animate-pulse',
  },
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/20 border-blue-500 text-blue-500',
  purple: 'bg-purple-500/20 border-purple-500 text-purple-500',
  emerald: 'bg-emerald-500/20 border-emerald-500 text-emerald-500',
  amber: 'bg-amber-500/20 border-amber-500 text-amber-500',
  rose: 'bg-rose-500/20 border-rose-500 text-rose-500',
};

export function AIAgentStatus({ agents }: AIAgentStatusProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-8">
        {agents.map((agent) => {
          const config = statusConfig[agent.status];
          const Icon = config.icon;
          const colorClass = agent.status === 'dormant' 
            ? 'bg-muted border-border text-muted-foreground' 
            : colorMap[agent.color] || colorMap.blue;

          return (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2 cursor-default">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                      colorClass,
                      config.animation
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{agent.name}</p>
                    <p className={cn(
                      'text-[10px]',
                      agent.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {config.label}
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// Default agents configuration
export const DEFAULT_AI_AGENTS: AIAgent[] = [
  { id: 'sampler', name: 'Sampler', role: 'Frame Extraction', status: 'active', color: 'blue' },
  { id: 'analyzer', name: 'Analyzer', role: 'Vision AI', status: 'waking', color: 'purple' },
  { id: 'clusterer', name: 'Clusterer', role: 'Grouping', status: 'dormant', color: 'emerald' },
];
