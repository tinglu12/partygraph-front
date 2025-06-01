"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface VibeSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Simple search component for users to input their desired vibe
 * Triggers semantic search when user submits their query
 */
export const VibeSearch = ({ 
  onSearch, 
  isLoading = false,
  placeholder = "What vibe are you looking for tonight? (e.g., 'chill music and good food', 'artsy and creative')" 
}: VibeSearchProps) => {
  const [query, setQuery] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Main heading */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Find Your Vibe
        </h1>
        <p className="text-gray-300 text-lg">
          Describe what you're looking for and we'll find events that match your vibe
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full h-12 text-lg px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </div>
          )}
        </Button>
      </form>

      {/* Example suggestions */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm mb-2">Try something like:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "chill music and drinks",
            "creative and artsy vibes", 
            "high energy dancing",
            "foodie experiences",
            "outdoor summer fun"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              disabled={isLoading}
              className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-gray-300 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 