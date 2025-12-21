import { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Zap, Activity, ExternalLink, ChevronRight
} from 'lucide-react';
import { getSectionById } from '../config/sections';
import type { SectionId } from '@/types/devtools';

interface PanelProps {
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW PANEL
// ═══════════════════════════════════════════════════════════════════════════

export const OverviewPanel = memo(function OverviewPanel({ className }: PanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* System Status Card */}
      <div className="dev-card">
        <div className="section-header">
          <Zap className="w-3 h-3" />
          <span>System Status</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <StatusItem label="API" status="healthy" />
          <StatusItem label="Database" status="healthy" />
          <StatusItem label="Auth" status="healthy" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dev-card">
        <div className="section-header">
          <Activity className="w-3 h-3" />
          <span>Session Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <QuickStat label="Uptime" value="2h 34m" />
          <QuickStat label="API Calls" value="1,247" />
          <QuickStat label="Errors" value="0" valueClass="text-signal-green" />
          <QuickStat label="Warnings" value="3" valueClass="text-signal-amber" />
        </div>
      </div>

      {/* Quick Links */}
      <div className="dev-card">
        <div className="section-header">
          <ExternalLink className="w-3 h-3" />
          <span>Quick Links</span>
        </div>
        <div className="space-y-2">
          <QuickLink label="Dashboard" href="/dashboard" />
          <QuickLink label="Documentation" href="#" />
          <QuickLink label="Settings" href="#" />
        </div>
      </div>
    </div>
  );
});

function StatusItem({ label, status }: { label: string; status: 'healthy' | 'degraded' | 'down' }) {
  const statusClass = {
    healthy: 'status-light--green',
    degraded: 'status-light--amber',
    down: 'status-light--red',
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn('status-light', statusClass)} />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

function QuickStat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={cn('text-lg font-mono font-semibold', valueClass || 'text-foreground')}>{value}</span>
    </div>
  );
}

function QuickLink({ label, href }: { label: string; href: string }) {
  return (
    <a 
      href={href}
      className={cn(
        'flex items-center justify-between',
        'px-3 py-2 rounded-lg',
        'bg-background/50',
        'text-sm text-muted-foreground',
        'transition-all duration-200',
        'hover:bg-secondary hover:text-foreground',
        'group'
      )}
    >
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER PANELS
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
        Coming Soon
      </span>
    </div>
  );
}

export const AppsPanel = () => <PlaceholderPanel sectionId="apps" />;
export const AudioPanel = () => <PlaceholderPanel sectionId="audio" />;
export const VideoPanel = () => <PlaceholderPanel sectionId="video" />;
export const LibrariesPanel = () => <PlaceholderPanel sectionId="libraries" />;
export const ApisPanel = () => <PlaceholderPanel sectionId="apis" />;
export const AgentsPanel = () => <PlaceholderPanel sectionId="agents" />;
export const DataPanel = () => <PlaceholderPanel sectionId="data" />;
export const PipelinePanel = () => <PlaceholderPanel sectionId="pipeline" />;
export const TokensPanel = () => <PlaceholderPanel sectionId="tokens" />;
export const LogsPanel = () => <PlaceholderPanel sectionId="logs" />;
export const SecurityPanel = () => <PlaceholderPanel sectionId="security" />;
export const ContentPanel = () => <PlaceholderPanel sectionId="content" />;
export const ShortcutsPanel = () => <PlaceholderPanel sectionId="shortcuts" />;
export const StyleguidePanel = () => <PlaceholderPanel sectionId="styleguide" />;
export const GeneratorPanel = () => <PlaceholderPanel sectionId="generator" />;
export const ExportPanelMini = () => <PlaceholderPanel sectionId="export" />;
export const SettingsPanel = () => <PlaceholderPanel sectionId="settings" />;

// ═══════════════════════════════════════════════════════════════════════════
// PANEL ROUTER
// ═══════════════════════════════════════════════════════════════════════════

const panelComponents: Record<SectionId, React.ComponentType<PanelProps>> = {
  overview: OverviewPanel,
  apps: AppsPanel,
  audio: AudioPanel,
  video: VideoPanel,
  libraries: LibrariesPanel,
  apis: ApisPanel,
  agents: AgentsPanel,
  data: DataPanel,
  pipeline: PipelinePanel,
  tokens: TokensPanel,
  logs: LogsPanel,
  security: SecurityPanel,
  content: ContentPanel,
  flowchart: () => <PlaceholderPanel sectionId="flowchart" />,
  shortcuts: ShortcutsPanel,
  styleguide: StyleguidePanel,
  generator: GeneratorPanel,
  export: ExportPanelMini,
  settings: SettingsPanel,
};

export function PanelRouter({ activeSection }: { activeSection: SectionId }) {
  const Panel = panelComponents[activeSection] || OverviewPanel;
  return <Panel />;
}
