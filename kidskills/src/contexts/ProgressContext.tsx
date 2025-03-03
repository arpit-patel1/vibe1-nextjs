'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ActivityProgress {
  completed: boolean;
  score: number;
  lastAttempt?: string; // ISO date string
}

interface ProgressContextType {
  progress: Record<string, ActivityProgress>;
  getActivityProgress: (activityId: string) => ActivityProgress | undefined;
  updateActivityProgress: (activityId: string, progress: Partial<ActivityProgress>) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, ActivityProgress>>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('kidskills_progress');
      if (savedProgress) {
        try {
          setProgress(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Failed to parse saved progress:', error);
        }
      }
    }
  }, []);

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(progress).length > 0) {
      localStorage.setItem('kidskills_progress', JSON.stringify(progress));
    }
  }, [progress]);

  // Get progress for a specific activity
  const getActivityProgress = (activityId: string): ActivityProgress | undefined => {
    return progress[activityId];
  };

  // Update progress for a specific activity
  const updateActivityProgress = (activityId: string, newProgress: Partial<ActivityProgress>) => {
    setProgress(prev => {
      const current = prev[activityId] || { completed: false, score: 0 };
      return {
        ...prev,
        [activityId]: {
          ...current,
          ...newProgress,
          lastAttempt: new Date().toISOString()
        }
      };
    });
  };

  // Reset all progress
  const resetProgress = () => {
    setProgress({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kidskills_progress');
    }
  };

  return (
    <ProgressContext.Provider value={{ 
      progress, 
      getActivityProgress, 
      updateActivityProgress, 
      resetProgress 
    }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 