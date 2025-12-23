import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/layout/AppShell';
import { AppLauncherPanel } from '@/components/panels/AppLauncherPanel';
import { LogsPanel } from '@/components/panels/LogsPanel';
import { AppStyleGuidePanel } from '@/components/panels/AppStyleGuidePanel';
import { PipelinePanel } from '@/components/panels/PipelinePanel';
import { APIRegistryPanel } from '@/components/panels/APIRegistryPanel';
import { SecurityPanel } from '@/components/panels/SecurityPanel';
import { DataTestPanel } from '@/components/panels/DataTestPanel';
import { LibrariesPanel } from '@/components/panels/LibrariesPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { AgentFlowsPanel } from '@/components/panels/AgentFlowsPanel';
import { FlowchartPanel } from '@/components/panels/FlowchartPanel';
import { AgentsPanel } from '@/components/panels/AgentsPanel';
import { AnimationPanel } from '@/components/panels/AnimationPanel';
import { TestLabPanel } from '@/components/panels/TestLabPanel';
import { MediaMonitorPanel } from '@/components/panels/MediaMonitorPanel';
import { BuildStatusPanel } from '@/components/panels/BuildStatusPanel';
import { ShortcutsPanel } from '@/devtools/components/ShortcutsPanel';

import { PanelGeneratorPanel } from '@/devtools/components/PanelGeneratorPanel';
import { ExportPanel } from '@/devtools/components/ExportPanel';
import { SettingsPanel } from '@/devtools/components/SettingsPanel';
import { useAppStore } from '@/stores/appStore';
import { Terminal } from 'lucide-react';
import { ALL_SECTIONS } from '@/config/sections';

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
      // MONITORING (Passive) - Overview is now App Launcher
      case 'overview':
      case 'apps':
        return <AppLauncherPanel />;
      case 'logs':
        return <LogsPanel />;
      case 'pipeline':
        return <PipelinePanel />;
      case 'media':
        return <MediaMonitorPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'apis':
        return <APIRegistryPanel />;
      
      // TESTING (Active)
      case 'testing':
        return <TestLabPanel />;
      
      // REFERENCE
      case 'styleguide':
        return <AppStyleGuidePanel />;
      case 'shortcuts':
        return <ShortcutsPanel />;
      case 'libraries':
        return <LibrariesPanel />;
      
      // TOOLS
      case 'build-status':
        return <BuildStatusPanel />;
      case 'generator':
        return <PanelGeneratorPanel />;
      case 'export':
        return <ExportPanel />;
      case 'settings':
        return <SettingsPanel />;
      
      // LEGACY - kept for backwards compatibility
      case 'tokens':
        return <AppStyleGuidePanel />;
      case 'data':
        return <DataTestPanel />;
      case 'audio':
        return <AudioPanel />;
      case 'content':
        return <AgentFlowsPanel />;
      case 'flowchart':
        return <FlowchartPanel />;
      case 'agents':
        return <AgentsPanel />;
      case 'video':
        return <AnimationPanel />;
      case 'testlab':
        return <TestLabPanel />;
      
      default: {
        const section = ALL_SECTIONS.find(s => s.id === activeSection);
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
            <span className="mt-4 badge badge--muted">Coming Soon</span>
          </div>
        );
      }
    }
  };

  return <AppShell>{renderPanel()}</AppShell>;
}
