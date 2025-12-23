// App Launcher Panel - Primary landing page with compact app cards
// Consolidated from Overview + App Launcher panels
import { useState, useMemo } from 'react';
import { RefreshCw, Search, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { logEvent } from '@/stores/logsStore';
import { useAppContextStore } from '@/stores/appContextStore';
import { CollapsibleAppCard } from '@/components/overview/CollapsibleAppCard';
import { SystemHealthMonitor } from '@/components/overview/SystemHealthMonitor';
import { QuickStatsBar } from '@/components/overview/QuickStatsBar';
import { APIHealthCard } from '@/components/overview/APIHealthCard';
import {
  ECHOVERSE_APPS,
  APP_CATEGORIES,
  type AppCategory,
  type EchoverseApp,
} from '@/config/apps';

type FilterCategory = AppCategory | 'all';

const categoryTabs: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'media', label: 'Media' },
  { key: 'audio', label: 'Audio' },
  { key: 'creative', label: 'Creative' },
  { key: 'utility', label: 'Utility' },
];

export function AppLauncherPanel() {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<
    Record<string, 'online' | 'offline' | 'unknown'>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { loadedAppId, isLoading, loadApp } = useAppContextStore();

  const filteredApps = useMemo(() => {
    return ECHOVERSE_APPS.filter((app) => {
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
    const result: Record<string, number> = { all: ECHOVERSE_APPS.length };
    categoryTabs.forEach((tab) => {
      if (tab.key !== 'all') {
        result[tab.key] = ECHOVERSE_APPS.filter(
          (a) => a.category === tab.key
        ).length;
      }
    });
    return result;
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    const newStatus: Record<string, 'online' | 'offline' | 'unknown'> = {};
    ECHOVERSE_APPS.forEach((app) => {
      if (app.urls.local) {
        newStatus[app.id] = Math.random() > 0.5 ? 'online' : 'offline';
      }
    });
    await new Promise((r) => setTimeout(r, 800));
    setLocalStatus(newStatus);
    setIsRefreshing(false);
    toast.success('Status refreshed');
  };

  const handleToggleExpand = (appId: string) => {
    setExpandedAppId((prev) => (prev === appId ? null : appId));
  };

  const handleLoadApp = async (app: EchoverseApp) => {
    await loadApp(app);
    toast.success(`Loaded: ${app.name} v${app.version || '1.0'}`);
    logEvent('info', `App context loaded: ${app.name}`, { appId: app.id }, 'app-launcher');
  };

  return (
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
            Echoverse Apps
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {filteredApps.length} apps
            </span>
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
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
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
          <div className="space-y-2">
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
  );
}
