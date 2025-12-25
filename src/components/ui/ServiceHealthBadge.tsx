// Reusable Service Health Badge Component
import { Database, Shield, HardDrive, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { HealthStatus } from '@/types/devtools';
import type { BackendService } from '@/config/apps';

interface ServiceHealthBadgeProps {
  service: BackendService;
  status: HealthStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const SERVICE_CONFIG: Record<BackendService, { icon: typeof Database; label: string }> = {
  database: { icon: Database, label: 'Database' },
  auth: { icon: Shield, label: 'Authentication' },
  storage: { icon: HardDrive, label: 'Storage' },
  realtime: { icon: Radio, label: 'Realtime' },
};

const STATUS_STYLES: Record<HealthStatus, string> = {
  healthy: 'text-green-400',
  degraded: 'text-yellow-400',
  down: 'text-red-400',
  unknown: 'text-muted-foreground',
};

export function ServiceHealthBadge({ 
  service, 
  status, 
  showLabel = true,
  size = 'sm' 
}: ServiceHealthBadgeProps) {
  const config = SERVICE_CONFIG[service];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'flex items-center gap-1 cursor-help',
            textSize,
            STATUS_STYLES[status]
          )}
        >
          <Icon className={iconSize} />
          {showLabel && config.label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {config.label}: {status === 'healthy' ? 'Connected' : status === 'down' ? 'Disconnected' : status}
      </TooltipContent>
    </Tooltip>
  );
}
