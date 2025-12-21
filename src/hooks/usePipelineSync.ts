// Pipeline Sync Hook - Manual database sync for pipeline events
// Lines: ~50 | Status: GREEN
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePipelineStore, type PipelineEvent } from '@/stores/pipelineStore';

export function usePipelineSync() {
  const { setEvents, setLoading } = usePipelineStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch events from database - MANUAL ONLY
  const fetchEvents = useCallback(async () => {
    setIsSyncing(true);
    setLoading(true);
    
    const { data, error } = await supabase
      .from('pipeline_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      const events: PipelineEvent[] = data.map(row => ({
        id: row.id,
        step: row.step,
        provider: row.provider,
        duration_ms: row.duration_ms,
        success: row.success,
        error: row.error ?? undefined,
        asset_id: row.asset_id ?? undefined,
        metadata: row.metadata as Record<string, unknown> | undefined,
        created_at: new Date(row.created_at),
      }));
      setEvents(events);
    }
    
    setLoading(false);
    setIsSyncing(false);
  }, [setEvents, setLoading]);

  // Save event to database - only called explicitly
  const persistEvent = useCallback(async (event: PipelineEvent) => {
    const { error } = await supabase.from('pipeline_events').insert([{
      step: event.step,
      provider: event.provider,
      duration_ms: event.duration_ms,
      success: event.success,
      error: event.error ?? null,
      asset_id: event.asset_id ?? null,
      metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : null,
    }]);
    
    if (error) {
      console.error('Failed to persist pipeline event:', error);
    }
  }, []);

  // No automatic subscription - fully manual sync
  return { fetchEvents, persistEvent, isSyncing };
}
