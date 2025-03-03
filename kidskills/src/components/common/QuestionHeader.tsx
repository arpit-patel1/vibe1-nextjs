'use client';

import { motion } from 'framer-motion';

interface QuestionHeaderProps {
  title: string;
  question: string;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({ title, question }) => {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-nunito font-bold text-primary-blue mb-3">{title}</h2>
      <p className="text-xl text-charcoal">{question}</p>
    </motion.div>
  );
};

export default QuestionHeader; 