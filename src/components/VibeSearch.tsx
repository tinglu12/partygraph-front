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
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { getAllTags } from "@/actions/vibeSearchActions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VibeSearchProps {
  onSearch: (query: string) => void;
  onTagSelect?: (tag: string) => void;
  onClearSearch?: () => void;
  onDateFilter?: (dates: Date[]) => void;
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
  const [date, setDate] = useState<Date[]>([]);
  
  // Combobox state for tag selection
  const [tagComboboxOpen, setTagComboboxOpen] = useState(false);
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
  const [previewDates, setPreviewDates] = useState<Date[]>([]);

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

  // Handle drag start
  const handleDragStart = (startDate: Date) => {
    setIsDragging(true);
    setDragStartDate(startDate);
    
    // Determine drag mode based on initial date selection state
    const isStartSelected = isDateSelected(startDate);
    setDragMode(isStartSelected ? 'deselect' : 'select');
    
    // Set initial preview
    setPreviewDates([startDate]);
  };

  // Handle drag over/move
  const handleDragMove = (currentDate: Date) => {
    if (!isDragging || !dragStartDate) return;
    
    // Calculate range between start and current date
    const rangeDates = getDateRange(dragStartDate, currentDate);
    setPreviewDates(rangeDates);
  };

  // Handle drag end
  const handleDragEnd = (endDate: Date) => {
    if (!isDragging || !dragStartDate) return;
    
    const rangeDates = getDateRange(dragStartDate, endDate);
    
    let newSelection: Date[];
    
    if (dragMode === 'select') {
      // Add range dates to selection (avoid duplicates)
      const existingTimes = new Set(date.map(d => d.getTime()));
      const newDates = rangeDates.filter(d => !existingTimes.has(d.getTime()));
      newSelection = [...date, ...newDates];
    } else {
      // Remove range dates from selection
      const rangeTimes = new Set(rangeDates.map(d => d.getTime()));
      newSelection = date.filter(d => !rangeTimes.has(d.getTime()));
    }
    
    handleDateSelect(newSelection);
    
    // Reset drag state
    setIsDragging(false);
    setDragStartDate(null);
    setPreviewDates([]);
  };

  // Handle global mouse events for drag operations
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging && dragStartDate) {
        handleDragEnd(dragStartDate);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Prevent text selection during drag
        e.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.body.style.userSelect = 'none'; // Prevent text selection
      
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragStartDate]);

  // Helper function to check if a date is selected
  const isDateSelected = (checkDate: Date): boolean => {
    return date.some(selectedDate => 
      selectedDate.getTime() === checkDate.getTime()
    );
  };

  // Helper function to get dates between two dates (inclusive)
  const getDateRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const startTime = Math.min(start.getTime(), end.getTime());
    const endTime = Math.max(start.getTime(), end.getTime());
    
    for (let time = startTime; time <= endTime; time += 24 * 60 * 60 * 1000) {
      dates.push(new Date(time));
    }
    
    return dates;
  };

  // Handle single click (original behavior)
  const handleSingleDateClick = (clickedDate: Date) => {
    if (isDragging) return; // Don't handle single clicks during drag
    
    const isSelected = isDateSelected(clickedDate);
    let newSelection: Date[];
    
    if (isSelected) {
      // Remove the date
      newSelection = date.filter(d => d.getTime() !== clickedDate.getTime());
    } else {
      // Add the date
      newSelection = [...date, clickedDate];
    }
    
    handleDateSelect(newSelection);
  };

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

  // Handle tag selection from combobox
  const handleTagSelect = (tagValue: string) => {
    const newTag = tagValue === selectedTag ? "" : tagValue;
    setSelectedTag(newTag);
    setTagComboboxOpen(false);
    
    if (newTag) {
      if (onTagSelect) {
        onTagSelect(newTag);
      } else {
        setQuery(newTag);
        onSearch(newTag);
      }
    }
  };

  // Handle date selection
  const handleDateSelect = (selectedDates: Date[] | undefined) => {
    const dates = selectedDates || [];
    setDate(dates);
    if (onDateFilter) {
      onDateFilter(dates);
    }
  };

  // Handle clearing selection
  const handleClearSelection = () => {
    setSelectedTag("");
    setQuery("");
    setDate([]);
    setPreviewDates([]);
    setIsDragging(false);
    setDragStartDate(null);
    if (onClearSearch) {
      onClearSearch();
    }
  };

  // Custom DraggableCalendar component
  const DraggableCalendar = () => {
    return (
      <div
        className="select-none"
        onMouseLeave={() => {
          if (isDragging && dragStartDate) {
            handleDragEnd(dragStartDate);
          }
        }}
      >
        <Calendar
          mode="multiple"
          selected={date}
          onSelect={() => {}} // We'll handle selection manually
          disabled={(dateToCheck) => dateToCheck < new Date("1900-01-01")}
          initialFocus
          className="rounded-2xl border-0"
          classNames={{
            day_today: "bg-gray-100/10 text-gray-300 hover:bg-gray-100/20"
          }}
          components={{
            Day: ({ date: dayDate, displayMonth, ...props }) => {
              const isSelected = date.some(d => d.getTime() === dayDate.getTime());
              const isPreview = isDragging && previewDates.some(p => p.getTime() === dayDate.getTime());
              
              return (
                <button
                  className={cn(
                    "size-8 p-0 font-normal relative cursor-pointer transition-colors rounded-md",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isPreview && dragMode === 'select' && "bg-purple-400/40 text-white border border-purple-400/60",
                    isPreview && dragMode === 'deselect' && "bg-red-400/40 text-white border border-red-400/60",
                    !isSelected && !isPreview && "hover:bg-accent hover:text-accent-foreground",
                    dayDate.toDateString() === new Date().toDateString() && "bg-gray-100/10 text-gray-300"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleDragStart(dayDate);
                  }}
                  onMouseEnter={() => {
                    if (isDragging) {
                      handleDragMove(dayDate);
                    }
                  }}
                  onMouseUp={() => {
                    if (isDragging) {
                      handleDragEnd(dayDate);
                    } else {
                      handleSingleDateClick(dayDate);
                    }
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleDragStart(dayDate);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    // Get the element under the touch point
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    const dayButton = element?.closest('[data-date]');
                    if (dayButton) {
                      const dateStr = dayButton.getAttribute('data-date');
                      if (dateStr) {
                        const touchDate = new Date(dateStr);
                        handleDragMove(touchDate);
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    if (isDragging && dragStartDate) {
                      handleDragEnd(dragStartDate);
                    } else {
                      handleSingleDateClick(dayDate);
                    }
                  }}
                  data-date={dayDate.toISOString()}
                >
                  {dayDate.getDate()}
                </button>
              );
            }
          }}
        />
      </div>
    );
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
            {/* Combobox for tag selection */}
            {mounted && availableTags.length > 0 && (
              <Popover open={tagComboboxOpen} onOpenChange={setTagComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={tagComboboxOpen}
                    disabled={isLoading}
                    className="h-18 px-4 pr-3 bg-white/20 backdrop-blur-md text-gray-300 !text-xl rounded-2xl border border-white/40 hover:bg-white/22 hover:text-white focus:bg-white/25 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 min-w-[180px] justify-between font-normal shadow-lg"
                  >
                    <span className={selectedTag ? "text-white" : "opacity-75"}>
                      {selectedTag || "Search by tag"}
                    </span>
                    <ChevronsUpDown className="w-5 h-5 ml-2 opacity-75" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[var(--radix-popover-trigger-width)] p-0 bg-white/15 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl" 
                  align="end"
                >
                  <Command className="bg-transparent">
                    <CommandInput 
                      placeholder="Search tags..." 
                      className="h-12 text-white placeholder:text-gray-400 bg-transparent border-0 focus:ring-0"
                    />
                    <CommandList className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:mr-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:mt-2 [&::-webkit-scrollbar-track]:mb-3 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent">
                      <CommandEmpty className="text-gray-300 py-6 text-center">
                        No tags found.
                      </CommandEmpty>
                      <CommandGroup>
                        {selectedTag && (
                          <CommandItem
                            value=""
                            onSelect={() => {
                              setSelectedTag("");
                              setTagComboboxOpen(false);
                              if (onClearSearch) {
                                onClearSearch();
                              }
                            }}
                            className="text-gray-300 hover:bg-white/10 focus:bg-white/10 rounded-xl mx-1 my-0.5 cursor-pointer transition-colors duration-200 border-b border-white/20 mb-1"
                          >
                            <X className="w-4 h-4 mr-2 text-gray-400" />
                            Clear selection
                          </CommandItem>
                        )}
                        {availableTags.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={handleTagSelect}
                            className={`text-white hover:bg-white/20 focus:bg-white/20 rounded-xl mx-1 my-0.5 cursor-pointer transition-colors duration-200 ${
                              selectedTag === tag
                                ? "bg-white/15 border border-purple-400/50"
                                : ""
                            }`}
                          >
                            <Tag className="w-4 h-4 mr-2 text-purple-400" />
                            {tag}
                            <Check
                              className={cn(
                                "ml-auto w-4 h-4",
                                selectedTag === tag ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {/* Date picker with calendar popup */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className={cn(
                    "h-18 px-4 bg-white/20 backdrop-blur-md text-gray-300 !text-xl rounded-2xl border border-white/40 hover:bg-white/22 hover:text-white focus:bg-white/25 focus:border-blue-400/80 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 min-w-[160px] justify-between font-normal shadow-lg",
                    date.length === 0 && "opacity-75"
                  )}
                >
                  <span className={date.length > 0 ? "text-white" : ""}>
                    {date.length === 0 
                      ? "Filter by date"
                      : date.length === 1 
                      ? format(date[0], "MMM dd, yyyy")
                      : date.length <= 3
                      ? date.map(d => format(d, "MMM dd")).join(", ")
                      : `${date.length} dates selected`
                    }
                  </span>
                  <CalendarIcon className="w-5 h-5 ml-2 opacity-75" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-white/15 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl" 
                align="end"
              >
                <DraggableCalendar />
                {date.length > 0 && (
                  <div className="p-3 border-t border-white/20">
                    <Button
                      variant="ghost"
                      onClick={() => handleDateSelect([])}
                      className="w-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear {date.length === 1 ? "date" : "dates"}
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
