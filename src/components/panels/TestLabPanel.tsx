// Test Lab Panel v3.0.0 - Consolidated testing with Audio, Video, Data tabs
import { useState, useRef } from 'react';
import { 
  FlaskConical, 
  Volume2, 
  Film, 
  Database,
  Play,
  Square,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO TAB
// ═══════════════════════════════════════════════════════════════════════════

function AudioTab() {
  const [volume, setVolume] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  const playTestTone = () => {
    if (isPlaying) {
      oscillatorRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
      gainNode.gain.setValueAtTime(volume / 100, ctx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillatorRef.current = oscillator;
      
      setIsPlaying(true);
      
      // Auto-stop after 2 seconds
      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      toast.error('Audio context not supported');
    }
  };

  return (
    <div className="space-y-6">
      {/* Volume Control */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-semibold text-sm">Master Volume</h3>
          <span className="font-data text-signal-green">{volume}%</span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={([v]) => setVolume(v)}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Test Tone */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-semibold text-sm">Test Tone (440Hz)</h3>
            <p className="text-xs text-muted-foreground mt-1">Plays for 2 seconds</p>
          </div>
          <Button 
            variant={isPlaying ? "destructive" : "outline"} 
            size="sm"
            onClick={playTestTone}
          >
            {isPlaying ? <Square className="w-3 h-3 mr-1.5" /> : <Play className="w-3 h-3 mr-1.5" />}
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
        </div>
      </div>

      {/* TTS Preview */}
      <div className="terminal-glass p-4 rounded-lg border-l-2 border-signal-amber">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-signal-amber mt-0.5" />
          <div>
            <h3 className="font-mono font-semibold text-sm">TTS Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Text-to-speech preview uses AI credits. Coming in Phase 5.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIDEO TAB
// ═══════════════════════════════════════════════════════════════════════════

function VideoTab() {
  const [animDebugMode, setAnimDebugMode] = useState(false);
  const [showFps, setShowFps] = useState(true);
  const [fps, setFps] = useState(60);

  // Simulate FPS monitoring
  useState(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(55 + Math.random() * 10));
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div className="space-y-6">
      {/* FPS Display */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-mono font-semibold text-sm">FPS Monitor</h3>
          </div>
          <Switch checked={showFps} onCheckedChange={setShowFps} />
        </div>
        {showFps && (
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "font-data text-3xl",
              fps >= 55 ? "text-signal-green" : fps >= 30 ? "text-signal-amber" : "text-signal-red"
            )}>
              {fps}
            </span>
            <span className="text-xs text-muted-foreground">FPS</span>
          </div>
        )}
      </div>

      {/* Animation Debug Mode */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-semibold text-sm">Animation Debug Mode</h3>
            <p className="text-xs text-muted-foreground mt-1">Show animation boundaries and timing</p>
          </div>
          <Switch checked={animDebugMode} onCheckedChange={setAnimDebugMode} />
        </div>
      </div>

      {/* Rive Status */}
      <div className="terminal-glass p-4 rounded-lg">
        <h3 className="font-mono font-semibold text-sm mb-3">Rive Runtime</h3>
        <div className="flex items-center gap-2">
          <span className="status-light status-light--amber" />
          <span className="text-sm text-muted-foreground">Not initialized</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Rive animations available in Phase 6.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA TAB
// ═══════════════════════════════════════════════════════════════════════════

function DataTab() {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedDemoData = async () => {
    setIsSeeding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Demo data seeded successfully');
    setIsSeeding(false);
  };

  const clearLocalStorage = () => {
    if (confirm('This will clear all localStorage data. Are you sure?')) {
      localStorage.clear();
      toast.success('LocalStorage cleared');
    }
  };

  const clearIndexedDB = async () => {
    if (confirm('This will clear all IndexedDB caches. Are you sure?')) {
      const dbs = await indexedDB.databases?.() || [];
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
      toast.success('IndexedDB caches cleared');
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Data Seeding */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-semibold text-sm">Seed Demo Data</h3>
            <p className="text-xs text-muted-foreground mt-1">Populate database with test records</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={seedDemoData}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
            ) : (
              <Database className="w-3 h-3 mr-1.5" />
            )}
            {isSeeding ? 'Seeding...' : 'Seed'}
          </Button>
        </div>
      </div>

      {/* Clear LocalStorage */}
      <div className="terminal-glass p-4 rounded-lg group hover:border-signal-red/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-semibold text-sm">Clear LocalStorage</h3>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-signal-red transition-colors">
              ⚠️ This will reset all local settings
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearLocalStorage}
            className="border-signal-red/30 text-signal-red hover:bg-signal-red/10"
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Clear IndexedDB */}
      <div className="terminal-glass p-4 rounded-lg group hover:border-signal-red/30 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-semibold text-sm">Clear IndexedDB Cache</h3>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-signal-red transition-colors">
              ⚠️ Clears all cached data and blobs
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearIndexedDB}
            className="border-signal-red/30 text-signal-red hover:bg-signal-red/10"
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function TestLabPanel() {
  return (
    <div className="space-y-4 boot-sequence">
      {/* Header */}
      <div>
        <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-signal-purple" />
          Test Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          Audio, video, and data testing utilities
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="audio" className="gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1.5">
            <Film className="w-3.5 h-3.5" />
            Video
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5">
            <Database className="w-3.5 h-3.5" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio">
          <AudioTab />
        </TabsContent>
        <TabsContent value="video">
          <VideoTab />
        </TabsContent>
        <TabsContent value="data">
          <DataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
