import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Film, Activity, Play, Pause, RotateCcw, Gauge, Box
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsStore } from '@/devtools/stores/settingsStore';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & DATA
// ═══════════════════════════════════════════════════════════════════════════

interface Animation {
  file: string;
  states: number;
  size: string;
  status: 'playing' | 'paused' | 'stopped';
}

const mockAnimations: Animation[] = [
  { file: 'narrator.riv', states: 3, size: '124 KB', status: 'playing' },
  { file: 'idle-blink.riv', states: 2, size: '45 KB', status: 'playing' },
  { file: 'page-turn.riv', states: 4, size: '89 KB', status: 'paused' },
  { file: 'loading-spinner.riv', states: 1, size: '12 KB', status: 'stopped' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════

export function AnimationPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const isMonitoring = settings.fpsMonitoringEnabled && !settings.lowResourceMode;
  
  const [fps, setFps] = useState<number | null>(null);
  const [animations, setAnimations] = useState(mockAnimations);
  const [debugOptions, setDebugOptions] = useState({
    showBounds: true,
    showBones: false,
    slowMotion: false,
    logStateChanges: false,
  });

  // Live FPS counter - only runs when monitoring is enabled
  useEffect(() => {
    if (!isMonitoring) {
      setFps(null);
      return;
    }

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    function countFrame() {
      frameCount++;
      animId = requestAnimationFrame(countFrame);
    }

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTime;
      const measuredFps = Math.round((frameCount / elapsed) * 1000);
      setFps(Math.min(60, measuredFps));
      frameCount = 0;
      lastTime = now;
    }, 500);

    animId = requestAnimationFrame(countFrame);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [isMonitoring]);

  const pauseAll = () => {
    setAnimations(prev => prev.map(a => ({ ...a, status: 'paused' as const })));
  };

  const playAll = () => {
    setAnimations(prev => prev.map(a => ({ ...a, status: 'playing' as const })));
  };

  const reloadAll = () => {
    setAnimations(mockAnimations);
  };

  const toggleDebug = (key: keyof typeof debugOptions) => {
    setDebugOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMonitoring = () => {
    updateSettings({ fpsMonitoringEnabled: !settings.fpsMonitoringEnabled });
  };

  const statusColors = {
    playing: 'status-light--green',
    paused: 'status-light--amber',
    stopped: 'status-light--red',
  };

  return (
    <div className="space-y-4">
      {/* Rive Runtime Status */}
      <div className="dev-card">
        <div className="section-header">
          <Film className="w-3 h-3" />
          <span>Rive Runtime</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="flex items-center gap-1.5">
              <div className="status-light status-light--green" />
              Initialized
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span className="text-foreground">@rive-app/react-canvas 4.16.3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WASM:</span>
            <span className="text-signal-green">✓ Loaded (2.1 MB)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Renderer:</span>
            <span className="text-foreground">WebGL 2.0</span>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="dev-card">
        <div className="section-header">
          <Gauge className="w-3 h-3" />
          <span>Performance</span>
          {isMonitoring && (
            <span className="ml-auto flex items-center gap-1 text-signal-cyan text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-cyan animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        
        {/* Low Resource Mode Warning */}
        {settings.lowResourceMode && settings.fpsMonitoringEnabled && (
          <div className="text-xs text-signal-amber bg-signal-amber/10 px-2 py-1 rounded mb-3">
            ⚠️ FPS monitoring paused by Low Resource Mode
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-muted-foreground">FPS:</span>
              <span className={cn(
                fps !== null
                  ? fps >= 55 ? 'text-signal-green' : fps >= 30 ? 'text-signal-amber' : 'text-signal-red'
                  : 'text-muted-foreground'
              )}>
                {fps !== null ? `${fps}/60` : '—/60'}
              </span>
            </div>
            <Progress value={fps !== null ? (fps / 60) * 100 : 0} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frame Time:</span>
              <span className="text-foreground">
                {fps !== null ? `${(1000 / fps).toFixed(1)}ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Draw Calls:</span>
              <span className="text-muted-foreground">—</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Triangles:</span>
              <span className="text-muted-foreground">—</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isMonitoring ? "default" : "outline"} 
              size="sm" 
              className={cn(
                "text-xs h-7",
                isMonitoring && "bg-signal-cyan/20 text-signal-cyan border-signal-cyan/30 hover:bg-signal-cyan/30"
              )}
              onClick={toggleMonitoring}
              disabled={settings.lowResourceMode}
            >
              <Activity className="w-3 h-3 mr-1" />
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </div>
        </div>
      </div>

      {/* Loaded Animations */}
      <div className="dev-card">
        <div className="section-header">
          <Box className="w-3 h-3" />
          <span>Loaded Animations</span>
        </div>
        <ScrollArea className="h-[140px]">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-terminal-border">
                <th className="pb-2">File</th>
                <th className="pb-2">States</th>
                <th className="pb-2">Size</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {animations.map(anim => (
                <tr key={anim.file} className="border-b border-terminal-border/30">
                  <td className="py-2 text-foreground">{anim.file}</td>
                  <td className="py-2 text-muted-foreground">{anim.states} states</td>
                  <td className="py-2 text-muted-foreground">{anim.size}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-1.5">
                      <div className={cn('status-light', statusColors[anim.status])} />
                      <span className="capitalize">{anim.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={pauseAll}>
            <Pause className="w-3 h-3" />
            Pause All
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={playAll}>
            <Play className="w-3 h-3" />
            Play All
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={reloadAll}>
            <RotateCcw className="w-3 h-3" />
            Reload All
          </Button>
        </div>
      </div>

      {/* Debug Options */}
      <div className="dev-card">
        <div className="section-header">
          <Film className="w-3 h-3" />
          <span>Debug Options</span>
        </div>
        <div className="space-y-2">
          {[
            { key: 'showBounds', label: 'Show animation bounds' },
            { key: 'showBones', label: 'Show bone structure' },
            { key: 'slowMotion', label: 'Slow motion (0.25x)' },
            { key: 'logStateChanges', label: 'Log state changes' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={debugOptions[key as keyof typeof debugOptions]}
                onCheckedChange={() => toggleDebug(key as keyof typeof debugOptions)}
              />
              <label htmlFor={key} className="text-xs text-muted-foreground cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
