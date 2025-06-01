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
  placeholder = "Search... (e.g. energetic music with great food, chill art gallery vibes, etc)" 
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
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-[1.1]">
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
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
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
          <div className="flex flex-row gap-2 items-center w-full sm:w-auto">
            {/* Dropdown for manual tag selection */}
            {mounted && availableTags.length > 0 && (
              <select
                className="h-16 px-4 pr-10 bg-white/10 text-gray-400 text-lg rounded-xl border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 outline-none min-w-[180px] [&>option:not(:disabled)]:text-white [&>option:not(:disabled)]:bg-slate-800"
                disabled={isLoading}
                defaultValue=""
                onChange={e => {
                  if (e.target.value) handleTagClick(e.target.value);
                }}
              >
                <option value="" disabled className="text-gray-400">Or view tags manually</option>
                {availableTags.map(tag => (
                  <option key={tag} value={tag} className="text-white bg-slate-800">{tag}</option>
                ))}
              </select>
            )}
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
        </div>
      </form>

      {/* Remove the available tags section below the search bar */}
      {/* Enhanced suggestions section */}
      <div className="text-center space-y-6"></div>
    </div>
  );
}; 