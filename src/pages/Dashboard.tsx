import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPanel } from '@/components/panels/OverviewPanel';
import { LogsPanel } from '@/components/panels/LogsPanel';
import { UITokensPanel } from '@/components/panels/UITokensPanel';
import { PipelinePanel } from '@/components/panels/PipelinePanel';
import { APIRegistryPanel } from '@/components/panels/APIRegistryPanel';
import { SecurityPanel } from '@/components/panels/SecurityPanel';
import { DataTestPanel } from '@/components/panels/DataTestPanel';
import { LibrariesPanel } from '@/components/panels/LibrariesPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { ContentPanel } from '@/components/panels/ContentPanel';
import { FlowchartPanel } from '@/components/panels/FlowchartPanel';
import { AgentsPanel } from '@/components/panels/AgentsPanel';
import { AnimationPanel } from '@/components/panels/AnimationPanel';
import { TestLabPanel } from '@/components/panels/TestLabPanel';
import { ShortcutsPanel } from '@/devtools/components/ShortcutsPanel';
import { StyleGuidePanel } from '@/devtools/components/StyleGuidePanel';
import { PanelGeneratorPanel } from '@/devtools/components/PanelGeneratorPanel';
import { ExportPanel } from '@/devtools/components/ExportPanel';
import { SettingsPanel } from '@/devtools/components/SettingsPanel';
import { useAppStore } from '@/stores/appStore';
import { Terminal } from 'lucide-react';
import { DEVTOOLS_SECTIONS } from '@/config/sections';

export default function Dashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { activeSection } = useAppStore();

  // DEV MODE: Auth bypass for testing - remove in production
  const DEV_BYPASS_AUTH = true;

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return; // Skip auth checks in dev mode
    if (!isLoading && !user) {
      navigate('/auth');
    }
    if (!isLoading && user && !isAdmin) {
      navigate('/demo');
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (!DEV_BYPASS_AUTH && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-8 h-8 text-signal-green animate-pulse mx-auto mb-4" />
          <p className="font-mono text-muted-foreground">Initializing Mission Control...</p>
        </div>
      </div>
    );
  }

  if (!DEV_BYPASS_AUTH && !isAdmin) return null;

  const renderPanel = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPanel />;
      case 'logs':
        return <LogsPanel />;
      case 'tokens':
        return <UITokensPanel />;
      case 'pipeline':
        return <PipelinePanel />;
      case 'apis':
        return <APIRegistryPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'data':
        return <DataTestPanel />;
      case 'libraries':
        return <LibrariesPanel />;
      case 'audio':
        return <AudioPanel />;
      case 'content':
        return <ContentPanel />;
      case 'flowchart':
        return <FlowchartPanel />;
      case 'agents':
        return <AgentsPanel />;
      case 'video':
        return <AnimationPanel />;
      case 'testlab':
        return <TestLabPanel />;
      case 'shortcuts':
        return <ShortcutsPanel />;
      case 'styleguide':
        return <StyleGuidePanel />;
      case 'generator':
        return <PanelGeneratorPanel />;
      case 'export':
        return <ExportPanel />;
      case 'settings':
        return <SettingsPanel />;
      default: {
        const section = DEVTOOLS_SECTIONS.find(s => s.id === activeSection);
        const Icon = section?.icon || Terminal;
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center boot-sequence">
            <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center bg-secondary border border-border text-muted-foreground">
              <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">
              {section?.label || 'Panel'}
            </h3>
            <p className="text-sm text-muted-foreground">{section?.description}</p>
            <span className="mt-4 badge badge--muted">Coming in Phase {section?.phase || '?'}</span>
          </div>
        );
      }
    }
  };

  return <AppShell>{renderPanel()}</AppShell>;
}
