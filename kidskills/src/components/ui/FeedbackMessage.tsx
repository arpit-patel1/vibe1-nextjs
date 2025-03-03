'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeedbackMessageProps {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  onContinue?: () => void;
  buttonText?: string;
}

export default function FeedbackMessage({ 
  isCorrect, 
  message, 
  explanation, 
  onContinue, 
  buttonText = "Continue" 
}: FeedbackMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`mt-6 p-4 rounded-lg border-2 ${
        isCorrect 
          ? 'bg-green-50 border-green-500 text-green-800' 
          : 'bg-red-50 border-red-500 text-red-800'
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3 flex-shrink-0">
          {isCorrect ? (
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">
            {isCorrect ? 'Great job!' : 'Nice try!'}
          </h3>
          <p className="text-sm mb-2">{message}</p>
          {explanation && <p className="text-sm italic">{explanation}</p>}
        </div>
      </div>
      
      {onContinue && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      )}
    </motion.div>
  );
} 