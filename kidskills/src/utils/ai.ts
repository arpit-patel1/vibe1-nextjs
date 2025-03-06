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
  console.log(`createAIClient: Starting with API key length: ${apiKey ? apiKey.length : 0}`);
  console.log(`createAIClient: Model info - name: ${model?.name || 'unknown'}, id: ${model?.id || 'unknown'}, provider: ${model?.provider || 'unknown'}`);
  
  if (!apiKey) {
    console.error('createAIClient: API key is missing');
    throw new Error('API key is required');
  }
  
  if (!model || !model.id) {
    console.error('createAIClient: Invalid model provided:', model);
    // Use a default model instead of throwing an error
    model = {
      id: 'google/gemini-2.0-pro-exp-02-05:free',
      name: 'Gemini 2.0 Pro',
      description: 'Advanced model from Google',
      tokensPerMinute: 160000,
      costPer1KTokens: 0.10,
      provider: 'openrouter'
    };
    console.log('createAIClient: Using default model instead:', model.name);
  }
  
  // Check window.ENV if available for debugging
  if (typeof window !== 'undefined' && window.ENV && window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL) {
    console.log(`createAIClient: Environment model: ${window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL}`);
    if (window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL !== model.id) {
      console.log(`createAIClient: Using model ${model.id} instead of environment model ${window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL}`);
    } else {
      console.log(`createAIClient: Model matches environment: ${model.id}`);
    }
  }
  
  const provider = getProviderById(model.provider);
  
  if (!provider) {
    console.error(`createAIClient: Unknown provider: ${model.provider}`);
    // Use a default provider instead of throwing an error
    const defaultProvider = {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access to multiple AI models through a single API',
      baseUrl: 'https://openrouter.ai/api/v1',
      isDefault: true
    };
    console.log('createAIClient: Using default provider instead:', defaultProvider.name);
    
    try {
      const client = new OpenAI({
        apiKey,
        baseURL: defaultProvider.baseUrl,
        dangerouslyAllowBrowser: true, // Required for client-side usage
        defaultHeaders: {
          'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://kidskills.app', // Required for OpenRouter
          'X-Title': 'KidSkills' // Application name for OpenRouter
        }
      });
      
      console.log(`createAIClient: Successfully created client for ${defaultProvider.name} using model ${model.id}`);
      return client;
    } catch (error) {
      console.error(`createAIClient: Error creating client for ${defaultProvider.name}:`, error);
      throw error;
    }
  }
  
  console.log(`createAIClient: Creating client for provider: ${provider.name} with baseURL: ${provider.baseUrl}`);
  
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: provider.baseUrl,
      dangerouslyAllowBrowser: true, // Required for client-side usage
      defaultHeaders: {
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://kidskills.app', // Required for OpenRouter
        'X-Title': 'KidSkills' // Application name for OpenRouter
      }
    });
    
    console.log(`createAIClient: Successfully created client for ${provider.name} using model ${model.id}`);
    return client;
  } catch (error) {
    console.error(`createAIClient: Error creating client for ${provider.name}:`, error);
    throw error;
  }
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
 * @param additionalParams Additional parameters for the question
 * @param retryCount Optional retry count
 * @returns Generated question data
 */
export async function generateQuestion(params: {
  apiKey: string;
  model: AIModelConfig | null;
  subject: string;
  difficulty: string;
  questionType: string;
  gradeLevel: number;
  previousPerformance?: number;
  interests?: string[];
  additionalParams?: {
    grammarType?: string;
    keepSentencesShort?: boolean;
    readingTopic?: string;
    includePassage?: boolean;
    randomSeed?: number;
    temperature?: number;
  };
}): Promise<AIGeneratedQuestion> {
  const { 
    apiKey, 
    model, 
    subject, 
    difficulty, 
    questionType, 
    gradeLevel, 
    previousPerformance, 
    interests,
    additionalParams
  } = params;

  // Log additional parameters if provided
  if (additionalParams) {
    console.log('Additional parameters for question generation:', additionalParams);
  }

  // Create AI client
  const ai = createAIClient(apiKey, model);

  // Prepare system prompt based on question type
  let systemPrompt = '';
  
  if (subject === 'english' && questionType === 'grammar') {
    // Extract grammar type and sentence length preference
    const grammarType = additionalParams?.grammarType || 'general';
    const keepSentencesShort = additionalParams?.keepSentencesShort || false;
    
    systemPrompt = `You are an expert English teacher creating a grammar question for a grade ${gradeLevel} student.
Generate a unique and engaging grammar question focusing on ${grammarType} rules.
${keepSentencesShort ? 'Keep sentences short and concise.' : ''}
The question should be appropriate for the student's grade level (${gradeLevel}) and difficulty level (${difficulty}).

Your response must be in JSON format with the following fields:
- question: A clear question about ${grammarType} in English
- options: An array of 4 possible answers, with exactly one correct option
- explanation: A helpful explanation of why the correct answer is right
- hint: A subtle hint that guides without giving away the answer
- tags: An array of relevant tags for categorizing this question

Each option should have:
- id: A unique identifier (a, b, c, or d)
- text: The text of the option
- isCorrect: Boolean indicating if this is the correct answer (exactly one should be true)

Make the question engaging and educational.`;
  } else if (subject === 'english' && questionType === 'reading') {
    // Extract reading topic
    const readingTopic = additionalParams?.readingTopic || 'general';
    const includePassage = additionalParams?.includePassage || true;
    
    systemPrompt = `You are an expert English teacher creating a reading comprehension question for a grade ${gradeLevel} student.
Generate a short, engaging reading passage about ${readingTopic} followed by a comprehension question.
The passage should be appropriate for the student's grade level (${gradeLevel}) and difficulty level (${difficulty}).

Your response must be in JSON format with the following fields:
- readingPassage: A short, engaging passage about ${readingTopic} (3-4 paragraphs)
- question: A clear comprehension question about the passage
- options: An array of 4 possible answers, with exactly one correct option
- explanation: A helpful explanation of why the correct answer is right, referencing the passage
- hint: A subtle hint that guides the student to look at the relevant part of the passage
- tags: An array of relevant tags for categorizing this question

Each option should have:
- id: A unique identifier (a, b, c, or d)
- text: The text of the option
- isCorrect: Boolean indicating if this is the correct answer (exactly one should be true)

Make the passage and question engaging, educational, and appropriate for the grade level.`;
  } else if (subject === 'english' && questionType === 'vocabulary') {
    systemPrompt = `You are an expert English teacher creating a vocabulary question for a grade ${gradeLevel} student.
Generate a unique and engaging vocabulary question.
The question should be appropriate for the student's grade level (${gradeLevel}) and difficulty level (${difficulty}).

Your response must be in JSON format with the following fields:
- question: A clear question about English vocabulary
- options: An array of 4 possible answers, with exactly one correct option
- explanation: A helpful explanation of why the correct answer is right
- hint: A subtle hint that guides without giving away the answer
- tags: An array of relevant tags for categorizing this question

Each option should have:
- id: A unique identifier (a, b, c, or d)
- text: The text of the option
- isCorrect: Boolean indicating if this is the correct answer (exactly one should be true)

Make the question engaging and educational.`;
  } else if (subject === 'english' && questionType === 'creative-writing') {
    systemPrompt = `You are an expert English teacher creating a creative writing prompt for a grade ${gradeLevel} student.
Generate a unique and engaging creative writing prompt.
The prompt should be appropriate for the student's grade level (${gradeLevel}) and difficulty level (${difficulty}).

Your response must be in JSON format with the following fields:
- question: An engaging creative writing prompt
- explanation: Some guidance on how to approach this writing prompt
- hint: Additional ideas or suggestions to help with writer's block
- tags: An array of relevant tags for categorizing this prompt

Make the prompt engaging, imaginative, and appropriate for the grade level.`;
  } else if (subject === 'math' && questionType === 'word-problem') {
    systemPrompt = `You are an educational AI assistant for KidSkills, an app for children in grade ${gradeLevel}. 
Generate a ${difficulty} level math word problem appropriate for grade ${gradeLevel} students.
${previousPerformance ? `The student's previous performance was ${previousPerformance}%.` : ''}
${interests?.length ? `The student is interested in: ${interests.join(', ')}.` : ''}

IMPORTANT: Generate a UNIQUE and DIVERSE word problem that is different from previous problems. Use creative scenarios, different number values, and varied problem structures.

The word problem should:
1. Be clear and concise
2. Use simple language appropriate for grade ${gradeLevel}
3. Involve real-world scenarios that children can relate to
4. Have a single numerical answer
5. If possible, incorporate the student's interests to make it engaging
6. Include only necessary information to solve the problem
7. Be different from typical textbook problems

Random seed: ${additionalParams?.randomSeed || Math.floor(Math.random() * 10000)} (use this to generate a unique problem)

IMPORTANT: Return ONLY a JSON object with no markdown formatting, no backticks, and no "json" tag.
IMPORTANT: Your response MUST use the field name 'question' (not 'problem') for the word problem text, and 'correctAnswer' (not 'solution') for the answer.
IMPORTANT: Do NOT include an options array in your response. This is a free-form answer question, not multiple choice.

Expected JSON format:
{
  "question": "The complete word problem text",
  "correctAnswer": 42,
  "explanation": "Step-by-step explanation of how to solve the problem",
  "hint": "A helpful hint",
  "tags": ["tag1", "tag2"]
}`;
  } else {
    systemPrompt = `You are an educational AI assistant for KidSkills, an app for children in grade ${gradeLevel}. 
Generate a ${difficulty} level ${subject} question of type ${questionType}.
${previousPerformance ? `The student's previous performance was ${previousPerformance}%.` : ''}
${interests?.length ? `The student is interested in: ${interests.join(', ')}.` : ''}

IMPORTANT: Generate a UNIQUE and DIVERSE question that is different from previous questions. Use creative scenarios and varied problem structures.

Random seed: ${additionalParams?.randomSeed || Math.floor(Math.random() * 10000)} (use this to generate a unique problem)

IMPORTANT: Return ONLY a JSON object with no markdown formatting, no backticks, and no "json" tag.`;
  }

  // Define the expected response format for each question type
  const responseFormat = questionType === 'word-problem' 
    ? {
        question: "The complete word problem text",
        correctAnswer: 42,
        explanation: "Step-by-step explanation of how to solve the problem",
        hint: "A helpful hint",
        tags: ["tag1", "tag2"]
      }
    : {
        question: "The question text",
        options: [
          {"id": "A", "text": "First option", "isCorrect": false},
          {"id": "B", "text": "Second option", "isCorrect": false},
          {"id": "C", "text": "Third option", "isCorrect": true},
          {"id": "D", "text": "Fourth option", "isCorrect": false}
        ],
        explanation: "Explanation of the correct answer",
        hint: "A helpful hint",
        tags: ["tag1", "tag2"]
      };

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a unique ${subject} ${questionType} for grade ${gradeLevel} with random seed ${additionalParams?.randomSeed || Math.floor(Math.random() * 10000)}. Return ONLY a JSON object with the required fields.` }
  ];

  try {
    console.log(`generateQuestion: Creating AI client for ${model?.name} (${model?.id})`);
    const response = await ai.chat.completions.create({
      model: model?.id,
      messages: messages as any,
      temperature: additionalParams?.temperature || (0.7 + (Math.random() * 0.3)),
      max_tokens: 800,
      response_format: { type: "json_object", schema: responseFormat }
    });

    console.log(`generateQuestion: Received response from ${model?.provider} API`);
    
    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      console.error(`generateQuestion: No content returned from AI`);
      throw new Error('No content returned from AI');
    }
    
    console.log(`generateQuestion: Successfully received content of length ${content.length}`);
    
    try {
      // First try direct JSON parsing
      const responseData = JSON.parse(content);
      console.log(`generateQuestion: Successfully parsed JSON response`);
      
      // Validate the response has the required fields
      if (!responseData.question) {
        throw new Error('Response missing required field: question');
      }
      
      // For reading comprehension, ensure we have a reading passage
      if (subject === 'english' && questionType === 'reading' && !responseData.readingPassage) {
        throw new Error('Reading comprehension response missing required field: readingPassage');
      }
      
      // For multiple choice questions, validate options
      if (questionType !== 'creative-writing' && questionType !== 'word-problem' && (!responseData.options || !Array.isArray(responseData.options))) {
        throw new Error('Response missing required field: options array');
      }
      
      // Provide default values for optional fields
      if (!responseData.explanation) responseData.explanation = 'No explanation provided.';
      if (!responseData.hint) responseData.hint = 'Think carefully about the question.';
      
      return responseData as AIGeneratedQuestion;
    } catch (parseError) {
      console.log(`generateQuestion: Initial JSON parsing failed, trying to clean response`);
      
      // Fallback: Try to extract JSON from markdown code blocks
      try {
        // Remove markdown code blocks if present (```json and ```)
        const cleanedContent = content
          .replace(/^```json\n/, '')
          .replace(/^```\n/, '')
          .replace(/\n```$/, '')
          .trim();
        
        console.log(`generateQuestion: Cleaned content for parsing:`, cleanedContent);
        const responseData = JSON.parse(cleanedContent);
        console.log(`generateQuestion: Successfully parsed cleaned JSON response`);
        
        // Validate the response has the required fields
        if (!responseData.question) {
          throw new Error('Response missing required field: question');
        }
        
        // For reading comprehension, ensure we have a reading passage
        if (subject === 'english' && questionType === 'reading' && !responseData.readingPassage) {
          throw new Error('Reading comprehension response missing required field: readingPassage');
        }
        
        // For multiple choice questions, validate options
        if (questionType !== 'creative-writing' && questionType !== 'word-problem' && (!responseData.options || !Array.isArray(responseData.options))) {
          throw new Error('Response missing required field: options array');
        }
        
        // Provide default values for optional fields
        if (!responseData.explanation) responseData.explanation = 'No explanation provided.';
        if (!responseData.hint) responseData.hint = 'Think carefully about the question.';
        
        return responseData as AIGeneratedQuestion;
      } catch (secondError) {
        console.error(`generateQuestion: Failed to parse JSON response after cleaning:`, secondError);
        console.error(`generateQuestion: Raw content:`, content);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    }
  } catch (error) {
    console.error(`generateQuestion: Error with ${model?.provider}:`, error);
    if (error.response) {
      console.error(`generateQuestion: API response error:`, error.response.data);
    }
    
    // Check for specific error types that might benefit from retrying
    const shouldRetry = 
      (error.message?.includes('Invalid API response format') || 
       error.message?.includes('No content returned from AI') ||
       error.message?.includes('Cannot read properties of undefined') ||
       error.status === 429 || // Rate limit
       error.status === 500 || // Server error
       error.status === 502 || // Bad gateway
       error.status === 503 || // Service unavailable
       error.status === 504) && // Gateway timeout
      (additionalParams?.retryCount || 0) < 2; // Allow up to 2 retries
    
    // Retry logic for recoverable errors
    if (shouldRetry) {
      console.log(`generateQuestion: Retrying (${(additionalParams?.retryCount || 0) + 1}/2)...`);
      
      // Wait a moment before retrying (exponential backoff)
      const delay = Math.pow(2, (additionalParams?.retryCount || 0)) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry with slightly different parameters
      return generateQuestion({
        apiKey,
        model,
        subject,
        difficulty,
        gradeLevel,
        questionType,
        previousPerformance,
        interests,
        additionalParams: {
          ...additionalParams,
          retryCount: (additionalParams?.retryCount || 0) + 1
        }
      });
    }
    
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
  console.log(`generateRecommendations: Starting with model ${model.name} (${model.id})`);
  
  // Define the response schema for recommendations
  const responseSchema = {
    type: "object",
    properties: {
      strengths: { type: "array", items: { type: "string" } },
      improvementAreas: { type: "array", items: { type: "string" } },
      recommendedActivities: { 
        type: "array", 
        items: { 
          type: "object",
          properties: {
            subject: { type: "string" },
            type: { type: "string" },
            difficulty: { type: "string" }
          },
          required: ["subject", "type", "difficulty"]
        }
      },
      learningTip: { type: "string" },
      difficultyAdjustment: { type: "string", enum: ["increase", "decrease", "maintain"] }
    },
    required: ["strengths", "improvementAreas", "recommendedActivities", "learningTip", "difficultyAdjustment"]
  };
  
  const systemPrompt = `You are an educational AI assistant for KidSkills, an app for children.
Analyze the student's performance data and generate personalized learning recommendations.

IMPORTANT: Return ONLY a JSON object with no markdown formatting, no backticks, and no "json" tag.`;

  const performanceContext = JSON.stringify(performanceData);
  const interestsContext = interests.join(', ');

  const messages = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Generate learning recommendations based on this performance data: ${performanceContext}. The student is interested in: ${interestsContext}. Return ONLY a JSON object with the required fields.` 
    }
  ];

  try {
    console.log(`generateRecommendations: Creating client for ${model.provider}`);
    const client = createAIClient(apiKey, model);
    
    console.log(`generateRecommendations: Sending request to ${model.provider} API`);
    const response = await client.chat.completions.create({
      model: model.id,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object", schema: responseSchema }
    });

    console.log(`generateRecommendations: Received response from ${model.provider} API`);
    
    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      console.error(`generateRecommendations: No content returned from AI`);
      throw new Error('No content returned from AI');
    }
    
    console.log(`generateRecommendations: Successfully received content of length ${content.length}`);
    
    try {
      // First try direct JSON parsing
      const recommendations = JSON.parse(content);
      console.log(`generateRecommendations: Successfully parsed JSON response`);
      return recommendations;
    } catch (parseError) {
      console.log(`generateRecommendations: Initial JSON parsing failed, trying to clean response`);
      
      // Fallback: Try to extract JSON from markdown code blocks
      try {
        // Remove markdown code blocks if present (```json and ```)
        const cleanedContent = content
          .replace(/^```json\n/, '')
          .replace(/^```\n/, '')
          .replace(/\n```$/, '')
          .trim();
        
        console.log(`generateRecommendations: Cleaned content for parsing:`, cleanedContent);
        const recommendations = JSON.parse(cleanedContent);
        console.log(`generateRecommendations: Successfully parsed cleaned JSON response`);
        return recommendations;
      } catch (secondError) {
        console.error(`generateRecommendations: Failed to parse JSON response after cleaning:`, secondError);
        console.error(`generateRecommendations: Raw content:`, content);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    }
  } catch (error) {
    console.error(`generateRecommendations: Error with ${model.provider}:`, error);
    if (error.response) {
      console.error(`generateRecommendations: API response error:`, error.response.data);
    }
    
    throw error;
  }
}

/**
 * Validate an OpenRouter API key
 * @param apiKey The API key to validate
 * @returns True if the key is valid, false otherwise
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  console.log(`validateApiKey: Starting with API key length: ${apiKey ? apiKey.length : 0}`);
  
  if (!apiKey) {
    console.error('validateApiKey: API key is missing');
    return false;
  }
  
  try {
    console.log('validateApiKey: Testing API key with OpenRouter models endpoint');
    
    // Make a request to the models endpoint to check if the key is valid
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://kidskills.app',
        'X-Title': 'KidSkills'
      }
    });
    
    if (!response.ok) {
      console.error(`validateApiKey: API request failed with status ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`validateApiKey: API key is valid, received ${data.data ? data.data.length : 0} models`);
    return true;
  } catch (error) {
    console.error('validateApiKey: Error validating API key:', error);
    return false;
  }
}

/**
 * Fetch available models from OpenRouter API
 * @param apiKey User's API key
 * @returns Array of available model IDs
 */
export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  console.log(`fetchAvailableModels: Starting with API key length: ${apiKey ? apiKey.length : 0}`);
  
  if (!apiKey) {
    console.error('fetchAvailableModels: API key is missing');
    throw new Error('API key is required');
  }
  
  try {
    console.log('fetchAvailableModels: Fetching models from OpenRouter API');
    
    // Create a fetch request to OpenRouter's models endpoint
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://kidskills.app',
        'X-Title': 'KidSkills'
      }
    });
    
    if (!response.ok) {
      console.error(`fetchAvailableModels: API request failed with status ${response.status}`);
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`fetchAvailableModels: Received response with ${data.data ? data.data.length : 0} models`);
    
    // Extract model IDs from the response
    if (data.data && Array.isArray(data.data)) {
      const modelIds = data.data.map((model: any) => model.id);
      console.log(`fetchAvailableModels: Extracted ${modelIds.length} model IDs`);
      return modelIds;
    }
    
    console.error('fetchAvailableModels: Invalid response format', data);
    return [];
  } catch (error) {
    console.error('fetchAvailableModels: Error fetching models:', error);
    throw error;
  }
}
