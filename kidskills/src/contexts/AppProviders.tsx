'use client';

import { ReactNode } from 'react';
import { UserProgressProvider } from './UserProgressContext';
import { PreferencesProvider } from './PreferencesContext';
import { AudioProvider } from './AudioContext';
import { ActivityProvider } from './ActivityContext';
import { AIProvider } from './AIContext';
import { ProgressProvider } from './ProgressContext';
import { CharacterProvider } from './CharacterContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <PreferencesProvider>
      <UserProgressProvider>
        <AudioProvider>
          <ActivityProvider>
            <AIProvider>
              <ProgressProvider>
                <CharacterProvider>
                  {children}
                </CharacterProvider>
              </ProgressProvider>
            </AIProvider>
          </ActivityProvider>
        </AudioProvider>
      </UserProgressProvider>
    </PreferencesProvider>
  );
}; 