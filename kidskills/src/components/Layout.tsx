'use client';

import React, { ReactNode } from 'react';
import Head from 'next/head';
import { MainNavigation } from './navigation/MainNavigation';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'KidSkills - Fun Learning for Kids'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="KidSkills - Fun and interactive learning for children in grades 2-3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-warm-white">
        <MainNavigation />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="py-4 bg-white shadow-sm mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} KidSkills. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}; 