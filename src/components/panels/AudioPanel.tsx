// Audio Panel - Sound system controls for Echoverse apps
// Lines: ~280 | Status: GREEN
import { useState, useEffect } from 'react';
import { 
  Volume2, VolumeX, Music, Bell, Mic, Speech, 
  Play, Square, RefreshCw, Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAudioStore, playTestTone, voiceOptions, type AudioChannel } from '@/stores/audioStore';
import { useLogsStore } from '@/stores/logsStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChannelConfig {
  key: keyof AudioChannel;
  label: string;
  icon: typeof Music;
}

const CHANNELS: ChannelConfig[] = [
  { key: 'music', label: 'Music', icon: Music },
  { key: 'sfx', label: 'SFX', icon: Bell },
  { key: 'narration', label: 'Narration', icon: Mic },
  { key: 'voice', label: 'Voice (TTS)', icon: Speech },
];

export function AudioPanel() {
  const {
    masterMuted,
    masterVolume,
    channels,
    contextState,
    sampleRate,
    baseLatency,
    outputLatency,
    setMasterMuted,
    setMasterVolume,
    setChannelVolume,
    setContextState,
  } = useAudioStore();
  
  const { addLog } = useLogsStore();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(voiceOptions[0].id);
  const [ttsText, setTtsText] = useState('The quick brown fox jumps over the lazy dog.');
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio context on first user interaction
  const initAudioContext = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      setContextState(ctx.state as any);
      addLog('info', 'Audio context initialized', undefined, 'audio-panel');
    }
  };

  const handleTestTone = () => {
    initAudioContext();
    playTestTone(440, 0.5);
    addLog('info', 'Test tone played: 440Hz for 0.5s', undefined, 'audio-panel');
    toast.success('Test tone played');
  };

  const handleTestSFX = () => {
    initAudioContext();
    // Play a quick beep sequence
    playTestTone(880, 0.1);
    setTimeout(() => playTestTone(660, 0.1), 150);
    setTimeout(() => playTestTone(440, 0.2), 300);
    addLog('info', 'SFX sequence played', undefined, 'audio-panel');
    toast.success('SFX test played');
  };

  const handleTestTTS = () => {
    initAudioContext();
    const voice = voiceOptions.find(v => v.id === selectedVoice);
    addLog('info', `TTS preview requested: ${voice?.name} (${voice?.provider})`, undefined, 'audio-panel');
    toast.info('TTS Preview', { 
      description: `Would generate speech using ${voice?.name}. API not configured.` 
    });
  };

  const handleStopAll = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setContextState('closed');
      addLog('info', 'All audio stopped', undefined, 'audio-panel');
      toast.success('Audio stopped');
    }
  };

  const handleSuspend = () => {
    if (audioContext && contextState === 'running') {
      audioContext.suspend();
      setContextState('suspended');
      addLog('info', 'Audio context suspended', undefined, 'audio-panel');
    }
  };

  const handleResume = () => {
    if (audioContext && contextState === 'suspended') {
      audioContext.resume();
      setContextState('running');
      addLog('info', 'Audio context resumed', undefined, 'audio-panel');
    }
  };

  const toggleMute = () => {
    setMasterMuted(!masterMuted);
    addLog('info', masterMuted ? 'Audio unmuted' : 'Audio muted', undefined, 'audio-panel');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-signal-cyan" />
          Audio Controls
        </h1>
        <p className="text-sm text-muted-foreground">
          Sound system settings for Echoverse apps
        </p>
      </div>

      {/* Master Volume */}
      <section className="terminal-glass p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant={masterMuted ? "destructive" : "outline"}
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {masterMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <span className="font-mono font-semibold text-foreground">MASTER</span>
          </div>
          <span className="font-mono text-sm text-muted-foreground">{masterVolume}%</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Slider
            value={[masterVolume]}
            onValueChange={([v]) => setMasterVolume(v)}
            max={100}
            step={1}
            disabled={masterMuted}
            className={cn("flex-1", masterMuted && "opacity-50")}
          />
        </div>
      </section>

      {/* Channel Mixer */}
      <section className="terminal-glass p-4 rounded-lg space-y-4">
        <h3 className="font-mono font-semibold text-foreground">CHANNEL MIXER</h3>
        
        <div className="space-y-4">
          {CHANNELS.map(channel => {
            const Icon = channel.icon;
            const value = channels[channel.key];
            
            return (
              <div key={channel.key} className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="w-24 text-sm text-foreground">{channel.label}</span>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => setChannelVolume(channel.key, v)}
                  max={100}
                  step={1}
                  disabled={masterMuted}
                  className={cn("flex-1", masterMuted && "opacity-50")}
                />
                <span className="w-12 text-right text-sm font-mono text-muted-foreground">
                  {value}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Audio Context */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <h3 className="font-mono font-semibold text-foreground">AUDIO CONTEXT</h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                contextState === 'running' && "bg-signal-green",
                contextState === 'suspended' && "bg-signal-amber",
                contextState === 'closed' && "bg-signal-red"
              )} />
              <span className="font-mono text-foreground capitalize">{contextState}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sample Rate:</span>
            <span className="font-mono text-foreground">{sampleRate} Hz</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Base Latency:</span>
            <span className="font-mono text-foreground">{baseLatency.toFixed(3)}s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Output Latency:</span>
            <span className="font-mono text-foreground">{outputLatency.toFixed(3)}s</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSuspend}
            disabled={contextState !== 'running'}
            className="flex-1"
          >
            <Pause className="w-3 h-3 mr-1" /> Suspend
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResume}
            disabled={contextState !== 'suspended'}
            className="flex-1"
          >
            <Play className="w-3 h-3 mr-1" /> Resume
          </Button>
        </div>
      </section>

      {/* Test Audio */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <h3 className="font-mono font-semibold text-foreground">TEST AUDIO</h3>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleTestTone} className="flex-1">
            <Play className="w-3 h-3 mr-1" /> Test Tone
          </Button>
          <Button variant="outline" size="sm" onClick={handleTestSFX} className="flex-1">
            <Bell className="w-3 h-3 mr-1" /> Test SFX
          </Button>
          <Button variant="destructive" size="sm" onClick={handleStopAll} className="flex-1">
            <Square className="w-3 h-3 mr-1" /> Stop All
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Test Tone: 440 Hz (A4) sine wave • Duration: 0.5 seconds
        </p>
      </section>

      {/* TTS Preview */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <h3 className="font-mono font-semibold text-foreground">TTS PREVIEW</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Voice:</span>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="flex-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text to preview..."
            className="resize-none h-20 text-sm"
          />
          
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleTestTTS}>
              <Speech className="w-3 h-3 mr-1" /> Generate Preview
            </Button>
            <span className="text-xs text-muted-foreground">~2-3 seconds</span>
          </div>
        </div>
      </section>
    </div>
  );
}
