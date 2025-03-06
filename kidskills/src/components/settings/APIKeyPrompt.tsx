'use client';

import React, { useState, useEffect } from 'react';
import { useAI } from '@/contexts/AIContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Helper function to safely get environment variables
function getEnvVariable(key: string): string | undefined {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // First try window.ENV object where we stored our environment variables
      if (window.ENV && window.ENV[key as keyof typeof window.ENV]) {
        console.log(`APIKeyPrompt: Found ${key} in window.ENV`);
        return window.ENV[key as keyof typeof window.ENV];
      }
      
      // Try to get from cookies as fallback
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1];
        
        if (cookieValue) {
          console.log(`APIKeyPrompt: Found ${key} in cookies`);
          return cookieValue;
        }
      } catch (e) {
        console.error(`APIKeyPrompt: Error reading cookie for ${key}:`, e);
      }
      
      // Try localStorage as another fallback
      try {
        const localStorageValue = localStorage.getItem(key);
        if (localStorageValue) {
          console.log(`APIKeyPrompt: Found ${key} in localStorage`);
          return localStorageValue;
        }
      } catch (e) {
        console.error(`APIKeyPrompt: Error reading localStorage for ${key}:`, e);
      }
    }
    
    // Fallback to process.env for server-side or if window.ENV is not available
    if (process.env[key]) {
      console.log(`APIKeyPrompt: Found ${key} in process.env`);
      return process.env[key];
    }
    
    console.log(`APIKeyPrompt: ${key} not found in any source`);
    return undefined;
  } catch (error) {
    console.error(`APIKeyPrompt: Unexpected error getting ${key}:`, error);
    return undefined;
  }
}

export default function APIKeyPrompt() {
  const { apiKey, setApiKey, validateKey, isLoading, error, clearError, isApiKeyValid } = useAI();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showInfo, setShowInfo] = useState(false);
  const [isUsingEnvApiKey, setIsUsingEnvApiKey] = useState(false);

  // Check if we're using an environment variable on mount
  useEffect(() => {
    const envApiKey = getEnvVariable('NEXT_PUBLIC_OPENROUTER_API_KEY');
    console.log('Environment API key found:', envApiKey ? 'Yes (hidden for security)' : 'No');
    
    if (envApiKey) {
      setIsUsingEnvApiKey(true);
      // If we have an environment variable but no API key set in context, validate it
      if (!apiKey && !isApiKeyValid) {
        setApiKey(envApiKey);
        validateKey(envApiKey);
      }
    }
  }, []);

  // Update input when apiKey changes
  useEffect(() => {
    if (apiKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      await validateKey();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">OpenRouter API Key Required</h2>
      
      {isUsingEnvApiKey ? (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          <p className="font-medium">Using API key from environment variable</p>
          <p className="mt-2">
            An API key has been provided through environment variables. You can continue using this key or override it below.
          </p>
        </div>
      ) : (
        <p className="mb-6">
          To use AI-powered features, please enter your OpenRouter API key. 
          Your key is stored locally in your browser and is never sent to our servers.
        </p>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenRouter API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder={isUsingEnvApiKey ? "Using environment variable" : "sk-or-..."}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !inputKey.trim()}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${
            isLoading || !inputKey.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Validating...' : 'Save API Key'}
        </button>
      </form>
      
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-500 hover:text-blue-700 transition-colors flex items-center"
        >
          <svg
            className={`w-4 h-4 mr-1 transition-transform ${showInfo ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          How to get an OpenRouter API key
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: showInfo ? 'auto' : 0, opacity: showInfo ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-3 text-sm">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenRouter's website</a> and create an account</li>
              <li>Navigate to the Keys section</li>
              <li>Create a new API key</li>
              <li>Copy the key and paste it here</li>
            </ol>
            <p className="mt-3">
              Note: OpenRouter charges for API usage. Check their <a href="https://openrouter.ai/docs#models" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">pricing page</a> for details.
            </p>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-6 text-center">
        <Link href="/settings" className="text-blue-500 hover:text-blue-700 transition-colors">
          Go to Settings
        </Link>
      </div>
    </div>
  );
} 