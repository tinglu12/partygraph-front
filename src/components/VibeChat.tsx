"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Brain, User, Bot, Sparkles, Calendar, MapPin, Tag } from 'lucide-react';
import { EventNode } from '@/types/EventGraph';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VibeChatProps {
  selectedEvent?: EventNode | null;
  onClose: () => void;
}

/**
 * AI-powered chat interface for discussing event vibes
 * Provides contextual assistance and vibe analysis
 */
export const VibeChat = ({ selectedEvent, onClose }: VibeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: selectedEvent 
        ? `Hi! I'm your AI vibe assistant. I can help you understand the vibe and atmosphere of "${selectedEvent.title}". What would you like to know about this event?`
        : "Hi! I'm your AI vibe assistant. I can help you discover events that match your perfect vibe, analyze event atmospheres, and suggest similar experiences. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [selectedEvent]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual AI integration)
      const aiResponse = await generateAIResponse(inputValue, selectedEvent);
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-8 h-8 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Vibe Assistant</h3>
            <p className="text-sm text-gray-400">
              {selectedEvent ? `Discussing: ${selectedEvent.title}` : 'Ready to help with vibes'}
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>

      {/* Selected Event Context (if any) */}
      {selectedEvent && (
        <div className="p-4 bg-white/5 border-b border-white/10">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{selectedEvent.title}</h4>
              <p className="text-sm text-gray-300 line-clamp-2">{selectedEvent.description}</p>
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Tag className="w-4 h-4 text-green-400" />
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-purple-600/20 text-purple-200 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {selectedEvent.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{selectedEvent.tags.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            {!message.isUser && (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`
              max-w-[75%] rounded-2xl px-4 py-3 ${
                message.isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white/10 text-gray-100'
              }
            `}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {message.isUser && (
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedEvent ? "Ask about this event's vibe..." : "Ask me about vibes, events, or atmospheres..."}
            disabled={isLoading}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-purple-400/60"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI assistant powered by LLaMA • Press Enter to send
        </p>
      </div>
    </div>
  );
};

// Simulate AI response generation (replace with actual AI integration)
async function generateAIResponse(userMessage: string, selectedEvent?: EventNode | null): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const lowerMessage = userMessage.toLowerCase();

  // Context-aware responses based on selected event
  if (selectedEvent) {
    if (lowerMessage.includes('vibe') || lowerMessage.includes('atmosphere')) {
      const tags = selectedEvent.tags?.join(', ') || 'general';
      return `Based on "${selectedEvent.title}", this event has a ${tags} vibe. The atmosphere would likely be ${getVibeDescription(selectedEvent)}. What specific aspect of the vibe interests you most?`;
    }
    
    if (lowerMessage.includes('similar') || lowerMessage.includes('recommend')) {
      return `For events similar to "${selectedEvent.title}", I'd recommend looking for events with these tags: ${selectedEvent.tags?.slice(0, 3).join(', ')}. The vibe you're looking for seems to be ${getVibeDescription(selectedEvent)}. Would you like me to help you search for similar events?`;
    }

    if (lowerMessage.includes('crowd') || lowerMessage.includes('people')) {
      return `"${selectedEvent.title}" would likely attract ${getCrowdDescription(selectedEvent)}. The social energy would be ${getEnergyLevel(selectedEvent)}. Are you looking for advice on what to expect or how to enjoy the event?`;
    }
  }

  // General vibe-related responses
  if (lowerMessage.includes('vibe') && (lowerMessage.includes('find') || lowerMessage.includes('discover'))) {
    return "I'd love to help you find events that match your vibe! Can you describe what kind of atmosphere you're looking for? For example: energetic and social, calm and artistic, or maybe something adventurous?";
  }

  if (lowerMessage.includes('music') || lowerMessage.includes('concert')) {
    return "Music events have such diverse vibes! Are you looking for something intimate like a jazz club, high-energy like electronic dance music, or maybe something in between? I can help you find the perfect musical atmosphere.";
  }

  // Default responses
  const responses = [
    "That's an interesting question about vibes! Can you tell me more about what specific atmosphere or feeling you're looking for?",
    "I'm here to help you understand and discover great vibes! What kind of event experience are you hoping to find?",
    "Vibes are so personal and unique! Let me know what draws you to certain events and I can help you find similar experiences.",
    "Every event has its own special energy. What elements make an event feel right for you?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper functions for generating contextual responses
function getVibeDescription(event: EventNode): string {
  const tags = event.tags || [];
  
  if (tags.includes('party') || tags.includes('dance')) return 'energetic and social';
  if (tags.includes('art') || tags.includes('gallery')) return 'sophisticated and contemplative';
  if (tags.includes('music') || tags.includes('concert')) return 'immersive and rhythmic';
  if (tags.includes('food') || tags.includes('festival')) return 'communal and celebratory';
  if (tags.includes('outdoor')) return 'relaxed and natural';
  
  return 'unique and engaging';
}

function getCrowdDescription(event: EventNode): string {
  const tags = event.tags || [];
  
  if (tags.includes('party')) return 'young, energetic people looking to dance and socialize';
  if (tags.includes('art')) return 'creative individuals and art enthusiasts';
  if (tags.includes('music')) return 'music lovers and fans of the genre';
  if (tags.includes('food')) return 'food enthusiasts and social groups';
  
  return 'a diverse mix of people interested in the event\'s theme';
}

function getEnergyLevel(event: EventNode): string {
  const tags = event.tags || [];
  
  if (tags.includes('party') || tags.includes('dance')) return 'high-energy and dynamic';
  if (tags.includes('jazz') || tags.includes('classical')) return 'relaxed and focused';
  if (tags.includes('festival')) return 'vibrant and communal';
  
  return 'engaging and positive';
} 