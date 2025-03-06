import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIModelConfig, AVAILABLE_MODELS, AIRecommendations, AIProvider, AI_PROVIDERS, getModelsByProvider, getDefaultModelForProvider } from '@/types/ai';
import { validateApiKey, createAIClient, fetchAvailableModels } from '@/utils/ai';
import OpenAI from 'openai';

// Define the context type
interface AIContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: AIModelConfig;
  setSelectedModel: (model: AIModelConfig) => void;
  selectedProvider: AIProvider;
  isApiKeyValid: boolean;
  validateKey: (key?: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  recommendations: AIRecommendations | null;
  setRecommendations: (recommendations: AIRecommendations | null) => void;
  aiClient: OpenAI | null;
  availableModels: string[];
  fetchModels: () => Promise<string[]>;
}

// Create the context with default values
const AIContext = createContext<AIContextType>({
  apiKey: '',
  setApiKey: () => {},
  selectedModel: AVAILABLE_MODELS.find(model => model.isDefault) || AVAILABLE_MODELS[0],
  setSelectedModel: () => {},
  selectedProvider: AI_PROVIDERS[0],
  isApiKeyValid: false,
  validateKey: async () => false,
  isLoading: false,
  error: null,
  clearError: () => {},
  recommendations: null,
  setRecommendations: () => {},
  aiClient: null,
  availableModels: [],
  fetchModels: async () => [],
});

// Helper function to safely interact with localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        console.log(`Retrieved ${key} from localStorage:`, value ? 'Value exists' : 'No value');
        return value;
      }
      return null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        console.log(`Saving ${key} to localStorage`);
        localStorage.setItem(key, value);
        // Dispatch a custom event to notify listeners of the change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageUpdated'));
          console.log(`Dispatched localStorageUpdated event for ${key}`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined') {
        console.log(`Removing ${key} from localStorage`);
        localStorage.removeItem(key);
        // Dispatch a custom event to notify listeners of the change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageUpdated'));
          console.log(`Dispatched localStorageUpdated event for ${key}`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

// Helper function to safely get environment variables
function getEnvVariable(key: string): string | undefined {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // First try window.ENV object where we stored our environment variables
      if (window.ENV && window.ENV[key as keyof typeof window.ENV]) {
        const value = window.ENV[key as keyof typeof window.ENV];
        if (value) {
          console.log(`getEnvVariable: Found ${key} in window.ENV: ${key.includes('API_KEY') ? value.substring(0, 5) + '...' : value}`);
          return value;
        }
      }
      
      // Try to get from cookies as fallback
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1];
        
        if (cookieValue) {
          console.log(`getEnvVariable: Found ${key} in cookies: ${key.includes('API_KEY') ? cookieValue.substring(0, 5) + '...' : cookieValue}`);
          return decodeURIComponent(cookieValue);
        }
      } catch (e) {
        console.error(`getEnvVariable: Error reading cookie for ${key}:`, e);
      }
      
      // Try localStorage as another fallback
      try {
        const localStorageValue = localStorage.getItem(key);
        if (localStorageValue) {
          console.log(`getEnvVariable: Found ${key} in localStorage: ${key.includes('API_KEY') ? localStorageValue.substring(0, 5) + '...' : localStorageValue}`);
          return localStorageValue;
        }
        
        // For API key, also check the openrouter_api_key key
        if (key === 'NEXT_PUBLIC_OPENROUTER_API_KEY') {
          const openrouterApiKey = localStorage.getItem('openrouter_api_key');
          if (openrouterApiKey) {
            console.log(`getEnvVariable: Found openrouter_api_key in localStorage: ${openrouterApiKey.substring(0, 5) + '...'}`);
            return openrouterApiKey;
          }
        }
      } catch (e) {
        console.error(`getEnvVariable: Error reading localStorage for ${key}:`, e);
      }
    }
    
    // Fallback to process.env for server-side or if window.ENV is not available
    if (process.env[key]) {
      console.log(`getEnvVariable: Found ${key} in process.env: ${key.includes('API_KEY') ? '(hidden)' : process.env[key]}`);
      return process.env[key];
    }
    
    // For API key, also check OPENROUTER_API_KEY
    if (key === 'NEXT_PUBLIC_OPENROUTER_API_KEY' && process.env.OPENROUTER_API_KEY) {
      console.log(`getEnvVariable: Found OPENROUTER_API_KEY in process.env: (hidden)`);
      return process.env.OPENROUTER_API_KEY;
    }
    
    console.log(`getEnvVariable: ${key} not found in any source`);
    return undefined;
  } catch (error) {
    console.error(`getEnvVariable: Unexpected error getting ${key}:`, error);
    return undefined;
  }
}

// Define a default model to use when no model is specified
const DEFAULT_MODEL: AIModelConfig = AVAILABLE_MODELS.find(model => model.isDefault) || AVAILABLE_MODELS[0];

// Provider component
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for API key - initialize with environment variable if available
  const [apiKey, setApiKey] = useState<string>('');
  
  // State for selected model and provider
  // Initialize with a placeholder - we'll load from environment variables or localStorage in useEffect
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(DEFAULT_MODEL);
  
  const selectedProvider = AI_PROVIDERS[0]; // OpenRouter is the only provider
  
  // State for API key validation
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  
  // AI client state
  const [aiClient, setAIClient] = useState<OpenAI | null>(null);
  
  // Available models state
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Initialize from environment variables on mount
  useEffect(() => {
    console.log('AIProvider init: Checking for environment variables');
    
    // Check if window.ENV is available
    if (typeof window !== 'undefined') {
      try {
        if (window.ENV) {
          const envApiKey = window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY;
          const envModelId = window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL;
          
          console.log('window.ENV variables:', {
            NEXT_PUBLIC_OPENROUTER_API_KEY: envApiKey ? 'Set (hidden)' : 'Not set',
            NEXT_PUBLIC_DEFAULT_AI_MODEL: envModelId || 'Not set'
          });
          
          // If we have an environment API key, use it
          if (envApiKey && !apiKey) {
            console.log('Setting API key from window.ENV:', envApiKey.substring(0, 5) + '...');
            setApiKey(envApiKey);
            validateKey(envApiKey).catch(err => {
              console.error('Error validating API key from window.ENV:', err);
            });
          } else {
            console.log('No API key found in window.ENV or apiKey already set');
          }
          
          // If we have an environment model, use it
          if (envModelId) {
            console.log('Setting model from window.ENV:', envModelId);
            // Find the model in AVAILABLE_MODELS
            const envModel = AVAILABLE_MODELS.find(m => m.id === envModelId);
            if (envModel) {
              console.log('Found matching model in AVAILABLE_MODELS:', envModel.name);
              setSelectedModel(envModel);
            } else {
              console.warn(`Model ${envModelId} not found in AVAILABLE_MODELS. Available models:`, 
                AVAILABLE_MODELS.map(m => m.id).join(', '));
              console.warn('Using default model:', DEFAULT_MODEL.name);
              // If the model is not found, log a warning and use the default model
              setSelectedModel(DEFAULT_MODEL);
            }
          } else {
            console.log('AIProvider init: Using default model');
          }
        } else {
          console.log('AIProvider init: window.ENV not available');
          
          // Use default model
          console.log('AIProvider init: Using default model:', DEFAULT_MODEL.name);
          setSelectedModel(DEFAULT_MODEL);
        }
      } catch (err) {
        console.error('Error in AIProvider initialization:', err);
        // Set default model to ensure the app doesn't break
        setSelectedModel(DEFAULT_MODEL);
      }
    } else {
      console.log('AIProvider init: Not in browser environment');
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    console.log('OpenRouter API key changed');
    if (apiKey) {
      // Create AI client when API key is set and valid
      if (isApiKeyValid) {
        try {
          const client = createAIClient(apiKey, selectedModel);
          setAIClient(client);
          console.log('OpenRouter client created successfully');
        } catch (err) {
          console.error('Error creating OpenRouter client:', err);
          setAIClient(null);
        }
      }
    } else {
      setAIClient(null);
    }
  }, [apiKey, isApiKeyValid, selectedModel]);

  // Update client when selected model changes
  useEffect(() => {
    if (selectedModel) {
      console.log('Selected model changed:', selectedModel.name);
      
      // Update client if needed
      if (isApiKeyValid) {
        try {
          const client = createAIClient(apiKey, selectedModel);
          setAIClient(client);
          console.log('Updated OpenRouter client with new model');
        } catch (err) {
          console.error('Error updating OpenRouter client:', err);
        }
      }
    } else {
      console.log('No model selected');
    }
  }, [selectedModel, apiKey, isApiKeyValid]);

  // Function to validate API key
  const validateKey = async (key?: string): Promise<boolean> => {
    const keyToValidate = key || apiKey;
    
    if (!keyToValidate) {
      console.log(`validateKey: No OpenRouter API key provided`);
      setIsApiKeyValid(false);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Validating OpenRouter API key...`);
      const isValid = await validateApiKey(keyToValidate);
      console.log(`OpenRouter API key validation result:`, isValid);
      
      setIsApiKeyValid(isValid);
      
      if (isValid) {
        try {
          console.log(`Creating OpenRouter client...`);
          // Get a model for this provider
          const model = getModelsByProvider('openrouter')[0];
          
          // Create the client with error handling
          try {
            const client = createAIClient(keyToValidate, model);
            setAIClient(client);
            console.log(`OpenRouter client created successfully`);
          } catch (clientErr) {
            console.error(`Error creating OpenRouter client:`, clientErr);
            // Don't set error state here to avoid breaking the app
            // Just log the error and continue
          }
          
          // Fetch available models with error handling
          try {
            await fetchModels();
          } catch (modelsErr) {
            console.error(`Error fetching models:`, modelsErr);
            // Don't set error state here to avoid breaking the app
            // Just log the error and continue
          }
        } catch (err) {
          console.error(`Error in client setup:`, err);
          // Don't set error state here to avoid breaking the app
          // Just log the error and continue
        }
      } else {
        setAIClient(null);
        setError(`Invalid OpenRouter API key. Please check and try again.`);
      }
      
      return isValid;
    } catch (err) {
      console.error(`Error validating OpenRouter API key:`, err);
      setIsApiKeyValid(false);
      setAIClient(null);
      setError(`Error validating OpenRouter API key. Please try again.`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch available models
  const fetchModels = async (): Promise<string[]> => {
    if (!apiKey || !isApiKeyValid) {
      console.log(`fetchModels: No valid OpenRouter API key`);
      return [];
    }
    
    try {
      console.log(`Fetching available models for OpenRouter...`);
      const models = await fetchAvailableModels(apiKey);
      console.log(`Fetched ${models.length} models for OpenRouter`);
      setAvailableModels(models);
      return models;
    } catch (err) {
      console.error(`Error fetching OpenRouter models:`, err);
      return [];
    }
  };

  // Function to clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    selectedProvider,
    isApiKeyValid,
    validateKey,
    isLoading,
    error,
    clearError,
    recommendations,
    setRecommendations,
    aiClient,
    availableModels,
    fetchModels,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// Custom hook to use the AI context
export const useAI = () => useContext(AIContext);

export default AIContext; 