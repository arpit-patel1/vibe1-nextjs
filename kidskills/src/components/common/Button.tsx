'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/contexts/AudioContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  fullWidth?: boolean;
  soundEffect?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  fullWidth = false,
  soundEffect = 'button-click.mp3',
  className = '',
  onClick,
  ...props
}: ButtonProps) => {
  const { playSound } = useAudio();

  // Determine variant classes
  const variantClasses = {
    primary: 'bg-primary-blue hover:bg-primary-blue/90 text-warm-white',
    secondary: 'bg-soft-purple hover:bg-soft-purple/90 text-warm-white',
    success: 'bg-leaf-green hover:bg-leaf-green/90 text-warm-white',
    danger: 'bg-coral-red hover:bg-coral-red/90 text-warm-white',
  };

  // Determine size classes
  const sizeClasses = {
    small: 'text-base py-2 px-4 rounded-xl min-w-[50px] min-h-[50px]',
    medium: 'text-lg py-3 px-5 rounded-2xl min-w-[60px] min-h-[60px]',
    large: 'text-xl py-4 px-6 rounded-3xl min-w-[70px] min-h-[70px]',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Play sound effect
    if (soundEffect) {
      playSound(soundEffect, 'sfx');
    }
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      className={`
        font-bold shadow-md transition-colors
        flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}; 