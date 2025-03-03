'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Activity } from '@/types';

// Activity context type
interface ActivityContextType {
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
  setCurrentActivity: (activity: Activity | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create context
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Provider component
export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        isLoading,
        error,
        setCurrentActivity,
        setIsLoading,
        setError,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook to use the activity context
export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}; 