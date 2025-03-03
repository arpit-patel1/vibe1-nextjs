'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { Button } from '@/components/common/Button';
import { CharacterGuide } from '@/components/common/CharacterGuide';

export default function AILearningDashboard() {
  const { userProgress, generateAIRecommendations } = useUserProgress();
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate AI recommendations when the dashboard loads
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      try {
        await generateAIRecommendations();
      } catch (error) {
        console.error('Failed to generate AI recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecommendations();
  }, [generateAIRecommendations]);
  
  // Calculate completion percentage for each subject
  const getSubjectCompletion = (subject: string) => {
    const subjectActivities = userProgress.completedActivities.filter(id => id.startsWith(subject));
    // Assuming each subject has 5 activities
    return Math.round((subjectActivities.length / 5) * 100);
  };
  
  // Get skill level label
  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-nunito font-bold text-charcoal mb-2">
          AI Learning Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your personalized learning journey powered by AI. Track your progress, see recommendations, and continue your learning adventure.
        </p>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Progress Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-nunito font-bold text-charcoal mb-4">
              Your Learning Journey
            </h2>
            
            {/* Subject Progress */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Math</span>
                  <span>{getSubjectCompletion('math')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-blue h-2.5 rounded-full" 
                    style={{ width: `${getSubjectCompletion('math')}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">English</span>
                  <span>{getSubjectCompletion('english')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${getSubjectCompletion('english')}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Leadership</span>
                  <span>{getSubjectCompletion('leadership')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-500 h-2.5 rounded-full" 
                    style={{ width: `${getSubjectCompletion('leadership')}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Skill Levels */}
            <h3 className="font-semibold mb-2">Current Skill Levels</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-blue-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">Math</div>
                <div className="font-medium">{getSkillLevelLabel(userProgress.skillLevels.math)}</div>
              </div>
              <div className="bg-green-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">English</div>
                <div className="font-medium">{getSkillLevelLabel(userProgress.skillLevels.english)}</div>
              </div>
              <div className="bg-purple-100 p-2 rounded text-center">
                <div className="text-xs text-gray-600">Leadership</div>
                <div className="font-medium">{getSkillLevelLabel(userProgress.skillLevels.leadership)}</div>
              </div>
            </div>
            
            {/* Activity Stats */}
            <h3 className="font-semibold mb-2">Activity Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="text-2xl font-bold text-primary-blue">
                  {userProgress.completedActivities.length}
                </div>
                <div className="text-xs text-gray-600">Activities Completed</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="text-2xl font-bold text-green-500">
                  {Object.values(userProgress.scores).reduce((sum, score) => sum + score, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Points</div>
              </div>
            </div>
          </div>
          
          {/* Middle Column: AI Recommendations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-nunito font-bold text-charcoal">
                AI Recommendations
              </h2>
              <div className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs">
                AI Powered
              </div>
            </div>
            
            {/* Recommended Activities */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Suggested Next Activities</h3>
              {userProgress.aiRecommendations?.nextActivities && 
               userProgress.aiRecommendations.nextActivities.length > 0 ? (
                <div className="space-y-2">
                  {userProgress.aiRecommendations.nextActivities.map((activityId) => (
                    <Link href={`/activities/${activityId}`} key={activityId}>
                      <motion.div 
                        className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-medium">
                          {activityId.split('-')[0].charAt(0).toUpperCase() + 
                           activityId.split('-')[0].slice(1)} Activity {activityId.split('-')[1]}
                        </div>
                        <div className="text-sm text-gray-600">
                          Recommended based on your learning patterns
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Complete more activities to get personalized recommendations.
                </p>
              )}
            </div>
            
            {/* Focus Areas */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Focus Areas</h3>
              {userProgress.aiRecommendations?.focusAreas && 
               userProgress.aiRecommendations.focusAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProgress.aiRecommendations.focusAreas.map((area) => (
                    <div 
                      key={area}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No specific focus areas identified yet.
                </p>
              )}
            </div>
            
            {/* Personalized Tips */}
            <div>
              <h3 className="font-semibold mb-2">Learning Tips</h3>
              {userProgress.aiRecommendations?.personalizedTips && 
               userProgress.aiRecommendations.personalizedTips.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  {userProgress.aiRecommendations.personalizedTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  Complete more activities to get personalized tips.
                </p>
              )}
            </div>
          </div>
          
          {/* Right Column: Learning Insights */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-nunito font-bold text-charcoal mb-4">
              Learning Insights
            </h2>
            
            {/* Strengths */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Your Strengths</h3>
              {userProgress.learningPatterns?.strengths && 
               userProgress.learningPatterns.strengths.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProgress.learningPatterns.strengths.map((strength) => (
                    <div 
                      key={strength}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {strength.charAt(0).toUpperCase() + strength.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Complete more activities to identify your strengths.
                </p>
              )}
            </div>
            
            {/* Challenge Areas */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Challenge Areas</h3>
              {userProgress.learningPatterns?.challengeAreas && 
               userProgress.learningPatterns.challengeAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userProgress.learningPatterns.challengeAreas.map((area) => (
                    <div 
                      key={area}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Complete more activities to identify your challenge areas.
                </p>
              )}
            </div>
            
            {/* Learning Style */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Your Learning Style</h3>
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">
                  Based on your activity patterns, you seem to learn best with 
                  <span className="font-semibold"> interactive</span> content and 
                  <span className="font-semibold"> visual</span> explanations.
                </p>
                <p className="text-gray-700 mt-2">
                  Average response time: {userProgress.learningPatterns?.averageResponseTime.toFixed(1) || '0'} seconds
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div>
              <h3 className="font-semibold mb-2">Suggested Actions</h3>
              <div className="space-y-2">
                <Link href="/subjects/math">
                  <Button variant="primary" size="medium" className="w-full">
                    Continue Learning
                  </Button>
                </Link>
                <Button 
                  variant="secondary" 
                  size="medium" 
                  className="w-full"
                  onClick={() => generateAIRecommendations()}
                >
                  Refresh Recommendations
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <CharacterGuide
          message="Welcome to your AI Learning Dashboard! I've analyzed your learning patterns and created personalized recommendations just for you. Keep up the great work!"
        />
      </div>
    </div>
  );
} 