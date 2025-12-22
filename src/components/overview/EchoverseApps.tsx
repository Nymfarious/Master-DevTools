// Echoverse Apps Grid v3.2.0 - Enhanced app launcher with categories, search, expandable cards
import { useState, useMemo } from 'react';
import { 
  ExternalLink,
  Globe,
  Github,
  Search,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  ECHOVERSE_APPS, 
  APP_CATEGORIES, 
  APP_STATUS_STYLES,
  type AppCategory,
  type EchoverseApp
} from '@/config/apps';

type FilterCategory = AppCategory | 'all';

const categoryTabs: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'media', label: 'Media' },
  { key: 'audio', label: 'Audio' },
  { key: 'creative', label: 'Creative' },
  { key: 'utility', label: 'Utility' },
];

export function EchoverseApps() {
  const [category, setCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, 'online' | 'offline' | 'unknown'>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredApps = useMemo(() => {
    return ECHOVERSE_APPS.filter(app => {
      const matchesCategory = category === 'all' || app.category === category;
      const matchesSearch = searchQuery === '' ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.features?.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [category, searchQuery]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: ECHOVERSE_APPS.length };
    categoryTabs.forEach(tab => {
      if (tab.key !== 'all') {
        result[tab.key] = ECHOVERSE_APPS.filter(a => a.category === tab.key).length;
      }
    });
    return result;
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    // Mock status check - randomly assign statuses
    const newStatus: Record<string, 'online' | 'offline' | 'unknown'> = {};
    ECHOVERSE_APPS.forEach(app => {
      if (app.urls.local) {
        newStatus[app.id] = Math.random() > 0.5 ? 'online' : 'offline';
      }
    });
    await new Promise(r => setTimeout(r, 800));
    setLocalStatus(newStatus);
    setIsRefreshing(false);
    toast.success('Status refreshed');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  const toggleExpand = (appId: string) => {
    setExpandedApp(prev => prev === appId ? null : appId);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">
          <Globe className="w-3.5 h-3.5" />
          Echoverse Apps
          <span className="ml-2 text-xs font-mono text-muted-foreground">
            {filteredApps.length} apps
          </span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshStatus}
          className="h-7 text-xs gap-1.5"
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
          Ping
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          {categoryTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                category === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className="ml-1 font-mono opacity-60">{counts[tab.key]}</span>
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

      {/* App Grid */}
      {filteredApps.length === 0 ? (
        <div className="terminal-glass p-8 rounded-lg text-center text-muted-foreground">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No apps match your search</p>
          <p className="text-xs mt-1 opacity-60">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredApps.map(app => {
            const Icon = app.icon;
            const isExpanded = expandedApp === app.id;
            const statusStyle = APP_STATUS_STYLES[app.status];
            const categoryStyle = APP_CATEGORIES[app.category];
            const pingStatus = localStatus[app.id] || 'unknown';

            return (
              <div
                key={app.id}
                className={cn(
                  "terminal-glass rounded-lg overflow-hidden transition-all duration-200",
                  "hover:ring-1 hover:ring-border/50",
                  isExpanded && "ring-1 ring-primary/50"
                )}
              >
                {/* Main card content */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(app.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        categoryStyle.color + '/20'
                      )}>
                        <Icon className={cn("w-5 h-5", statusStyle.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-sm">{app.name}</span>
                          {app.urls.local && (
                            <Circle className={cn(
                              "w-2 h-2 fill-current",
                              pingStatus === 'online' && "text-green-400",
                              pingStatus === 'offline' && "text-red-400",
                              pingStatus === 'unknown' && "text-gray-400"
                            )} />
                          )}
                        </div>
                        {app.version && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            v{app.version}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("badge text-[10px]", statusStyle.bg, statusStyle.color)}>
                        {statusStyle.label}
                      </span>
                      <span className={cn("badge text-[10px]", categoryStyle.color + '/20', 'text-foreground/70')}>
                        {categoryStyle.label}
                      </span>
                    </div>
                  </div>

                  <p className={cn(
                    "text-xs text-muted-foreground mb-2",
                    !isExpanded && "line-clamp-2"
                  )}>
                    {app.description}
                  </p>

                  {app.lastUpdated && (
                    <p className="text-[10px] text-muted-foreground/60">
                      Last updated: {app.lastUpdated}
                    </p>
                  )}

                  <div className="flex items-center justify-end mt-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border/30 space-y-3">
                    {/* Features */}
                    {app.features && app.features.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                          Features
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {app.features.map(feature => (
                            <span key={feature} className="badge badge--muted text-[10px]">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* API Dependencies */}
                    {app.apiDependencies && app.apiDependencies.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                          API Dependencies
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {app.apiDependencies.map(dep => (
                            <span key={dep} className="badge bg-cyan-500/20 text-cyan-400 text-[10px]">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {app.urls.github && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          onClick={(e) => { e.stopPropagation(); handleOpen(app.urls.github!); }}
                        >
                          <Github className="w-3 h-3" />
                          GitHub
                        </Button>
                      )}
                      {app.urls.local && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={(e) => { e.stopPropagation(); handleOpen(app.urls.local!); }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Local
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1.5"
                            onClick={(e) => { e.stopPropagation(); handleCopyUrl(app.urls.local!); }}
                          >
                            <Copy className="w-3 h-3" />
                            Copy URL
                          </Button>
                        </>
                      )}
                      {app.urls.production && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1.5"
                          onClick={(e) => { e.stopPropagation(); handleOpen(app.urls.production!); }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Production
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
