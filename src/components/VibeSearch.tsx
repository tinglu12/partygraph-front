"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Sparkles,
  Brain,
  Zap,
  ChevronDown,
  Tag,
  X,
  CalendarIcon,
} from "lucide-react";
import { getAllTags } from "@/actions/vibeSearchActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VibeSearchProps {
  onSearch: (query: string) => void;
  onTagSelect?: (tag: string) => void;
  onClearSearch?: () => void;
  onDateFilter?: (date: Date | undefined) => void;
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
  onClearSearch,
  onDateFilter,
  isLoading = false,
  placeholder = "Describe your perfect vibe...",
}: VibeSearchProps) => {
  const [query, setQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

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
        console.error("Failed to load tags:", error);
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
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e as any);
    }
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    if (onTagSelect) {
      onTagSelect(tag);
    } else {
      setQuery(tag);
      onSearch(tag);
    }
  };

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onDateFilter) {
      onDateFilter(selectedDate);
    }
  };

  // Handle clearing selection
  const handleClearSelection = () => {
    setSelectedTag("");
    setQuery("");
    setDate(undefined);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8">
      {/* Enhanced main heading with AI branding */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-6 w-full h-full">
          <Brain className="w-8 h-8 text-purple-400" />
          <Link
            href="/vibe"
            className="hover:opacity-80 transition-opacity"
            onClick={handleClearSelection}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-[1.2] py-1">
              Party Graph
            </h1>
          </Link>
          <Zap className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-8">
          Find events that match your vibe
        </p>
      </div>

      {/* Enhanced search form */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full !h-18 !text-xl px-8 bg-white/20 backdrop-blur-md border-white/40 text-white placeholder:text-gray-400 focus:bg-white/25 focus:border-purple-400/80 focus:shadow-2xl focus:shadow-purple-500/30 hover:bg-white/22 transition-all duration-300 rounded-2xl pr-14 shadow-lg"
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="flex flex-row gap-2 items-center w-full sm:w-auto">
            {/* Shadcn dropdown for manual tag selection */}
            {mounted && availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    className="h-18 px-4 pr-3 bg-white/20 backdrop-blur-md text-gray-300 !text-xl rounded-2xl border border-white/40 hover:bg-white/22 hover:text-white focus:bg-white/25 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 min-w-[180px] justify-between font-normal shadow-lg"
                  >
                    <span className={selectedTag ? "text-white" : "opacity-75"}>
                      {selectedTag || "Or view tags manually"}
                    </span>
                    <ChevronDown className="w-5 h-5 ml-2 opacity-75" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-hidden bg-white/15 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl"
                  align="end"
                >
                  <div className="max-h-60 overflow-y-auto pr-1 py-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:mr-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:mt-2 [&::-webkit-scrollbar-track]:mb-3 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
                    {selectedTag && (
                      <DropdownMenuItem
                        onClick={handleClearSelection}
                        className="text-gray-300 hover:bg-white/10 focus:bg-white/10 rounded-xl mx-1 my-0.5 cursor-pointer transition-colors duration-200 border-b border-white/20 mb-1"
                      >
                        <X className="w-4 h-4 mr-2 text-gray-400" />
                        Clear selection
                      </DropdownMenuItem>
                    )}
                    {availableTags.map((tag) => (
                      <DropdownMenuItem
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`text-white hover:bg-white/20 focus:bg-white/20 rounded-xl mx-1 my-0.5 cursor-pointer transition-colors duration-200 ${
                          selectedTag === tag
                            ? "bg-white/15 border border-purple-400/50"
                            : ""
                        }`}
                      >
                        <Tag className="w-4 h-4 mr-2 text-purple-400" />
                        {tag}
                        {selectedTag === tag && (
                          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full"></div>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Date picker with calendar popup */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className={cn(
                    "h-18 px-4 bg-white/20 backdrop-blur-md text-gray-300 !text-xl rounded-2xl border border-white/40 hover:bg-white/22 hover:text-white focus:bg-white/25 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 min-w-[160px] justify-between font-normal shadow-lg",
                    !date && "opacity-75"
                  )}
                >
                  <span className={date ? "text-white" : ""}>
                    {date ? format(date, "MMM dd, yyyy") : "Filter by date"}
                  </span>
                  <CalendarIcon className="w-5 h-5 ml-2 opacity-75" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-white/15 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl" 
                align="end"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date("1900-01-01")}
                  initialFocus
                  className="rounded-2xl border-0"
                />
                {date && (
                  <div className="p-3 border-t border-white/20">
                    <Button
                      variant="ghost"
                      onClick={() => handleDateSelect(undefined)}
                      className="w-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-18 px-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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
