import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Volume2, Film, Mic, RefreshCw, CheckCircle, XCircle, 
  AlertTriangle, Clock, Activity, Waves, Video, Speaker
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ServiceStatus {
  id: string;
  name: string;
  provider: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  lastChecked: Date | null;
  latency?: number;
  credits?: { used: number; limit: number };
}

interface AudioContextStatus {
  state: 'running' | 'suspended' | 'closed';
  sampleRate: number;
  currentTime: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MediaMonitorPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Service status state (mock data - replace with real checks)
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: 'elevenlabs',
      name: 'ElevenLabs TTS',
      provider: 'ElevenLabs',
      status: 'unknown',
      lastChecked: null,
      credits: { used: 0, limit: 10000 },
    },
    {
      id: 'web-audio',
      name: 'Web Audio API',
      provider: 'Browser',
      status: 'unknown',
      lastChecked: null,
    },
    {
      id: 'rive',
      name: 'Rive Runtime',
      provider: 'Rive',
      status: 'unknown',
      lastChecked: null,
    },
    {
      id: 'replicate-audio',
      name: 'Replicate Audio',
      provider: 'Replicate',
      status: 'unknown',
      lastChecked: null,
    },
    {
      id: 'replicate-video',
      name: 'Replicate Video',
      provider: 'Replicate',
      status: 'unknown',
      lastChecked: null,
    },
  ]);

  // Audio context status
  const [audioContext, setAudioContext] = useState<AudioContextStatus | null>(null);

  // Manual refresh all services
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    
    // Check Web Audio API
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext({
        state: ctx.state,
        sampleRate: ctx.sampleRate,
        currentTime: ctx.currentTime,
      });
      ctx.close();
      
      setServices(prev => prev.map(s => 
        s.id === 'web-audio' 
          ? { ...s, status: 'online' as const, lastChecked: new Date() }
          : s
      ));
    } catch {
      setServices(prev => prev.map(s => 
        s.id === 'web-audio' 
          ? { ...s, status: 'offline' as const, lastChecked: new Date() }
          : s
      ));
    }

    // Check Rive (just verify the library is loaded)
    const riveLoaded = typeof (window as any).rive !== 'undefined' || 
                       document.querySelector('canvas[data-rive]') !== null;
    setServices(prev => prev.map(s => 
      s.id === 'rive' 
        ? { ...s, status: riveLoaded ? 'online' : 'unknown' as const, lastChecked: new Date() }
        : s
    ));

    // For external services, just mark as "unknown" until real API check
    setServices(prev => prev.map(s => 
      ['elevenlabs', 'replicate-audio', 'replicate-video'].includes(s.id)
        ? { ...s, status: 'unknown' as const, lastChecked: new Date() }
        : s
    ));

    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Media Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Audio, Video, and TTS service status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Last checked: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audio" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2">
            <Film className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="tts" className="gap-2">
            <Mic className="h-4 w-4" />
            TTS
          </TabsTrigger>
        </TabsList>

        {/* AUDIO TAB */}
        <TabsContent value="audio" className="space-y-4 mt-4">
          <AudioMonitorSection 
            services={services.filter(s => ['web-audio', 'replicate-audio'].includes(s.id))}
            audioContext={audioContext}
          />
        </TabsContent>

        {/* VIDEO TAB */}
        <TabsContent value="video" className="space-y-4 mt-4">
          <VideoMonitorSection 
            services={services.filter(s => ['rive', 'replicate-video'].includes(s.id))}
          />
        </TabsContent>

        {/* TTS TAB */}
        <TabsContent value="tts" className="space-y-4 mt-4">
          <TTSMonitorSection 
            services={services.filter(s => s.id === 'elevenlabs')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO MONITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface AudioMonitorSectionProps {
  services: ServiceStatus[];
  audioContext: AudioContextStatus | null;
}

function AudioMonitorSection({ services, audioContext }: AudioMonitorSectionProps) {
  return (
    <div className="space-y-4">
      {/* Web Audio API Status */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Web Audio API
          </CardTitle>
          <CardDescription>Browser audio engine status</CardDescription>
        </CardHeader>
        <CardContent>
          {audioContext ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">State:</span>
                <Badge 
                  variant={audioContext.state === 'running' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {audioContext.state}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Rate:</span>
                <span className="ml-2 font-mono">{audioContext.sampleRate} Hz</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Time:</span>
                <span className="ml-2 font-mono">{audioContext.currentTime.toFixed(2)}s</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Refresh All" to check status</p>
          )}
        </CardContent>
      </Card>

      {/* Audio Services */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Speaker className="h-4 w-4" />
            Audio Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {services.map(service => (
              <ServiceStatusRow key={service.id} service={service} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIDEO MONITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface VideoMonitorSectionProps {
  services: ServiceStatus[];
}

function VideoMonitorSection({ services }: VideoMonitorSectionProps) {
  const [fps] = useState<number | null>(null);
  const [debugMode] = useState(false);

  return (
    <div className="space-y-4">
      {/* Animation Runtime */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Animation Runtime
          </CardTitle>
          <CardDescription>Rive and animation engine status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">FPS Target:</span>
            <Badge variant="outline">60 FPS</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Current FPS:</span>
            <span className="font-mono text-sm">
              {fps !== null ? `${fps} FPS` : 'Not measured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Debug Mode:</span>
            <Badge variant={debugMode ? 'default' : 'secondary'}>
              {debugMode ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Video Services */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {services.map(service => (
              <ServiceStatusRow key={service.id} service={service} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TTS MONITOR SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface TTSMonitorSectionProps {
  services: ServiceStatus[];
}

function TTSMonitorSection({ services }: TTSMonitorSectionProps) {
  const elevenLabs = services.find(s => s.id === 'elevenlabs');

  return (
    <div className="space-y-4">
      {/* ElevenLabs Status */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mic className="h-4 w-4" />
            ElevenLabs TTS (Ekko)
          </CardTitle>
          <CardDescription>Voice synthesis service status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {elevenLabs && (
            <>
              <ServiceStatusRow service={elevenLabs} />
              
              {elevenLabs.credits && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits Used:</span>
                    <span className="font-mono">
                      {elevenLabs.credits.used.toLocaleString()} / {elevenLabs.credits.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(elevenLabs.credits.used / elevenLabs.credits.limit) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Credits are checked manually. Click "Refresh All" to update.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Voice Configuration */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Voice Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Voice:</span>
              <span className="ml-2">Ekko</span>
            </div>
            <div>
              <span className="text-muted-foreground">Model:</span>
              <span className="ml-2 font-mono">eleven_monolingual_v1</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stability:</span>
              <span className="ml-2">0.5</span>
            </div>
            <div>
              <span className="text-muted-foreground">Clarity:</span>
              <span className="ml-2">0.75</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ServiceStatusRow({ service }: { service: ServiceStatus }) {
  const statusConfig = {
    online: { icon: CheckCircle, color: 'text-green-500', label: 'Online' },
    offline: { icon: XCircle, color: 'text-red-500', label: 'Offline' },
    degraded: { icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
    unknown: { icon: Clock, color: 'text-muted-foreground', label: 'Unknown' },
  };

  const config = statusConfig[service.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-2 bg-background/50 rounded">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className="text-sm">{service.name}</span>
        <Badge variant="outline" className="text-xs">{service.provider}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {config.label}
        </Badge>
        {service.latency && (
          <span className="text-xs text-muted-foreground font-mono">
            {service.latency}ms
          </span>
        )}
      </div>
    </div>
  );
}
