import { cn } from '@/lib/utils';
import { LucideIcon, ExternalLink } from 'lucide-react';
import { StatusLight } from './StatusLight';
import { Button } from './button';

interface AppCardProps {
  name: string;
  description?: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'coming-soon';
  url?: string;
  color?: string;
  className?: string;
}

export function AppCard({ 
  name, 
  description, 
  icon: Icon, 
  status, 
  url, 
  color = 'signal-blue',
  className 
}: AppCardProps) {
  const isDisabled = status === 'coming-soon' || status === 'disconnected';
  
  const healthStatus = {
    connected: 'healthy' as const,
    disconnected: 'down' as const,
    'coming-soon': 'unknown' as const,
  };

  const statusLabel = {
    connected: 'Connected',
    disconnected: 'Offline',
    'coming-soon': 'Coming Soon',
  };

  return (
    <div className={cn(
      'terminal-glass p-4 rounded-lg',
      'transition-all duration-200',
      isDisabled ? 'opacity-50' : 'hover:border-border hover:shadow-lg',
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          'bg-secondary border border-border',
          !isDisabled && 'text-signal-blue'
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-foreground truncate">
              {name}
            </h3>
            <StatusLight status={healthStatus[status]} size="sm" />
          </div>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        {!isDisabled && url && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              Launch
            </a>
          </Button>
        )}
        
        {isDisabled && (
          <span className="text-xs font-mono text-muted-foreground">
            {statusLabel[status]}
          </span>
        )}
      </div>
    </div>
  );
}
