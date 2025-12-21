import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        
        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-muted-foreground">
              © 2024 Master Devtools. All systems operational.
            </p>
            <div className="flex items-center gap-2">
              <span className="status-light status-light--green" />
              <span className="font-mono text-xs text-signal-green">v1.0.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
