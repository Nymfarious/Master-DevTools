import { memo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import type { SectionId, CustomPanelConfig } from '../types';
import { getSectionById } from '../config/sections';

// ── Direct imports for panels ─────────────────────────────────────────────
import { OverviewPanel } from '@/components/panels/OverviewPanel';
import { LogsPanel } from '@/components/panels/LogsPanel';
import { APIRegistryPanel } from '@/components/panels/APIRegistryPanel';
import { PipelinePanel } from '@/components/panels/PipelinePanel';
import { SecurityPanel } from '@/components/panels/SecurityPanel';
import { DataTestPanel } from '@/components/panels/DataTestPanel';
import { UITokensPanel } from '@/components/panels/UITokensPanel';
import { LibrariesPanel } from '@/components/panels/LibrariesPanel';
import { ContentPanel } from '@/components/panels/ContentPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { FlowchartPanel } from '@/components/panels/FlowchartPanel';
import { AgentsPanel } from '@/components/panels/AgentsPanel';
import { AnimationPanel } from '@/components/panels/AnimationPanel';

// Phase 8 panels
import { IssuesPanel } from './IssuesPanel';
import { TestLabPanel } from './TestLabPanel';
import { CircuitBreakerPanel } from './CircuitBreakerPanel';
import { SecurityEventsPanel } from './SecurityEventsPanel';
import { SettingsPanel } from './SettingsPanel';

// Phase 10 panels
import { ShortcutsPanel } from './ShortcutsPanel';
import { StyleGuidePanel } from './StyleGuidePanel';
import { PanelGeneratorPanel } from './PanelGeneratorPanel';
import { ExportPanel } from './ExportPanel';

// v3.2.0 panels
import { BuildStatusPanel } from '@/components/panels/BuildStatusPanel';
import { MediaMonitorPanel } from '@/components/panels/MediaMonitorPanel';

// ═══════════════════════════════════════════════════════════════════════════
// PANEL MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const panelComponents: Record<SectionId, React.ComponentType> = {
  overview: OverviewPanel,
  apps: IssuesPanel, // Issue tracker replaces apps placeholder
  apis: APIRegistryPanel,
  logs: LogsPanel,
  pipeline: PipelinePanel,
  security: SecurityEventsPanel, // Enhanced security events
  data: DataTestPanel,
  tokens: UITokensPanel,
  libraries: LibrariesPanel,
  content: ContentPanel,
  audio: AudioPanel,
  flowchart: FlowchartPanel,
  agents: AgentsPanel,
  video: AnimationPanel,
  // Phase 10 panels
  shortcuts: ShortcutsPanel,
  styleguide: StyleGuidePanel,
  generator: PanelGeneratorPanel,
  export: ExportPanel,
  settings: SettingsPanel,
  // v3.2.0 panels
  'build-status': BuildStatusPanel,
  media: MediaMonitorPanel,
  testing: TestLabPanel,
  testlab: TestLabPanel,
};

// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER PANEL
// ═══════════════════════════════════════════════════════════════════════════

function PlaceholderPanel({ sectionId }: { sectionId: SectionId }) {
  const section = getSectionById(sectionId);
  if (!section) return null;

  const Icon = section.icon;

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className={cn(
        'w-16 h-16 rounded-2xl mb-4',
        'flex items-center justify-center',
        'bg-secondary border border-border',
        'text-muted-foreground'
      )}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
        {section.label}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {section.description}
      </p>
      <span className="mt-4 badge badge--muted">
        Coming in Phase {section.phase || 'X'}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════════════════════

function PanelLoading() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-signal-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading panel...</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANEL ROUTER
// ═══════════════════════════════════════════════════════════════════════════

interface PanelRouterProps {
  activeSection: SectionId;
  customPanels?: CustomPanelConfig[];
}

/**
 * Routes to the correct panel based on activeSection
 * Supports lazy loading and custom panels
 */
export const PanelRouter = memo(function PanelRouter({ 
  activeSection,
  customPanels 
}: PanelRouterProps) {
  // Check for custom panel first
  const customPanel = customPanels?.find(p => p.id === activeSection);
  if (customPanel) {
    const CustomComponent = customPanel.component;
    return (
      <Suspense fallback={<PanelLoading />}>
        <CustomComponent />
      </Suspense>
    );
  }

  // Use built-in panel
  const Panel = panelComponents[activeSection] || (() => <PlaceholderPanel sectionId={activeSection} />);
  
  return (
    <Suspense fallback={<PanelLoading />}>
      <Panel />
    </Suspense>
  );
});
