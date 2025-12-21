import { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore } from '../stores/settingsStore';

export function BlockSignupsToggle() {
  const { settings, updateSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Fetch current status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'signups_blocked')
          .single();
        
        if (data) {
          const value = data.setting_value as { blocked?: boolean };
          updateSettings({ blockSignups: value?.blocked ?? false });
        }
      } catch {
        // Setting may not exist yet, that's okay
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [updateSettings]);

  const toggleSignups = async (blocked: boolean) => {
    setIsSyncing(true);
    
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          setting_key: 'signups_blocked',
          setting_value: { blocked },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });
      
      if (!error) {
        updateSettings({ blockSignups: blocked });
        toast({
          title: blocked ? '🔒 Signups Blocked' : '🔓 Signups Enabled',
          description: blocked 
            ? 'New user registrations are now blocked' 
            : 'New users can now create accounts',
        });
      } else {
        throw error;
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update signup settings',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <Loader2 className="w-4 h-4 text-signal-amber animate-spin" />
          ) : (
            <Shield className="w-4 h-4 text-signal-amber" />
          )}
          <Label className="text-sm font-medium">Block New Signups</Label>
        </div>
        <Switch
          checked={settings.blockSignups}
          onCheckedChange={toggleSignups}
          disabled={isLoading || isSyncing}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Prevent new users from creating accounts (synced to database)
      </p>
    </div>
  );
}
