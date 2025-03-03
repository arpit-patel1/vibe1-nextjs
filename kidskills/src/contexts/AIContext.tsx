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

// Provider component
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for API key
  const [apiKey, setApiKey] = useState<string>('');
  
  // State for selected model and provider
  // Initialize with a placeholder - we'll load from localStorage in useEffect
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(() => {
    // Try to get the model from localStorage first
    if (typeof window !== 'undefined') {
      try {
        const storedModelId = localStorage.getItem('selected_ai_model');
        console.log('AIProvider init: Checking for stored model ID:', storedModelId);
        
        if (storedModelId) {
          // First check if it's a predefined model
          const predefinedModel = AVAILABLE_MODELS.find(m => m.id === storedModelId);
          
          if (predefinedModel) {
            console.log('AIProvider init: Found predefined model:', predefinedModel.name);
            return predefinedModel;
          }
          
          // Check for stored model details
          const storedModelDetails = localStorage.getItem('selected_model_details');
          
          if (storedModelDetails) {
            try {
              const modelConfig = JSON.parse(storedModelDetails) as AIModelConfig;
              console.log('AIProvider init: Using stored model details:', modelConfig.name);
              return modelConfig;
            } catch (err) {
              console.error('AIProvider init: Error parsing stored model details:', err);
            }
          }
          
          // Create a basic model config from the ID
          const basicModel: AIModelConfig = {
            id: storedModelId,
            name: storedModelId.split('/').pop() || storedModelId,
            description: 'Model from localStorage',
            tokensPerMinute: 100000,
            costPer1KTokens: 0.0,
            provider: 'openrouter'
          };
          
          console.log('AIProvider init: Created basic model from ID:', basicModel.name);
          return basicModel;
        }
      } catch (err) {
        console.error('AIProvider init: Error reading from localStorage:', err);
      }
    }
    
    // Fall back to default model
    console.log('AIProvider init: Using default model');
    return AVAILABLE_MODELS.find(model => model.isDefault) || AVAILABLE_MODELS[0];
  });
  
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

  // Load API key and model from localStorage on mount
  useEffect(() => {
    // Use a separate function to handle async operations
    const initializeFromStorage = async () => {
      console.log('Initializing AIContext from localStorage');
      
      // Load OpenRouter API key
      const storedApiKey = safeLocalStorage.getItem('openrouter_api_key');
      console.log('Stored OpenRouter API key found:', storedApiKey ? 'Yes (hidden for security)' : 'No');
      
      if (storedApiKey) {
        console.log('Setting API key from localStorage');
        setApiKey(storedApiKey);
        
        // Validate the key
        try {
          console.log('Validating stored OpenRouter API key...');
          const isValid = await validateApiKey(storedApiKey);
          console.log('OpenRouter API key validation result:', isValid);
          
          // Explicitly set the validation state
          setIsApiKeyValid(isValid);
          console.log('Updated isApiKeyValid state to:', isValid);
          
          if (isValid) {
            try {
              console.log('Creating AI client for OpenRouter...');
              const defaultModel = getDefaultModelForProvider('openrouter');
              console.log('Using default model:', defaultModel.name);
              const client = createAIClient(storedApiKey, defaultModel);
              setAIClient(client);
              console.log('OpenRouter client created successfully');
              
              // Fetch available models
              console.log('Fetching available models...');
              const models = await fetchAvailableModels(storedApiKey);
              console.log('Fetched models:', models.length);
              setAvailableModels(models);
            } catch (err) {
              console.error('Error creating OpenRouter client:', err);
              setError('Error creating OpenRouter client. Please check your API key.');
              setIsApiKeyValid(false); // Reset validation state on error
            }
          } else {
            console.warn('API key validation failed');
            setIsApiKeyValid(false); // Ensure validation state is false
          }
        } catch (err) {
          console.error('Error validating stored OpenRouter API key:', err);
          setError('Error validating OpenRouter API key. Please try again.');
          setIsApiKeyValid(false); // Reset validation state on error
        }
      } else {
        console.log('No OpenRouter API key found in localStorage');
        setIsApiKeyValid(false); // Ensure validation state is false when no key exists
      }
      
      // Load selected model
      const storedModelId = safeLocalStorage.getItem('selected_ai_model');
      console.log('Stored model ID:', storedModelId);
      
      if (storedModelId) {
        // First check if it's one of our predefined models
        const predefinedModel = AVAILABLE_MODELS.find(m => m.id === storedModelId);
        
        if (predefinedModel) {
          console.log('Found predefined model:', predefinedModel.name);
          setSelectedModel(predefinedModel);
        } else {
          // Check if we have stored details for this dynamic model
          const storedModelDetails = safeLocalStorage.getItem('selected_model_details');
          console.log('Checking for stored model details:', storedModelDetails ? 'Found' : 'Not found');
          
          if (storedModelDetails) {
            try {
              const modelConfig = JSON.parse(storedModelDetails) as AIModelConfig;
              console.log('Parsed stored model details:', modelConfig.name);
              
              // Verify the ID matches
              if (modelConfig.id === storedModelId) {
                console.log('Setting selected model to stored dynamic model:', modelConfig.name);
                setSelectedModel(modelConfig);
              } else {
                console.log('Stored model details ID mismatch, creating new config');
                // Create a new config based on the ID
                const dynamicModel: AIModelConfig = {
                  id: storedModelId,
                  name: storedModelId.split('/').pop() || storedModelId,
                  description: 'Dynamic model from OpenRouter',
                  tokensPerMinute: 100000,
                  costPer1KTokens: 0.0,
                  provider: 'openrouter'
                };
                setSelectedModel(dynamicModel);
              }
            } catch (err) {
              console.error('Error parsing stored model details:', err);
              // Fallback to creating a new config
              const dynamicModel: AIModelConfig = {
                id: storedModelId,
                name: storedModelId.split('/').pop() || storedModelId,
                description: 'Dynamic model from OpenRouter',
                tokensPerMinute: 100000,
                costPer1KTokens: 0.0,
                provider: 'openrouter'
              };
              console.log('Setting selected model to new dynamic model:', dynamicModel.name);
              setSelectedModel(dynamicModel);
            }
          } else {
            // No stored details, create a new config
            const dynamicModel: AIModelConfig = {
              id: storedModelId,
              name: storedModelId.split('/').pop() || storedModelId,
              description: 'Dynamic model from OpenRouter',
              tokensPerMinute: 100000,
              costPer1KTokens: 0.0,
              provider: 'openrouter'
            };
            console.log('Setting selected model to new dynamic model:', dynamicModel.name);
            setSelectedModel(dynamicModel);
          }
        }
      } else {
        console.log('No stored model ID, using default model');
      }
    };
    
    initializeFromStorage();
    
    // Add event listener for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openrouter_api_key' && e.newValue !== apiKey) {
        console.log('OpenRouter API key changed in another tab');
        setApiKey(e.newValue || '');
      } else if (e.key === 'selected_ai_model' && e.newValue) {
        console.log('Selected model changed in another tab:', e.newValue);
        
        // First check if it's a predefined model
        const predefinedModel = AVAILABLE_MODELS.find(m => m.id === e.newValue);
        
        if (predefinedModel) {
          console.log('Found predefined model:', predefinedModel.name);
          setSelectedModel(predefinedModel);
        } else {
          // Try to get the stored details
          try {
            const storedDetails = localStorage.getItem('selected_model_details');
            
            if (storedDetails) {
              const modelConfig = JSON.parse(storedDetails) as AIModelConfig;
              
              if (modelConfig.id === e.newValue) {
                console.log('Setting selected model to stored dynamic model:', modelConfig.name);
                setSelectedModel(modelConfig);
              } else {
                // Create a new config
                const dynamicModel: AIModelConfig = {
                  id: e.newValue,
                  name: e.newValue.split('/').pop() || e.newValue,
                  description: 'Dynamic model from OpenRouter',
                  tokensPerMinute: 100000,
                  costPer1KTokens: 0.0,
                  provider: 'openrouter'
                };
                console.log('Setting selected model to new dynamic model:', dynamicModel.name);
                setSelectedModel(dynamicModel);
              }
            } else {
              // Create a new config
              const dynamicModel: AIModelConfig = {
                id: e.newValue,
                name: e.newValue.split('/').pop() || e.newValue,
                description: 'Dynamic model from OpenRouter',
                tokensPerMinute: 100000,
                costPer1KTokens: 0.0,
                provider: 'openrouter'
              };
              console.log('Setting selected model to new dynamic model:', dynamicModel.name);
              setSelectedModel(dynamicModel);
            }
          } catch (err) {
            console.error('Error handling model change event:', err);
            
            // Fallback to creating a basic model config
            const dynamicModel: AIModelConfig = {
              id: e.newValue,
              name: e.newValue.split('/').pop() || e.newValue,
              description: 'Dynamic model from OpenRouter',
              tokensPerMinute: 100000,
              costPer1KTokens: 0.0,
              provider: 'openrouter'
            };
            console.log('Setting selected model to fallback dynamic model:', dynamicModel.name);
            setSelectedModel(dynamicModel);
          }
        }
      } else if (e.key === 'selected_model_details') {
        console.log('Model details changed in another tab');
        // This is handled by the selected_ai_model change
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    console.log('OpenRouter API key changed, saving to localStorage');
    if (apiKey) {
      safeLocalStorage.setItem('openrouter_api_key', apiKey);
      
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
      safeLocalStorage.removeItem('openrouter_api_key');
      setAIClient(null);
    }
  }, [apiKey, isApiKeyValid]);

  // Save selected model to localStorage when it changes
  useEffect(() => {
    // Only save to localStorage if this is a user-initiated change, not the initial state
    if (selectedModel && selectedModel.id !== 'openai/gpt-3.5-turbo') {
      console.log('Selected model changed, saving to localStorage:', selectedModel.name);
      safeLocalStorage.setItem('selected_ai_model', selectedModel.id);
      
      // Also save the model details for future retrieval
      try {
        safeLocalStorage.setItem('selected_model_details', JSON.stringify(selectedModel));
        console.log('Saved model details to localStorage');
      } catch (err) {
        console.error('Error saving model details to localStorage:', err);
      }
      
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
      console.log('Not saving default model to localStorage');
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
          const client = createAIClient(keyToValidate, model);
          
          setAIClient(client);
          console.log(`OpenRouter client created successfully`);
          
          // Fetch available models
          fetchModels();
        } catch (err) {
          console.error(`Error creating OpenRouter client:`, err);
          setAIClient(null);
          setError(`Error creating OpenRouter client. Please check your API key.`);
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