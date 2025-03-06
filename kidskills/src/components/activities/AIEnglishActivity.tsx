'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/contexts/AIContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useAudio } from '@/contexts/AudioContext';
import { AIGeneratedQuestion } from '@/types/ai';
import { generateQuestion } from '@/utils/ai';
import { generateAIQuestion } from '@/utils/aiQuestionGenerator';
import ConfettiAnimation from '../animations/ConfettiAnimation';
import LoadingSpinner from '../ui/LoadingSpinner';
import FeedbackMessage from '../ui/FeedbackMessage';
import APIKeyPrompt from '../settings/APIKeyPrompt';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useCharacter } from '@/contexts/CharacterContext';
import { ActivityProps } from '@/types/activities';
import QuestionHeader from '../common/QuestionHeader';
import OptionButton from '../common/OptionButton';
import ProgressBar from '../common/ProgressBar';
import { CharacterGuide } from '../common/CharacterGuide';
import { getRandomItem } from '@/utils/random';

interface AIEnglishActivityProps {
  activityId: string;
  initialQuestion?: string;
  initialOptions?: Array<{ id: string; text: string; isCorrect: boolean }>;
  initialExplanation?: string;
}

const AIEnglishActivity: React.FC<ActivityProps> = ({ 
  activityId,
  title, 
  subject, 
  exerciseType = 'grammar',
  content, 
  nextActivities 
}) => {
  const router = useRouter();
  const { apiKey, selectedModel, isApiKeyValid } = useAI();
  const { updateProgress, getUserInterests, getGradeLevel } = useUserProgress();
  const { playSound } = useAudio();
  const { preferences } = usePreferences();
  const { getActivityProgress } = useProgress();
  const { character, getCharacterReaction } = useCharacter();
  
  // State for the current question
  const [currentQuestion, setCurrentQuestion] = useState<AIGeneratedQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [readingPassage, setReadingPassage] = useState<string | null>(null);
  const [isReadingComprehension, setIsReadingComprehension] = useState(false);
  
  // Get user data
  const userInterests = getUserInterests();
  const gradeLevel = getGradeLevel();

  // Determine the exercise type based on the activity ID
  const getExerciseType = useCallback(() => {
    if (activityId === 'english-2') return 'grammar';
    if (activityId === 'english-3') return 'reading';
    if (activityId === 'english-4') return 'vocabulary';
    return exerciseType || 'grammar';
  }, [activityId, exerciseType]);
  
  // Function to generate a new question
  const generateNextQuestion = useCallback(async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowFeedback(false);
    
    const currentExerciseType = getExerciseType();
    setIsReadingComprehension(currentExerciseType === 'reading');
    
    // Get previous performance for adaptive difficulty
    const progress = getActivityProgress(activityId);
    const previousPerformance = progress?.score || 50;
    
    // Generate parameters based on exercise type
    let additionalParams: Record<string, any> = {};
    
    if (currentExerciseType === 'grammar') {
      // For grammar questions, randomly select a grammar type
      const grammarTypes = [
        'punctuation', 
        'verb-tense', 
        'subject-verb-agreement', 
        'pronouns', 
        'articles', 
        'prepositions', 
        'sentence-structure', 
        'general'
      ];
      additionalParams = {
        grammarType: getRandomItem(grammarTypes),
        keepSentencesShort: Math.random() > 0.5,
        randomSeed: Math.floor(Math.random() * 10000),
        temperature: 0.7 + (Math.random() * 0.3)
      };
    } else if (currentExerciseType === 'reading') {
      // For reading comprehension, randomly select a reading topic
      const readingTopics = ['animals', 'space', 'adventure', 'general'];
      additionalParams = {
        readingTopic: getRandomItem(readingTopics),
        includePassage: true,
        randomSeed: Math.floor(Math.random() * 10000),
        temperature: 0.7 + (Math.random() * 0.3)
      };
    } else if (currentExerciseType === 'vocabulary') {
      // For vocabulary questions
      additionalParams = {
        randomSeed: Math.floor(Math.random() * 10000),
        temperature: 0.7 + (Math.random() * 0.3)
      };
    }
    
    try {
      let question;
      
      // Use local generation if API key is invalid or not available
      if (!isApiKeyValid || !apiKey) {
        console.log('Using local question generation (no valid API key)');
        question = await generateAIQuestion({
          subject: 'english',
          questionType: currentExerciseType,
          difficulty: preferences.difficulty,
          gradeLevel: preferences.gradeLevel,
          previousPerformance,
          interests: preferences.interests,
          additionalParams
        });
      } else {
        // Try to use the API first
        try {
          console.log('Attempting to generate question via API');
          question = await generateQuestion({
            apiKey: apiKey,
            model: selectedModel,
            subject: 'english',
            questionType: currentExerciseType,
            difficulty: preferences.difficulty,
            gradeLevel: preferences.gradeLevel,
            previousPerformance,
            interests: preferences.interests,
            additionalParams
          });
        } catch (apiError) {
          console.error('API question generation failed, falling back to local:', apiError);
          // Fall back to local generation if API fails
          question = await generateAIQuestion({
            subject: 'english',
            questionType: currentExerciseType,
            difficulty: preferences.difficulty,
            gradeLevel: preferences.gradeLevel,
            previousPerformance,
            interests: preferences.interests,
            additionalParams
          });
        }
      }
      
      setCurrentQuestion(question);
      
      // Set reading passage if available
      if (question && question.readingPassage) {
        setReadingPassage(question.readingPassage);
      } else {
        setReadingPassage(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating question:', error);
      setLoading(false);
    }
  }, [activityId, getActivityProgress, preferences, getExerciseType, apiKey, isApiKeyValid, selectedModel]);
  
  // Load initial question
  useEffect(() => {
    generateNextQuestion();
  }, [generateNextQuestion]);
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Prevent selecting during feedback
    
    setSelectedOption(optionId);
    
    // Find the selected option
    const option = currentQuestion?.options?.find(opt => opt.id === optionId);
    const correct = option?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update progress
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    
    setQuestionsAnswered(prev => prev + 1);
  };
  
  // Handle continuing to the next question or completing the activity
  const handleContinue = () => {
    if (questionsAnswered >= 5) {
      // Activity completed
      const score = Math.round((correctAnswers / questionsAnswered) * 100);
      updateProgress(activityId, { completed: true, score });
      
      // Navigate to the next activity if available
      if (nextActivities && nextActivities.length > 0) {
        const nextActivity = nextActivities[0];
        router.push(`/activities/${nextActivity}`);
      } else {
        router.push('/dashboard');
      }
    } else {
      // Generate next question
      generateNextQuestion();
    }
  };
  
  // Get character reaction based on correctness
  const getReaction = () => {
    if (isCorrect === null) return null;
    return getCharacterReaction(isCorrect);
  };
  
  // Get feedback message
  const getFeedbackMessage = () => {
    if (isCorrect === null) return '';
    
    if (isCorrect) {
      return 'Great job! That\'s correct!';
    } else {
      // Find the correct option
      const correctOption = currentQuestion?.options?.find(opt => opt.isCorrect);
      return `Not quite. The correct answer is: ${correctOption?.text}`;
    }
  };
  
  // Get explanation
  const getExplanation = () => {
    return currentQuestion?.explanation || '';
  };
  
  // Show API key prompt if no valid key
  if (!isApiKeyValid && !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
        <p className="mb-6 text-center">
          To use AI-generated questions, you need to set up an OpenRouter API key. 
          However, you can still continue with pre-generated questions.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => generateNextQuestion()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continue with Pre-generated Questions
          </button>
          <APIKeyPrompt />
        </div>
      </div>
    );
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-lg">Generating your English question...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {showConfetti && <ConfettiAnimation />}
      
      <div className="w-full mb-6">
        <ProgressBar 
          current={questionsAnswered} 
          total={5} 
          label={`Question ${questionsAnswered + 1} of 5`} 
        />
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Generating your question...</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Reading passage for reading comprehension questions */}
          {isReadingComprehension && readingPassage && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-3">Reading Passage</h3>
              <div className="prose max-w-none">
                {readingPassage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          
          <QuestionHeader 
            title={isReadingComprehension ? "Reading Comprehension" : "Grammar Challenge"} 
            question={currentQuestion?.question || ''} 
          />
          
          <div className="grid grid-cols-1 gap-4 mt-6">
            {currentQuestion?.options?.map(option => (
              <OptionButton
                key={option.id}
                id={option.id}
                text={option.text}
                selected={selectedOption === option.id}
                correct={showFeedback ? option.isCorrect : undefined}
                onClick={() => handleOptionSelect(option.id)}
                disabled={showFeedback}
              />
            ))}
          </div>
          
          {showFeedback && (
            <FeedbackMessage
              isCorrect={isCorrect || false}
              message={getFeedbackMessage()}
              explanation={getExplanation()}
              onContinue={handleContinue}
              buttonText={questionsAnswered >= 5 ? "Complete Activity" : "Next Question"}
            />
          )}
        </div>
      )}
      
      <div className="mt-8">
        <CharacterGuide
          character={character}
          reaction={getReaction()}
          hint={currentQuestion?.hint}
          showHint={selectedOption !== null && !isCorrect}
        />
      </div>
    </div>
  );
};

export default AIEnglishActivity; 