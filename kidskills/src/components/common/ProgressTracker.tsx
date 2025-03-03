'use client';

import { motion } from 'framer-motion';
import { SubjectType } from '@/types';

interface ProgressTrackerProps {
  subject: SubjectType;
  progress: number; // 0 to 100
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const ProgressTracker = ({
  subject,
  progress,
  showLabel = true,
  size = 'medium',
  className = '',
}: ProgressTrackerProps) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // Subject-specific colors
  const subjectColors = {
    math: 'bg-primary-blue',
    english: 'bg-leaf-green',
    leadership: 'bg-soft-purple',
  };
  
  // Size classes
  const sizeClasses = {
    small: 'h-4 text-sm',
    medium: 'h-6 text-base',
    large: 'h-8 text-lg',
  };
  
  // Animation variants
  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${normalizedProgress}%`,
      transition: { 
        duration: 1,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="font-bold">
            {subject.charAt(0).toUpperCase() + subject.slice(1)} Progress
          </span>
          <span className="font-bold">{normalizedProgress}%</span>
        </div>
      )}
      
      <div className={`w-full ${sizeClasses[size]} bg-neutral-gray rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${subjectColors[subject]} rounded-full`}
          variants={progressVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      
      {/* Progress milestones */}
      <div className="flex justify-between mt-1 px-1">
        <div className="w-2 h-2 rounded-full bg-neutral-gray" />
        <div className={`w-2 h-2 rounded-full ${normalizedProgress >= 25 ? subjectColors[subject] : 'bg-neutral-gray'}`} />
        <div className={`w-2 h-2 rounded-full ${normalizedProgress >= 50 ? subjectColors[subject] : 'bg-neutral-gray'}`} />
        <div className={`w-2 h-2 rounded-full ${normalizedProgress >= 75 ? subjectColors[subject] : 'bg-neutral-gray'}`} />
        <div className={`w-2 h-2 rounded-full ${normalizedProgress >= 100 ? subjectColors[subject] : 'bg-neutral-gray'}`} />
      </div>
    </div>
  );
} 