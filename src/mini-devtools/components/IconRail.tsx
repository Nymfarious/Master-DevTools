import { memo } from 'react';
import { cn } from '@/lib/utils';
import { DEVTOOLS_SECTIONS } from '../config/sections';
import { useDevToolsStore, useDevLogsStore } from '@/stores/devtools-store';

export const IconRail = memo(function IconRail() {
  const { activeSection, setActiveSection } = useDevToolsStore();
  const hasUnreadErrors = useDevLogsStore((state) => 
    state.logs.some(log => !log.read && (log.level === 'error' || log.level === 'warn'))
  );

  return (
    <nav 
      className={cn(
        'w-14 flex-shrink-0',
        'flex flex-col items-center gap-1',
        'py-4 px-2',
        'bg-background/50',
        'border-r border-border/50'
      )}
      aria-label="DevTools sections"
    >
      {/* Top section - main tools */}
      <div className="flex flex-col gap-1 boot-sequence">
        {DEVTOOLS_SECTIONS.slice(0, 9).map((section) => (
          <RailButton
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            hasAlert={section.id === 'logs' && hasUnreadErrors}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-border/50 my-2" />

      {/* Bottom section - meta tools */}
      <div className="flex flex-col gap-1 boot-sequence">
        {DEVTOOLS_SECTIONS.slice(9).map((section) => (
          <RailButton
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            hasAlert={section.id === 'logs' && hasUnreadErrors}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </div>
    </nav>
  );
});

interface RailButtonProps {
  section: typeof DEVTOOLS_SECTIONS[number];
  isActive: boolean;
  hasAlert?: boolean;
  onClick: () => void;
}

const RailButton = memo(function RailButton({ 
  section, 
  isActive, 
  hasAlert,
  onClick 
}: RailButtonProps) {
  const Icon = section.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'rail-button',
        isActive && 'rail-button--active'
      )}
      aria-label={section.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5" />
      
      {/* Tooltip */}
      <span className="tooltip">
        <span className="text-foreground">{section.label}</span>
        {section.shortcut && (
          <span className="ml-2 text-muted-foreground">{section.shortcut}</span>
        )}
      </span>

      {/* Alert indicator */}
      {hasAlert && (
        <span className="red-dot" />
      )}

      {/* Active indicator bar */}
      {isActive && (
        <span 
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2',
            'w-0.5 h-5 rounded-r',
            'bg-signal-blue',
            'shadow-glow-blue'
          )}
        />
      )}
    </button>
  );
});
