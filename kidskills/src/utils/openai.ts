import { AIModelConfig, getProviderById } from '@/types/ai';
import OpenAI from 'openai';

/**
 * AI API utility for KidSkills
 * Handles communication with OpenRouter API for generating educational content
 */

/**
 * Create an AI client instance for OpenRouter
 * @param apiKey User's API key
 * @param model The AI model configuration
 * @returns OpenAI client instance configured for OpenRouter
 */
export function createAIClient(apiKey: string, model: AIModelConfig) {
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  const provider = getProviderById(model.provider);
  
  if (!provider) {
    throw new Error(`Unknown provider: ${model.provider}`);
  }
  
  console.log(`Creating AI client for provider: ${provider.name}`);
  
  return new OpenAI({
    apiKey,
    baseURL: provider.baseUrl,
    dangerouslyAllowBrowser: true, // Required for client-side usage
    defaultHeaders: {
      'HTTP-Referer': window.location.origin, // Required for OpenRouter
      'X-Title': 'KidSkills' // Application name for OpenRouter
    }
  });
}

/**
 * Generate an educational question using AI
 * @param apiKey User's API key
 * @param model The AI model to use
 * @param subject Subject area (math, english, etc.)
 * @param difficulty Difficulty level
 * @param gradeLevel Student grade level
 * @param questionType Type of question to generate
 * @param previousPerformance Optional previous performance percentage
 * @param interests Optional student interests for personalization
 * @returns Generated question data
 */
export async function generateQuestion({
  apiKey,
  model,
  subject,
  difficulty,
  gradeLevel,
  questionType,
  previousPerformance,
  interests
}: {
  apiKey: string;
  model: AIModelConfig;
  subject: string;
  difficulty: string;
  gradeLevel: number;
  questionType: string;
  previousPerformance?: number;
  interests?: string[];
}) {
  let systemPrompt = '';
  
  // Create different system prompts based on question type
  if (questionType === 'word-problem') {
    systemPrompt = `You are an educational AI assistant for KidSkills, an app for children in grade ${gradeLevel}. 
Generate a ${difficulty} level math word problem appropriate for grade ${gradeLevel} students.
${previousPerformance ? `The student's previous performance was ${previousPerformance}%.` : ''}
${interests?.length ? `The student is interested in: ${interests.join(', ')}.` : ''}

The word problem should:
1. Be clear and concise
2. Use simple language appropriate for grade ${gradeLevel}
3. Involve real-world scenarios that children can relate to
4. Have a single numerical answer
5. If possible, incorporate the student's interests to make it engaging
6. Include only necessary information to solve the problem

Return your response as a JSON object with the following structure:
{
  "question": "The complete word problem text",
  "correctAnswer": "The numerical answer",
  "explanation": "Step-by-step explanation of how to solve the problem",
  "hint": "A helpful hint",
  "tags": ["tag1", "tag2"]
}`;
  } else {
    systemPrompt = `You are an educational AI assistant for KidSkills, an app for children in grade ${gradeLevel}. 
Generate a ${difficulty} level ${subject} question of type ${questionType}.
${previousPerformance ? `The student's previous performance was ${previousPerformance}%.` : ''}
${interests?.length ? `The student is interested in: ${interests.join(', ')}.` : ''}

Return your response as a JSON object with the following structure:
{
  "question": "The question text",
  "options": [
    {"id": "A", "text": "First option", "isCorrect": false},
    {"id": "B", "text": "Second option", "isCorrect": false},
    {"id": "C", "text": "Third option", "isCorrect": true},
    {"id": "D", "text": "Fourth option", "isCorrect": false}
  ],
  "explanation": "Explanation of the correct answer",
  "hint": "A helpful hint",
  "tags": ["tag1", "tag2"]
}`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a ${subject} ${questionType} for grade ${gradeLevel}.` }
  ];

  try {
    console.log(`Generating question using ${model.name} (${model.provider})`);
    const client = createAIClient(apiKey, model);
    
    const response = await client.chat.completions.create({
      model: model.id,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800
    });

    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }
    
    const questionData = JSON.parse(content);
    return questionData;
  } catch (error) {
    console.error(`Error generating question with ${model.provider}:`, error);
    throw error;
  }
}

/**
 * Generate personalized learning recommendations
 * @param apiKey User's API key
 * @param model The AI model to use
 * @param performanceData User's performance data
 * @param interests User's interests
 * @returns AI recommendations
 */
export async function generateRecommendations({
  apiKey,
  model,
  performanceData,
  interests
}: {
  apiKey: string;
  model: AIModelConfig;
  performanceData: {
    subject: string;
    correctAnswers: number;
    totalQuestions: number;
    averageResponseTime: number;
    mistakePatterns: string[];
  }[];
  interests: string[];
}) {
  const systemPrompt = `You are an educational AI assistant for KidSkills, an app for children.
Analyze the student's performance data and generate personalized learning recommendations.
Return your response as a JSON object with the following structure:
{
  "strengths": ["strength1", "strength2"],
  "improvementAreas": ["area1", "area2"],
  "recommendedActivities": [
    {"subject": "subject", "type": "activity type", "difficulty": "difficulty level"}
  ],
  "learningTip": "A helpful learning tip",
  "difficultyAdjustment": "increase" | "decrease" | "maintain"
}`;

  const performanceContext = JSON.stringify(performanceData);
  const interestsContext = interests.join(', ');

  const messages = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Generate learning recommendations based on this performance data: ${performanceContext}. The student is interested in: ${interestsContext}.` 
    }
  ];

  try {
    console.log(`Generating recommendations using ${model.name} (${model.provider})`);
    const client = createAIClient(apiKey, model);
    
    const response = await client.chat.completions.create({
      model: model.id,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800
    });

    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }
    
    const recommendations = JSON.parse(content);
    return recommendations;
  } catch (error) {
    console.error(`Error generating recommendations with ${model.provider}:`, error);
    throw error;
  }
}

/**
 * Check if an API key is valid by making a small test request
 * @param apiKey The API key to validate
 * @returns Boolean indicating if the key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) {
    console.log('validateApiKey: No API key provided');
    return false;
  }
  
  const provider = getProviderById('openrouter');
  if (!provider) {
    console.error(`validateApiKey: Unknown provider: openrouter`);
    return false;
  }
  
  console.log(`validateApiKey: Testing API key validity for ${provider.name}`);
  
  try {
    // Create a client for OpenRouter
    const client = new OpenAI({
      apiKey,
      baseURL: provider.baseUrl,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KidSkills'
      }
    });
    
    console.log(`validateApiKey: ${provider.name} client created successfully`);
    
    // List models as a simple validation request
    const response = await client.models.list();
    console.log(`validateApiKey: Models list request successful for ${provider.name}`);
    
    // Check if we got a valid response with models
    if (response && response.data && response.data.length > 0) {
      console.log(`validateApiKey: API key is valid for ${provider.name}, found ${response.data.length} models`);
      return true;
    } else {
      console.warn(`validateApiKey: ${provider.name} API response did not contain expected data`);
      return false;
    }
  } catch (error: any) {
    // Log more detailed error information
    console.error(`validateApiKey: Error during ${provider.name} validation:`, error);
    
    if (error.status === 401) {
      console.error(`validateApiKey: Authentication error - invalid ${provider.name} API key`);
    } else if (error.status === 429) {
      console.error(`validateApiKey: Rate limit exceeded for ${provider.name}`);
    } else if (error.message) {
      console.error(`validateApiKey: Error message: ${error.message}`);
    }
    
    return false;
  }
}

/**
 * Fetch available models from OpenRouter API
 * @param apiKey The API key
 * @returns Array of model IDs
 */
export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  if (!apiKey) {
    console.log('fetchAvailableModels: No API key provided');
    return [];
  }
  
  const provider = getProviderById('openrouter');
  if (!provider) {
    console.error(`fetchAvailableModels: Unknown provider: openrouter`);
    return [];
  }
  
  console.log(`fetchAvailableModels: Fetching available models from ${provider.name}`);
  
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: provider.baseUrl,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KidSkills'
      }
    });
    
    const response = await client.models.list();
    
    if (response && response.data) {
      const modelIds = response.data.map(model => model.id);
      console.log(`fetchAvailableModels: Found ${modelIds.length} models for ${provider.name}`);
      return modelIds;
    }
    
    return [];
  } catch (error) {
    console.error(`fetchAvailableModels: Error fetching models from ${provider.name}:`, error);
    return [];
  }
} 