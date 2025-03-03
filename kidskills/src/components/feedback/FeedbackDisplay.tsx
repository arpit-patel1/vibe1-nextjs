import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';
import { Button } from '@/components/common/Button';

interface FeedbackDisplayProps {
  isCorrect: boolean;
  message: string;
  onContinue: () => void;
  showConfetti?: boolean;
}

export const FeedbackDisplay = ({
  isCorrect,
  message,
  onContinue,
  showConfetti = true,
}: FeedbackDisplayProps) => {
  const { playSound } = useAudio();

  // Play appropriate sound when feedback is shown
  useEffect(() => {
    if (isCorrect) {
      playSound('correct-answer.mp3', 'sfx');
    } else {
      playSound('incorrect-answer.mp3', 'sfx');
    }
  }, [isCorrect, playSound]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: 'spring',
        stiffness: 500,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  // Confetti animation (simplified)
  const renderConfetti = () => {
    if (!isCorrect || !showConfetti) return null;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 10 + 5;
          const color = [
            'bg-primary-blue',
            'bg-leaf-green',
            'bg-sunshine-yellow',
            'bg-coral-red',
            'bg-soft-purple',
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center bg-charcoal/50 z-50">
        {renderConfetti()}
        
        <motion.div
          className={`
            bg-warm-white rounded-3xl p-6 shadow-lg max-w-md w-full mx-4
            border-4 ${isCorrect ? 'border-leaf-green' : 'border-coral-red'}
          `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            
            <h2 className={`text-2xl font-nunito font-bold mb-4 ${isCorrect ? 'text-leaf-green' : 'text-coral-red'}`}>
              {isCorrect ? 'Great job!' : 'Not quite right'}
            </h2>
            
            <p className="text-lg mb-6">{message}</p>
            
            <Button
              variant={isCorrect ? 'success' : 'primary'}
              size="large"
              onClick={onContinue}
              fullWidth
            >
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}; 