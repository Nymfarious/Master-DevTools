import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileJson, FileText, Archive } from 'lucide-react';
import { useLogsStore } from '../stores/logsStore';
import { usePipelineStore } from '../stores/pipelineStore';
import { useToast } from '@/hooks/use-toast';

export function ExportPanel() {
  const { toast } = useToast();
  const logs = useLogsStore((state) => state.logs);
  const pipelineEvents = usePipelineStore((state) => state.events);
  
  const [exportOptions, setExportOptions] = useState({
    logs: true,
    pipeline: true,
    config: false,
    timestamps: true,
  });

  const toggleOption = (key: keyof typeof exportOptions) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportAsJSON = () => {
    const data: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      version: '2.3.0',
    };

    if (exportOptions.logs) {
      data.logs = logs;
    }
    if (exportOptions.pipeline) {
      data.pipelineEvents = pipelineEvents;
    }
    if (exportOptions.config) {
      data.config = {
        // Add any config you want to export
      };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported!', description: 'DevTools data exported as JSON' });
  };

  const exportAsText = () => {
    let content = `DevTools Export - ${new Date().toISOString()}\n`;
    content += '='.repeat(50) + '\n\n';

    if (exportOptions.logs && logs.length > 0) {
      content += 'LOGS:\n' + '-'.repeat(20) + '\n';
      logs.forEach(log => {
        const time = exportOptions.timestamps ? `[${log.timestamp}] ` : '';
        content += `${time}[${log.level.toUpperCase()}] ${log.message}\n`;
        if (log.context) {
          content += `  Context: ${JSON.stringify(log.context)}\n`;
        }
      });
      content += '\n';
    }

    if (exportOptions.pipeline && pipelineEvents.length > 0) {
      content += 'PIPELINE EVENTS:\n' + '-'.repeat(20) + '\n';
      pipelineEvents.forEach(event => {
        const time = exportOptions.timestamps ? `[${event.timestamp}] ` : '';
        content += `${time}${event.step} via ${event.provider} - ${event.success ? 'SUCCESS' : 'FAILED'} (${event.duration}ms)\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported!', description: 'DevTools data exported as text' });
  };

  const hasData = logs.length > 0 || pipelineEvents.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Export Data
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Export logs, pipeline events, and configurations
        </p>
      </div>

      {/* Data Summary */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Available Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Log Entries</span>
            <Badge variant="outline">{logs.length}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pipeline Events</span>
            <Badge variant="outline">{pipelineEvents.length}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Include in Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox 
              checked={exportOptions.logs} 
              onCheckedChange={() => toggleOption('logs')}
            />
            <span className="text-sm">Logs ({logs.length} entries)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox 
              checked={exportOptions.pipeline} 
              onCheckedChange={() => toggleOption('pipeline')}
            />
            <span className="text-sm">Pipeline Events ({pipelineEvents.length} events)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox 
              checked={exportOptions.timestamps} 
              onCheckedChange={() => toggleOption('timestamps')}
            />
            <span className="text-sm">Include timestamps</span>
          </label>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Export Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={exportAsJSON} 
            className="w-full justify-start"
            disabled={!hasData}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button 
            onClick={exportAsText} 
            variant="outline"
            className="w-full justify-start"
            disabled={!hasData}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export as Text
          </Button>
        </CardContent>
      </Card>

      {!hasData && (
        <p className="text-xs text-muted-foreground text-center">
          No data to export yet. Use the app to generate logs and pipeline events.
        </p>
      )}
    </div>
  );
}
