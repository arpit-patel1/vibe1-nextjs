'use client';

import { CharacterGuide } from '@/components/common/CharacterGuide';
import { SubjectNavigator } from '@/components/navigation/SubjectNavigator';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';

// Test comment to trigger automatic server restart

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section */}
      <section className="py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Text Content */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-nunito font-bold text-charcoal mb-4">
              Learn and Have Fun with <span className="text-primary-blue">KidSkills</span>!
            </h1>
            <p className="text-xl mb-6">
              Explore fun activities to improve your skills in math, English, and leadership.
              Perfect for 2nd and 3rd graders!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="large">
                Start Learning
              </Button>
              <Button size="large" variant="secondary">
                About KidSkills
              </Button>
            </div>
          </motion.div>

          {/* Character Guide */}
          <motion.div 
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CharacterGuide 
              message="Hi there! I'm Buddy, your learning friend. Ready to explore and learn new things together?"
              emotion="excited"
            />
          </motion.div>
        </div>
      </section>

      {/* Subject Navigation */}
      <section className="py-8">
        <h2 className="text-3xl font-nunito font-bold text-charcoal mb-6 text-center">
          Choose a Subject to Explore
        </h2>
        <SubjectNavigator />
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-12">
        <h2 className="text-3xl font-nunito font-bold text-charcoal mb-8 text-center">
          What Makes KidSkills Special?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <motion.div 
            className="bg-warm-white p-6 rounded-3xl shadow-md"
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-nunito font-bold mb-2">Fun Learning Games</h3>
            <p>Interactive activities that make learning enjoyable and engaging.</p>
          </motion.div>
          
          {/* Feature 2 */}
          <motion.div 
            className="bg-warm-white p-6 rounded-3xl shadow-md"
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-nunito font-bold mb-2">Achievements & Rewards</h3>
            <p>Earn badges and track your progress as you master new skills.</p>
          </motion.div>
          
          {/* Feature 3 */}
          <motion.div 
            className="bg-warm-white p-6 rounded-3xl shadow-md"
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-nunito font-bold mb-2">Skills for Life</h3>
            <p>Build important academic and social skills that help in school and beyond.</p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 md:py-12 mt-auto">
        <div className="bg-primary-blue text-warm-white rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-nunito font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-6">Jump right in and explore fun activities!</p>
          <Button 
            size="large" 
            variant="secondary"
            className="bg-warm-white text-primary-blue hover:bg-warm-white/90"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
