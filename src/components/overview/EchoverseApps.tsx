// Echoverse Apps Grid v3.0.0 - App launcher with 5 Coming Soon placeholders
import { 
  Scissors, 
  Drum, 
  Film, 
  Video, 
  Mic,
  ExternalLink, 
  Settings,
  Globe,
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusLight } from '@/components/ui/StatusLight';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EchoverseApp {
  id: string;
  name: string;
  description: string;
  icon: typeof Scissors;
  status: 'online' | 'offline' | 'coming-soon';
  version?: string;
  url?: string;
  githubUrl?: string;
}

const APPS: EchoverseApp[] = [
  { 
    id: 'sprite-slicer', 
    name: 'Sprite Slicer Studio', 
    description: 'Slice and export sprite sheets',
    icon: Scissors, 
    status: 'coming-soon',
    githubUrl: 'https://github.com/echoverse/sprite-slicer'
  },
  { 
    id: 'ddrummer', 
    name: 'dDrummer Suite', 
    description: 'Digital drum machine & sequencer',
    icon: Drum, 
    status: 'coming-soon',
    githubUrl: 'https://github.com/echoverse/ddrummer'
  },
  { 
    id: 'cdmedia-pipeline', 
    name: 'C-dmedia Pipeline', 
    description: 'Media processing pipeline',
    icon: Film, 
    status: 'coming-soon',
    githubUrl: 'https://github.com/echoverse/cdmedia'
  },
  { 
    id: 'frameperfect-ai', 
    name: 'FramePerfect AI', 
    description: 'Extract, analyze & curate video frames with Gemini AI',
    icon: Video, 
    status: 'coming-soon',
    githubUrl: 'https://github.com/Nymfarious/FramePerfect-AI'
  },
  { 
    id: 'juniper', 
    name: 'Juniper Voice Assistant', 
    description: 'AI voice commands & TTS',
    icon: Mic, 
    status: 'coming-soon',
    githubUrl: 'https://github.com/echoverse/juniper'
  },
];

export function EchoverseApps() {
  const handleOpen = (app: EchoverseApp) => {
    if (app.status === 'coming-soon') {
      toast.info(`${app.name} is coming soon!`);
      return;
    }
    if (app.status === 'offline') {
      toast.error(`${app.name} is offline`);
      return;
    }
    if (app.url) {
      window.open(app.url, '_blank');
    }
  };

  const handleGithub = (app: EchoverseApp) => {
    if (app.githubUrl) {
      window.open(app.githubUrl, '_blank');
    } else {
      toast.info('GitHub repository coming soon');
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="section-header">
        <Globe className="w-3.5 h-3.5" />
        Echoverse Apps
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {APPS.map(app => {
          const Icon = app.icon;
          const isComingSoon = app.status === 'coming-soon';
          const isOnline = app.status === 'online';
          
          return (
            <div 
              key={app.id}
              className={cn(
                "terminal-glass p-4 rounded-lg",
                "transition-all duration-200",
                "hover:ring-1 hover:ring-border/50",
                isComingSoon && "opacity-70"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "w-5 h-5",
                    isOnline ? "text-signal-green" : "text-muted-foreground"
                  )} />
                  <span className="font-display font-semibold text-sm">{app.name}</span>
                </div>
                {isComingSoon ? (
                  <span className="badge badge--muted text-[10px]">Coming Soon</span>
                ) : (
                  <StatusLight status={isOnline ? 'healthy' : 'unknown'} size="sm" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                {app.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {app.version || '--'}
                </span>
                
                <div className="flex gap-1.5">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 text-xs" 
                    onClick={() => handleGithub(app)}
                  >
                    <Github className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={isComingSoon ? "outline" : "ghost"}
                    className="h-6 px-2 text-xs" 
                    onClick={() => handleOpen(app)}
                    disabled={isComingSoon}
                  >
                    {isComingSoon ? 'Connect' : <><ExternalLink className="w-3 h-3 mr-1" /> Open</>}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
