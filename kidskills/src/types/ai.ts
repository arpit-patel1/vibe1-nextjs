export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  tokensPerMinute: number;
  costPer1KTokens: number;
  isDefault?: boolean;
  provider: 'openrouter';
  baseUrl?: string;
}

export interface AIProvider {
  id: 'openrouter';
  name: string;
  description: string;
  baseUrl: string;
  isDefault?: boolean;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access to multiple AI models through a single API',
    baseUrl: 'https://openrouter.ai/api/v1',
    isDefault: true
  }
];

export const AVAILABLE_MODELS: AIModelConfig[] = [
  // Default OpenRouter models
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and economical model from OpenAI',
    tokensPerMinute: 180000,
    costPer1KTokens: 0.05,
    isDefault: true,
    provider: 'openrouter'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and efficient model from Anthropic',
    tokensPerMinute: 150000,
    costPer1KTokens: 0.25,
    provider: 'openrouter'
  },
  {
    id: 'meta-llama/llama-3-8b-instruct',
    name: 'Llama 3 8B',
    description: 'Open source model from Meta',
    tokensPerMinute: 120000,
    costPer1KTokens: 0.10,
    provider: 'openrouter'
  }
];

// Function to get models by provider
export function getModelsByProvider(providerId: 'openrouter'): AIModelConfig[] {
  return AVAILABLE_MODELS.filter(model => model.provider === providerId);
}

// Function to get default model for a provider
export function getDefaultModelForProvider(providerId: 'openrouter'): AIModelConfig {
  const providerModels = getModelsByProvider(providerId);
  const defaultModel = providerModels.find(model => model.isDefault);
  return defaultModel || providerModels[0];
}

// Function to get provider by ID
export function getProviderById(providerId: 'openrouter'): AIProvider | undefined {
  return AI_PROVIDERS.find(provider => provider.id === providerId);
}

export interface AIQuestionParams {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'standard' | 'challenging' | 'advanced';
  questionType: string;
  gradeLevel?: number;
  previousPerformance?: string | number;
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  interests?: string[];
  additionalParams?: Record<string, any>;
}

export interface AIGeneratedQuestion {
  question: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer?: string | number;
  explanation?: string;
  hint?: string;
  difficulty?: string;
  readingPassage?: string;
  tags?: string[];
}

export interface AIRecommendations {
  strengths: string[];
  improvementAreas: string[];
  recommendedActivities: string[];
  learningTip: string;
  difficultyAdjustment: 'easier' | 'same' | 'harder';
}

export interface LearningPatterns {
  preferredSubjects: string[];
  preferredQuestionTypes: string[];
  averageTimePerQuestion: number;
  mistakePatterns: Record<string, number>;
  improvementRate: number;
} 