'use client';

import { motion } from 'framer-motion';
import { ActivityCard } from '@/components/common/ActivityCard';
import { SubjectType } from '@/types';

interface ClientActivitiesGridProps {
  subject: SubjectType;
  activities: any[]; // Use proper type here
}

export function ClientActivitiesGrid({ subject, activities }: ClientActivitiesGridProps) {
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

  // Handle activity click
  const handleActivityClick = (activityId: string) => {
    window.location.href = `/activities/${activityId}`;
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {activities.map((activity) => (
        <motion.div key={activity.id} variants={itemVariants}>
          <ActivityCard
            title={activity.title}
            subject={subject}
            difficulty={activity.difficulty as 1 | 2 | 3}
            completed={activity.completed}
            onClick={() => handleActivityClick(activity.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
} 