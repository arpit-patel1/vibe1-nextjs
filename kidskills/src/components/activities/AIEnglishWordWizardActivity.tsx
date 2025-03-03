'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { useAudio } from '@/contexts/AudioContext';
import { useAI } from '@/contexts/AIContext';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import { generateQuestion, validateApiKey } from '@/utils/ai';
import { AIModelConfig } from '@/types/ai';
import { createAIClient } from '@/utils/ai';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AIEnglishWordWizardActivityProps {
  activityId: string;
  gradeLevel?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  exerciseType?: 'creative-writing' | 'grammar' | 'vocabulary' | 'reading';
}

export const AIEnglishWordWizardActivity = ({
  activityId,
  gradeLevel = 3,
  difficulty = 'medium',
  exerciseType = 'creative-writing',
}: AIEnglishWordWizardActivityProps) => {
  const { playSound } = useAudio();
  const { 
    apiKey, 
    selectedModel, 
    isApiKeyValid,
    validateKey,
    setApiKey
  } = useAI();
  
  // State for the English exercise
  const [prompt, setPrompt] = useState<string>('');
  const [userResponse, setUserResponse] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [exerciseCount, setExerciseCount] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [localKeyValidated, setLocalKeyValidated] = useState<boolean>(false);
  const [currentModelUsed, setCurrentModelUsed] = useState<AIModelConfig | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState<boolean>(false);
  const [generationFlag, setGenerationFlag] = useState<string | null>(null);
  
  // Function to handle Next Exercise button click with debounce
  const handleNextExercise = useCallback(() => {
    // Disable the button to prevent multiple clicks
    setIsNextButtonDisabled(true);
    
    // Clear the generation flag to allow a new exercise to be generated
    localStorage.removeItem('has_attempted_english_generation');
    
    // Generate a new exercise
    generateEnglishExercise();
    
    // Re-enable the button after a delay
    setTimeout(() => {
      setIsNextButtonDisabled(false);
    }, 3000); // 3 seconds delay
  }, []);

  // Force revalidate the API key if needed
  const forceRevalidateKey = useCallback(async () => {
    console.log("EnglishWordWizard: Force revalidating API key");
    const storedKey = localStorage.getItem('openrouter_api_key');
    
    if (!storedKey) {
      console.log("EnglishWordWizard: No API key found in localStorage");
      return false;
    }
    
    console.log(`EnglishWordWizard: Found API key in localStorage (length: ${storedKey.length})`);
    
    try {
      // First try using the context's validateKey function
      console.log("EnglishWordWizard: Attempting to validate key using context function");
      const isValid = await validateKey(storedKey);
      console.log("EnglishWordWizard: Context validation result:", isValid);
      
      if (isValid) {
        console.log("EnglishWordWizard: Key validated successfully via context");
        setLocalKeyValidated(true);
        return true;
      }
      
      // If that fails, try direct validation
      console.log("EnglishWordWizard: Context validation failed, trying direct validation");
      const directValidation = await validateApiKey(storedKey);
      console.log("EnglishWordWizard: Direct validation result:", directValidation);
      
      if (directValidation) {
        console.log("EnglishWordWizard: Key validated successfully via direct validation");
        // Update the context with the valid key
        setApiKey(storedKey);
        setLocalKeyValidated(true);
        return true;
      }
      
      console.log("EnglishWordWizard: All validation attempts failed");
      return false;
    } catch (err) {
      console.error("EnglishWordWizard: Error during force validation:", err);
      return false;
    }
  }, [validateKey, setApiKey]);

  // Check if API key is valid with fallback to localStorage
  const isKeyValid = useCallback(() => {
    console.log("EnglishWordWizard: Checking API key validity");
    console.log("EnglishWordWizard: Context API key valid:", isApiKeyValid);
    console.log("EnglishWordWizard: Context API key exists:", !!apiKey);
    console.log("EnglishWordWizard: Selected model:", selectedModel?.name);
    console.log("EnglishWordWizard: Local key validated:", localKeyValidated);
    
    // If the context already has a valid key, use it
    if (isApiKeyValid && apiKey) {
      console.log("EnglishWordWizard: API key is valid in context");
      return true;
    }
    
    // If we've already validated the local key in this session
    if (localKeyValidated) {
      console.log("EnglishWordWizard: Local key was previously validated in this session");
      return true;
    }
    
    // Otherwise, we need to check localStorage and validate
    console.log("EnglishWordWizard: No valid key found in context, will need to validate from localStorage");
    return false;
  }, [apiKey, isApiKeyValid, selectedModel, localKeyValidated]);

  // Get the current model from localStorage or context
  const getCurrentModel = useCallback(() => {
    console.log("EnglishWordWizard: Getting current model");
    
    // First check if we have a model in context
    if (selectedModel) {
      console.log(`EnglishWordWizard: Using model from context: ${selectedModel.name} (${selectedModel.id})`);
      setCurrentModelUsed(selectedModel);
      return selectedModel;
    }
    
    // If not, try to get it from localStorage
    const storedModelId = localStorage.getItem('selected_ai_model');
    console.log(`EnglishWordWizard: Stored model ID from localStorage: ${storedModelId}`);
    
    if (storedModelId) {
      // Try to get the stored model details
      const storedModelDetails = localStorage.getItem('selected_model_details');
      console.log(`EnglishWordWizard: Stored model details: ${storedModelDetails ? 'Found' : 'Not found'}`);
      
      if (storedModelDetails) {
        try {
          const modelConfig = JSON.parse(storedModelDetails) as AIModelConfig;
          console.log(`EnglishWordWizard: Using model from localStorage: ${modelConfig.name} (${modelConfig.id})`);
          setCurrentModelUsed(modelConfig);
          return modelConfig;
        } catch (err) {
          console.error("EnglishWordWizard: Error parsing stored model details:", err);
        }
      }
      
      // If we couldn't get the details, create a basic model config
      const basicModel: AIModelConfig = {
        id: storedModelId,
        name: storedModelId.split('/').pop() || storedModelId,
        description: 'Model from localStorage',
        tokensPerMinute: 100000,
        costPer1KTokens: 0.0,
        provider: 'openrouter'
      };
      
      console.log(`EnglishWordWizard: Created basic model config: ${basicModel.name} (${basicModel.id})`);
      setCurrentModelUsed(basicModel);
      return basicModel;
    }
    
    // If we still don't have a model, use the default but DO NOT save it to localStorage
    console.log("EnglishWordWizard: No model found, using default model (temporary, not saving to localStorage)");
    const defaultModel = {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Default model',
      tokensPerMinute: 100000,
      costPer1KTokens: 0.0,
      provider: 'openrouter'
    };
    
    setCurrentModelUsed(defaultModel);
    return defaultModel;
  }, [selectedModel]);

  // Initial setup and API key validation
  useEffect(() => {
    const keyStatus = apiKey ? (isApiKeyValid ? 'Valid' : 'Invalid') : 'Missing';
    const localStorageKey = localStorage.getItem('openrouter_api_key');
    const localKeyStatus = localStorageKey ? `Present (${localStorageKey.length} chars)` : 'Missing';
    
    // Get the current model
    const modelToUse = getCurrentModel();
    const modelInfo = modelToUse ? `${modelToUse.name} (${modelToUse.id})` : 'None';
    
    const debugText = `API Key: ${keyStatus}, Valid: ${isApiKeyValid}, Local Key: ${localKeyStatus}, Local Validated: ${localKeyValidated}, Model: ${modelInfo}`;
    setDebugInfo(debugText);
    console.log(`EnglishWordWizard Debug: ${debugText}`);
    
    // Check if we need to validate a key from localStorage
    const needsValidation = !isApiKeyValid && !localKeyValidated && localStorageKey;
    
    if (needsValidation) {
      console.log("EnglishWordWizard: API key found in localStorage but not validated, attempting validation");
      forceRevalidateKey().then(isValid => {
        console.log("EnglishWordWizard: Force validation completed, result:", isValid);
      });
    }
  }, [apiKey, isApiKeyValid, selectedModel, forceRevalidateKey, localKeyValidated, getCurrentModel]);

  // Generate initial exercise on component mount
  useEffect(() => {
    // Check if we've already attempted to generate an exercise
    const hasAttemptedGeneration = localStorage.getItem('has_attempted_english_generation');
    
    if (!hasAttemptedGeneration) {
      console.log("EnglishWordWizard: Initial mount, generating exercise");
      localStorage.setItem('has_attempted_english_generation', 'true');
      generateEnglishExercise();
    } else {
      console.log("EnglishWordWizard: Already attempted generation, skipping");
    }
    
    // Cleanup function to remove the generation flag when component unmounts
    return () => {
      console.log("EnglishWordWizard: Component unmounting, cleaning up");
      localStorage.removeItem('has_attempted_english_generation');
      localStorage.removeItem('generating_english_exercise');
    };
  }, []);

  // Generate a new English exercise
  const generateEnglishExercise = async (useBackupModel = false) => {
    console.log(`EnglishWordWizard: Attempting to generate exercise${useBackupModel ? ' with backup model' : ''}`);
    
    // Check if we're already loading an exercise
    if (isLoading) {
      console.log("EnglishWordWizard: Already generating an exercise, ignoring this call");
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Check if we have a valid key
    const keyValid = isKeyValid();
    console.log("EnglishWordWizard: Initial key validity check:", keyValid);
    
    // If no valid key in context or local session, try to validate from localStorage
    if (!keyValid) {
      console.log("EnglishWordWizard: No valid key found, attempting to validate from localStorage");
      const forceValidated = await forceRevalidateKey();
      
      if (!forceValidated) {
        console.log("EnglishWordWizard: Key validation failed, showing error message");
        setError('Please add your OpenRouter API key in the Settings page.');
        return;
      }
    }
    
    // Get the current model to use
    let modelToUse = getCurrentModel();
    
    // If using backup model, switch to a more reliable model
    if (useBackupModel) {
      console.log("EnglishWordWizard: Using backup model (GPT-3.5 Turbo) due to previous failure");
      modelToUse = {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo (Backup)',
        description: 'Backup model for reliability',
        tokensPerMinute: 100000,
        costPer1KTokens: 0.0,
        provider: 'openrouter'
      };
    }
    
    console.log(`EnglishWordWizard: Using model for generation: ${modelToUse.name} (${modelToUse.id})`);
    
    // Ensure we have a selected model
    if (!modelToUse) {
      console.log("EnglishWordWizard: No model selected");
      setError('Please select an AI model in the Settings page.');
      return;
    }
    
    // Get the API key to use (from context or localStorage)
    const keyToUse = apiKey || localStorage.getItem('openrouter_api_key');
    if (!keyToUse) {
      console.log("EnglishWordWizard: No API key available");
      setError('Please add your OpenRouter API key in the Settings page.');
      return;
    }
    
    console.log(`EnglishWordWizard: Using API key (length: ${keyToUse.length}) and model: ${modelToUse.name} (${modelToUse.id})`);
    
    // Set a flag in localStorage to indicate we're generating an exercise
    localStorage.setItem('generating_english_exercise', 'true');
    
    setIsLoading(true);
    setPrompt('');
    setUserResponse('');
    setIsCorrect(null);
    setExplanation('');
    setFeedback('');
    setHasSubmitted(false);
    setShowNextButton(false);

    try {
      console.log(`EnglishWordWizard: Generating exercise with model: ${modelToUse.name} (${modelToUse.id})`);
      
      // Add a small delay before making the API request to avoid rate limiting
      console.log("EnglishWordWizard: Adding a short delay before API request to avoid rate limiting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // List of possible interests to randomly select from
      const allInterests = [
        'animals', 'sports', 'space', 'food', 'dinosaurs', 'robots', 
        'superheroes', 'music', 'art', 'oceans', 'planets', 'cars', 
        'trains', 'airplanes', 'magic', 'science', 'nature', 'computers',
        'video games', 'books', 'movies', 'travel', 'building', 'cooking'
      ];
      
      // Randomly select 3-5 interests
      const numInterests = Math.floor(Math.random() * 3) + 3; // 3 to 5 interests
      const shuffledInterests = [...allInterests].sort(() => 0.5 - Math.random());
      const selectedInterests = shuffledInterests.slice(0, numInterests);
      
      console.log(`EnglishWordWizard: Using random interests: ${selectedInterests.join(', ')}`);
      
      const result = await generateQuestion({
        apiKey: keyToUse,
        model: modelToUse,
        subject: 'english',
        difficulty,
        gradeLevel,
        questionType: exerciseType,
        interests: selectedInterests
      });

      console.log("EnglishWordWizard: Exercise generated successfully");
      
      // Validate the result object
      if (!result) {
        console.error("EnglishWordWizard: Generated result is undefined");
        
        // Try with backup model if not already using it
        if (!useBackupModel) {
          console.log("EnglishWordWizard: Trying with backup model");
          setIsLoading(false);
          generateEnglishExercise(true);
          return;
        }
        
        setError('Failed to generate an exercise. Please try again.');
        setIsLoading(false);
        return;
      }
      
      if (!result.question) {
        console.error("EnglishWordWizard: Generated question is undefined");
        console.error("EnglishWordWizard: Full result:", JSON.stringify(result, null, 2));
        
        // Try with backup model if not already using it
        if (!useBackupModel) {
          console.log("EnglishWordWizard: Trying with backup model");
          setIsLoading(false);
          generateEnglishExercise(true);
          return;
        }
        
        setError('Failed to generate a valid exercise. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Set the prompt and explanation
      setPrompt(result.question);
      setExplanation(result.explanation || '');
      
      // Increment exercise count
      setExerciseCount(prev => prev + 1);
      
      // Clear loading state
      setIsLoading(false);
      
      // Clear the generation flag
      localStorage.removeItem('generating_english_exercise');
      
    } catch (err: any) {
      console.error("EnglishWordWizard: Error generating exercise:", err);
      
      // Handle specific error types
      if (err.message?.includes('API key')) {
        setError('Invalid API key. Please check your OpenRouter API key in Settings.');
      } else if (err.message?.includes('rate limit')) {
        setError('Rate limit exceeded. Please try again in a few minutes.');
      } else if (err.message?.includes('model')) {
        setError('Error with the selected model. Please try a different model in Settings.');
      } else {
        setError(`Failed to generate an exercise: ${err.message || 'Unknown error'}`);
      }
      
      setIsLoading(false);
      localStorage.removeItem('generating_english_exercise');
    }
  };

  // Handle user response submission
  const handleSubmit = async () => {
    if (!userResponse.trim() || hasSubmitted) return;
    
    setIsGeneratingFeedback(true);
    
    try {
      // Get the current model and API key
      const modelToUse = getCurrentModel();
      const keyToUse = apiKey || localStorage.getItem('openrouter_api_key');
      
      if (!keyToUse || !modelToUse) {
        throw new Error('Missing API key or model configuration');
      }
      
      // Create an AI client
      const client = createAIClient(keyToUse, modelToUse);
      
      // Generate feedback on the user's response
      const response = await client.chat.completions.create({
        model: modelToUse.id,
        messages: [
          {
            role: 'system',
            content: `You are an educational AI assistant for KidSkills, an app for children in grade ${gradeLevel}. 
            You are evaluating a student's response to an English ${exerciseType} exercise.
            Provide encouraging, constructive feedback appropriate for a grade ${gradeLevel} student.
            Focus on what they did well and offer 1-2 specific suggestions for improvement.
            Keep your feedback concise, positive, and helpful.`
          },
          {
            role: 'user',
            content: `Exercise prompt: "${prompt}"
            
            Student's response: "${userResponse}"
            
            Please provide:
            1. Whether the response meets the requirements (yes/no)
            2. Specific positive feedback on what they did well
            3. 1-2 gentle suggestions for improvement
            4. A score out of 10
            
            Format your response as a JSON object with these fields: 
            {
              "isCorrect": boolean,
              "feedback": "your feedback text",
              "score": number
            }`
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      
      // Parse the feedback
      const feedbackText = response.choices[0]?.message?.content;
      
      if (!feedbackText) {
        throw new Error('Empty response from AI');
      }
      
      try {
        const feedbackData = JSON.parse(feedbackText);
        setIsCorrect(feedbackData.isCorrect);
        setFeedback(feedbackData.feedback);
        setScore(prev => prev + feedbackData.score);
      } catch (parseErr) {
        console.error("Error parsing feedback:", parseErr);
        setFeedback(feedbackText);
        setIsCorrect(true); // Default to positive feedback if parsing fails
      }
      
      // Play sound based on feedback
      playSound(isCorrect ? 'correct' : 'incorrect');
      
      setHasSubmitted(true);
      setShowNextButton(true);
      
    } catch (err: any) {
      console.error("Error generating feedback:", err);
      setFeedback("We couldn't generate detailed feedback at this time, but your response has been recorded.");
      setHasSubmitted(true);
      setShowNextButton(true);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Render API key prompt if no valid key
  if (!isApiKeyValid && !apiKey && !localKeyValidated) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">English Word Wizard</h2>
        <p className="mb-6">To use this activity, you need to add your OpenRouter API key in Settings.</p>
        <Button 
          variant="primary" 
          size="large" 
          href="/settings"
        >
          Go to Settings
        </Button>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-lg">Generating your English exercise...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-red-500 mb-4">{error}</div>
          <Button
            variant="primary"
            size="large"
            onClick={() => generateEnglishExercise()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header with score */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">English Word Wizard</h2>
        <div className="text-lg font-semibold">Score: {score}</div>
      </div>
      
      {/* Exercise prompt */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Your Task:</h3>
        <p className="text-lg">{prompt}</p>
      </div>
      
      {/* User response textarea */}
      <div className="mb-6">
        <label htmlFor="userResponse" className="block text-lg font-medium mb-2">
          Your Response:
        </label>
        <textarea
          id="userResponse"
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          disabled={hasSubmitted}
          className={`w-full p-3 border rounded-lg min-h-[150px] ${
            hasSubmitted ? 'bg-gray-100' : 'bg-white'
          }`}
          placeholder="Write your response here..."
        />
      </div>
      
      {/* Feedback section */}
      <AnimatePresence>
        {hasSubmitted && feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
            <p>{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Submit or Next button */}
      {!hasSubmitted ? (
        <Button
          variant="primary"
          size="large"
          onClick={handleSubmit}
          disabled={!userResponse.trim() || isGeneratingFeedback}
          className="w-full"
        >
          {isGeneratingFeedback ? 'Generating Feedback...' : 'Submit Response'}
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="large"
          onClick={handleNextExercise}
          disabled={isNextButtonDisabled}
          className="w-full"
        >
          {isNextButtonDisabled ? 'Generating Next Exercise...' : 'Next Exercise'}
        </Button>
      )}
      
      {/* Character guide */}
      <div className="mt-8">
        <CharacterGuide
          character="owl"
          message={
            hasSubmitted
              ? explanation
              : "Take your time to think about the prompt. There's no single right answer - I want to see your creativity and thinking!"
          }
        />
      </div>
    </div>
  );
};

export default AIEnglishWordWizardActivity; 