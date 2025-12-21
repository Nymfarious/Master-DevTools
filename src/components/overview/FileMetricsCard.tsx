// File Metrics Card - Shows file line counts with status indicators
// Lines: ~90 | Status: GREEN
import { FileCode, AlertTriangle, AlertCircle } from 'lucide-react';
import { useFileMetricsStore, PROJECT_FILES } from '@/stores/fileMetricsStore';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function FileMetricsCard() {
  const { files, setFileMetric, getTotalLines, getWarningCount, getCriticalCount, thresholds } = useFileMetricsStore();
  
  // Initialize file metrics on mount
  useEffect(() => {
    PROJECT_FILES.forEach(f => setFileMetric(f.path, f.lines));
  }, [setFileMetric]);
  
  const sortedFiles = [...files].sort((a, b) => b.lines - a.lines);
  const warningCount = getWarningCount();
  const criticalCount = getCriticalCount();
  const totalLines = getTotalLines();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-header">
          <FileCode className="w-3.5 h-3.5" />
          File Metrics
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Total: {totalLines.toLocaleString()} lines</span>
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-signal-amber">
              <AlertTriangle className="w-3 h-3" /> {warningCount}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-signal-red">
              <AlertCircle className="w-3 h-3" /> {criticalCount}
            </span>
          )}
        </div>
      </div>
      
      <div className="terminal-glass rounded-lg overflow-hidden">
        <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
          {sortedFiles.map(file => (
            <div 
              key={file.path}
              className={cn(
                "flex items-center justify-between p-2.5 text-sm",
                "hover:bg-secondary/30 transition-colors",
                file.status === 'yellow' && "bg-signal-amber/5",
                file.status === 'red' && "bg-signal-red/5"
              )}
            >
              <span className="font-mono text-xs text-foreground truncate flex-1 mr-4">
                {file.path}
              </span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-mono text-xs w-16 text-right",
                  file.status === 'green' && "text-signal-green",
                  file.status === 'yellow' && "text-signal-amber",
                  file.status === 'red' && "text-signal-red"
                )}>
                  {file.lines} lines
                </span>
                {file.status !== 'green' && (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    file.status === 'yellow' && "bg-signal-amber",
                    file.status === 'red' && "bg-signal-red animate-pulse"
                  )} 
                  style={{ 
                    boxShadow: file.status === 'red' 
                      ? '0 0 8px hsl(var(--signal-red))' 
                      : file.status === 'yellow'
                        ? '0 0 8px hsl(var(--signal-amber))'
                        : 'none'
                  }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-2 border-t border-border/30 bg-secondary/20 text-xs text-muted-foreground">
          <span className="text-signal-amber">⚠ Yellow</span> ≥{thresholds.yellow} lines | 
          <span className="text-signal-red ml-2">⛔ Red</span> ≥{thresholds.red} lines → Refactor!
        </div>
      </div>
    </section>
  );
}
