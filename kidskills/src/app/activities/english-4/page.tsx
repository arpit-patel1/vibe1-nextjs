import { ClientActivityContent } from '../[id]/ClientActivityContent';

export default function EnglishActivity4() {
  // Sample English vocabulary activity
  const activity = {
    id: 'english-4',
    title: 'Vocabulary Builder',
    subject: 'english',
    type: 'multiple-choice',
    content: {
      gradeLevel: 3,
      difficulty: 'medium',
      exerciseType: 'vocabulary'
    },
    nextActivities: ['english-1']
  };

  return <ClientActivityContent activity={activity} />;
} 