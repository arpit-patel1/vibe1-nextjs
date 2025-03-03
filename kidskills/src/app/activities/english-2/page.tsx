import { ClientActivityContent } from '../[id]/ClientActivityContent';

export default function EnglishActivity2() {
  // Sample English grammar activity
  const activity = {
    id: 'english-2',
    title: 'Grammar Challenge',
    subject: 'english',
    type: 'multiple-choice',
    content: {
      gradeLevel: 3,
      difficulty: 'medium',
      exerciseType: 'grammar'
    },
    nextActivities: ['english-3']
  };

  return <ClientActivityContent activity={activity} />;
} 