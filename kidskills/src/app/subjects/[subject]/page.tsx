import { notFound } from 'next/navigation';
import { SubjectType } from '@/types';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import { ProgressTracker } from '@/components/common/ProgressTracker';
import { SubjectNavigator } from '@/components/navigation/SubjectNavigator';
import { ClientActivitiesGrid } from './ClientActivitiesGrid';

// Sample activities data (in a real app, this would come from a data file or API)
const sampleActivities = {
  math: [
    {
      id: 'math-1',
      title: 'Addition Adventure',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'math-2',
      title: 'Subtraction Safari',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'math-3',
      title: 'Multiplication Mountain',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'math-4',
      title: 'Word Problem Wizards',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'math-5',
      title: 'Division Dive',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'math-6',
      title: 'Fraction Fun',
      difficulty: 3,
      completed: false,
    },
  ],
  english: [
    {
      id: 'english-1',
      title: 'Creative Writing Adventure',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'english-2',
      title: 'Grammar Challenge',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'english-3',
      title: 'Reading Adventure',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'english-4',
      title: 'Vocabulary Builder',
      difficulty: 2,
      completed: false,
    },
  ],
  leadership: [
    {
      id: 'leadership-1',
      title: 'Teamwork Town',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'leadership-2',
      title: 'Emotion Explorer',
      difficulty: 1,
      completed: false,
    },
    {
      id: 'leadership-3',
      title: 'Problem Solving Palace',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'leadership-4',
      title: 'Communication Castle',
      difficulty: 2,
      completed: false,
    },
    {
      id: 'leadership-5',
      title: 'Responsibility Realm',
      difficulty: 3,
      completed: false,
    },
  ],
};

// Subject-specific messages and icons
const subjectInfo = {
  math: {
    title: 'Math Skills',
    description: 'Learn numbers, shapes, and problem solving',
    icon: '🔢',
    color: 'bg-primary-blue',
    characterMessage: 'Let\'s explore the world of numbers together!',
  },
  english: {
    title: 'English Exploration',
    description: 'Discover the joy of reading, writing, and communicating!',
    characterMessage: 'Words are magical! Let\'s read stories, learn new words, and write our own adventures.',
    icon: '📚',
  },
  leadership: {
    title: 'Leadership Lab',
    description: 'Build teamwork, communication, and problem-solving skills!',
    characterMessage: 'Being a good leader means helping others and working together. Let\'s practice these important skills!',
    icon: '🌟',
  },
};

interface SubjectPageProps {
  params: {
    subject: string;
  };
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  // Await params before accessing properties
  const resolvedParams = await params;
  
  // Validate subject parameter
  if (!['math', 'english', 'leadership'].includes(resolvedParams.subject)) {
    notFound();
  }

  const subject = resolvedParams.subject as SubjectType;
  const activities = sampleActivities[subject];
  const info = subjectInfo[subject];
  
  // Calculate progress (in a real app, this would come from user data)
  const progress = 20; // Sample progress percentage

  return (
    <div className="min-h-[80vh]">
      {/* Subject Header */}
      <section className={`py-8 rounded-3xl mb-8 ${subject === 'math' ? 'bg-primary-blue/10' : subject === 'english' ? 'bg-leaf-green/10' : 'bg-soft-purple/10'}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-nunito font-bold text-charcoal mb-2">
              {info.title} <span className="text-3xl">{info.icon}</span>
            </h1>
            <p className="text-xl mb-4">{info.description}</p>
            
            {/* Progress Tracker */}
            <div className="mb-4">
              <ProgressTracker subject={subject} progress={progress} />
            </div>
          </div>
          
          <div className="flex-1">
            <CharacterGuide message={info.characterMessage} />
          </div>
        </div>
      </section>
      
      {/* Subject Navigation */}
      <section className="mb-8">
        <h2 className="text-2xl font-nunito font-bold text-charcoal mb-4">
          Explore Other Subjects
        </h2>
        <SubjectNavigator activeSubject={subject} />
      </section>
      
      {/* Activities Grid */}
      <section className="py-8">
        <h2 className="text-2xl font-nunito font-bold text-charcoal mb-6">
          Available Activities
        </h2>
        
        <ClientActivitiesGrid subject={subject} activities={activities} />
      </section>
    </div>
  );
} 