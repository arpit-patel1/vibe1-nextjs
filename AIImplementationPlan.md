# KidSkills - AI Implementation Plan

## Overview
This document outlines the technical implementation plan for transforming KidSkills into an AI-native educational platform using OpenAI's API. The implementation will focus on using GPT-4o-mini as the default model, with options for users to select other OpenAI models and provide their own API keys.

## Technical Architecture

### API Integration Layer

#### 1. OpenAI Client Setup
```typescript
// src/utils/openai.ts
import { OpenAI } from 'openai';

// Initialize with default API key or user-provided key
export const createOpenAIClient = (apiKey?: string) => {
  return new OpenAI({
    apiKey: apiKey || process.env.NEXT_PUBLIC_DEFAULT_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true // For client-side usage
  });
};
```

#### 2. Model Configuration
```typescript
// src/types/ai.ts
export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  tokensPerMinute: number;
  costPer1KTokens: number;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: AIModelConfig[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Default model - balanced performance and cost',
    tokensPerMinute: 100000,
    costPer1KTokens: 0.15,
    isDefault: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Faster responses, more economical',
    tokensPerMinute: 180000,
    costPer1KTokens: 0.05
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Premium model - highest quality responses',
    tokensPerMinute: 80000,
    costPer1KTokens: 0.5
  }
];
```

### State Management

#### 1. AI Context Provider
```typescript
// src/contexts/AIContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOpenAIClient } from '../utils/openai';
import { AVAILABLE_MODELS, AIModelConfig } from '../types/ai';

interface AIContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  currentModel: AIModelConfig;
  setCurrentModel: (model: AIModelConfig) => void;
  isConnected: boolean;
  estimatedCost: number;
  resetUsage: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<AIModelConfig>(
    AVAILABLE_MODELS.find(model => model.isDefault) || AVAILABLE_MODELS[0]
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tokenUsage, setTokenUsage] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // Load saved API key and model preference from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('kidskills_api_key');
    if (savedKey) setApiKey(savedKey);
    
    const savedModelId = localStorage.getItem('kidskills_model_id');
    if (savedModelId) {
      const model = AVAILABLE_MODELS.find(m => m.id === savedModelId);
      if (model) setCurrentModel(model);
    }
  }, []);

  // Save API key and model preference to localStorage when changed
  useEffect(() => {
    if (apiKey) localStorage.setItem('kidskills_api_key', apiKey);
    localStorage.setItem('kidskills_model_id', currentModel.id);
  }, [apiKey, currentModel]);

  // Test connection when API key changes
  useEffect(() => {
    const testConnection = async () => {
      if (!apiKey) {
        setIsConnected(false);
        return;
      }
      
      try {
        const openai = createOpenAIClient(apiKey);
        const response = await openai.chat.completions.create({
          model: currentModel.id,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        });
        
        setIsConnected(true);
        // Update token usage
        const newTokens = response.usage?.total_tokens || 0;
        setTokenUsage(prev => prev + newTokens);
        updateEstimatedCost(tokenUsage + newTokens);
      } catch (error) {
        console.error('API connection test failed:', error);
        setIsConnected(false);
      }
    };
    
    testConnection();
  }, [apiKey, currentModel]);
  
  const updateEstimatedCost = (tokens: number) => {
    const cost = (tokens / 1000) * currentModel.costPer1KTokens;
    setEstimatedCost(parseFloat(cost.toFixed(4)));
  };
  
  const resetUsage = () => {
    setTokenUsage(0);
    setEstimatedCost(0);
  };

  return (
    <AIContext.Provider value={{
      apiKey,
      setApiKey,
      currentModel,
      setCurrentModel,
      isConnected,
      estimatedCost,
      resetUsage
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
```

#### 2. Integration with Existing Context
```typescript
// src/pages/_app.tsx
import { AIProvider } from '../contexts/AIContext';

function MyApp({ Component, pageProps }) {
  return (
    <AIProvider>
      <UserProgressProvider>
        <AudioProvider>
          <Component {...pageProps} />
        </AudioProvider>
      </UserProgressProvider>
    </AIProvider>
  );
}
```

### AI Service Functions

#### 1. Question Generation
```typescript
// src/utils/aiQuestionGenerator.ts
import { createOpenAIClient } from './openai';
import { AIQuestionParams, AIGeneratedQuestion } from '../types';
import { useAI } from '../contexts/AIContext';

export const generateQuestion = async (params: AIQuestionParams): Promise<AIGeneratedQuestion> => {
  const { apiKey, currentModel } = useAI();
  const openai = createOpenAIClient(apiKey || undefined);
  
  // Create a detailed prompt based on parameters
  const prompt = `
    Generate a ${params.subject} question for a ${params.difficulty} level student in grade ${params.gradeLevel}.
    Question type: ${params.questionType}
    Previous performance: ${params.previousPerformance || 'Not available'}
    Learning style: ${params.learningStyle || 'Visual'}
    Interests: ${params.interests?.join(', ') || 'General'}
    
    The question should be engaging, age-appropriate, and include:
    1. The question text
    2. Four possible answer options (for multiple choice)
    3. The correct answer
    4. A child-friendly explanation of the answer
    5. A hint that could help the student
    
    Format the response as a JSON object with the following structure:
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option",
      "explanation": "Simple explanation of why this is correct",
      "hint": "A helpful hint"
    }
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: currentModel.id,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message.content || '';
    return JSON.parse(content) as AIGeneratedQuestion;
  } catch (error) {
    console.error('Error generating question:', error);
    // Return a fallback question
    return {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      explanation: "When you add 2 and 2 together, you get 4.",
      hint: "Count on your fingers: 1, 2, 3, 4."
    };
  }
};
```

#### 2. Personalized Feedback
```typescript
// src/utils/aiFeedback.ts
import { createOpenAIClient } from './openai';
import { useAI } from '../contexts/AIContext';

export const generateFeedback = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  previousMistakes: string[] = []
): Promise<string> => {
  const { apiKey, currentModel } = useAI();
  const openai = createOpenAIClient(apiKey || undefined);
  
  const prompt = `
    A child (age 7-9) has answered the following question:
    
    Question: ${question}
    Their answer: ${userAnswer}
    Correct answer: ${correctAnswer}
    
    Previous mistakes they've made: ${previousMistakes.join(', ') || 'None recorded'}
    
    Please provide encouraging, child-friendly feedback that:
    1. Acknowledges their effort
    2. Explains why their answer was correct or incorrect in simple terms
    3. Gives a specific tip to help them improve if they were wrong
    4. Uses positive, supportive language
    5. Keeps the explanation under 2 sentences
    
    The feedback should be directly addressed to the child.
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: currentModel.id,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });
    
    return response.choices[0]?.message.content || 
      "Great effort! Keep practicing and you'll get it next time.";
  } catch (error) {
    console.error('Error generating feedback:', error);
    return userAnswer === correctAnswer 
      ? "Great job! You got it right!" 
      : "Nice try! Let's keep practicing.";
  }
};
```

#### 3. Learning Recommendations
```typescript
// src/utils/aiRecommendations.ts
import { createOpenAIClient } from './openai';
import { UserProgress, AIRecommendations } from '../types';
import { useAI } from '../contexts/AIContext';

export const generateRecommendations = async (
  userProgress: UserProgress
): Promise<AIRecommendations> => {
  const { apiKey, currentModel } = useAI();
  const openai = createOpenAIClient(apiKey || undefined);
  
  // Create a detailed analysis of user progress
  const progressSummary = JSON.stringify({
    completedActivities: userProgress.completedActivities,
    scores: userProgress.scores,
    strengths: userProgress.strengths || [],
    areasForImprovement: userProgress.areasForImprovement || [],
    interests: userProgress.interests || []
  });
  
  const prompt = `
    Analyze this child's (age 7-9) learning progress and provide personalized recommendations:
    
    ${progressSummary}
    
    Please provide:
    1. Three specific strengths based on their performance
    2. Two areas where they could improve
    3. Three recommended activities that would help them progress
    4. A specific learning tip tailored to their needs
    5. A suggested difficulty adjustment (easier, same, or harder)
    
    Format the response as a JSON object with the following structure:
    {
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "improvementAreas": ["Area 1", "Area 2"],
      "recommendedActivities": ["Activity 1", "Activity 2", "Activity 3"],
      "learningTip": "A specific learning tip",
      "difficultyAdjustment": "easier|same|harder"
    }
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: currentModel.id,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message.content || '';
    return JSON.parse(content) as AIRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Return fallback recommendations
    return {
      strengths: ["Completing activities regularly", "Trying different subjects", "Persistence"],
      improvementAreas: ["Reviewing incorrect answers", "Practicing more consistently"],
      recommendedActivities: ["Math: Addition Practice", "English: Sight Words", "Leadership: Decision Making"],
      learningTip: "Try to spend 10 minutes each day practicing the skills you find most challenging.",
      difficultyAdjustment: "same"
    };
  }
};
```

### UI Components

#### 1. API Key Management
```typescript
// src/components/settings/APIKeyInput.tsx
import React, { useState } from 'react';
import { useAI } from '../../contexts/AIContext';

export const APIKeyInput: React.FC = () => {
  const { apiKey, setApiKey, isConnected } = useAI();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  
  const handleSave = () => {
    setApiKey(inputKey);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">OpenAI API Key</h3>
      <p className="text-sm mb-4">
        Enter your OpenAI API key to enable AI-powered features. 
        Your key is stored locally and never sent to our servers.
      </p>
      
      <div className="flex items-center mb-2">
        <input
          type={showKey ? "text" : "password"}
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="sk-..."
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowKey(!showKey)}
          className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
        >
          {showKey ? "Hide" : "Show"}
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Not connected'}</span>
        </div>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Key
        </button>
      </div>
    </div>
  );
};
```

#### 2. Model Selector
```typescript
// src/components/settings/ModelSelector.tsx
import React from 'react';
import { useAI } from '../../contexts/AIContext';
import { AVAILABLE_MODELS } from '../../types/ai';

export const ModelSelector: React.FC = () => {
  const { currentModel, setCurrentModel, estimatedCost } = useAI();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">AI Model Settings</h3>
      <p className="text-sm mb-4">
        Choose which AI model to use. More powerful models provide better responses but may cost more.
      </p>
      
      <div className="space-y-3">
        {AVAILABLE_MODELS.map(model => (
          <div 
            key={model.id}
            className={`p-3 border rounded-md cursor-pointer hover:bg-blue-50 ${
              currentModel.id === model.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setCurrentModel(model)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-sm text-gray-600">{model.description}</p>
              </div>
              <div className="text-xs text-gray-500">
                ${model.costPer1KTokens.toFixed(3)}/1K tokens
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm">
        <p>Estimated cost this session: <span className="font-medium">${estimatedCost}</span></p>
      </div>
    </div>
  );
};
```

#### 3. Settings Page
```typescript
// src/pages/settings.tsx
import React from 'react';
import { Layout } from '../components/Layout';
import { APIKeyInput } from '../components/settings/APIKeyInput';
import { ModelSelector } from '../components/settings/ModelSelector';
import { useAI } from '../contexts/AIContext';

const SettingsPage: React.FC = () => {
  const { resetUsage } = useAI();
  
  return (
    <Layout title="Settings">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Parent/Teacher Settings</h1>
        
        <div className="space-y-6">
          <APIKeyInput />
          <ModelSelector />
          
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Usage Management</h3>
            <p className="text-sm mb-4">
              Monitor and control AI usage to manage costs.
            </p>
            
            <button
              onClick={resetUsage}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset Usage Counter
            </button>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">About AI Features</h3>
            <p className="text-sm">
              KidSkills uses OpenAI's powerful AI models to create personalized learning experiences.
              The AI generates questions, provides feedback, and recommends activities based on your
              child's progress and interests.
            </p>
            <p className="text-sm mt-2">
              All AI processing happens through OpenAI's secure API. Your API key is stored only on
              your device and is never sent to our servers. You only pay for the AI usage you actually use.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
```

## Implementation Phases

### Phase 1: Core AI Infrastructure
1. Create AI types and interfaces
2. Implement OpenAI client utility
3. Develop AI Context provider
4. Build API key management UI
5. Create model selector component
6. Implement settings page

### Phase 2: Question Generation
1. Develop AI question generator utility
2. Update activity components to use AI-generated questions
3. Implement caching for generated questions to reduce API calls
4. Add fallback mechanisms for offline use

### Phase 3: Personalized Feedback
1. Create AI feedback generation utility
2. Update activity components to display AI-generated feedback
3. Implement error handling and fallbacks
4. Add personalization based on user history

### Phase 4: Learning Analytics
1. Develop AI recommendation engine
2. Create dashboard to display AI insights
3. Implement learning pattern detection
4. Add personalized activity suggestions

### Phase 5: Testing & Optimization
1. Conduct performance testing
2. Optimize token usage to reduce costs
3. Implement rate limiting and quota management
4. Add telemetry for monitoring AI response quality

## API Usage Optimization

### Token Conservation Strategies
1. Use specific, concise prompts
2. Implement client-side caching of responses
3. Batch similar requests where possible
4. Use lower-cost models for simpler tasks
5. Set appropriate max_tokens limits

### Cost Management
1. Implement usage tracking and display
2. Add parent-configurable usage limits
3. Provide cost estimates before generating content
4. Cache frequently used content (e.g., common math problems)
5. Develop offline mode with pre-generated content

## Security Considerations

### API Key Management
1. Store API keys in localStorage with encryption
2. Never transmit API keys to any server
3. Provide clear instructions for obtaining and securing keys
4. Implement key validation before saving

### Content Safety
1. Use OpenAI's content filtering
2. Implement additional client-side content filtering
3. Provide clear reporting mechanism for inappropriate content
4. Create age-appropriate prompt templates

## Fallback Mechanisms

### Offline Support
1. Pre-generate and cache common questions
2. Implement basic non-AI question generation
3. Store recent AI-generated content for offline use
4. Provide clear UI indicators when using fallback content

### Error Handling
1. Graceful degradation when API calls fail
2. User-friendly error messages
3. Automatic retry with exponential backoff
4. Alternative activity suggestions when AI is unavailable 