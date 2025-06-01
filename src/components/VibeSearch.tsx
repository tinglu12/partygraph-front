"use client";
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';

interface VibeSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Enhanced search component for users to input their desired vibe
 * Features improved styling, animations, and visual feedback
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
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  // Handle example suggestion clicks
  const handleExampleClick = (example: string) => {
    if (!isLoading) {
      setQuery(example);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Enhanced main heading with gradient and icon */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Find Your Vibe
          </h1>
          <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Describe what you're looking for and we'll find events that match your vibe
        </p>
      </div>

      {/* Enhanced search form with better styling */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full h-14 text-lg px-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-white/40 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300 rounded-xl"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Enhanced example suggestions with better styling */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4 font-medium">Try something like:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "chill music and drinks",
            "creative and artsy vibes", 
            "high energy dancing",
            "foodie experiences",
            "outdoor summer fun",
            "intimate acoustic sets",
            "rooftop party vibes"
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-full transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 