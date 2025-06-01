"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Brain, Zap } from 'lucide-react';
import { getAllTags } from '@/actions/vibeSearchActions';

interface VibeSearchProps {
  onSearch: (query: string) => void;
  onTagSelect?: (tag: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Enhanced search component with semantic AI-powered search capabilities
 * Features beautiful modern design, tag suggestions, and LLaMA integration
 */
export const VibeSearch = ({ 
  onSearch, 
  onTagSelect,
  isLoading = false,
  placeholder = "Describe your perfect vibe... (e.g., 'energetic music with great food', 'chill art gallery vibes')" 
}: VibeSearchProps) => {
  const [query, setQuery] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load available tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    
    if (mounted) {
      loadTags();
    }
  }, [mounted]);

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

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    if (onTagSelect) {
      onTagSelect(tag);
    } else {
      setQuery(tag);
      onSearch(tag);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8">
      {/* Enhanced main heading with AI branding */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Party Graph
          </h1>
          <Zap className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Describe your perfect vibe
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span>Powered by LLaMA AI for intelligent semantic matching</span>
        </div>
      </div>

      {/* Enhanced search form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full h-16 text-lg px-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-purple-400/50 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300 rounded-xl pr-12"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="h-16 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">AI Searching...</span>
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

      {/* Enhanced suggestions section */}
      <div className="text-center space-y-6">
        {/* Available tags section - only show when mounted and tags are loaded */}
        {mounted && availableTags.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300 text-sm mb-4 font-medium flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              Or search by specific tags:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-blue-100 rounded-full border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 