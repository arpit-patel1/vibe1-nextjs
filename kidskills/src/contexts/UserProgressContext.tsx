'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProgress } from '@/types';

// Default user progress state
const defaultUserProgress: UserProgress = {
  completedActivities: [],
  scores: {},
  streaks: {},
  lastActivity: null,
  skillLevels: {
    math: 'beginner',
    english: 'beginner',
    leadership: 'beginner',
  },
  // Add learning patterns data
  learningPatterns: {
    preferredSubjects: [],
    challengeAreas: [],
    strengths: [],
    averageResponseTime: 0,
    mistakePatterns: {},
    sessionDurations: [],
  },
  // Add AI recommendations
  aiRecommendations: {
    nextActivities: [],
    focusAreas: [],
    personalizedTips: [],
    difficultyAdjustment: 'standard',
    lastUpdated: null,
  }
};

// Create context
const UserProgressContext = createContext<{
  userProgress: UserProgress;
  updateProgress: (activityId: string, score: number, wasSuccessful: boolean, responseTime: number, mistakes: string[]) => void;
  generateAIRecommendations: () => Promise<void>;
  getUserInterests: () => string[];
  getGradeLevel: () => number;
} | undefined>(undefined);

// Provider component
export function UserProgressProvider({ children }: { children: ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProgress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved progress', e);
        }
      }
    }
    return defaultUserProgress;
  });

  // Save to localStorage when progress changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }
  }, [userProgress]);

  // Update progress after completing an activity
  const updateProgress = (
    activityId: string, 
    score: number, 
    wasSuccessful: boolean,
    responseTime: number,
    mistakes?: string[]
  ) => {
    setUserProgress(prev => {
      // Create a deep copy to avoid mutation
      const updated = JSON.parse(JSON.stringify(prev)) as UserProgress;
      
      // Update completed activities if successful
      if (wasSuccessful && !updated.completedActivities.includes(activityId)) {
        updated.completedActivities.push(activityId);
      }
      
      // Update scores
      updated.scores[activityId] = Math.max(score, updated.scores[activityId] || 0);
      
      // Update last activity
      updated.lastActivity = activityId;
      
      // Update learning patterns
      const subject = typeof activityId === 'string' ? activityId.split('-')[0] : activityId;
      
      // Track response time
      const prevResponseTimes = updated.learningPatterns.averageResponseTime || 0;
      const responseCount = updated.completedActivities.length || 1;
      updated.learningPatterns.averageResponseTime = 
        (prevResponseTimes * (responseCount - 1) + responseTime) / responseCount;
      
      // Track mistake patterns
      if (!updated.learningPatterns.mistakePatterns[subject]) {
        updated.learningPatterns.mistakePatterns[subject] = [];
      }
      
      // Ensure mistakes is an array before spreading
      if (Array.isArray(mistakes)) {
        updated.learningPatterns.mistakePatterns[subject].push(...mistakes);
      } else if (mistakes) {
        // If mistakes is defined but not an array, push it as a single item
        updated.learningPatterns.mistakePatterns[subject].push(mistakes.toString());
      }
      
      // Identify strengths and challenges based on scores
      updateStrengthsAndChallenges(updated);
      
      return updated;
    });
  };

  // Helper function to update strengths and challenges
  const updateStrengthsAndChallenges = (progress: UserProgress) => {
    const subjectScores: Record<string, { total: number, count: number }> = {};
    
    // Calculate average scores by subject
    Object.entries(progress.scores).forEach(([activityId, score]) => {
      const subject = typeof activityId === 'string' ? activityId.split('-')[0] : activityId;
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0 };
      }
      subjectScores[subject].total += score;
      subjectScores[subject].count += 1;
    });
    
    // Determine strengths and challenges
    progress.learningPatterns.strengths = [];
    progress.learningPatterns.challengeAreas = [];
    
    Object.entries(subjectScores).forEach(([subject, { total, count }]) => {
      const average = total / count;
      if (average >= 80) {
        progress.learningPatterns.strengths.push(subject);
      } else if (average <= 60) {
        progress.learningPatterns.challengeAreas.push(subject);
      }
    });
    
    // Update preferred subjects based on activity frequency
    const subjectFrequency: Record<string, number> = {};
    progress.completedActivities.forEach(activityId => {
      const subject = typeof activityId === 'string' ? activityId.split('-')[0] : activityId;
      subjectFrequency[subject] = (subjectFrequency[subject] || 0) + 1;
    });
    
    progress.learningPatterns.preferredSubjects = Object.entries(subjectFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([subject]) => subject);
  };

  // Generate AI recommendations based on user progress
  const generateAIRecommendations = async () => {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate AI recommendations with logic
      
      setUserProgress(prev => {
        const updated = { ...prev };
        
        // Identify next activities based on learning patterns
        const nextActivities: string[] = [];
        
        // Recommend activities in challenge areas first
        if (updated.learningPatterns.challengeAreas.length > 0) {
          updated.learningPatterns.challengeAreas.forEach(subject => {
            // Find the next uncompleted activity in this subject
            for (let i = 1; i <= 5; i++) {
              const activityId = `${subject}-${i}`;
              if (!updated.completedActivities.includes(activityId)) {
                nextActivities.push(activityId);
                break;
              }
            }
          });
        }
        
        // Then add some activities from strength areas for confidence
        if (updated.learningPatterns.strengths.length > 0) {
          updated.learningPatterns.strengths.forEach(subject => {
            // Find a slightly more advanced activity in this subject
            for (let i = 2; i <= 5; i++) {
              const activityId = `${subject}-${i}`;
              if (!updated.completedActivities.includes(activityId) && 
                  !nextActivities.includes(activityId)) {
                nextActivities.push(activityId);
                break;
              }
            }
          });
        }
        
        // If we don't have enough recommendations yet, add some from preferred subjects
        if (nextActivities.length < 3 && updated.learningPatterns.preferredSubjects.length > 0) {
          updated.learningPatterns.preferredSubjects.forEach(subject => {
            for (let i = 1; i <= 5; i++) {
              const activityId = `${subject}-${i}`;
              if (!updated.completedActivities.includes(activityId) && 
                  !nextActivities.includes(activityId)) {
                nextActivities.push(activityId);
                if (nextActivities.length >= 3) break;
              }
            }
          });
        }
        
        // Determine focus areas based on mistake patterns
        const focusAreas: string[] = [];
        Object.entries(updated.learningPatterns.mistakePatterns).forEach(([subject, mistakes]) => {
          if (mistakes.length > 5) {
            focusAreas.push(subject);
          }
        });
        
        // Add specific skill focus areas based on mistake patterns
        if (updated.learningPatterns.mistakePatterns.math?.some(m => m.includes('multiplication'))) {
          focusAreas.push('multiplication');
        }
        
        if (updated.learningPatterns.mistakePatterns.math?.some(m => m.includes('division'))) {
          focusAreas.push('division');
        }
        
        if (updated.learningPatterns.mistakePatterns.english?.some(m => m.includes('vocabulary'))) {
          focusAreas.push('vocabulary');
        }
        
        // Generate personalized tips
        const personalizedTips: string[] = [];
        
        if (updated.learningPatterns.averageResponseTime > 10) {
          personalizedTips.push("Try to take your time with each question. It's not a race!");
        } else if (updated.learningPatterns.averageResponseTime < 3) {
          personalizedTips.push("You're answering quickly! Make sure to read each question carefully.");
        }
        
        if (focusAreas.includes('math')) {
          personalizedTips.push("Practice visualizing math problems with drawings or objects.");
        }
        
        if (focusAreas.includes('multiplication')) {
          personalizedTips.push("Try creating a multiplication table to help memorize common products.");
        }
        
        if (focusAreas.includes('division')) {
          personalizedTips.push("Remember that division is the inverse of multiplication. Use that to check your work!");
        }
        
        if (focusAreas.includes('english')) {
          personalizedTips.push("Try reading the questions out loud to better understand them.");
        }
        
        if (focusAreas.includes('vocabulary')) {
          personalizedTips.push("Create flashcards for new words you encounter to build your vocabulary.");
        }
        
        if (focusAreas.includes('leadership')) {
          personalizedTips.push("Think about how you would feel in different situations to develop empathy.");
        }
        
        // Adjust difficulty based on performance
        let difficultyAdjustment = 'standard';
        const averageScore = Object.values(updated.scores).reduce((sum, score) => sum + score, 0) / 
                            Object.values(updated.scores).length || 0;
        
        if (averageScore > 85) {
          difficultyAdjustment = 'advanced';
          personalizedTips.push("You're doing great! We'll give you more challenging questions to keep you engaged.");
        } else if (averageScore < 60) {
          difficultyAdjustment = 'simplified';
          personalizedTips.push("We'll provide some simpler questions to help build your confidence.");
        }
        
        // Update skill levels based on performance
        Object.keys(updated.skillLevels).forEach(subject => {
          const subjectActivities = Object.entries(updated.scores)
            .filter(([id]) => typeof id === 'string' && id.startsWith(subject))
            .map(([, score]) => score);
          
          if (subjectActivities.length > 0) {
            const avgSubjectScore = subjectActivities.reduce((sum, score) => sum + score, 0) / subjectActivities.length;
            
            if (avgSubjectScore >= 85 && updated.completedActivities.filter(id => typeof id === 'string' && id.startsWith(subject)).length >= 3) {
              updated.skillLevels[subject] = 'advanced';
            } else if (avgSubjectScore >= 70 && updated.completedActivities.filter(id => typeof id === 'string' && id.startsWith(subject)).length >= 2) {
              updated.skillLevels[subject] = 'intermediate';
            }
          }
        });
        
        // Update AI recommendations
        updated.aiRecommendations = {
          nextActivities: nextActivities.slice(0, 3), // Top 3 recommendations
          focusAreas,
          personalizedTips,
          difficultyAdjustment,
          lastUpdated: new Date().toISOString(),
        };
        
        return updated;
      });
    } catch (error) {
      console.error('Failed to generate AI recommendations', error);
    }
  };

  return (
    <UserProgressContext.Provider value={{ 
      userProgress, 
      updateProgress, 
      generateAIRecommendations,
      getUserInterests: () => ['animals', 'space', 'dinosaurs', 'robots', 'superheroes'],
      getGradeLevel: () => 3
    }}>
      {children}
    </UserProgressContext.Provider>
  );
}

// Custom hook to use the context
export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
} 