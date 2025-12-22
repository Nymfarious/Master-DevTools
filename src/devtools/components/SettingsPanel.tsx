// Settings Panel v3.2.0 - DevTools configuration with error interception toggle and state reset
import { Settings, RefreshCw, Eye, Activity, Beaker, Bot, Code, Upload, ChevronDown, Plus, MoreHorizontal, Zap, Palette, Keyboard, Info, ShieldOff, Unplug, Bug, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsStore, type ExpandIconStyle } from '../stores/settingsStore';
import { RoleSwitcher } from './RoleSwitcher';
import { BlockSignupsToggle } from './BlockSignupsToggle';
import { GuestModeToggle } from './GuestModeToggle';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { cn } from '@/lib/utils';

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: 'default' | 'warning' | 'danger';
}

function SettingRow({ icon: Icon, label, description, checked, onCheckedChange, variant = 'default' }: SettingRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between py-3",
      variant === 'warning' && checked && "bg-signal-amber/5 -mx-3 px-3 rounded-lg",
      variant === 'danger' && checked && "bg-signal-red/5 -mx-3 px-3 rounded-lg"
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn(
          "w-4 h-4 mt-0.5",
          variant === 'warning' && checked ? "text-signal-amber" : 
          variant === 'danger' && checked ? "text-signal-red" : "text-muted-foreground"
        )} />
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className={cn(
            "text-xs",
            variant === 'warning' && checked ? "text-signal-amber" :
            variant === 'danger' && checked ? "text-signal-red" : "text-muted-foreground"
          )}>{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const expandIconOptions: { value: ExpandIconStyle; label: string; icon: React.ElementType }[] = [
  { value: 'chevron', label: 'Chevron', icon: ChevronDown },
  { value: 'plusminus', label: 'Plus/Minus', icon: Plus },
  { value: 'dots', label: 'Dots', icon: MoreHorizontal },
];

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            DevTools configuration
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSettings}>
          <RefreshCw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-4 pr-4">
          
          {/* Role Section */}
          <section className="terminal-glass p-4 rounded-lg border-l-2 border-signal-green">
            <h3 className="font-mono font-semibold text-foreground mb-3">Current Role</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Simulate different user roles
              </p>
              <RoleSwitcher />
            </div>
          </section>

          {/* Connection Control - NEW in v3.0.0 */}
          <CollapsibleSection title="Connection Control" icon={Unplug} defaultOpen>
            <div className="space-y-3">
              <SettingRow
                icon={Unplug}
                label="Suspend All Connections"
                description="Stops all API calls, health checks, and polling"
                checked={settings.suspendConnections || false}
                onCheckedChange={(checked) => updateSettings({ suspendConnections: checked })}
                variant="warning"
              />
              
              <SettingRow
                icon={ShieldOff}
                label="Auth Bypass Mode"
                description="⚠️ DANGER: Skips all authentication checks"
                checked={settings.authBypass || false}
                onCheckedChange={(checked) => updateSettings({ authBypass: checked })}
                variant="danger"
              />
              
              {settings.authBypass && (
                <div className="p-3 rounded-lg bg-signal-red/10 border border-signal-red/30">
                  <p className="text-xs text-signal-red font-mono">
                    ⚠️ Auth bypass is enabled. Do NOT use in production!
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Appearance */}
          <CollapsibleSection title="Appearance" icon={Palette} defaultOpen>
            <div className="space-y-3">
              <SettingRow
                icon={Eye}
                label="Master Visibility"
                description="Show DevTools button in all views"
                checked={settings.masterVisibility}
                onCheckedChange={(checked) => updateSettings({ masterVisibility: checked })}
              />
              
              <SettingRow
                icon={Settings}
                label="Compact Mode"
                description="Reduce panel sizes and spacing"
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
              />

              {/* Expand Icon Style */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-start gap-3">
                  <ChevronDown className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Expand Icon Style</p>
                    <p className="text-xs text-muted-foreground">Choose collapse indicator</p>
                  </div>
                </div>
                <Select
                  value={settings.expandIconStyle}
                  onValueChange={(value: ExpandIconStyle) => updateSettings({ expandIconStyle: value })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expandIconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="w-3 h-3" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Resource Mode */}
          <CollapsibleSection title="Resource Mode" icon={Zap} defaultOpen>
            <div className="space-y-3">
              <SettingRow
                icon={Zap}
                label="Low Resource Mode"
                description="Disables auto-refresh, polling to save quota"
                checked={settings.lowResourceMode}
                onCheckedChange={(checked) => updateSettings({ lowResourceMode: checked })}
              />
              <SettingRow
                icon={Activity}
                label="FPS Monitoring"
                description="Enable real-time FPS tracking"
                checked={settings.fpsMonitoringEnabled}
                onCheckedChange={(checked) => updateSettings({ fpsMonitoringEnabled: checked })}
              />
              <SettingRow
                icon={Bug}
                label="Error Interception"
                description="Capture console.error/warn to DevTools logs"
                checked={settings.errorInterceptionEnabled}
                onCheckedChange={(checked) => updateSettings({ errorInterceptionEnabled: checked })}
              />
              {!settings.errorInterceptionEnabled && (
                <div className="p-3 rounded-lg bg-signal-amber/10 border border-signal-amber/30">
                  <p className="text-xs text-signal-amber font-mono">
                    ⚠️ Error interception disabled. Console errors won't appear in Logs panel.
                  </p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Developer Options */}
          <CollapsibleSection title="Developer Options" icon={Code} defaultOpen>
            <div className="space-y-3">
              <GuestModeToggle />
              <BlockSignupsToggle />
              
              <SettingRow
                icon={Code}
                label="Mock API Responses"
                description="Return fake data instead of real API calls"
                checked={settings.mockApiResponses}
                onCheckedChange={(checked) => updateSettings({ mockApiResponses: checked })}
              />
              
              <SettingRow
                icon={Code}
                label="Verbose Logging"
                description="Log all events to console"
                checked={settings.verboseLogging}
                onCheckedChange={(checked) => updateSettings({ verboseLogging: checked })}
              />

              <SettingRow
                icon={Upload}
                label="Guest Upload Override"
                description="Allow uploads without authentication"
                checked={settings.guestUploadOverride}
                onCheckedChange={(checked) => updateSettings({ guestUploadOverride: checked })}
              />
            </div>
          </CollapsibleSection>

          {/* Features */}
          <CollapsibleSection title="Features" icon={Activity}>
            <div className="space-y-3">
              <SettingRow
                icon={Activity}
                label="Health Checks"
                description="Enable API health monitoring"
                checked={settings.enableHealthChecks}
                onCheckedChange={(checked) => updateSettings({ enableHealthChecks: checked })}
              />
              
              <SettingRow
                icon={Activity}
                label="Pipeline Monitor"
                description="Track pipeline events"
                checked={settings.enablePipelineMonitor}
                onCheckedChange={(checked) => updateSettings({ enablePipelineMonitor: checked })}
              />
              
              <SettingRow
                icon={Bot}
                label="Agent Console"
                description="Enable AI agent debugging"
                checked={settings.enableAgentConsole}
                onCheckedChange={(checked) => updateSettings({ enableAgentConsole: checked })}
              />
              
              <SettingRow
                icon={Beaker}
                label="Test Lab"
                description="Enable test runner panel"
                checked={settings.enableTestLab}
                onCheckedChange={(checked) => updateSettings({ enableTestLab: checked })}
              />
            </div>
          </CollapsibleSection>

          {/* Keyboard Shortcuts */}
          <CollapsibleSection title="Keyboard Shortcuts" icon={Keyboard}>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open DevTools</span>
                <kbd className="px-2 py-1 rounded bg-secondary border border-border font-mono">⌘ + D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quick Search</span>
                <kbd className="px-2 py-1 rounded bg-secondary border border-border font-mono">⌘ + K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Navigate Sections</span>
                <kbd className="px-2 py-1 rounded bg-secondary border border-border font-mono">⌘ + 1-9</kbd>
              </div>
            </div>
          </CollapsibleSection>

          {/* About */}
          <CollapsibleSection title="About" icon={Info}>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-signal-green font-mono">3.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-mono">Dec 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project</span>
                <span>Master DevTools</span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Reset Buttons */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full border-signal-red/50 text-signal-red hover:bg-signal-red/10"
              onClick={resetSettings}
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Reset All Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => {
                // All persisted devtools store keys
                const devtoolsKeys = [
                  'devtools-settings',
                  'devtools-state',
                  'devtools-app-state',
                  'master-devtools-errors',
                  'master-devtools-build-status',
                ];
                devtoolsKeys.forEach(key => localStorage.removeItem(key));
                toast.success('DevTools state cleared', {
                  description: 'Reloading page to apply changes...',
                });
                setTimeout(() => window.location.reload(), 500);
              }}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Clear Persisted DevTools State
            </Button>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
