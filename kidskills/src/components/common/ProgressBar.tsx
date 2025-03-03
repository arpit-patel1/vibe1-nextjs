'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  label 
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-charcoal">{label}</span>
          <span className="text-sm font-medium text-charcoal">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-4 bg-neutral-gray/30 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary-blue rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 