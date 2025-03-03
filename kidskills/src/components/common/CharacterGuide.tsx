'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAudio } from '@/contexts/AudioContext';

interface CharacterGuideProps {
  message?: string;
  audioFile?: string;
  character?: string;
  emotion?: 'happy' | 'thinking' | 'excited' | 'confused';
  autoHide?: boolean;
  hideDelay?: number;
}

export const CharacterGuide = ({
  message = 'Hello! I\'m here to help you learn!',
  audioFile,
  character,
  emotion = 'happy',
  autoHide = false,
  hideDelay = 5000,
}: CharacterGuideProps) => {
  const { preferences } = usePreferences();
  const { playSound } = useAudio();
  const [isVisible, setIsVisible] = useState(true);

  // Use the selected character from preferences if not specified
  const characterToShow = character || preferences.character.selectedCharacter;

  // Auto-hide the character after delay if autoHide is true
  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, isVisible]);

  // Play audio when component mounts
  useEffect(() => {
    if (audioFile && isVisible) {
      playSound(audioFile, 'narration');
    }
  }, [audioFile, isVisible, playSound]);

  // If character display is disabled in preferences, don't render anything
  if (!preferences.character.showCharacter) {
    return null;
  }

  // Get character image based on selected character and emotion
  const getCharacterImage = () => {
    return `/images/characters/${characterToShow}-${emotion}.svg`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const characterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex items-end gap-4 p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Character Image */}
          <motion.div
            className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32"
            variants={characterVariants}
            animate={["visible", "bounce"]}
          >
            {/* Fallback to a colored circle if image is not available */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-primary-blue rounded-full opacity-20" />
              <img
                src={getCharacterImage()}
                alt={`${characterToShow} character`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // If image fails to load, replace with a fallback
                  e.currentTarget.src = '/images/characters/default-happy.svg';
                }}
              />
            </div>
          </motion.div>

          {/* Speech Bubble */}
          <motion.div
            className="relative bg-warm-white p-4 rounded-2xl shadow-md border-2 border-neutral-gray max-w-xs"
            variants={messageVariants}
          >
            {/* Speech bubble pointer */}
            <div className="absolute left-0 bottom-4 w-4 h-4 bg-warm-white border-l-2 border-b-2 border-neutral-gray transform rotate-45 -translate-x-2" />
            
            <p className="text-lg font-comic">{message}</p>
            
            {/* Close button */}
            <button
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neutral-gray/50 flex items-center justify-center text-charcoal hover:bg-neutral-gray"
              onClick={() => setIsVisible(false)}
              aria-label="Close message"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 