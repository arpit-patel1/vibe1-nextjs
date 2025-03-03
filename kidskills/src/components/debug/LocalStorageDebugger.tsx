'use client';

import React, { useState, useEffect } from 'react';

export default function LocalStorageDebugger() {
  const [storageItems, setStorageItems] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStorageItems = () => {
      try {
        const items: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            items[key] = value || '';
          }
        }
        setStorageItems(items);
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }
    };

    // Update on mount
    updateStorageItems();

    // Update on storage changes
    const handleStorageChange = () => {
      updateStorageItems();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for our own updates
    window.addEventListener('localStorageUpdated', handleStorageChange);

    // Poll for changes every second (as a fallback)
    const interval = setInterval(updateStorageItems, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
      setStorageItems({});
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm"
      >
        {isVisible ? 'Hide Debug' : 'Show Debug'}
      </button>

      {isVisible && (
        <div className="mt-2 p-4 bg-white border border-gray-300 rounded-md shadow-lg max-w-md max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">localStorage Debug</h3>
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-2 py-1 rounded-md text-xs"
            >
              Clear All
            </button>
          </div>

          {Object.keys(storageItems).length === 0 ? (
            <p className="text-gray-500 text-sm">No items in localStorage</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-1">Key</th>
                  <th className="text-left py-1">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(storageItems).map(([key, value]) => (
                  <tr key={key} className="border-t border-gray-200">
                    <td className="py-1 pr-2 font-medium">{key}</td>
                    <td className="py-1 truncate max-w-[200px]">
                      {key.includes('api_key') ? '••••••••' : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
} 