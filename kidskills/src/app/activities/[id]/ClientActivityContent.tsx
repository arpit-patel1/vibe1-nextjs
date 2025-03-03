'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { MultipleChoiceActivity } from '@/components/activities/MultipleChoiceActivity';
import { InfiniteQuestionActivity } from '@/components/activities/InfiniteQuestionActivity';
import { AIEnhancedActivity } from '@/components/activities/AIEnhancedActivity';
import AIEnglishActivity from '@/components/activities/AIEnglishActivity';
import { AIMathWordProblemActivity } from '@/components/activities/AIMathWordProblemActivity';
import { AIEnglishWordWizardActivity } from '@/components/activities/AIEnglishWordWizardActivity';
import { useAI } from '@/contexts/AIContext';

interface ClientActivityContentProps {
  activity: any; // Use proper type here
}

export function ClientActivityContent({ activity }: ClientActivityContentProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const { isApiKeyValid } = useAI();
  
  // Handle activity completion
  const handleComplete = (success: boolean) => {
    setIsCompleted(true);
    setWasSuccessful(success);
    // In a real app, we would save progress to user data
    console.log(`Activity ${activity.id} completed with success: ${success}`);
  };
  
  // Render the appropriate activity component based on type and subject
  if (isCompleted) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-nunito font-bold text-charcoal mb-4">
          {wasSuccessful ? '🎉 Activity Completed! 🎉' : '👍 Good Try! 👍'}
        </h2>
        <p className="mb-6">
          {wasSuccessful 
            ? 'You did a great job! Ready for the next challenge?' 
            : 'Learning takes practice. Let\'s try something else!'}
        </p>
        <div className="flex justify-center space-x-4">
          <Link href={`/subjects/${activity.subject}`}>
            <Button variant="secondary" size="large">
              Back to {activity.subject.charAt(0).toUpperCase() + activity.subject.slice(1)}
            </Button>
          </Link>
          {activity.nextActivities && activity.nextActivities.length > 0 && (
            <Link href={`/activities/${activity.nextActivities[0]}`}>
              <Button variant="primary" size="large">
                Next Activity
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }
  
  // Check if this is an English activity (for AI-powered grammar questions)
  if (activity.subject === 'english') {
    // Use AI-native English activity for all English activities
    if (activity.type === 'word-problem' || activity.type === 'creative-writing') {
      return (
        <AIEnglishWordWizardActivity
          activityId={activity.id}
          gradeLevel={activity.content?.gradeLevel || 3}
          difficulty={activity.content?.difficulty || 'medium'}
          exerciseType={activity.content?.exerciseType || 'creative-writing'}
        />
      );
    } else {
      // For multiple-choice and other English activities
      return (
        <AIEnglishActivity
          activityId={activity.id}
          initialQuestion={activity.content?.question}
          initialOptions={activity.content?.options}
          initialExplanation={activity.feedback?.explanation}
        />
      );
    }
  }
  
  // Check if this is a math activity (for AI-enhanced experience)
  if (activity.subject === 'math') {
    // Check for AI-native addition activity
    if (activity.type === 'ai-addition') {
      return (
        <AIEnhancedActivity
          activityId={activity.id}
          initialQuestion=""
          initialOptions={[]}
          initialExplanation=""
          subject={activity.subject}
          isAINative={true}
          aiQuestionType="addition"
          gradeLevel={activity.content?.gradeLevel || 2}
          difficulty={activity.content?.difficulty || 'easy'}
        />
      );
    }
    // Use AI-enhanced activity for math questions
    else if (activity.type === 'word-problem') {
      return (
        <AIMathWordProblemActivity
          activityId={activity.id}
          gradeLevel={activity.content?.gradeLevel || 3}
          difficulty={activity.content?.difficulty || 'medium'}
        />
      );
    } else {
      // For all other math activities, use the AI-enhanced component
      return (
        <AIEnhancedActivity
          activityId={activity.id}
          initialQuestion={activity.content?.question}
          initialOptions={activity.content?.options}
          initialExplanation={activity.feedback?.explanation}
          subject={activity.subject}
        />
      );
    }
  }
  
  // For any other subject, use the AI-enhanced activity as a fallback
  return (
    <AIEnhancedActivity
      activityId={activity.id}
      initialQuestion={activity.content?.question || "What is the answer to this question?"}
      initialOptions={activity.content?.options || []}
      initialExplanation={activity.feedback?.explanation || ""}
      subject={activity.subject || "general"}
    />
  );
} 