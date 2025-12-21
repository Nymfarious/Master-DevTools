// Demo Log Generator - Buttons to trigger test logs
// Lines: ~55 | Status: GREEN
import { Plus, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogsStore } from '@/stores/logsStore';

export function DemoLogGenerator() {
  const { addLog } = useLogsStore();

  const generateError = () => {
    addLog('error', 'Failed to fetch from API endpoint /api/health', { 
      endpoint: '/api/health',
      statusCode: 500,
      duration: 1247 
    }, 'api-client');
  };

  const generateWarning = () => {
    addLog('warn', `Response time exceeded threshold (${Math.floor(400 + Math.random() * 300)}ms)`, {
      threshold: 500,
      actual: Math.floor(500 + Math.random() * 300)
    }, 'health-check');
  };

  const generateInfo = () => {
    addLog('info', 'User session started', {
      sessionId: Math.random().toString(36).slice(2, 10)
    }, 'auth-service');
  };

  const generateSuccess = () => {
    addLog('success', 'Database migration completed successfully', {
      migrationsRun: 3,
      duration: '2.3s'
    }, 'database');
  };

  return (
    <section className="space-y-3">
      <h2 className="section-header">
        <Plus className="w-3.5 h-3.5" />
        Demo: Generate Test Logs
      </h2>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateError}
          className="text-signal-red border-signal-red/30 hover:bg-signal-red/10"
        >
          <AlertCircle className="w-3 h-3 mr-1.5" />
          Trigger Error
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateWarning}
          className="text-signal-amber border-signal-amber/30 hover:bg-signal-amber/10"
        >
          <AlertTriangle className="w-3 h-3 mr-1.5" />
          Trigger Warning
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateInfo}
          className="text-signal-blue border-signal-blue/30 hover:bg-signal-blue/10"
        >
          <Info className="w-3 h-3 mr-1.5" />
          Trigger Info
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateSuccess}
          className="text-signal-green border-signal-green/30 hover:bg-signal-green/10"
        >
          <CheckCircle className="w-3 h-3 mr-1.5" />
          Trigger Success
        </Button>
      </div>
    </section>
  );
}
