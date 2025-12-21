import { Terminal } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useLogsStore } from '@/stores/logsStore';
import { MAIN_SECTIONS, META_SECTIONS } from '@/config/sections';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SectionId } from '@/types/devtools';

export function Sidebar() {
  const { activeSection, setActiveSection } = useAppStore();
  const { hasUnreadErrors } = useLogsStore();

  const renderNavItem = (section: typeof MAIN_SECTIONS[0]) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;
    const showRedDot = section.id === 'logs' && hasUnreadErrors;

    return (
      <TooltipProvider key={section.id} delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveSection(section.id as SectionId)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center relative',
                'transition-all duration-200',
                'hover:bg-secondary',
                isActive && 'bg-signal-blue/10 ring-1 ring-signal-blue/30',
                isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-signal-blue before:rounded-r'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-signal-blue' : 'text-muted-foreground hover:text-foreground'
              )} />
              {showRedDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-signal-red animate-pulse" 
                      style={{ boxShadow: '0 0 8px hsl(var(--signal-red))' }} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <span>{section.label}</span>
            {section.shortcut && (
              <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono text-muted-foreground">
                {section.shortcut}
              </kbd>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 z-50 border-r border-border bg-card flex flex-col items-center py-3">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-signal-green/10 border border-signal-green/30 flex items-center justify-center mb-6"
           style={{ boxShadow: '0 0 20px hsla(130, 55%, 48%, 0.2)' }}>
        <Terminal className="w-5 h-5 text-signal-green" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {MAIN_SECTIONS.map(renderNavItem)}
        
        {/* Separator */}
        <div className="my-2 mx-2 h-px bg-border" />
        
        {META_SECTIONS.map(renderNavItem)}
      </nav>
    </aside>
  );
}
