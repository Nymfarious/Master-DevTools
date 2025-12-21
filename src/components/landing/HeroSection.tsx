import { Terminal, Cpu, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function HeroSection() {
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-signal-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-signal-blue/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center boot-sequence">
        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-signal-green/30 bg-signal-green/10 mb-8">
          <span className="status-light status-light--green" />
          <span className="font-mono text-xs text-signal-green">SYSTEM ONLINE</span>
        </div>
        
        {/* Main title */}
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
          <span className="text-foreground">Master</span>
          <span className="text-gradient"> Devtools</span>
        </h1>
        
        {/* Subtitle */}
        <p className="font-mono text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Unified monitoring and control center for all your AI-powered applications.
          <span className="text-signal-cyan"> Access APIs without bringing your own keys.</span>
        </p>
        
        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="badge badge--green">
            <Activity className="w-3 h-3 mr-1" />
            Real-time Monitoring
          </div>
          <div className="badge badge--blue">
            <Cpu className="w-3 h-3 mr-1" />
            AI Pipeline Tracking
          </div>
          <div className="badge badge--purple">
            <Zap className="w-3 h-3 mr-1" />
            Shared API Access
          </div>
        </div>
        
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button className="bg-signal-green hover:bg-signal-green/90 text-background font-mono px-8 py-6 text-lg">
                <Terminal className="w-5 h-5 mr-2" />
                OPEN DASHBOARD
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button className="bg-signal-green hover:bg-signal-green/90 text-background font-mono px-8 py-6 text-lg">
                  <Terminal className="w-5 h-5 mr-2" />
                  GET STARTED
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" className="border-border hover:bg-secondary font-mono px-8 py-6 text-lg">
                  TRY DEMO
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
