'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { useAudio } from '@/contexts/AudioContext';
import { useAI } from '@/contexts/AIContext';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import { generateQuestion, validateApiKey } from '@/utils/ai';
import { AIModelConfig } from '@/types/ai';
import { createAIClient } from '@/utils/ai';
import ConfettiAnimation from '@/components/animations/ConfettiAnimation';

interface AIMathWordProblemActivityProps {
  activityId: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const AIMathWordProblemActivity = ({
  activityId,
  gradeLevel,
  difficulty,
}: AIMathWordProblemActivityProps) => {
  const { playSound } = useAudio();
  const { 
    apiKey, 
    selectedModel, 
    isApiKeyValid,
    validateKey,
    setApiKey
  } = useAI();
  
  // State for the word problem
  const [problem, setProblem] = useState<string>('');
  const problemRef = useRef<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [localKeyValidated, setLocalKeyValidated] = useState<boolean>(false);
  const [currentModelUsed, setCurrentModelUsed] = useState<AIModelConfig | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Function to handle Next Problem button click with debounce
  const handleNextProblem = useCallback(() => {
    // Disable the button to prevent multiple clicks
    setIsNextButtonDisabled(true);
    
    // Clear the generation flag to allow a new problem to be generated
    localStorage.removeItem('has_attempted_generation');
    
    // Generate a new problem
    generateWordProblem();
    
    // Re-enable the button after a delay
    setTimeout(() => {
      setIsNextButtonDisabled(false);
    }, 3000); // 3 seconds delay
  }, []);

  // Force revalidate the API key if needed
  const forceRevalidateKey = useCallback(async () => {
    console.log("MathWordProblem: Force revalidating API key");
    const storedKey = localStorage.getItem('openrouter_api_key');
    
    if (!storedKey) {
      console.log("MathWordProblem: No API key found in localStorage");
      return false;
    }
    
    console.log(`MathWordProblem: Found API key in localStorage (length: ${storedKey.length})`);
    
    try {
      // First try using the context's validateKey function
      console.log("MathWordProblem: Attempting to validate key using context function");
      const isValid = await validateKey(storedKey);
      console.log("MathWordProblem: Context validation result:", isValid);
      
      if (isValid) {
        console.log("MathWordProblem: Key validated successfully via context");
        setLocalKeyValidated(true);
        return true;
      }
      
      // If that fails, try direct validation
      console.log("MathWordProblem: Context validation failed, trying direct validation");
      const directValidation = await validateApiKey(storedKey);
      console.log("MathWordProblem: Direct validation result:", directValidation);
      
      if (directValidation) {
        console.log("MathWordProblem: Key validated successfully via direct validation");
        // Update the context with the valid key
        setApiKey(storedKey);
        setLocalKeyValidated(true);
        return true;
      }
      
      console.log("MathWordProblem: All validation attempts failed");
      return false;
    } catch (err) {
      console.error("MathWordProblem: Error during force validation:", err);
      return false;
    }
  }, [validateKey, setApiKey]);

  // Check if API key is valid with fallback to localStorage
  const isKeyValid = useCallback(() => {
    console.log("MathWordProblem: Checking API key validity");
    console.log("MathWordProblem: Context API key valid:", isApiKeyValid);
    console.log("MathWordProblem: Context API key exists:", !!apiKey);
    console.log("MathWordProblem: Selected model:", selectedModel?.name);
    console.log("MathWordProblem: Local key validated:", localKeyValidated);
    
    // If the context already has a valid key, use it
    if (isApiKeyValid && apiKey) {
      console.log("MathWordProblem: API key is valid in context");
      return true;
    }
    
    // If we've already validated the local key in this session
    if (localKeyValidated) {
      console.log("MathWordProblem: Local key was previously validated in this session");
      return true;
    }
    
    // Otherwise, we need to check localStorage and validate
    console.log("MathWordProblem: No valid key found in context, will need to validate from localStorage");
    return false;
  }, [apiKey, isApiKeyValid, selectedModel, localKeyValidated]);

  // Get the current model to use
  const getCurrentModel = useCallback(() => {
    console.log('MathWordProblem: Getting current model');
    
    // First try to get the model from context
    if (selectedModel) {
      console.log(`MathWordProblem: Using model from context: ${selectedModel.name} (${selectedModel.id})`);
      setCurrentModelUsed(selectedModel);
      return selectedModel;
    }
    
    console.log("MathWordProblem: No model found in context");
    setError('Please select an AI model in the Settings page.');
    return null;
  }, [selectedModel]);

  // Log debug information about API key status
  useEffect(() => {
    const keyStatus = apiKey ? (isApiKeyValid ? 'Valid' : 'Invalid') : 'Missing';
    const localStorageKey = localStorage.getItem('openrouter_api_key');
    const localKeyStatus = localStorageKey ? `Present (${localStorageKey.length} chars)` : 'Missing';
    
    // Get the current model
    const modelToUse = getCurrentModel();
    const modelInfo = modelToUse ? `${modelToUse.name} (${modelToUse.id})` : 'None';
    
    const debugText = `API Key: ${keyStatus}, Valid: ${isApiKeyValid}, Local Key: ${localKeyStatus}, Local Validated: ${localKeyValidated}, Model: ${modelInfo}`;
    setDebugInfo(debugText);
    console.log(`MathWordProblem Debug: ${debugText}`);
    
    // Check if we need to validate a key from localStorage
    const needsValidation = !isApiKeyValid && !localKeyValidated && localStorageKey;
    
    if (needsValidation) {
      console.log("MathWordProblem: API key found in localStorage but not validated, attempting validation");
      forceRevalidateKey().then(isValid => {
        console.log("MathWordProblem: Force validation completed, result:", isValid);
        if (isValid) {
          // If validation succeeded, try generating a problem
          generateWordProblem();
        }
      });
    }
  }, [apiKey, isApiKeyValid, selectedModel, forceRevalidateKey, localKeyValidated, getCurrentModel]);

  // Helper function to get previously generated questions from localStorage
  const getPreviousQuestions = useCallback(() => {
    try {
      const storedQuestions = localStorage.getItem('previous_math_questions');
      if (storedQuestions) {
        const parsed = JSON.parse(storedQuestions);
        // Ensure we always return an array
        if (Array.isArray(parsed)) {
          // Filter out any undefined or null values
          return parsed.filter(question => !!question);
        } else {
          console.warn('previous_math_questions is not an array, returning empty array');
          return [];
        }
      }
    } catch (err) {
      console.error('Error retrieving previous questions:', err);
    }
    return [];
  }, []);
  
  // Helper function to save a new question to localStorage
  const saveQuestion = useCallback((question: string) => {
    try {
      const previousQuestions = getPreviousQuestions();
      
      // Keep only the last 10 questions to avoid localStorage size issues
      const updatedQuestions = [...previousQuestions, question].slice(-10);
      
      localStorage.setItem('previous_math_questions', JSON.stringify(updatedQuestions));
      console.log(`Saved question to history. Now tracking ${updatedQuestions.length} questions.`);
    } catch (err) {
      console.error('Error saving question to history:', err);
    }
  }, [getPreviousQuestions]);
  
  // Check if the new question is too similar to previous ones
  const isTooSimilar = useCallback((newQuestion: string) => {
    if (!newQuestion) {
      console.log("MathWordProblem: New question is undefined, skipping similarity check");
      return false;
    }
    
    const previousQuestions = getPreviousQuestions();
    if (!previousQuestions || previousQuestions.length === 0) {
      return false;
    }
    
    // Check similarity with each previous question
    for (const prevQuestion of previousQuestions) {
      if (!prevQuestion) continue; // Skip undefined previous questions
      
      const similarity = calculateSimilarity(newQuestion, prevQuestion);
      console.log(`MathWordProblem: Similarity with previous question: ${similarity.toFixed(2)}`);
      
      // If similarity is above threshold, consider it too similar
      if (similarity > 0.7) {
        console.log("MathWordProblem: New question is too similar to a previous one");
        return true;
      }
    }
    
    return false;
  }, [getPreviousQuestions]);
  
  // Simple function to calculate text similarity (0-1 scale)
  const calculateSimilarity = (text1: string, text2: string): number => {
    // Ensure both texts are defined
    if (!text1 || !text2) {
      console.log("MathWordProblem: Cannot calculate similarity with undefined text");
      return 0;
    }
    
    // Convert to lowercase and remove punctuation for better comparison
    const normalize = (text: string) => {
      if (!text) return ''; // Handle undefined or null text
      return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    };
    
    const normalizedText1 = normalize(text1);
    const normalizedText2 = normalize(text2);
    
    // Count matching words
    const words1 = normalizedText1.split(/\s+/);
    const words2 = normalizedText2.split(/\s+/);
    
    const wordSet1 = new Set(words1);
    const wordSet2 = new Set(words2);
    
    let matchCount = 0;
    for (const word of wordSet1) {
      if (wordSet2.has(word)) {
        matchCount++;
      }
    }
    
    // Calculate Jaccard similarity
    const union = new Set([...wordSet1, ...wordSet2]).size;
    return union > 0 ? matchCount / union : 0;
  };

  // Generate a new word problem
  const generateWordProblem = async (useBackupModel = false) => {
    console.log(`MathWordProblem: Attempting to generate word problem`);
    
    // Check if we're already loading a problem
    if (isLoading) {
      console.log("MathWordProblem: Already generating a problem, ignoring this call");
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Check if we have a valid key
    const keyValid = isKeyValid();
    console.log("MathWordProblem: Initial key validity check:", keyValid);
    
    // If no valid key in context or local session, try to validate from localStorage
    if (!keyValid) {
      console.log("MathWordProblem: No valid key found, attempting to validate from localStorage");
      const forceValidated = await forceRevalidateKey();
      
      if (!forceValidated) {
        console.log("MathWordProblem: Key validation failed, showing error message");
        setError('Please add your OpenRouter API key in the Settings page.');
        return;
      }
    }
    
    // Get the current model to use
    let modelToUse = getCurrentModel();
    
    console.log(`MathWordProblem: Using model for generation: ${modelToUse?.name} (${modelToUse?.id})`);
    
    // Ensure we have a selected model
    if (!modelToUse) {
      console.log("MathWordProblem: No model selected");
      setError('Please select an AI model in the Settings page.');
      return;
    }
    
    // Get the API key to use (from context or localStorage)
    const keyToUse = apiKey || localStorage.getItem('openrouter_api_key');
    if (!keyToUse) {
      console.log("MathWordProblem: No API key available");
      setError('Please add your OpenRouter API key in the Settings page.');
      return;
    }
    
    console.log(`MathWordProblem: Using API key (length: ${keyToUse.length}) and model: ${modelToUse.name} (${modelToUse.id})`);
    
    // Set a flag in localStorage to indicate we're generating a problem
    localStorage.setItem('generating_problem', 'true');
    
    setIsLoading(true);
    setProblem('');
    setUserAnswer('');
    setIsCorrect(null);
    setExplanation('');
    setHasSubmitted(false);
    setShowNextButton(false);

    try {
      console.log(`MathWordProblem: Generating question with model: ${modelToUse.name} (${modelToUse.id})`);
      
      // Add a small delay before making the API request to avoid rate limiting
      // This is especially important when clicking "Next Problem" button repeatedly
      console.log("MathWordProblem: Adding a short delay before API request to avoid rate limiting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log localStorage state for debugging
      console.log("MathWordProblem: localStorage state:");
      console.log("- selected_ai_model:", localStorage.getItem('selected_ai_model'));
      console.log("- selected_model_details:", localStorage.getItem('selected_model_details'));
      
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
      
      console.log(`MathWordProblem: Using random interests: ${selectedInterests.join(', ')}`);
      
      // Add a timestamp to ensure uniqueness
      const timestamp = Date.now();
      console.log(`MathWordProblem: Request timestamp: ${timestamp}`);
      
      const result = await generateQuestion({
        apiKey: keyToUse,
        model: modelToUse,
        subject: 'math',
        difficulty,
        gradeLevel,
        questionType: 'word-problem',
        interests: selectedInterests
      });

      console.log("MathWordProblem: Question generated successfully");
      
      // Log the result structure to help diagnose issues
      console.log("MathWordProblem: Result structure:", Object.keys(result));
      console.log("MathWordProblem: Question content:", result.question);
      console.log("MathWordProblem: Correct answer:", result.correctAnswer);
      
      // Validate the result object
      if (!result) {
        console.error("MathWordProblem: Generated result is undefined");
        
        setError('Failed to generate a question. Please try again.');
        setIsLoading(false);
        return;
      }
      
      if (!result.question) {
        console.error("MathWordProblem: Generated question is undefined");
        console.error("MathWordProblem: Full result:", JSON.stringify(result, null, 2));
        
        setError('Failed to generate a valid question. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Check if the question is too similar to previous ones
      if (isTooSimilar(result.question)) {
        console.log("MathWordProblem: Generated question is too similar to a previous one");
        
        // If we've already retried a few times, just use this question to avoid infinite loops
        if (retryCount >= 2) {
          console.log(`MathWordProblem: Reached retry limit (${retryCount}), using this question anyway`);
          console.log("MathWordProblem: Setting problem state to:", result.question);
          setProblem(result.question);
          problemRef.current = result.question;
          setExplanation(result.explanation);
          saveQuestion(result.question);
          setRetryCount(0);
        } else {
          // Try generating a new question
          console.log(`MathWordProblem: Retrying question generation (attempt ${retryCount + 1})`);
          setRetryCount(prev => prev + 1);
          setIsLoading(false);
          generateWordProblem();
          return;
        }
      } else {
        // Question is unique enough, use it
        console.log("MathWordProblem: Setting problem state to:", result.question);
        setProblem(result.question);
        problemRef.current = result.question;
        setExplanation(result.explanation);
        saveQuestion(result.question);
        setRetryCount(0);
        
        // Force a re-render with the new problem
        setTimeout(() => {
          console.log("MathWordProblem: Checking if problem state was updated:", problem);
          console.log("MathWordProblem: Problem ref value:", problemRef.current);
          if (!problem && problemRef.current) {
            console.log("MathWordProblem: Problem state not updated, forcing update");
            setProblem(problemRef.current);
          }
        }, 100);
      }
      
      // Store the correct answer for later comparison
      localStorage.setItem('currentCorrectAnswer', result.correctAnswer.toString());
      
      playSound('success');
      setQuestionCount(prev => prev + 1);
    } catch (err: any) {
      console.error('MathWordProblem: Error generating word problem:', err);
      
      // Provide more specific error messages based on the error
      if (err.message?.includes('API key')) {
        setError('Invalid API key. Please check your OpenRouter API key in the Settings page.');
      } else if (err.message?.includes('rate limit') || err.status === 429) {
        setError('Rate limit exceeded. Please try again in a few minutes.');
      } else if (err.message?.includes('model')) {
        setError(`Model error: ${err.message}. Please try selecting a different model in Settings.`);
      } else if (err.message?.includes('Invalid API response format')) {
        console.error('MathWordProblem: Invalid API response format:', err);
        
        setError('The AI service returned an invalid response. Please try again later or select a different model in Settings.');
      } else if (err.message?.includes('Cannot read properties of undefined')) {
        console.error('MathWordProblem: Undefined property error:', err);
        
        setError('There was an error with the AI response. Please try again later or select a different model in Settings.');
      } else if (err.message?.includes('Empty API response')) {
        console.error('MathWordProblem: Empty API response:', err);
        
        setError('The AI service returned an empty response. Please try again later or select a different model in Settings.');
      } else {
        setError(`Error: ${err.message || 'Failed to generate word problem'}`);
      }
      
      playSound('error');
    } finally {
      setIsLoading(false);
      // Clear the generating flag
      localStorage.removeItem('generating_problem');
      
      // Log the final state after generation
      console.log("MathWordProblem: Generation completed. Final states:");
      console.log("- problem:", problem);
      console.log("- problemRef:", problemRef.current);
      console.log("- isLoading:", isLoading);
      console.log("- error:", error);
      
      // Force a re-render to ensure the UI updates
      setTimeout(() => {
        console.log("MathWordProblem: Forcing re-render check. Current problem state:", problem);
        console.log("MathWordProblem: Current problem ref:", problemRef.current);
        if (!problem && problemRef.current) {
          console.log("MathWordProblem: Problem state is empty but ref has value, updating state");
          setProblem(problemRef.current);
        }
      }, 500);
    }
  };

  // Check the user's answer
  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setError('Please enter an answer.');
      return;
    }

    const correctAnswer = localStorage.getItem('currentCorrectAnswer');
    if (!correctAnswer) {
      setError('Something went wrong. Please try again.');
      return;
    }

    // Compare answers (normalize to handle different formats)
    const normalizedUserAnswer = userAnswer.trim().replace(/^0+/, '');
    const normalizedCorrectAnswer = correctAnswer.trim().replace(/^0+/, '');
    
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setHasSubmitted(true);
    setShowNextButton(true);
    
    if (isAnswerCorrect) {
      playSound('correct');
      setScore(prev => prev + 1);
      // Show confetti animation for correct answers
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } else {
      playSound('incorrect');
    }
  };

  // Generate a new problem when the component mounts
  useEffect(() => {
    // Create a flag to track if we've already attempted to generate a problem
    const hasAttemptedGeneration = localStorage.getItem('has_attempted_generation');
    // Check if a problem is already being generated
    const isGeneratingProblem = localStorage.getItem('generating_problem');
    
    console.log("MathWordProblem: Component mounted, checking if we need to generate a problem");
    console.log("MathWordProblem: Has attempted generation:", hasAttemptedGeneration);
    console.log("MathWordProblem: Is generating problem:", isGeneratingProblem);
    
    // Always clear these flags on mount to ensure we can generate a new problem
    localStorage.removeItem('has_attempted_generation');
    localStorage.removeItem('generating_problem');
    
    // Wait a moment to ensure context is fully initialized
    const timer = setTimeout(async () => {
      console.log("MathWordProblem: Initial problem generation");
      
      // Check if we have a valid key before attempting to generate
      const keyValid = isKeyValid();
      if (!keyValid) {
        const storedKey = localStorage.getItem('openrouter_api_key');
        if (!storedKey) {
          console.log("MathWordProblem: No API key found, showing error message");
          setError('Please add your OpenRouter API key in the Settings page.');
          return;
        }
        
        // Try to validate the key
        const isValid = await forceRevalidateKey();
        if (!isValid) {
          console.log("MathWordProblem: Key validation failed, showing error message");
          setError('Please add a valid OpenRouter API key in the Settings page.');
          return;
        }
      }
      
      // Always generate a problem on mount
      generateWordProblem();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      // Clear the generation flag when component unmounts
      localStorage.removeItem('has_attempted_generation');
      localStorage.removeItem('generating_problem');
    };
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setUserAnswer(value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkAnswer();
  };
  
  // Cleanup function to ensure all flags are cleared when component unmounts
  useEffect(() => {
    return () => {
      // Clear all flags when component unmounts
      localStorage.removeItem('has_attempted_generation');
      localStorage.removeItem('generating_problem');
      console.log("MathWordProblem: Cleaned up all flags on unmount");
    };
  }, []);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      {/* Show confetti animation when answer is correct */}
      {showConfetti && <ConfettiAnimation />}
      
      {/* Header with score */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-nunito font-bold text-charcoal">
          Math Word Problems
        </h2>
        <div className="text-lg font-medium">
          Score: {score}/{questionCount}
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mb-4"></div>
          <p className="text-lg">Generating a new word problem...</p>
        </div>
      ) : (
        <>
          {/* Word problem */}
          {problem || problemRef.current ? (
            <div className="mb-6">
              <CharacterGuide 
                message={problem || problemRef.current} 
                emotion="thinking"
              />
              
              {/* Direct display of the problem text */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Problem:</h3>
                <p className="text-lg">{problem || problemRef.current}</p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600">No problem generated yet. Please check your API key in Settings.</p>
            </div>
          )}
          
          {/* Answer input form */}
          {(problem || problemRef.current) && (
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                <label htmlFor="answer" className="block text-lg font-medium mb-2">
                  Your Answer:
                </label>
                <input
                  type="text"
                  id="answer"
                  value={userAnswer}
                  onChange={handleInputChange}
                  disabled={hasSubmitted || isGeneratingFeedback}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-primary-blue focus:outline-none"
                  placeholder="Type your answer here..."
                />
              </div>
              
              {!hasSubmitted && (
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={!userAnswer.trim() || isGeneratingFeedback}
                  className="w-full"
                >
                  {isGeneratingFeedback ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Checking...
                    </span>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              )}
            </form>
          )}
          
          {/* Feedback */}
          <AnimatePresence>
            {hasSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg mb-6 ${
                  isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                } border-2`}
              >
                <h3 className={`text-xl font-bold mb-2 ${
                  isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                </h3>
                <div className="whitespace-pre-line text-gray-800">
                  {explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 p-4 rounded-lg mb-6">
              <p className="text-red-700">{error}</p>
              {error.includes('API key') && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={forceRevalidateKey}
                  className="mt-2"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}
          
          {/* Next problem button */}
          {showNextButton && (
            <Button
              variant="secondary"
              size="large"
              onClick={handleNextProblem}
              disabled={isNextButtonDisabled || isLoading}
              className="w-full"
            >
              {isNextButtonDisabled || isLoading ? 'Generating...' : 'Next Problem'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}; 