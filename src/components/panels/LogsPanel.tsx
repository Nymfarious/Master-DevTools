// Error Log Panel v3.2.0 - Enhanced error logging with typed errors, pin, AI analyze, export
import { useState, useMemo, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  Trash2, 
  CheckCircle, 
  Download,
  ChevronDown,
  ChevronUp,
  Pin,
  Sparkles,
  X,
  FileX,
  Wifi,
  Cog,
  Server,
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useErrorStore } from '@/stores/errorStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  ErrorType, 
  ERROR_COLORS, 
  ERROR_BG_COLORS, 
  ERROR_BORDER_COLORS 
} from '@/types/error';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type FilterType = 'all' | ErrorType;

const ERROR_ICON_COMPONENTS: Record<ErrorType, typeof FileX> = {
  import: FileX,
  export: Download,
  processing: Cog,
  network: Wifi,
  validation: AlertTriangle,
  api: Server,
  auth: Shield,
};

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'import', label: 'Import' },
  { key: 'export', label: 'Export' },
  { key: 'network', label: 'Network' },
  { key: 'api', label: 'API' },
  { key: 'processing', label: 'Processing' },
  { key: 'validation', label: 'Validation' },
  { key: 'auth', label: 'Auth' },
];

export function LogsPanel() {
  // Subscribe to errors array directly with shallow equality
  const rawErrors = useErrorStore((state) => state.errors);
  const { 
    togglePin, 
    deleteError, 
    markAsRead, 
    markAllAsRead, 
    clearErrors, 
    clearReadErrors,
    setAISuggestion,
    setAnalyzing,
    hasUnreadErrors
  } = useErrorStore();
  
  // Memoize sorted errors to prevent infinite rerender loop
  const errors = useMemo(() => 
    [...rawErrors].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.timestamp - a.timestamp;
    }), [rawErrors]);
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Mark all as read when panel opens
  useEffect(() => {
    markAllAsRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const filteredErrors = useMemo(() => {
    return errors.filter(error => {
      const matchesFilter = filter === 'all' || error.type === filter;
      const matchesSearch = searchQuery === '' || 
        error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.details?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [errors, filter, searchQuery]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { total: errors.length };
    filterTabs.forEach(tab => {
      if (tab.key !== 'all') {
        result[tab.key] = errors.filter(e => e.type === tab.key).length;
      }
    });
    return result;
  }, [errors]);

  const toggleExpanded = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const handleAnalyzeWithAI = async (id: string, message: string, details?: string) => {
    setAnalyzing(id, true);
    // Mock AI analysis - simulates processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock suggestion based on error type
    const suggestions = [
      "Check if the file path is correct and the file exists.",
      "Verify network connectivity and API endpoint availability.",
      "Ensure all required fields are properly validated before submission.",
      "Check authentication tokens and refresh if expired.",
      "Review the processing pipeline for any missing dependencies.",
    ];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAISuggestion(id, suggestion);
    toast.success('AI analysis complete');
  };

  const exportAsMarkdown = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const filename = `error-log_${dateStr}_${timeStr}.md`;

    const content = [
      '# Error Log Export',
      `Generated: ${now.toLocaleString()}`,
      `Total Errors: ${errors.length}`,
      '',
      '---',
      '',
      ...errors.map(err => [
        `## [${err.type.toUpperCase()}] ${err.message}`,
        '',
        `- **Time:** ${new Date(err.timestamp).toLocaleString()}`,
        `- **Source:** ${err.source || 'Unknown'}`,
        `- **Pinned:** ${err.pinned ? 'Yes' : 'No'}`,
        err.details ? `- **Details:** ${err.details}` : '',
        err.aiSuggestion ? `- **AI Suggestion:** ${err.aiSuggestion}` : '',
        '',
        '---',
        '',
      ].filter(Boolean).join('\n'))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported to ${filename}`);
  };

  return (
    <div className="space-y-4 boot-sequence">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-header text-lg">
            <ScrollText className="w-4 h-4" />
            Error Log
            {counts.total > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-mono bg-signal-red/20 text-signal-red rounded-full">
                {counts.total}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAsMarkdown}
              className="h-7 text-xs gap-1.5"
              disabled={errors.length === 0}
            >
              <Download className="w-3 h-3" />
              Export MD
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearReadErrors}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-signal-amber"
              disabled={errors.length === 0}
            >
              <Trash2 className="w-3 h-3" />
              Clear Read
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-signal-red"
                  disabled={errors.length === 0}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all errors?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {errors.length} error logs including pinned items. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearErrors} className="bg-signal-red hover:bg-signal-red/90">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Filter tabs + Search */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                  filter === tab.key 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.key !== 'all' && counts[tab.key] > 0 && (
                  <span className={cn("ml-1 font-mono", ERROR_COLORS[tab.key as ErrorType])}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search errors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary/50"
            />
          </div>
        </div>
      </div>
      
      {/* Error entries */}
      <div className="terminal-glass rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
        {filteredErrors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No errors logged</p>
            <p className="text-xs mt-1 opacity-60">Errors will appear here when they occur</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredErrors.map(error => {
              const Icon = ERROR_ICON_COMPONENTS[error.type];
              const isExpanded = expandedLogs.has(error.id);
              const hasDetails = !!error.details;
              
              return (
                <div 
                  key={error.id} 
                  className={cn(
                    "group transition-colors",
                    error.pinned && "bg-primary/5 border-l-2 border-l-primary",
                    !error.read && !error.pinned && "border-l-2 border-l-signal-blue"
                  )}
                >
                  <div className={cn(
                    "p-3",
                    error.read && !error.pinned && "opacity-60 hover:opacity-80"
                  )}>
                    <div className="flex items-start gap-3">
                      <Icon className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0", 
                        ERROR_COLORS[error.type]
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "badge text-[10px] uppercase", 
                            ERROR_BG_COLORS[error.type],
                            ERROR_COLORS[error.type]
                          )}>
                            {error.type}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatTime(error.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {error.message}
                        </p>
                        {error.source && (
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            Source: {error.source}
                          </p>
                        )}
                        {hasDetails && (
                          <button
                            onClick={() => toggleExpanded(error.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAnalyzeWithAI(error.id, error.message, error.details)}
                          disabled={error.isAnalyzing || !!error.aiSuggestion}
                          title="Analyze with AI"
                        >
                          {error.isAnalyzing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className={cn(
                              "w-3.5 h-3.5",
                              error.aiSuggestion ? "text-signal-purple" : ""
                            )} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => togglePin(error.id)}
                          title={error.pinned ? "Unpin" : "Pin"}
                        >
                          <Pin className={cn(
                            "w-3.5 h-3.5",
                            error.pinned && "fill-primary text-primary"
                          )} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-signal-red"
                          onClick={() => deleteError(error.id)}
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expandable details */}
                    {isExpanded && hasDetails && (
                      <pre className="mt-3 p-3 bg-background/50 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
                        {error.details}
                      </pre>
                    )}
                    
                    {/* AI Suggestion */}
                    {error.aiSuggestion && (
                      <div className={cn(
                        "mt-3 p-3 rounded-lg border",
                        "bg-signal-purple/10 border-signal-purple/30"
                      )}>
                        <div className="flex items-center gap-2 text-xs text-signal-purple mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="font-medium">AI Suggestion</span>
                        </div>
                        <p className="text-sm text-foreground/90">
                          {error.aiSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
