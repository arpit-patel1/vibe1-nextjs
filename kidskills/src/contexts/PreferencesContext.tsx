'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences, AudioPreferences, AccessibilityPreferences, CharacterPreferences } from '@/types';

// Default preferences
const defaultPreferences: Preferences = {
  audio: {
    sfxVolume: 0.7,
    narrationVolume: 1.0,
    musicVolume: 0.5,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
  },
  character: {
    selectedCharacter: 'default',
    customizations: {},
    showCharacter: true,
  },
};

// Context type
interface PreferencesContextType {
  preferences: Preferences;
  updateAudioPreferences: (audio: Partial<AudioPreferences>) => void;
  updateAccessibilityPreferences: (accessibility: Partial<AccessibilityPreferences>) => void;
  updateCharacterPreferences: (character: Partial<CharacterPreferences>) => void;
  resetPreferences: () => void;
}

// Create context
const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Provider component
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('kidskills-preferences');
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Failed to parse preferences:', error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('kidskills-preferences', JSON.stringify(preferences));
    }
  }, [preferences, isLoaded]);

  // Update audio preferences
  const updateAudioPreferences = (audio: Partial<AudioPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        ...audio,
      },
    }));
  };

  // Update accessibility preferences
  const updateAccessibilityPreferences = (accessibility: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        ...accessibility,
      },
    }));
  };

  // Update character preferences
  const updateCharacterPreferences = (character: Partial<CharacterPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      character: {
        ...prev.character,
        ...character,
      },
    }));
  };

  // Reset preferences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateAudioPreferences,
        updateAccessibilityPreferences,
        updateCharacterPreferences,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

// Custom hook to use the preferences context
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}; 