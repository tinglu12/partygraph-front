"use client";

import { useState } from 'react';
import { MessageCircle, X, Brain, Sparkles } from 'lucide-react';

interface FloatingChatButtonProps {
  onChatClick: () => void;
  isChatOpen: boolean;
  hasSelectedEvent?: boolean;
}

/**
 * Floating chat button for contextual AI assistance
 * Provides access to vibe analysis and event discussion
 */
export const FloatingChatButton = ({ 
  onChatClick, 
  isChatOpen, 
  hasSelectedEvent = false 
}: FloatingChatButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onChatClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            group relative w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
            text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 
            hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/30
            ${isChatOpen ? 'rotate-45' : 'rotate-0'}
            ${hasSelectedEvent ? 'animate-pulse' : ''}
          `}
        >
          {/* Icon with rotation animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isChatOpen ? (
              <X className="w-7 h-7 transition-transform duration-200" />
            ) : (
              <MessageCircle className="w-7 h-7 transition-transform duration-200 group-hover:scale-110" />
            )}
          </div>

          {/* AI indicator when hovering */}
          <div className={`
            absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 
            rounded-full flex items-center justify-center transition-all duration-200
            ${isHovered || isChatOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}>
            <Brain className="w-3 h-3 text-white" />
          </div>

          {/* Ripple effect on hover */}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300"></div>
        </button>

        {/* Tooltip */}
        <div className={`
          absolute right-full mr-4 top-1/2 transform -translate-y-1/2
          px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg
          whitespace-nowrap transition-all duration-200 pointer-events-none
          ${isHovered && !isChatOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
          {hasSelectedEvent ? 'Discuss Event Vibe' : 'AI Vibe Assistant'}
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>

        {/* Sparkles animation for selected event */}
        {hasSelectedEvent && !isChatOpen && (
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute -top-1 -left-1 w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0s' }} />
            <Sparkles className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-purple-400 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        )}
      </div>
    </>
  );
}; 