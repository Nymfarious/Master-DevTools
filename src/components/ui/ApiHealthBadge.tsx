// Reusable API Health Badge Component
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { HealthStatus } from '@/types/devtools';

interface ApiHealthBadgeProps {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<HealthStatus, { bg: string; text: string; label: string }> = {
  healthy: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Healthy' },
  degraded: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Degraded' },
  down: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Down' },
  unknown: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' },
};

export function ApiHealthBadge({ 
  name, 
  status, 
  responseTime, 
  showLabel = true,
  size = 'sm' 
}: ApiHealthBadgeProps) {
  const config = STATUS_CONFIG[status];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'badge flex items-center gap-1 cursor-help',
            textSize,
            config.bg,
            config.text
          )}
        >
          <Circle className={cn('fill-current', dotSize, config.text)} />
          {showLabel && name}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="flex flex-col gap-0.5">
          <span>{name}: {config.label}</span>
          {responseTime !== undefined && (
            <span className="text-muted-foreground">{responseTime}ms response</span>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
