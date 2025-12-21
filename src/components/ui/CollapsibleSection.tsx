import { useState } from 'react';
import { ChevronDown, Plus, Minus, MoreVertical, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore, type ExpandIconStyle } from '@/devtools/stores/settingsStore';

interface CollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

function ExpandIcon({ style, isOpen }: { style: ExpandIconStyle; isOpen: boolean }) {
  const iconClass = cn(
    'h-4 w-4 transition-transform duration-200',
    isOpen && style === 'chevron' && 'rotate-180',
    isOpen && style === 'dots' && 'rotate-90'
  );

  switch (style) {
    case 'plusminus':
      return isOpen ? <Minus className={iconClass} /> : <Plus className={iconClass} />;
    case 'dots':
      return <MoreVertical className={iconClass} />;
    case 'chevron':
    default:
      return <ChevronDown className={iconClass} />;
  }
}

export function CollapsibleSection({ 
  title, 
  icon: Icon, 
  defaultOpen = false, 
  children,
  className 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { settings } = useSettingsStore();

  return (
    <div className={cn('space-y-2', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-lg',
          'bg-secondary/50 hover:bg-secondary transition-colors',
          'text-left'
        )}
      >
        <div className="flex items-center gap-2">
          <ExpandIcon style={settings.expandIconStyle} isOpen={isOpen} />
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      </button>
      
      {isOpen && (
        <div className={cn(
          'ml-6 space-y-2 p-3',
          'border-l-2 border-signal-green/30',
          'animate-in slide-in-from-top-2 duration-200'
        )}>
          {children}
        </div>
      )}
    </div>
  );
}
