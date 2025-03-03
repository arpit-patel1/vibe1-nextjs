'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePreferences } from './PreferencesContext';

interface CharacterContextType {
  character: string;
  getCharacterReaction: (isCorrect: boolean) => string | null;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const [character, setCharacter] = useState<string>('buddy');

  // Update character when preferences change
  useEffect(() => {
    if (preferences.character.selectedCharacter) {
      setCharacter(preferences.character.selectedCharacter);
    }
  }, [preferences.character.selectedCharacter]);

  // Get character reaction based on correctness
  const getCharacterReaction = (isCorrect: boolean): string | null => {
    if (!preferences.character.showCharacter) {
      return null;
    }

    if (isCorrect) {
      return 'happy';
    } else {
      return 'thinking';
    }
  };

  return (
    <CharacterContext.Provider value={{ character, getCharacterReaction }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}; 