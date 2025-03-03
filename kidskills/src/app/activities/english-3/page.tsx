import { ClientActivityContent } from '../[id]/ClientActivityContent';

export default function EnglishActivity3() {
  // Sample English reading comprehension activity
  const activity = {
    id: 'english-3',
    title: 'Reading Adventure',
    subject: 'english',
    type: 'multiple-choice',
    content: {
      gradeLevel: 3,
      difficulty: 'medium',
      exerciseType: 'reading'
    },
    nextActivities: ['english-4']
  };

  return <ClientActivityContent activity={activity} />;
} 