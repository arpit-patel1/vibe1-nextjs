'use client';

import React, { useEffect, useState } from 'react';
import { useAI } from '@/contexts/AIContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import Link from 'next/link';
import LocalStorageDebugger from '@/components/debug/LocalStorageDebugger';
import { AVAILABLE_MODELS } from '@/types/ai';

export default function SettingsPage() {
  const { 
    apiKey, 
    setApiKey, 
    selectedModel, 
    setSelectedModel, 
    isApiKeyValid, 
    validateKey, 
    isLoading, 
    error, 
    clearError,
    aiClient,
    selectedProvider,
    availableModels,
    fetchModels
  } = useAI();

  const { preferences, updateCharacterPreferences } = usePreferences();

  const [inputKey, setInputKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [localStorageStatus, setLocalStorageStatus] = useState<'untested' | 'working' | 'error'>('untested');
  const [dynamicModels, setDynamicModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  
  // Popular model families for quick filtering
  const modelFamilies = [
    { name: 'All', filter: '' },
    { name: 'GPT', filter: 'gpt' },
    { name: 'Claude', filter: 'claude' },
    { name: 'Llama', filter: 'llama' },
    { name: 'Mistral', filter: 'mistral' },
    { name: 'Gemini', filter: 'gemini' },
    { name: 'Anthropic', filter: 'anthropic' },
    { name: 'OpenAI', filter: 'openai' },
  ];

  // Initialize input fields with API key from context when component mounts
  useEffect(() => {
    console.log('Settings page mounted, initializing from context');
    if (apiKey) {
      console.log('Setting input key from context OpenRouter API key');
      setInputKey(apiKey);
    }
    
    // Load dynamic models if we have a valid key
    if (isApiKeyValid) {
      loadDynamicModels();
    }
  }, []);

  // Update input field when apiKey changes in context
  useEffect(() => {
    console.log('OpenRouter API key changed in context:', apiKey ? 'Present (hidden)' : 'Not present');
    if (apiKey && apiKey !== inputKey) {
      setInputKey(apiKey);
    }
  }, [apiKey]);

  // Update when selectedModel changes
  useEffect(() => {
    console.log('Selected model changed in context:', selectedModel?.name);
  }, [selectedModel]);

  // Load dynamic models from the API
  const loadDynamicModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await fetchModels();
      setDynamicModels(models);
      console.log('Loaded dynamic models:', models);
    } catch (err) {
      console.error('Error loading dynamic models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Handle OpenRouter API key validation
  const handleValidateKey = async () => {
    clearError();
    setValidationSuccess(false);
    setIsValidating(true);
    
    console.log('Validating OpenRouter API key...');
    if (inputKey.trim()) {
      console.log('Sending key for validation, length:', inputKey.trim().length);
      const isValid = await validateKey(inputKey.trim());
      console.log('OpenRouter API key validation result:', isValid);
      
      if (isValid) {
        console.log('Validation successful, updating UI');
        setValidationSuccess(true);
        setTimeout(() => setValidationSuccess(false), 3000);
        loadDynamicModels();
      } else {
        console.log('Validation failed');
      }
    } else {
      console.log('No key to validate');
    }
    
    setIsValidating(false);
  };

  // Handle OpenRouter API key form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSaveSuccess(false);
    
    console.log('Submitting OpenRouter API key form');
    if (inputKey.trim()) {
      console.log('Setting OpenRouter API key in context');
      setApiKey(inputKey.trim());
      
      console.log('Validating OpenRouter API key...');
      const isValid = await validateKey(inputKey.trim());
      console.log('OpenRouter API key validation result:', isValid);
      
      if (isValid) {
        console.log('OpenRouter API key is valid, saving to localStorage');
        // Ensure it's saved to localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('openrouter_api_key', inputKey.trim());
            console.log('OpenRouter API key saved to localStorage');
            
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('localStorageUpdated'));
            console.log('localStorageUpdated event dispatched');
            
            // Load dynamic models
            loadDynamicModels();
            
            // Show success message
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          } catch (err) {
            console.error('Error saving OpenRouter API key to localStorage:', err);
          }
        }
      } else {
        console.log('OpenRouter API key validation failed');
      }
    } else {
      console.log('No OpenRouter API key provided');
    }
  };

  // Force revalidation of the current API key
  const handleForceRevalidate = async () => {
    clearError();
    setIsValidating(true);
    
    console.log('Force revalidating current API key...');
    const currentKey = apiKey || localStorage.getItem('openrouter_api_key') || '';
    
    if (currentKey) {
      console.log('Current key found, length:', currentKey.length);
      const isValid = await validateKey(currentKey);
      console.log('Force revalidation result:', isValid);
      
      if (isValid) {
        setValidationSuccess(true);
        setTimeout(() => setValidationSuccess(false), 3000);
      }
    } else {
      console.log('No current API key to revalidate');
    }
    
    setIsValidating(false);
  };

  // Handle model selection
  const handleModelChange = (modelId: string) => {
    console.log('Changing model to:', modelId);
    
    // First check if this is one of our predefined models
    const predefinedModel = availableModels.find(m => m.id === modelId);
    
    if (predefinedModel) {
      console.log('Found predefined model:', predefinedModel.name);
      setSelectedModel(predefinedModel);
      
      // Explicitly save to localStorage
      try {
        localStorage.setItem('selected_ai_model', predefinedModel.id);
        console.log('Saved predefined model to localStorage:', predefinedModel.id);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('localStorageUpdated'));
        console.log('localStorageUpdated event dispatched for model change');
      } catch (err) {
        console.error('Error saving model to localStorage:', err);
      }
    } else {
      // Create a temporary model config for this dynamic model
      const tempModel = {
        id: modelId,
        name: modelId.split('/').pop() || modelId, // Extract model name from ID for better display
        description: `Dynamic model from OpenRouter`,
        tokensPerMinute: 100000, // Default value
        costPer1KTokens: 0.0, // Unknown cost
        provider: 'openrouter' as 'openrouter'
      };
      
      console.log('Created temporary model config:', tempModel);
      setSelectedModel(tempModel);
      
      // Explicitly save to localStorage
      try {
        localStorage.setItem('selected_ai_model', modelId);
        console.log('Saved dynamic model ID to localStorage:', modelId);
        
        // Also save the model details for future retrieval
        localStorage.setItem('selected_model_details', JSON.stringify(tempModel));
        console.log('Saved model details to localStorage');
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('localStorageUpdated'));
        console.log('localStorageUpdated event dispatched for model change');
      } catch (err) {
        console.error('Error saving model to localStorage:', err);
      }
    }
  };

  // Direct localStorage test
  const testLocalStorage = () => {
    try {
      console.log('Testing direct localStorage access');
      const testValue = 'test_value_' + Date.now();
      localStorage.setItem('test_key', testValue);
      const retrievedValue = localStorage.getItem('test_key');
      console.log('Test localStorage value:', retrievedValue);
      
      if (retrievedValue === testValue) {
        setLocalStorageStatus('working');
        window.dispatchEvent(new Event('localStorageUpdated'));
        alert(`localStorage test successful: ${retrievedValue}`);
      } else {
        setLocalStorageStatus('error');
        alert(`localStorage test failed: Value mismatch`);
      }
    } catch (error) {
      console.error('Error testing localStorage:', error);
      setLocalStorageStatus('error');
      alert(`localStorage test failed: ${error}`);
    }
  };

  // Filter models based on search query
  const filteredModels = dynamicModels.filter(model => 
    model.toLowerCase().includes(modelSearchQuery.toLowerCase())
  );
  
  // Apply a quick filter
  const applyQuickFilter = (filter: string) => {
    setModelSearchQuery(filter);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:text-blue-700 transition-colors flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">AI Settings</h1>
      
      {/* OpenRouter API Key */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          OpenRouter API Key
          {isApiKeyValid && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="mr-1.5 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Validated
            </span>
          )}
        </h2>
        
        <p className="mb-6">
          Your OpenRouter API key is stored locally in your browser and is never sent to our servers.
          {isApiKeyValid && ' Your OpenRouter API key is valid and ready to use.'}
        </p>
        
        <div className="mb-4">
          <div className={`p-3 rounded-lg border mb-4 ${
            isApiKeyValid 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <strong>Status:</strong> {isApiKeyValid 
              ? (
                <span className="flex items-center">
                  <svg className="mr-1.5 h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Valid OpenRouter API key
                </span>
              ) 
              : 'No valid OpenRouter API key'
            }
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                id="apiKey"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-or-..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              OpenRouter API key saved successfully!
            </div>
          )}
          
          {validationSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              OpenRouter API key validated successfully!
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleValidateKey}
              disabled={isValidating || !inputKey.trim()}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                isValidating || !inputKey.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isValidating ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Validating...
                </span>
              ) : (
                'Validate API Key'
              )}
            </button>
            
            <button
              type="submit"
              disabled={isLoading || !inputKey.trim()}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                isLoading || !inputKey.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Saving...
                </span>
              ) : (
                'Save API Key'
              )}
            </button>
            
            {/* Force revalidation button */}
            {apiKey && (
              <button
                type="button"
                onClick={handleForceRevalidate}
                disabled={isValidating}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  isValidating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {isValidating ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Revalidating...
                  </span>
                ) : (
                  'Force Revalidate'
                )}
              </button>
            )}
          </div>
        </form>
        
        <div className="text-sm text-gray-600">
          <p>Don't have an API key? <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Sign up for OpenRouter</a></p>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* AI Model Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">AI Model Selection</h2>
        
        <p className="mb-6">
          Choose which model to use for generating questions and providing feedback.
          {selectedModel && (
            <span className="block mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              Current model: <span className="font-semibold text-blue-700">{selectedModel?.name || 'None selected'}</span>
            </span>
          )}
        </p>
        
        {/* Dynamic models from API */}
        <h3 className="text-lg font-semibold mb-3">Available Models from OpenRouter</h3>
        {isLoadingModels ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Loading available models...</p>
          </div>
        ) : dynamicModels.length > 0 ? (
          <div className="border rounded-lg p-4 mb-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-700">Currently selected model: <span className="font-bold">{selectedModel?.name}</span></p>
              <p className="text-sm text-blue-600 mt-1">Model ID: {selectedModel?.id}</p>
            </div>
            
            {/* Search filter for models */}
            <div className="mb-4">
              <label htmlFor="modelSearch" className="block text-sm font-medium text-gray-700 mb-1">
                Search Models
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="modelSearch"
                  value={modelSearchQuery}
                  onChange={(e) => setModelSearchQuery(e.target.value)}
                  placeholder="Type to filter models..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {modelSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModelSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {filteredModels.length} of {dynamicModels.length} models shown
              </div>
            </div>
            
            {/* Quick filter buttons */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</p>
              <div className="flex flex-wrap gap-2">
                {modelFamilies.map(family => (
                  <button
                    key={family.name}
                    onClick={() => applyQuickFilter(family.filter)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      (family.filter === '' && modelSearchQuery === '') || 
                      (family.filter !== '' && modelSearchQuery === family.filter)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {family.name}
                  </button>
                ))}
              </div>
            </div>
            
            <p className="mb-2">The following models are available from OpenRouter:</p>
            <div className="max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {filteredModels.map(model => (
                  <div 
                    key={model}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModel.id === model 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    onClick={() => handleModelChange(model)}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                        selectedModel.id === model ? 'bg-blue-500' : 'border border-gray-400'
                      }`} />
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className={`text-sm ${selectedModel.id === model ? 'font-medium' : ''}`}>
                            {model.split('/').pop() || model}
                          </span>
                          {model === selectedModel.id && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1">
                            {model.split('/')[0]}
                          </span>
                          {model}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {filteredModels.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No models match your search. Try a different query.</p>
              </div>
            )}
            <p className="mt-4 text-sm text-gray-600">
              Click on any model above to select it. Your selection will be saved automatically.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg p-4 mb-6 text-gray-600">
            <p>
              {!isApiKeyValid && 'Add a valid OpenRouter API key to see available models.'}
              {isApiKeyValid && 'No models found. Try refreshing the page or check your API key.'}
            </p>
            {isApiKeyValid && (
              <button 
                onClick={loadDynamicModels}
                className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
              >
                Refresh Models
              </button>
            )}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>
            Note: Using more powerful models may result in higher costs but can provide better quality responses.
            Check the <a href="https://openrouter.ai/docs#models" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenRouter pricing page</a> for the most up-to-date information.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Character Settings</h2>
        
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <div className="mr-3">
              <span className="text-lg font-medium">Show Character Guide</span>
              <p className="text-sm text-gray-600">Enable or disable the flying buddy character</p>
            </div>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={preferences.character.showCharacter}
                onChange={() => updateCharacterPreferences({ 
                  showCharacter: !preferences.character.showCharacter 
                })}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${
                preferences.character.showCharacter ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                preferences.character.showCharacter ? 'transform translate-x-6' : ''
              }`}></div>
            </div>
          </label>
        </div>
        
        {preferences.character.showCharacter && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              The character guide provides helpful tips and instructions throughout the app.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Troubleshooting</h3>
        <button
          onClick={testLocalStorage}
          className={`px-4 py-2 rounded-md text-sm text-white ${
            localStorageStatus === 'working' 
              ? 'bg-green-600' 
              : localStorageStatus === 'error' 
                ? 'bg-red-600' 
                : 'bg-gray-700'
          }`}
        >
          {localStorageStatus === 'working' 
            ? 'localStorage Working ✓' 
            : localStorageStatus === 'error' 
              ? 'localStorage Error ✗' 
              : 'Test localStorage'}
        </button>
        <p className="mt-2 text-sm text-gray-600">
          If you're experiencing issues with settings not saving, click the button above to test if your browser supports localStorage.
        </p>
      </div>
      
      <LocalStorageDebugger />
    </div>
  );
} 