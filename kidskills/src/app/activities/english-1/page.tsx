import { ClientActivityContent } from '../[id]/ClientActivityContent';

export default function EnglishActivity1() {
  // Sample English creative writing activity
  const activity = {
    id: 'english-1',
    title: 'Creative Writing Adventure',
    subject: 'english',
    type: 'creative-writing',
    content: {
      gradeLevel: 3,
      difficulty: 'medium',
      exerciseType: 'creative-writing'
    },
    nextActivities: ['english-2']
  };

  return <ClientActivityContent activity={activity} />;
} 