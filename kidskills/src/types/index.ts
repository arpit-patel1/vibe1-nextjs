// User Progress Types
export interface CompletedActivity {
  completedAt: number;
  score: number;
  attempts: number;
}

export interface UserProgress {
  completedActivities: string[];
  scores: Record<string, number>;
  streaks: Record<string, number>;
  lastActivity: string | null;
  skillLevels: {
    math: string;
    english: string;
    leadership: string;
    [key: string]: string;
  };
  learningPatterns: LearningPatterns;
  aiRecommendations: AIRecommendations;
}

// Preferences Types
export interface AudioPreferences {
  sfxVolume: number;
  narrationVolume: number;
  musicVolume: number;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

export interface CharacterPreferences {
  selectedCharacter: string;
  customizations: Record<string, string>;
  showCharacter: boolean;
}

export interface Preferences {
  audio: AudioPreferences;
  accessibility: AccessibilityPreferences;
  character: CharacterPreferences;
}

// Activity Types
export type ActivityType = 'multiple-choice' | 'drag-drop' | 'fill-blank' | 'matching' | 'tracing';
export type SubjectType = 'math' | 'english' | 'leadership';
export type DifficultyLevel = 1 | 2 | 3;

export interface ActivityInstruction {
  text: string;
  audio: string;
}

export interface ActivityFeedback {
  correct: string[];
  incorrect: string[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: SubjectType;
  difficulty: DifficultyLevel;
  title: string;
  instructions: ActivityInstruction;
  content: MultipleChoiceContent | DragDropContent | FillBlankContent | MatchingContent | TracingContent;
  feedback: ActivityFeedback;
  hints: string[];
  nextActivities: string[];
}

// Multiple Choice Activity
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceContent {
  question: string;
  options: MultipleChoiceOption[];
}

// Drag and Drop Activity
export interface DragItem {
  id: string;
  text: string;
  correctZoneId: string;
}

export interface DropZone {
  id: string;
  text: string;
}

export interface DragDropContent {
  items: DragItem[];
  zones: DropZone[];
}

// Fill in the Blank Activity
export interface BlankItem {
  id: string;
  correctAnswer: string[];
}

export interface FillBlankContent {
  text: string;
  blanks: BlankItem[];
}

// Matching Activity
export interface MatchItem {
  id: string;
  text: string;
  matchId: string;
}

export interface MatchingContent {
  leftItems: MatchItem[];
  rightItems: MatchItem[];
}

// Tracing Activity
export interface TracingContent {
  imageUrl: string;
  pathData: string;
  tolerance: number;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  criteria: {
    type: 'activity_completion' | 'score_threshold' | 'streak';
    value: number;
    activityIds?: string[];
    subject?: SubjectType;
  };
}

// Learning Patterns Types
export interface LearningPatterns {
  preferredSubjects: string[];
  challengeAreas: string[];
  strengths: string[];
  averageResponseTime: number;
  mistakePatterns: Record<string, string[]>;
  sessionDurations: number[];
}

// AI Recommendations Types
export interface AIRecommendations {
  nextActivities: string[];
  focusAreas: string[];
  personalizedTips: string[];
  difficultyAdjustment: 'simplified' | 'standard' | 'advanced';
  lastUpdated: string | null;
}

// AI Question Generation Types
export interface AIQuestionParams {
  subject: string;
  difficulty: string;
  questionType: string;
  previousPerformance?: number;
  learningStyle?: string;
  interests?: string[];
}

export interface AIGeneratedQuestion {
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  difficulty: string;
  tags: string[];
} 