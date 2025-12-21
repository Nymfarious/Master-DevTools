import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO STATE
// ═══════════════════════════════════════════════════════════════════════════

interface AudioState {
  muted: boolean;
  volumes: {
    master: number;
    music: number;
    sfx: number;
    narration: number;
  };
  
  /** Actions */
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setVolume: (channel: keyof AudioState['volumes'], value: number) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      muted: false,
      volumes: {
        master: 80,
        music: 70,
        sfx: 100,
        narration: 90,
      },

      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((state) => ({ muted: !state.muted })),
      setVolume: (channel, value) => set((state) => ({
        volumes: { ...state.volumes, [channel]: Math.max(0, Math.min(100, value)) },
      })),
    }),
    {
      name: 'devtools-audio',
    }
  )
);

/**
 * Play a test tone
 * Useful for testing audio output
 */
export function playTestTone(frequency = 440, duration = 0.2): void {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn('Could not play test tone:', e);
  }
}
