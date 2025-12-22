import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useAppStore } from '@/stores/appStore';
import { useSystemStore } from '@/stores/systemStore';
import { DEVTOOLS_SECTIONS } from '@/config/sections';
import { toast } from 'sonner';
import type { SectionId } from '@/types/devtools';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { setActiveSection, setCommandPaletteOpen } = useAppStore();
  const { incrementUptime } = useSystemStore();

  // Uptime counter
  useEffect(() => {
    const timer = setInterval(incrementUptime, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // incrementUptime is stable from Zustand

  // Keyboard shortcuts (⌘/Ctrl for Mac, Alt for Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey || e.altKey;
      
      // Command palette: ⌘K, Ctrl+K, or Alt+K
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        toast('Command palette coming soon!', {
          description: 'Press ⌘K / Alt+K to search',
          duration: 2000,
        });
        return;
      }

      // Escape: close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        return;
      }

      // Section navigation: ⌘1-9, ⌘0, Alt+1-9, Alt+0
      if (isMod) {
        const keyToSection: Record<string, SectionId> = {
          '1': 'overview',
          '2': 'apps',
          '3': 'apis',
          '4': 'logs',
          '5': 'pipeline',
          '6': 'security',
          '7': 'data',
          '8': 'tokens',
          '9': 'agents',
          '0': 'audio',
        };

        const section = keyToSection[e.key];
        if (section) {
          e.preventDefault();
          setActiveSection(section);
          const sectionData = DEVTOOLS_SECTIONS.find(s => s.id === section);
          if (sectionData) {
            toast(`${sectionData.label}`, {
              description: sectionData.description,
              duration: 1500,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Zustand actions are stable

  return (
    <div className="min-h-screen bg-background grid-bg relative">
      {/* Subtle scanline overlay */}
      <div className="scanlines pointer-events-none fixed inset-0 z-[100] opacity-30" />
      
      {/* Layout */}
      <Sidebar />
      <Header />
      
      {/* Main content area */}
      <main className="ml-16 pt-14 pb-8 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
