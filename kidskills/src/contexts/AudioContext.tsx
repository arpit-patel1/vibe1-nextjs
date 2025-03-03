'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { Howl } from 'howler';
import { usePreferences } from './PreferencesContext';

// Audio types
type SoundType = 'sfx' | 'narration' | 'music';
type SoundId = string;

// Audio context type
interface AudioContextType {
  playSound: (soundId: SoundId, type: SoundType) => void;
  stopSound: (soundId: SoundId) => void;
  pauseSound: (soundId: SoundId) => void;
  resumeSound: (soundId: SoundId) => void;
  stopAllSounds: () => void;
}

// Create context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Sound cache to prevent reloading sounds
const soundCache: Record<string, Howl> = {};

// Provider component
export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const { preferences } = usePreferences();

  // Update volume levels when preferences change
  useEffect(() => {
    Object.keys(soundCache).forEach((key) => {
      const [_soundId, type] = key.split('|');
      const sound = soundCache[key];
      
      if (type === 'sfx') {
        sound.volume(preferences.audio.sfxVolume);
      } else if (type === 'narration') {
        sound.volume(preferences.audio.narrationVolume);
      } else if (type === 'music') {
        sound.volume(preferences.audio.musicVolume);
      }
    });
  }, [preferences.audio]);

  // Play a sound
  const playSound = (soundId: SoundId, type: SoundType) => {
    try {
      const cacheKey = `${soundId}|${type}`;
      
      // Get volume based on sound type
      let volume = 1.0;
      if (type === 'sfx') {
        volume = preferences.audio.sfxVolume;
      } else if (type === 'narration') {
        volume = preferences.audio.narrationVolume;
      } else if (type === 'music') {
        volume = preferences.audio.musicVolume;
      }
      
      // Check if sound is already loaded
      if (soundCache[cacheKey]) {
        soundCache[cacheKey].volume(volume);
        soundCache[cacheKey].play();
        return;
      }
      
      // Load and play the sound
      const sound = new Howl({
        src: [`/audio/${soundId}`],
        volume,
        html5: true,
        preload: true,
        onend: () => {
          // Clean up one-shot sounds to save memory
          if (type !== 'music') {
            delete soundCache[cacheKey];
          }
        },
        onloaderror: (_id, error) => {
          // Log error but don't throw exception
          console.warn(`Could not load sound ${soundId}. This is expected during development if sound files are not available.`);
          // Remove from cache so we don't keep trying to play it
          delete soundCache[cacheKey];
        },
      });
      
      soundCache[cacheKey] = sound;
      sound.play();
    } catch (error) {
      console.warn(`Error playing sound ${soundId}: ${error}`);
    }
  };
  
  // Stop a sound
  const stopSound = (soundId: SoundId) => {
    Object.keys(soundCache).forEach((key) => {
      if (key.startsWith(`${soundId}|`)) {
        soundCache[key].stop();
      }
    });
  };
  
  // Pause a sound
  const pauseSound = (soundId: SoundId) => {
    Object.keys(soundCache).forEach((key) => {
      if (key.startsWith(`${soundId}|`)) {
        soundCache[key].pause();
      }
    });
  };
  
  // Resume a sound
  const resumeSound = (soundId: SoundId) => {
    Object.keys(soundCache).forEach((key) => {
      if (key.startsWith(`${soundId}|`)) {
        soundCache[key].play();
      }
    });
  };
  
  // Stop all sounds
  const stopAllSounds = () => {
    Object.keys(soundCache).forEach((key) => {
      soundCache[key].stop();
    });
  };
  
  return (
    <AudioContext.Provider
      value={{
        playSound,
        stopSound,
        pauseSound,
        resumeSound,
        stopAllSounds,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Hook to use audio context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 