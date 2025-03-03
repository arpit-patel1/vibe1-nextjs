'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SubjectType } from '@/types';
import { useAudio } from '@/contexts/AudioContext';

interface SubjectNavigatorProps {
  activeSubject?: SubjectType | null;
  className?: string;
}

export const SubjectNavigator = ({
  activeSubject = null,
  className = '',
}: SubjectNavigatorProps) => {
  const router = useRouter();
  const { playSound } = useAudio();

  // Subject data
  const subjects: { id: SubjectType; name: string; icon: string; color: string }[] = [
    {
      id: 'math',
      name: 'Math',
      icon: '🔢',
      color: 'bg-primary-blue',
    },
    {
      id: 'english',
      name: 'English',
      icon: '📚',
      color: 'bg-leaf-green',
    },
    {
      id: 'leadership',
      name: 'Leadership',
      icon: '🌟',
      color: 'bg-soft-purple',
    },
  ];

  const handleSubjectClick = (subject: SubjectType) => {
    playSound('navigation.mp3', 'sfx');
    router.push(`/subjects/${subject}`);
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
    <motion.div
      className={`flex flex-col sm:flex-row gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {subjects.map((subject) => (
        <motion.div
          key={subject.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex-1 cursor-pointer rounded-2xl overflow-hidden shadow-md
            ${activeSubject === subject.id ? 'ring-4 ring-sunshine-yellow' : ''}
          `}
          onClick={() => handleSubjectClick(subject.id)}
        >
          <div className={`${subject.color} p-4 text-center`}>
            <div className="text-4xl mb-2">{subject.icon}</div>
            <h3 className="text-xl font-nunito font-bold text-warm-white">{subject.name}</h3>
          </div>
          <div className="bg-warm-white p-4 text-center">
            <p className="text-charcoal">
              {subject.id === 'math' && 'Numbers, shapes, and problem solving'}
              {subject.id === 'english' && 'Reading, writing, and grammar'}
              {subject.id === 'leadership' && 'Teamwork and social skills'}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}; 