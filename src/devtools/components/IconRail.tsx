import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useDevToolsStore } from '../stores/devToolsStore';
import { useLogsStore } from '../stores/logsStore';
import { DEVTOOLS_SECTIONS, getEnabledSections } from '../config/sections';
import type { SectionId, DevToolsSection, CustomPanelConfig } from '../types';

interface IconRailProps {
  enabledPanels?: SectionId[];
  disabledPanels?: SectionId[];
  customPanels?: CustomPanelConfig[];
}

/**
 * Vertical icon navigation rail
 * Displays section icons with tooltips
 */
export const IconRail = memo(function IconRail({ 
  enabledPanels,
  disabledPanels,
  customPanels 
}: IconRailProps) {
  const { activeSection, setActiveSection } = useDevToolsStore();
  const hasUnreadErrors = useLogsStore((state) => state.hasUnreadErrors);

  const sections = getEnabledSections(enabledPanels, disabledPanels);
  const mainSections = sections.slice(0, 9);
  const metaSections = sections.slice(9);

  return (
    <nav 
      className={cn(
        'w-14 flex-shrink-0',
        'flex flex-col items-center',
        'py-2 px-2',
        'bg-background/50',
        'border-r border-border/50',
        'overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
      )}
      aria-label="DevTools sections"
    >
      {/* Main sections */}
      <div className="flex flex-col gap-1 boot-sequence">
        {mainSections.map((section) => (
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
      <div className="w-6 h-px bg-border/50 my-2 flex-shrink-0" />

      {/* Meta sections */}
      <div className="flex flex-col gap-1 boot-sequence">
        {metaSections.map((section) => (
          <RailButton
            key={section.id}
            section={section}
            isActive={activeSection === section.id}
            hasAlert={section.id === 'logs' && hasUnreadErrors}
            onClick={() => setActiveSection(section.id)}
          />
        ))}
      </div>

      {/* Custom panels */}
      {customPanels && customPanels.length > 0 && (
        <>
          <div className="w-6 h-px bg-border/50 my-2 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            {customPanels.map((panel) => (
              <RailButton
                key={panel.id}
                section={{
                  id: panel.id as SectionId,
                  label: panel.label,
                  icon: panel.icon,
                  description: panel.description || '',
                }}
                isActive={activeSection === panel.id}
                onClick={() => setActiveSection(panel.id as SectionId)}
              />
            ))}
          </div>
        </>
      )}
    </nav>
  );
});

interface RailButtonProps {
  section: DevToolsSection | { id: SectionId; label: string; icon: any; description: string; shortcut?: string };
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
        {'shortcut' in section && section.shortcut && (
          <span className="ml-2 text-muted-foreground">{section.shortcut}</span>
        )}
      </span>

      {/* Alert indicator */}
      {hasAlert && <span className="red-dot" />}

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
