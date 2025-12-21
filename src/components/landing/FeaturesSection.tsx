import { 
  AudioLines, 
  Video, 
  FileText, 
  Library, 
  Globe, 
  Bot, 
  Database, 
  GitBranch, 
  Coins, 
  ScrollText, 
  Shield, 
  Workflow 
} from 'lucide-react';

const features = [
  { icon: AudioLines, label: 'Audio', description: 'TTS, transcription, voice cloning' },
  { icon: Video, label: 'Video', description: 'Generation, editing, animation' },
  { icon: FileText, label: 'Content', description: 'Text generation, summaries' },
  { icon: Library, label: 'Libraries', description: 'Asset management, templates' },
  { icon: Globe, label: 'APIs', description: 'Registry, health monitoring' },
  { icon: Bot, label: 'Agents', description: 'AI assistants, automation' },
  { icon: Database, label: 'Data', description: 'Storage, analytics, exports' },
  { icon: GitBranch, label: 'Flowchart', description: 'Visual pipeline builder' },
  { icon: Coins, label: 'Tokens', description: 'Usage tracking, credits' },
  { icon: ScrollText, label: 'Logs', description: 'Real-time error tracking' },
  { icon: Shield, label: 'Security', description: 'API keys, permissions' },
  { icon: Workflow, label: 'Pipeline', description: 'Event tracking, metrics' },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Complete Control Center
          </h2>
          <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
            Everything you need to monitor, manage, and optimize your AI-powered applications
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={feature.label}
              className="dev-card group cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-signal-blue/10 border border-signal-blue/30 flex items-center justify-center shrink-0 group-hover:bg-signal-blue/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-signal-blue" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-semibold text-foreground mb-1">
                    {feature.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
