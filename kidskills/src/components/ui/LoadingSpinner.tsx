'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#3B82F6' 
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64
  };

  const spinnerSize = sizeMap[size];
  
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="rounded-full border-t-transparent"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: Math.max(2, spinnerSize / 12),
          borderColor: color,
          borderTopColor: 'transparent'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
} 