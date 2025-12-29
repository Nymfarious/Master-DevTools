// App Launcher Panel v3.4.0 - Primary landing page with compact app cards
// Consolidated from Overview + App Launcher panels
import { useState, useMemo } from 'react';
import { RefreshCw, Search, Rocket, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { logEvent } from '@/stores/logsStore';
import { useAppContextStore } from '@/stores/appContextStore';
import { useAPIHealthStore, checkAPIHealth } from '@/stores/apiHealthStore';
import { CollapsibleAppCard } from '@/components/overview/CollapsibleAppCard';
import { SystemHealthMonitor } from '@/components/overview/SystemHealthMonitor';
import { QuickStatsBar } from '@/components/overview/QuickStatsBar';
import { APIHealthCard } from '@/components/overview/APIHealthCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  APPVERSE_APPS,
  APP_CATEGORIES,
  type AppCategory,
  type AppverseApp,
  // Legacy exports for backwards compatibility
  ECHOVERSE_APPS,
  type EchoverseApp,
} from '@/config/apps';

type FilterCategory = AppCategory | 'all';

const categoryTabs: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'devtools', label: 'DevTools' },
  { key: 'research', label: 'Research' },
  { key: 'media', label: 'Media' },
  { key: 'audio', label: 'Audio' },
  { key: 'creative', label: 'Creative' },
];

export function AppLauncherPanel() {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<
    Record<string, 'online' | 'offline' | 'unknown'>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCheckingApis, setIsCheckingApis] = useState(false);

  const { loadedAppId, isLoading, loadApp } = useAppContextStore();
  const { endpoints, setEndpointStatus, setChecking } = useAPIHealthStore();

  const filteredApps = useMemo(() => {
    return APPVERSE_APPS.filter((app) => {
      const matchesCategory = category === 'all' || app.category === category;
      const matchesSearch =
        searchQuery === '' ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.features?.some((f) =>
          f.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [category, searchQuery]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: APPVERSE_APPS.length };
    categoryTabs.forEach((tab) => {
      if (tab.key !== 'all') {
        result[tab.key] = APPVERSE_APPS.filter(
          (a) => a.category === tab.key
        ).length;
      }
    });
    return result;
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    const newStatus: Record<string, 'online' | 'offline' | 'unknown'> = {};
    
    // Actually ping the local servers
    for (const app of APPVERSE_APPS) {
      if (app.urls.local) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          await fetch(app.urls.local, { 
            method: 'HEAD', 
            mode: 'no-cors',
            signal: controller.signal 
          });
          
          clearTimeout(timeoutId);
          newStatus[app.id] = 'online';
        } catch {
          newStatus[app.id] = 'offline';
        }
      }
    }
    
    setLocalStatus(newStatus);
    setIsRefreshing(false);
    toast.success('Local servers pinged');
  };

  const handleCheckAllApis = async () => {
    setIsCheckingApis(true);
    for (const endpoint of endpoints) {
      setChecking(endpoint.id, true);
      const result = await checkAPIHealth(endpoint);
      setEndpointStatus(endpoint.id, result);
      setChecking(endpoint.id, false);
    }
    setIsCheckingApis(false);
    toast.success('API health checked');
  };

  const handleToggleExpand = (appId: string) => {
    setExpandedAppId((prev) => (prev === appId ? null : appId));
  };

  const handleLoadApp = async (app: AppverseApp) => {
    await loadApp(app);
    toast.success(`Loaded: ${app.name} v${app.version || '1.0'}`);
    logEvent('info', `App context loaded: ${app.name}`, { appId: app.id }, 'app-launcher');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6 boot-sequence">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            App Launcher
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select an app to load its context into DevTools
          </p>
        </div>

        {/* App Cards Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Appverse
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {filteredApps.length} apps
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshStatus}
                    className="h-7 text-xs gap-1.5"
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={cn('w-3 h-3', isRefreshing && 'animate-spin')}
                    />
                    Ping
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                  Check if local development servers are running for each app
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckAllApis}
                    className="h-7 text-xs gap-1.5"
                    disabled={isCheckingApis}
                  >
                    <Zap
                      className={cn('w-3 h-3', isCheckingApis && 'animate-pulse')}
                    />
                    Check APIs
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                  Test connectivity to external API services (Supabase, Gemini, ElevenLabs, etc.)
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg flex-wrap">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setCategory(tab.key)}
                  className={cn(
                    'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors',
                    category === tab.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                  {counts[tab.key] > 0 && (
                    <span className="ml-1 font-mono opacity-60">
                      {counts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-secondary/50"
              />
            </div>
          </div>

          {/* Compact card list */}
          {filteredApps.length === 0 ? (
            <div className="terminal-glass p-8 rounded-lg text-center text-muted-foreground">
              <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No apps match your search</p>
              <p className="text-xs mt-1 opacity-60">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredApps.map((app) => (
                <CollapsibleAppCard
                  key={app.id}
                  app={app}
                  isSelected={expandedAppId === app.id}
                  isExpanded={expandedAppId === app.id}
                  isLoaded={loadedAppId === app.id}
                  isLoading={isLoading && expandedAppId === app.id}
                  pingStatus={localStatus[app.id] || 'unknown'}
                  onToggleExpand={() => handleToggleExpand(app.id)}
                  onLoad={() => handleLoadApp(app)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* System Health Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            System Health
          </h2>
          <div className="space-y-4">
            <SystemHealthMonitor />
            <QuickStatsBar />
            <APIHealthCard />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
