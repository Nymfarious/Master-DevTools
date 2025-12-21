import { UserCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '../stores/settingsStore';

export function GuestModeToggle() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-signal-blue" />
          <Label className="text-sm font-medium">Guest Mode</Label>
        </div>
        <Switch
          checked={settings.guestModeEnabled}
          onCheckedChange={(checked) => updateSettings({ guestModeEnabled: checked })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Allow guests to test features without authentication
      </p>
      {settings.guestModeEnabled && (
        <Badge className="bg-signal-blue/20 text-signal-blue text-xs border-signal-blue/30">
          Active - Auth bypassed
        </Badge>
      )}
    </div>
  );
}
