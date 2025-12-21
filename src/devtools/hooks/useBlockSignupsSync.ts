// Hook to sync blockSignups setting with Supabase
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore } from '../stores/settingsStore';
import { toast } from 'sonner';

export function useBlockSignupsSync() {
  const { settings, updateSettings } = useSettingsStore();

  // Fetch initial value from Supabase on mount
  useEffect(() => {
    const fetchBlockSignups = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'signups_blocked')
        .maybeSingle();

      if (error) {
        console.error('[DevTools] Failed to fetch blockSignups setting:', error);
        return;
      }

      if (data?.setting_value) {
        const blocked = (data.setting_value as { blocked: boolean }).blocked;
        if (blocked !== settings.blockSignups) {
          updateSettings({ blockSignups: blocked });
        }
      }
    };

    fetchBlockSignups();
  }, []);

  // Sync changes to Supabase when blockSignups changes
  useEffect(() => {
    const syncBlockSignups = async () => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'signups_blocked',
          setting_value: { blocked: settings.blockSignups },
        }, {
          onConflict: 'setting_key',
        });

      if (error) {
        console.error('[DevTools] Failed to sync blockSignups:', error);
        toast.error('Failed to sync signup block setting');
      }
    };

    // Debounce the sync to avoid rapid updates
    const timeoutId = setTimeout(syncBlockSignups, 500);
    return () => clearTimeout(timeoutId);
  }, [settings.blockSignups]);
}
