// Overview Panel v3.2.0 - Composes all overview sub-components
import { SystemHealthMonitor } from '@/components/overview/SystemHealthMonitor';
import { QuickStatsBar } from '@/components/overview/QuickStatsBar';
import { EchoverseApps } from '@/components/overview/EchoverseApps';
import { LiveActivityFeed } from '@/components/overview/LiveActivityFeed';
import { FileMetricsCard } from '@/components/overview/FileMetricsCard';
import { DemoLogGenerator } from '@/components/overview/DemoLogGenerator';
import { DemoErrorGenerator } from '@/components/overview/DemoErrorGenerator';
import { APIHealthCard } from '@/components/overview/APIHealthCard';

export function OverviewPanel() {
  return (
    <div className="space-y-6 boot-sequence">
      {/* System Health Monitor - 3 services with glowing lights */}
      <SystemHealthMonitor />
      
      {/* Quick Stats Bar - Uptime, API Calls, Errors, Warnings, Pipelines, Build */}
      <QuickStatsBar />
      
      {/* API Health Card - Live endpoint monitoring */}
      <APIHealthCard />
      
      {/* Two-column layout for Apps and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Echoverse Apps Grid */}
        <EchoverseApps />
        
        {/* Live Activity Feed */}
        <LiveActivityFeed />
      </div>
      
      {/* File Metrics Card - Line count monitoring */}
      <FileMetricsCard />
      
      {/* Demo Generators - For testing */}
      <div className="flex flex-wrap items-center gap-4">
        <DemoLogGenerator />
        <DemoErrorGenerator />
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border/30">
        Master DevTools v3.2.0 - Sprite Slicer Edition
      </footer>
    </div>
  );
}
