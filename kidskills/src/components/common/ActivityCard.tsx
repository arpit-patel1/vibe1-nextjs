'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SubjectType, DifficultyLevel } from '@/types';
import { useAudio } from '@/contexts/AudioContext';

interface ActivityCardProps {
  title: string;
  subject: SubjectType;
  difficulty: DifficultyLevel;
  completed?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export const ActivityCard = ({
  title,
  subject,
  difficulty,
  completed = false,
  icon,
  onClick,
}: ActivityCardProps) => {
  const { playSound } = useAudio();

  // Subject-specific classes
  const subjectClasses = {
    math: 'border-primary-blue',
    english: 'border-leaf-green',
    leadership: 'border-soft-purple',
  };

  // Subject-specific background colors for the header
  const headerClasses = {
    math: 'bg-primary-blue',
    english: 'bg-leaf-green',
    leadership: 'bg-soft-purple',
  };

  // Render stars based on difficulty
  const renderDifficulty = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <span
          key={index}
          className={`text-xl ${
            index < difficulty ? 'text-sunshine-yellow' : 'text-neutral-gray'
          }`}
        >
          ★
        </span>
      ));
  };

  const handleClick = () => {
    playSound('card-select.mp3', 'sfx');
    if (onClick) onClick();
  };

  return (
    <motion.div
      className={`
        rounded-3xl overflow-hidden shadow-md border-2
        ${subjectClasses[subject]}
        ${completed ? 'bg-neutral-gray/20' : 'bg-warm-white'}
        transition-all duration-300 cursor-pointer
      `}
      whileHover={{ scale: 1.03, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {/* Card Header */}
      <div className={`${headerClasses[subject]} p-4 text-warm-white`}>
        <div className="flex justify-between items-center">
          <h3 className="font-nunito font-bold text-xl truncate">{title}</h3>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex">{renderDifficulty()}</div>
          {completed && (
            <div className="bg-leaf-green text-warm-white rounded-full p-1 px-3 text-sm font-bold">
              Completed!
            </div>
          )}
        </div>

        {/* Subject Badge */}
        <div className="mt-4">
          <span
            className={`
              inline-block rounded-full px-3 py-1 text-sm font-bold text-warm-white
              ${headerClasses[subject]}
            `}
          >
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}; 