import { ClientActivityContent } from '../[id]/ClientActivityContent';

export default function MathActivity1() {
  // AI-native Addition Adventure activity
  const activity = {
    id: 'math-1',
    title: 'Addition Adventure',
    subject: 'math',
    type: 'ai-addition',
    content: {
      gradeLevel: 2,
      difficulty: 'easy',
      exerciseType: 'addition'
    },
    nextActivities: ['math-2']
  };

  return <ClientActivityContent activity={activity} />;
} 