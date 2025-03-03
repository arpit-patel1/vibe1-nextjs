'use client';

import { motion } from 'framer-motion';

interface OptionButtonProps {
  id: string;
  text: string;
  selected?: boolean;
  correct?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  id,
  text,
  selected = false,
  correct,
  onClick,
  disabled = false
}) => {
  // Determine button style based on state
  const getButtonStyle = () => {
    if (selected && correct === true) {
      return "bg-success-green text-white border-success-green";
    } else if (selected && correct === false) {
      return "bg-error-red text-white border-error-red";
    } else if (selected) {
      return "bg-primary-blue text-white border-primary-blue";
    } else {
      return "bg-warm-white text-charcoal border-neutral-gray hover:border-primary-blue";
    }
  };

  return (
    <motion.button
      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${getButtonStyle()}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-gray/20 flex items-center justify-center mr-3">
          <span className="font-bold">{id}</span>
        </div>
        <span className="text-lg">{text}</span>
      </div>
    </motion.button>
  );
};

export default OptionButton; 