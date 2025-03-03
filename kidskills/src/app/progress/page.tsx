'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterGuide } from '@/components/common/CharacterGuide';
import { ProgressTracker } from '@/components/common/ProgressTracker';

export default function ProgressPage() {
  // We'll keep the state but mark it with underscore to indicate it's defined for future use
  const [_activeTab, _setActiveTab] = useState<'overview' | 'achievements'>('overview');
  
  // Sample progress data (in a real app, this would come from user data)
  const subjectProgress = {
    math: 35,
    english: 20,
    leadership: 10,
  };
  
  // Sample achievements data
  const achievements = [
    {
      id: 'math-beginner',
      title: 'Math Explorer',
      description: 'Completed your first math activity',
      icon: '🔢',
      unlocked: true,
      date: '2023-09-15',
    },
    {
      id: 'english-reader',
      title: 'Word Wizard',
      description: 'Read 5 stories in English activities',
      icon: '📚',
      unlocked: true,
      date: '2023-09-18',
    },
    {
      id: 'leadership-team',
      title: 'Team Player',
      description: 'Completed 3 leadership activities',
      icon: '🤝',
      unlocked: false,
    },
    {
      id: 'math-master',
      title: 'Math Master',
      description: 'Solved 10 math problems correctly in a row',
      icon: '🏆',
      unlocked: false,
    },
    {
      id: 'perfect-streak',
      title: 'Perfect Streak',
      description: 'Logged in for 5 days in a row',
      icon: '🔥',
      unlocked: true,
      date: '2023-09-20',
    },
  ];
  
  // Calculate total progress
  const totalActivities = 15; // Sample total number of activities
  const completedActivities = 5; // Sample completed activities
  const totalProgress = Math.round((completedActivities / totalActivities) * 100);
  
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
  
  return (
    <div className="min-h-[80vh]">
      <section className="mb-8">
        <h1 className="text-4xl font-nunito font-bold text-charcoal mb-4">
          My Learning Journey
        </h1>
        <CharacterGuide 
          message="Here's your progress so far! Keep up the great work and earn more achievements as you learn."
        />
      </section>
      
      {/* Progress Overview */}
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-nunito font-bold text-charcoal mb-4">
            Overall Progress
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-6">
                <p className="text-lg mb-2">Total Progress</p>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-blue rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${totalProgress}%` }}
                  ></div>
                </div>
                <p className="text-right mt-1 text-sm text-neutral-gray">
                  {completedActivities} of {totalActivities} activities completed ({totalProgress}%)
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-lg mb-2">Math</p>
                  <ProgressTracker subject="math" progress={subjectProgress.math} />
                </div>
                <div>
                  <p className="text-lg mb-2">English</p>
                  <ProgressTracker subject="english" progress={subjectProgress.english} />
                </div>
                <div>
                  <p className="text-lg mb-2">Leadership</p>
                  <ProgressTracker subject="leadership" progress={subjectProgress.leadership} />
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {totalProgress < 25 ? '🌱' : totalProgress < 50 ? '🌿' : totalProgress < 75 ? '🌲' : '🌳'}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {totalProgress < 25 ? 'Just Starting' : totalProgress < 50 ? 'Growing Steadily' : totalProgress < 75 ? 'Making Great Progress' : 'Almost Mastered'}
                </h3>
                <p className="text-neutral-gray">
                  {totalProgress < 25 
                    ? 'You\'re at the beginning of your learning journey!' 
                    : totalProgress < 50 
                    ? 'You\'re making good progress. Keep it up!' 
                    : totalProgress < 75 
                    ? 'You\'re doing great! You\'ve learned so much already.' 
                    : 'Wow! You\'re almost a master of all skills!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Achievements */}
      <section>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-nunito font-bold text-charcoal mb-6">
            My Achievements
          </h2>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {achievements.map((achievement) => (
              <motion.div 
                key={achievement.id}
                variants={itemVariants}
                className={`p-4 rounded-lg border-2 ${achievement.unlocked ? 'border-sunshine-yellow bg-sunshine-yellow/10' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start">
                  <div className="text-3xl mr-3">{achievement.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg">{achievement.title}</h3>
                    <p className="text-sm text-neutral-gray mb-2">{achievement.description}</p>
                    {achievement.unlocked ? (
                      <p className="text-xs text-green-600">Unlocked on {achievement.date}</p>
                    ) : (
                      <p className="text-xs text-neutral-gray">Not yet unlocked</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
} 