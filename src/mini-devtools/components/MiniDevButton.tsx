import { useState } from 'react';
import { Terminal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevToolsStore, useDevLogsStore } from '@/stores/devtools-store';
import { useSettingsStore } from '@/devtools/stores/settingsStore';

interface MiniDevButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function MiniDevButton({ position = 'bottom-right' }: MiniDevButtonProps) {
  const { isOpen, toggleDrawer } = useDevToolsStore();
  const { settings } = useSettingsStore();
  const hasUnreadErrors = useDevLogsStore((state) => 
    state.logs.some(log => !log.read && (log.level === 'error' || log.level === 'warn'))
  );
  const [isHovered, setIsHovered] = useState(false);

  // Hide completely when master visibility is off
  if (!settings.masterVisibility) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <button
      onClick={toggleDrawer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'fixed z-[9998]',
        positionClasses[position],
        'w-14 h-14 rounded-2xl',
        'flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-signal-blue/50',
        'group',
        // Base glass effect
        'bg-card/80 backdrop-blur-xl',
        'border border-border',
        'shadow-terminal',
        // Hover state
        'hover:bg-secondary hover:border-signal-blue/30',
        'hover:shadow-glow-blue',
        'hover:scale-105',
        // Open state
        isOpen && 'bg-signal-blue/10 border-signal-blue/50 rotate-180'
      )}
      aria-label={isOpen ? 'Close DevTools' : 'Open DevTools'}
    >
      {/* Background gradient on hover */}
      <div 
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
          'bg-gradient-to-br from-signal-blue/20 via-signal-purple/10 to-transparent',
          isHovered && 'opacity-100'
        )}
      />

      {/* Icon */}
      <div className="relative z-10 transition-transform duration-300">
        {isOpen ? (
          <X className="w-6 h-6 text-signal-blue" />
        ) : (
          <Terminal 
            className={cn(
              'w-6 h-6 transition-colors duration-200',
              hasUnreadErrors ? 'text-signal-red' : 'text-muted-foreground',
              'group-hover:text-signal-blue'
            )} 
          />
        )}
      </div>

      {/* Red dot for unread errors */}
      {hasUnreadErrors && !isOpen && (
        <span className="red-dot" />
      )}

      {/* Keyboard hint on hover */}
      {isHovered && !isOpen && (
        <div 
          className={cn(
            'absolute -top-10 left-1/2 -translate-x-1/2',
            'px-2 py-1 rounded',
            'bg-secondary border border-border',
            'text-xs font-mono text-muted-foreground whitespace-nowrap',
            'animate-fade-up'
          )}
        >
          <span className="text-signal-blue">⌘</span> + <span className="text-signal-blue">D</span>
        </div>
      )}

      {/* Pulse ring animation when there are errors */}
      {hasUnreadErrors && !isOpen && (
        <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-signal-red" />
      )}
    </button>
  );
}
