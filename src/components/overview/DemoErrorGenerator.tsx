// Demo Error Generator v3.2.0 - For testing the error logging system
import { useState } from 'react';
import { Bug, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useErrorStore } from '@/stores/errorStore';
import { ErrorType } from '@/types/error';

const SAMPLE_ERRORS: { type: ErrorType; message: string; details?: string; source: string }[] = [
  { type: 'import', message: 'Failed to parse sprite sheet', details: 'Invalid PNG header at offset 0x00', source: 'SpriteImporter' },
  { type: 'export', message: 'Export buffer overflow', details: 'Exceeded max file size of 10MB', source: 'ExportService' },
  { type: 'network', message: 'API request timed out', details: 'GET /api/assets - timeout after 30s', source: 'AssetFetcher' },
  { type: 'api', message: 'Rate limit exceeded', details: '429 Too Many Requests - retry after 60s', source: 'APIClient' },
  { type: 'processing', message: 'Frame extraction failed', details: 'Unable to decode frame 42/100', source: 'FrameProcessor' },
  { type: 'validation', message: 'Invalid input dimensions', details: 'Width must be between 1 and 4096', source: 'Validator' },
  { type: 'auth', message: 'Session expired', details: 'JWT token expired at 2024-12-22T10:30:00Z', source: 'AuthService' },
];

export function DemoErrorGenerator() {
  const { logError } = useErrorStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRandomError = () => {
    const error = SAMPLE_ERRORS[Math.floor(Math.random() * SAMPLE_ERRORS.length)];
    logError(error.type, error.message, error.details, error.source);
  };

  const generateBurst = async () => {
    setIsGenerating(true);
    for (let i = 0; i < 5; i++) {
      generateRandomError();
      await new Promise(r => setTimeout(r, 200));
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={generateRandomError}
        className="text-xs gap-1.5"
      >
        <Bug className="w-3 h-3" />
        Log Error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={generateBurst}
        disabled={isGenerating}
        className="text-xs gap-1.5"
      >
        <Zap className="w-3 h-3" />
        {isGenerating ? 'Generating...' : 'Burst (5)'}
      </Button>
    </div>
  );
}
