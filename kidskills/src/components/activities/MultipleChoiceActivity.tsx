'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceActivityProps {
  question: string;
  options: Option[];
  explanation: string;
  onComplete: (success: boolean) => void;
}

export const MultipleChoiceActivity = ({
  question,
  options,
  explanation,
  onComplete,
}: MultipleChoiceActivityProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const isCorrect = selectedOption 
    ? options.find(option => option.id === selectedOption)?.isCorrect 
    : false;
  
  const handleOptionSelect = (optionId: string) => {
    if (!hasSubmitted) {
      setSelectedOption(optionId);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption) {
      setHasSubmitted(true);
      // Wait a moment before showing explanation
      setTimeout(() => {
        setShowExplanation(true);
        onComplete(isCorrect || false);
      }, 1000);
    }
  };
  
  const handleTryAgain = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowExplanation(false);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-nunito font-bold text-charcoal mb-6">
        {question}
      </h2>
      
      <div className="space-y-4 mb-8">
        {options.map((option) => (
          <motion.div
            key={option.id}
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
      
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
        >
          <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? 'Great job! 🎉' : 'Not quite right 🤔'}
          </h3>
          <p>{explanation}</p>
        </motion.div>
      )}
      
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
              onClick={() => onComplete(isCorrect || false)} 
              variant="primary"
              size="large"
            >
              {isCorrect ? 'Continue' : 'Next Activity'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}; 