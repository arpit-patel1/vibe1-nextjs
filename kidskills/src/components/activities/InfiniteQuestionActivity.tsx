'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { generateRandomQuestion, getQuestionTypeFromActivityId, QuestionType } from '@/utils/questionGenerator';
import { useAudio } from '@/contexts/AudioContext';

// Animation types
type AnimationType = 'confetti' | 'hearts' | 'snowflakes' | 'balloons';

interface InfiniteQuestionActivityProps {
  activityId: string;
  initialQuestion: string;
  initialOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  initialExplanation: string;
}

export const InfiniteQuestionActivity = ({
  activityId,
  initialQuestion,
  initialOptions,
  initialExplanation,
}: InfiniteQuestionActivityProps) => {
  const { playSound } = useAudio();
  const [questionType, setQuestionType] = useState<QuestionType>(
    getQuestionTypeFromActivityId(activityId)
  );
  
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
      const correct = checkCorrectness();
      setIsCorrect(correct);
      setHasSubmitted(true);
      
      if (correct) {
        playSound('correct-answer.mp3', 'sfx');
        setScore(prev => prev + 1);
        setStreak(prev => prev + 1);
        
        // Set random animation type
        setAnimationType(getRandomAnimationType());
        setShowAnimation(true);
        
        // Automatically move to next question after a delay
        setTimeout(() => {
          generateNextQuestion();
        }, 2000);
      } else {
        playSound('incorrect-answer.mp3', 'sfx');
        setStreak(0);
      }
    }
  };
  
  // Generate the next question
  const generateNextQuestion = () => {
    const newQuestion = generateRandomQuestion(questionType);
    setQuestion(newQuestion.question);
    setOptions(newQuestion.options);
    setExplanation(newQuestion.explanation);
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowAnimation(false);
    setQuestionCount(prev => prev + 1);
  };
  
  // Handle try again
  const handleTryAgain = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
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
      {renderAnimation()}
      
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
          <h2 className="text-2xl font-nunito font-bold text-charcoal mb-6">
            {question}
          </h2>
          
          {/* Options */}
          <div className="space-y-4 mb-8">
            {options.map((option) => (
              <motion.div
                key={`${question}-${option.id}`}
                whileHover={{ scale: hasSubmitted ? 1 : 1.02 }}
                whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}
                className={`
                  p-4 rounded-lg cursor-pointer border-2 transition-all
                  ${selectedOption === option.id ? 'border-primary-blue' : 'border-gray-200'}
                  ${hasSubmitted && selectedOption === option.id && option.isCorrect ? 'bg-green-100 border-green-500' : ''}
                  ${hasSubmitted && selectedOption === option.id && !option.isCorrect ? 'bg-red-100 border-red-500' : ''}
                  ${hasSubmitted && option.isCorrect && selectedOption !== option.id ? 'bg-green-50 border-green-300' : ''}
                  ${hasSubmitted ? (option.isCorrect ? 'border-green-500' : '') : 'hover:border-primary-blue/50'}
                `}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full mr-3 flex items-center justify-center
                    ${selectedOption === option.id ? 'bg-primary-blue text-white' : 'bg-gray-200'}
                    ${hasSubmitted && option.isCorrect ? 'bg-green-500 text-white' : ''}
                    ${hasSubmitted && selectedOption === option.id && !option.isCorrect ? 'bg-red-500 text-white' : ''}
                  `}>
                    {String.fromCharCode(65 + options.indexOf(option))}
                  </div>
                  <span className="text-lg">{option.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Explanation */}
      <AnimatePresence>
        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? 'Great job! 🎉' : 'Not quite right 🤔'}
            </h3>
            <p>{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Action buttons */}
      <div className="flex justify-center space-x-4">
        {!hasSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedOption}
            variant="primary"
            size="large"
          >
            Check Answer
          </Button>
        ) : (
          <>
            {!isCorrect && (
              <Button 
                onClick={handleTryAgain} 
                variant="secondary"
                size="large"
              >
                Try Again
              </Button>
            )}
            <Button 
              onClick={generateNextQuestion} 
              variant="primary"
              size="large"
            >
              Next Question
            </Button>
          </>
        )}
      </div>
    </div>
  );
}; 