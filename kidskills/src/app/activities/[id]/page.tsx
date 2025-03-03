import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SubjectType } from '@/types';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import { ClientActivityContent } from './ClientActivityContent';

// Sample activity data (in a real app, this would come from a data file or API)
const sampleActivities = {
  'math-1': {
    id: 'math-1',
    title: 'Addition Adventure',
    subject: 'math' as SubjectType,
    type: 'multiple-choice',
    instructions: 'Choose the correct answer for each addition problem.',
    content: {
      question: 'What is 5 + 3?',
      options: [
        { id: 'a', text: '7', isCorrect: false },
        { id: 'b', text: '8', isCorrect: true },
        { id: 'c', text: '9', isCorrect: false },
        { id: 'd', text: '10', isCorrect: false },
      ],
    },
    feedback: {
      correct: 'Great job! 5 + 3 = 8',
      incorrect: 'Not quite. Remember to count carefully!',
      explanation: 'When we add 5 and 3, we can count 5 objects and then count 3 more. 5, 6, 7, 8. So 5 + 3 = 8.',
    },
    hints: [
      'Try counting on your fingers',
      'Start with 5 and count 3 more',
    ],
    nextActivities: ['math-2'],
  },
  'math-2': {
    id: 'math-2',
    title: 'Subtraction Safari',
    subject: 'math' as SubjectType,
    type: 'multiple-choice',
    instructions: 'Choose the correct answer for each subtraction problem.',
    content: {
      question: 'What is 10 - 4?',
      options: [
        { id: 'a', text: '4', isCorrect: false },
        { id: 'b', text: '5', isCorrect: false },
        { id: 'c', text: '6', isCorrect: true },
        { id: 'd', text: '7', isCorrect: false },
      ],
    },
    feedback: {
      correct: 'Excellent! 10 - 4 = 6',
      incorrect: 'Try again. Think about taking away 4 from 10.',
      explanation: 'When we subtract 4 from 10, we start with 10 and count backwards 4 times. 10, 9, 8, 7, 6. So 10 - 4 = 6.',
    },
    hints: [
      'Try counting backwards from 10',
      'You can use your fingers to help',
    ],
    nextActivities: ['math-3'],
  },
  'math-3': {
    id: 'math-3',
    title: 'Multiplication Mountain',
    subject: 'math' as SubjectType,
    type: 'multiple-choice',
    instructions: 'Choose the correct answer for each multiplication problem.',
    content: {
      question: 'What is 3 × 4?',
      options: [
        { id: 'a', text: '7', isCorrect: false },
        { id: 'b', text: '10', isCorrect: false },
        { id: 'c', text: '12', isCorrect: true },
        { id: 'd', text: '15', isCorrect: false },
      ],
    },
    feedback: {
      correct: 'Fantastic! 3 × 4 = 12',
      incorrect: 'Not quite right. Think of 3 groups of 4 objects.',
      explanation: 'Multiplication is like repeated addition. 3 × 4 means 4 + 4 + 4, which equals 12.',
    },
    hints: [
      'Think of 3 groups with 4 items in each group',
      'You can draw it out to visualize the problem',
    ],
    nextActivities: ['math-4'],
  },
  'math-4': {
    id: 'math-4',
    title: 'Word Problem Wizards',
    subject: 'math' as SubjectType,
    type: 'word-problem',
    instructions: 'Solve the word problem and type your answer. AI will generate new problems just for you!',
    content: {
      gradeLevel: 3,
      difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    },
    feedback: {
      correct: 'Great job solving the word problem!',
      incorrect: 'That\'s not quite right. Let\'s try again!',
      explanation: 'Word problems help us apply math to real-world situations.',
    },
    hints: [
      'Read the problem carefully',
      'Identify what you need to find',
      'Choose the right operation (addition, subtraction, etc.)',
    ],
    nextActivities: ['math-1'],
  },
  // Add more activities as needed
};

interface ActivityPageProps {
  params: {
    id: string;
  };
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  // Await params before accessing properties
  const resolvedParams = await params;
  
  // Get activity data
  const activity = sampleActivities[resolvedParams.id as keyof typeof sampleActivities];
  
  // If activity doesn't exist, show 404
  if (!activity) {
    notFound();
  }
  
  return (
    <div className="min-h-[80vh]">
      {/* Activity Header */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Link href={`/subjects/${activity.subject}`} className="text-primary-blue hover:underline mb-2 inline-block">
              ← Back to {activity.subject.charAt(0).toUpperCase() + activity.subject.slice(1)}
            </Link>
            <h1 className="text-3xl font-nunito font-bold text-charcoal">
              {activity.title}
            </h1>
          </div>
        </div>
        
        <div className="mb-6">
          <CharacterGuide message={activity.instructions} />
        </div>
      </section>
      
      {/* Activity Content */}
      <section className="py-4">
        <ClientActivityContent activity={activity} />
      </section>
    </div>
  );
} 