import { Terminal } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useErrorStore } from '@/stores/errorStore';
import { 
  MONITORING_SECTIONS, 
  TESTING_SECTIONS, 
  REFERENCE_SECTIONS, 
  TOOLS_SECTIONS 
} from '@/config/sections';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SectionId, DevToolsSection } from '@/types/devtools';

export function Sidebar() {
  const { activeSection, setActiveSection } = useAppStore();
  const hasUnreadErrors = useErrorStore(state => state.hasUnreadErrors);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 z-50 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="p-3 flex justify-center">
        <div 
          className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
          style={{ boxShadow: '0 0 20px hsla(var(--primary), 0.2)' }}
        >
          <Terminal className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto px-2 py-2">
        {/* MONITORING */}
        <SectionHeader label="Monitor" />
        {MONITORING_SECTIONS.map(section => (
          <NavItem 
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            hasAlert={section.id === 'logs' && hasUnreadErrors}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
        
        <Divider />
        
        {/* TESTING */}
        <SectionHeader label="Test" />
        {TESTING_SECTIONS.map(section => (
          <NavItem 
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
        
        <Divider />
        
        {/* REFERENCE */}
        <SectionHeader label="Ref" />
        {REFERENCE_SECTIONS.map(section => (
          <NavItem 
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
        
        <Divider />
        
        {/* TOOLS */}
        <SectionHeader label="Tools" />
        {TOOLS_SECTIONS.map(section => (
          <NavItem 
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </nav>

      {/* Version */}
      <div className="p-2 text-center">
        <span className="text-[10px] font-mono text-muted-foreground">v3.2.0</span>
      </div>
    </aside>
  );
}

// Section header
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-1 py-2 text-[9px] font-mono uppercase tracking-widest text-muted-foreground text-center">
      {label}
    </div>
  );
}

// Divider
function Divider() {
  return <div className="my-1 mx-2 h-px bg-border/50" />;
}

// Nav item
interface NavItemProps {
  section: DevToolsSection;
  isActive: boolean;
  hasAlert?: boolean;
  onClick: () => void;
}

function NavItem({ section, isActive, hasAlert, onClick }: NavItemProps) {
  const Icon = section.icon;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'w-10 h-10 mx-auto rounded-lg flex items-center justify-center relative',
              'transition-all duration-200',
              'hover:bg-secondary',
              isActive && 'bg-primary/10 ring-1 ring-primary/30',
              isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-0.5 before:h-5 before:bg-primary before:rounded-r'
            )}
          >
            <Icon className={cn(
              'w-5 h-5 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )} />
            
            {/* Alert dot */}
            {hasAlert && (
              <span 
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" 
                style={{ boxShadow: '0 0 8px hsl(var(--destructive))' }} 
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="flex flex-col gap-1 ml-2">
          <span className="font-medium">{section.label}</span>
          <span className="text-xs text-muted-foreground">{section.description}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
