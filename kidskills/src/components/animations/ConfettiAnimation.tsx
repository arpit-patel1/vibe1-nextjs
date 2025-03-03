'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ConfettiAnimation() {
  const [confettiPieces, setConfettiPieces] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    // Generate confetti pieces on mount
    const pieces = Array.from({ length: 100 }).map((_, i) => {
      const size = Math.random() * 10 + 5;
      const colors = [
        '#FFC700', // yellow
        '#FF0000', // red
        '#2E3191', // blue
        '#39B54A', // green
        '#FF00FF', // pink
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = Math.random() > 0.5 ? 'circle' : 'rect';
      
      return (
        <motion.div
          key={`confetti-${i}`}
          className={`absolute ${shape === 'circle' ? 'rounded-full' : ''}`}
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            top: -20,
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: -20, x: 0, rotate: 0 }}
          animate={{
            y: window.innerHeight + 20,
            x: Math.random() * 200 - 100,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            ease: "easeOut",
          }}
        />
      );
    });
    
    setConfettiPieces(pieces);
    
    // Clean up animation after it completes
    const timeout = setTimeout(() => {
      setConfettiPieces([]);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces}
    </div>
  );
} 