// Audio Store - Manages audio state for Echoverse apps
// Lines: ~85 | Status: GREEN
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AudioChannel {
  music: number;
  sfx: number;
  narration: number;
  voice: number;
}

interface AudioState {
  // Master
  masterMuted: boolean;
  masterVolume: number;
  
  // Channels
  channels: AudioChannel;
  
  // Audio Context info
  contextState: 'suspended' | 'running' | 'closed';
  sampleRate: number;
  baseLatency: number;
  outputLatency: number;
  
  // Actions
  setMasterMuted: (muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setChannelVolume: (channel: keyof AudioChannel, volume: number) => void;
  setContextState: (state: 'suspended' | 'running' | 'closed') => void;
  setAudioContextInfo: (info: { sampleRate: number; baseLatency: number; outputLatency: number }) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      masterMuted: false,
      masterVolume: 80,
      
      channels: {
        music: 70,
        sfx: 100,
        narration: 90,
        voice: 90,
      },
      
      contextState: 'suspended',
      sampleRate: 48000,
      baseLatency: 0.02,
      outputLatency: 0.04,
      
      setMasterMuted: (muted) => set({ masterMuted: muted }),
      setMasterVolume: (volume) => set({ masterVolume: volume }),
      setChannelVolume: (channel, volume) => set((state) => ({
        channels: { ...state.channels, [channel]: volume }
      })),
      setContextState: (contextState) => set({ contextState }),
      setAudioContextInfo: (info) => set(info),
    }),
    {
      name: 'devtools-audio',
    }
  )
);

// Audio utility functions
export function playTestTone(frequency = 440, duration = 0.5) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  const { masterVolume, masterMuted } = useAudioStore.getState();
  gainNode.gain.value = masterMuted ? 0 : (masterVolume / 100) * 0.3;
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  
  // Update context info
  useAudioStore.getState().setAudioContextInfo({
    sampleRate: audioContext.sampleRate,
    baseLatency: audioContext.baseLatency || 0.02,
    outputLatency: (audioContext as any).outputLatency || 0.04,
  });
  useAudioStore.getState().setContextState('running');
  
  return audioContext;
}

export const voiceOptions = [
  { id: 'ekko', name: 'Ekko', provider: 'ElevenLabs', description: 'Warm, friendly narrator' },
  { id: 'aria', name: 'Aria', provider: 'ElevenLabs', description: 'Clear, professional' },
  { id: 'en-US-Neural2-A', name: 'Neural2-A', provider: 'Google TTS', description: 'Male, natural' },
  { id: 'en-US-Neural2-C', name: 'Neural2-C', provider: 'Google TTS', description: 'Female, natural' },
  { id: 'en-US-Wavenet-D', name: 'Wavenet-D', provider: 'Google TTS', description: 'Male, expressive' },
];
