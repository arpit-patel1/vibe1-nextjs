'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { QuestionType } from '@/utils/questionGenerator';
import { generateAIQuestion, AIQuestionParams } from '@/utils/aiQuestionGenerator';
import { useAudio } from '@/contexts/AudioContext';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import ConfettiAnimation from '@/components/animations/ConfettiAnimation';

// Animation types
type AnimationType = 'confetti' | 'hearts' | 'snowflakes' | 'balloons';

interface AIEnhancedActivityProps {
  activityId: string;
  initialQuestion: string;
  initialOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  initialExplanation: string;
  subject: string;
  isAINative?: boolean;
  aiQuestionType?: string;
  gradeLevel?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
}

export const AIEnhancedActivity = ({
  activityId,
  initialQuestion,
  initialOptions,
  initialExplanation,
  subject,
  isAINative = false,
  aiQuestionType = '',
  gradeLevel = 2,
  difficulty = 'easy',
}: AIEnhancedActivityProps) => {
  const { playSound } = useAudio();
  const { userProgress, updateProgress, generateAIRecommendations } = useUserProgress();
  
  // Get question type from activity ID
  const getQuestionTypeFromId = (id: string): QuestionType => {
    if (id.includes('math-1')) return 'addition';
    if (id.includes('math-2')) return 'subtraction';
    if (id.includes('math-3')) return 'multiplication';
    if (id.includes('math-4')) return 'division';
    return 'addition';
  };
  
  const [questionType, setQuestionType] = useState<QuestionType>(
    getQuestionTypeFromId(activityId)
  );
  
  // Add state for difficulty that initializes from the prop
  const [currentDifficulty, setDifficulty] = useState<string>(difficulty);
  
  const [question, setQuestion] = useState(initialQuestion);
  const [options, setOptions] = useState(initialOptions);
  const [explanation, setExplanation] = useState(initialExplanation);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState<AnimationType>('confetti');
  const [questionCount, setQuestionCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);
  
  // User interests (in a real app, this would come from user preferences)
  const [interests, setInterests] = useState<string[]>(['sports', 'animals', 'music']);
  
  // Load AI recommendations when component mounts
  useEffect(() => {
    if (userProgress.aiRecommendations?.personalizedTips) {
      setPersonalizedTips(userProgress.aiRecommendations.personalizedTips);
    }
    
    // Set difficulty based on AI recommendations
    if (userProgress.aiRecommendations?.difficultyAdjustment) {
      switch (userProgress.aiRecommendations.difficultyAdjustment) {
        case 'advanced':
          setDifficulty('advanced');
          break;
        case 'simplified':
          setDifficulty('beginner');
          break;
        default:
          setDifficulty('intermediate');
      }
    }
    
    // Start timer for response time tracking
    setStartTime(Date.now());
    
    // Generate first question if AI-native
    if (isAINative) {
      generateNextQuestion();
    }
  }, [userProgress]);
  
  // Check if the selected option is correct
  const checkCorrectness = () => {
    if (!selectedOption) return false;
    return options.find(option => option.id === selectedOption)?.isCorrect || false;
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!hasSubmitted) {
      setSelectedOption(optionId);
    }
  };
  
  // Get random animation type
  const getRandomAnimationType = (): AnimationType => {
    const animations: AnimationType[] = ['confetti', 'hearts', 'snowflakes', 'balloons'];
    return animations[Math.floor(Math.random() * animations.length)];
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (selectedOption) {
      // Calculate response time
      const endTime = Date.now();
      const timeSpent = (endTime - startTime) / 1000; // in seconds
      setResponseTime(timeSpent);
      
      const correct = checkCorrectness();
      setIsCorrect(correct);
      setHasSubmitted(true);
      
      if (correct) {
        playSound('correct-answer.mp3', 'sfx');
        setScore(prev => prev + 1);
        setStreak(prev => prev + 1);
        
        // Always use confetti animation and ensure it's visible
        setAnimationType('confetti');
        setShowAnimation(true);
        
        // Update user progress
        updateProgress(activityId, score + 1, true, timeSpent, []);
      } else {
        playSound('incorrect-answer.mp3', 'sfx');
        setStreak(0);
        
        // Track the mistake
        const wrongOptionText = options.find(opt => opt.id === selectedOption)?.text || '';
        const correctOptionText = options.find(opt => opt.isCorrect)?.text || '';
        const mistakeInfo = `${question} - Selected: ${wrongOptionText}, Correct: ${correctOptionText}`;
        setMistakes(prev => [...prev, mistakeInfo]);
        
        // Update user progress with mistake
        updateProgress(activityId, score, false, timeSpent, [mistakeInfo]);
        
        // Show a personalized tip if available
        if (personalizedTips.length > 0) {
          const randomTip = personalizedTips[Math.floor(Math.random() * personalizedTips.length)];
          setCurrentTip(randomTip);
          setShowTip(true);
          
          // Hide tip after 5 seconds
          setTimeout(() => {
            setShowTip(false);
          }, 5000);
        }
      }
    }
  };
  
  // Generate the next question using AI
  const generateNextQuestion = async () => {
    setIsLoading(true);
    
    try {
      // Prepare parameters for AI question generation
      const params: AIQuestionParams = {
        subject,
        difficulty: currentDifficulty,
        questionType: isAINative ? aiQuestionType : questionType,
        gradeLevel,
        previousPerformance: {
          correctAnswers: score,
          totalQuestions: questionCount,
          mistakePatterns: mistakes,
        },
        interests,
      };
      
      // Generate question using AI
      const newQuestion = await generateAIQuestion(params);
      
      // Update state with new question
      setQuestion(newQuestion.question);
      setOptions(newQuestion.options || []);
      setExplanation(newQuestion.explanation || '');
      setSelectedOption(null);
      setHasSubmitted(false);
      setShowAnimation(false);
      setQuestionCount(prev => prev + 1);
      
      // Reset timer for next question
      setStartTime(Date.now());
      
      // Adjust difficulty based on performance
      if (questionCount % 5 === 0) {
        if (score / questionCount > 0.8 && currentDifficulty !== 'advanced') {
          setDifficulty(prev => prev === 'beginner' ? 'intermediate' : 'advanced');
        } else if (score / questionCount < 0.4 && currentDifficulty !== 'beginner') {
          setDifficulty(prev => prev === 'advanced' ? 'intermediate' : 'beginner');
        }
        
        // Generate new AI recommendations every 5 questions
        generateAIRecommendations();
      }
    } catch (error) {
      console.error('Failed to generate AI question:', error);
      // Fallback to a simple question if AI generation fails
      setQuestion('What is 2 + 2?');
      setOptions([
        { id: 'a', text: '4', isCorrect: true },
        { id: 'b', text: '3', isCorrect: false },
        { id: 'c', text: '5', isCorrect: false },
        { id: 'd', text: '6', isCorrect: false },
      ]);
      setExplanation('2 + 2 = 4');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle try again
  const handleTryAgain = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowTip(false);
    // Reset timer for retry
    setStartTime(Date.now());
  };
  
  // Add a new function to handle moving to the next question
  const handleNextQuestion = () => {
    // Hide any animations
    setShowAnimation(false);
    // Generate the next question
    generateNextQuestion();
  };
  
  // Render confetti animation
  const renderConfetti = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 100 }).map((_, i) => {
          const size = Math.random() * 10 + 5;
          const color = [
            'bg-primary-blue',
            'bg-green-500',
            'bg-yellow-400',
            'bg-red-500',
            'bg-purple-500',
          ][Math.floor(Math.random() * 5)];
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${color}`}
              style={{
                width: size,
                height: size,
                top: '-5%',
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['0vh', `${100 + Math.random() * 20}vh`],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
            />
          );
        })}
      </div>
    );
  };
  
  // Render hearts animation
  const renderHearts = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 15 + 10;
          const color = [
            'text-red-500',
            'text-pink-500',
            'text-rose-400',
            'text-red-400',
            'text-pink-400',
          ][Math.floor(Math.random() * 5)];
          
          return (
            <motion.div
              key={i}
              className={`absolute ${color} text-${Math.floor(size)}px`}
              style={{
                fontSize: size,
                top: '100%',
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['0vh', `-${100 + Math.random() * 50}vh`],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 360],
                scale: [1, Math.random() * 0.5 + 0.8],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
            >
              ❤️
            </motion.div>
          );
        })}
      </div>
    );
  };
  
  // Render snowflakes animation
  const renderSnowflakes = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 70 }).map((_, i) => {
          const size = Math.random() * 12 + 8;
          
          return (
            <motion.div
              key={i}
              className="absolute text-white"
              style={{
                fontSize: size,
                top: '-5%',
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['0vh', `${100 + Math.random() * 20}vh`],
                x: [0, (Math.random() - 0.5) * 100],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                ease: 'linear',
                delay: Math.random() * 0.5,
              }}
            >
              ❄️
            </motion.div>
          );
        })}
      </div>
    );
  };
  
  // Render balloons animation
  const renderBalloons = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 20 + 15;
          const balloon = ['🎈', '🎊', '🎉', '🎁'][Math.floor(Math.random() * 4)];
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                fontSize: size,
                bottom: '-10%',
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['0vh', `-${100 + Math.random() * 50}vh`],
                x: [0, (Math.random() - 0.5) * 150],
                rotate: [0, Math.random() * 360],
                scale: [1, Math.random() * 0.3 + 0.9],
              }}
              transition={{
                duration: Math.random() * 4 + 2,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
            >
              {balloon}
            </motion.div>
          );
        })}
      </div>
    );
  };
  
  // Render the selected animation
  const renderAnimation = () => {
    if (!showAnimation) return null;
    
    switch (animationType) {
      case 'confetti':
        return renderConfetti();
      case 'hearts':
        return renderHearts();
      case 'snowflakes':
        return renderSnowflakes();
      case 'balloons':
        return renderBalloons();
      default:
        return renderConfetti();
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto relative">
      {/* Ensure confetti is always rendered when showAnimation is true and answer is correct */}
      {isCorrect && showAnimation && <ConfettiAnimation />}
      {showAnimation && animationType !== 'confetti' && renderAnimation()}
      
      {/* AI Difficulty Badge */}
      <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
        AI • {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
      </div>
      
      {/* Score display */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-primary-blue text-white px-4 py-2 rounded-full">
          Score: {score}
        </div>
        <div className="bg-yellow-400 text-charcoal px-4 py-2 rounded-full">
          Question: {questionCount}
        </div>
        <div className="bg-green-500 text-white px-4 py-2 rounded-full">
          Streak: {streak}
        </div>
      </div>
      
      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-nunito font-bold text-charcoal mb-2">Question:</h3>
            <p className="text-lg">{question}</p>
          </div>
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <motion.button
                key={option.id}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedOption === option.id
                    ? hasSubmitted
                      ? option.isCorrect
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : 'bg-blue-100 border-blue-500'
                    : hasSubmitted && option.isCorrect
                    ? 'bg-green-100 border-green-500'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => handleOptionSelect(option.id)}
                whileHover={{ scale: selectedOption ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={hasSubmitted}
              >
                <span className="font-semibold">{option.id.toUpperCase()}.</span> {option.text}
                {hasSubmitted && option.isCorrect && (
                  <span className="ml-2 text-green-600">✓</span>
                )}
                {hasSubmitted && selectedOption === option.id && !option.isCorrect && (
                  <span className="ml-2 text-red-600">✗</span>
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Feedback */}
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`p-4 rounded-lg mb-6 ${
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <h4 className="font-bold mb-1">
                {isCorrect ? 'Correct! 🎉' : 'Not quite right. 🤔'}
              </h4>
              <p>{explanation}</p>
            </motion.div>
          )}
          
          {/* AI Tip */}
          {showTip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-lg mb-6 bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            >
              <h4 className="font-bold mb-1">AI Tip 💡</h4>
              <p>{currentTip}</p>
            </motion.div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-center">
            {!hasSubmitted ? (
              <Button
                variant="primary"
                size="large"
                onClick={handleSubmit}
                disabled={!selectedOption || isLoading}
              >
                {isLoading ? 'Loading...' : 'Submit Answer'}
              </Button>
            ) : (
              <div className="flex space-x-4">
                {!isCorrect && (
                  <Button variant="secondary" size="large" onClick={handleTryAgain}>
                    Try Again
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleNextQuestion}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Next Question'}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Character Guide with AI tips */}
      <CharacterGuide
        message={
          hasSubmitted && !isCorrect
            ? "Don't worry! Everyone makes mistakes. Try again and you'll get it!"
            : "I'm your AI learning assistant! I'll adapt questions to help you learn better."
        }
      />
    </div>
  );
}; 