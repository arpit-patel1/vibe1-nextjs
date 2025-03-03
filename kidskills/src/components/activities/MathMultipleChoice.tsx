import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, MultipleChoiceContent, MultipleChoiceOption } from '@/types';
import { Button } from '@/components/common/Button';
import { FeedbackDisplay } from '@/components/feedback/FeedbackDisplay';
import { useUserProgress } from '@/contexts/UserProgressContext';

interface MathMultipleChoiceProps {
  activity: Activity;
  onComplete: () => void;
}

export const MathMultipleChoice = ({ activity, onComplete }: MathMultipleChoiceProps) => {
  const { updateCompletedActivity } = useUserProgress();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Cast the content to MultipleChoiceContent
  const content = activity.content as MultipleChoiceContent;
  
  // Handle option selection
  const handleOptionSelect = (option: MultipleChoiceOption) => {
    setSelectedOption(option.id);
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (!selectedOption) return;
    
    // Find the selected option
    const option = content.options.find(opt => opt.id === selectedOption);
    
    if (option) {
      const correct = option.isCorrect;
      setIsCorrect(correct);
      
      // Set feedback message
      if (correct) {
        setFeedbackMessage(activity.feedback.correct[Math.floor(Math.random() * activity.feedback.correct.length)]);
      } else {
        setFeedbackMessage(activity.feedback.incorrect[Math.floor(Math.random() * activity.feedback.incorrect.length)]);
      }
      
      // Show feedback
      setShowFeedback(true);
      
      // Update progress if correct
      if (correct) {
        updateCompletedActivity(activity.id, 100);
      }
    }
  };
  
  // Handle continue after feedback
  const handleContinue = () => {
    setShowFeedback(false);
    if (isCorrect) {
      onComplete();
    } else {
      // Reset selection for another try
      setSelectedOption(null);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Question */}
      <div className="bg-warm-white rounded-3xl p-6 shadow-md mb-6">
        <h2 className="text-2xl font-nunito font-bold mb-4">{activity.title}</h2>
        <p className="text-xl mb-6">{content.question}</p>
      </div>
      
      {/* Options */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {content.options.map((option) => (
          <motion.div key={option.id} variants={itemVariants}>
            <button
              className={`
                w-full text-left p-4 rounded-2xl text-xl font-bold transition-all
                ${
                  selectedOption === option.id
                    ? 'bg-primary-blue text-warm-white'
                    : 'bg-neutral-gray/30 hover:bg-neutral-gray/50'
                }
              `}
              onClick={() => handleOptionSelect(option)}
            >
              {option.text}
            </button>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <Button
          size="large"
          onClick={handleSubmit}
          disabled={!selectedOption}
        >
          Check Answer
        </Button>
      </div>
      
      {/* Feedback Display */}
      {showFeedback && (
        <FeedbackDisplay
          isCorrect={isCorrect}
          message={feedbackMessage}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}; 