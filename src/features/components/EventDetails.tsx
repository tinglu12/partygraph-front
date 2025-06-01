import { EventNode } from "@/lib/sampleData";
import { X, Calendar, Info, Tag as TagIcon, Folder, Sparkles, Pin } from "lucide-react";

interface EventDetailsProps {
  event: EventNode | null;
  onClose: () => void;
  onPin?: (event: EventNode) => void;
  isPinned?: boolean;
  hasTabNavigation?: boolean;
}

export function EventDetails({ event, onClose, onPin, isPinned = false, hasTabNavigation = false }: EventDetailsProps) {
  if (!event) return null;

  return (
    <div className={`w-[400px] bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-r border-white/20 shadow-2xl rounded-l-lg ${
      hasTabNavigation ? 'h-[calc(100%-3rem)]' : 'h-full'
    }`}>
      {/* Enhanced header with glass morphism */}
      <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-tl-lg ${
        hasTabNavigation 
          ? 'border-b border-white/10' 
          : 'border-b border-white/10'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-base font-bold text-white">Event Details</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {onPin && (
            <button
              onClick={() => onPin(event)}
              className={`p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border ${
                isPinned 
                  ? 'bg-purple-600/30 border-purple-400/50 text-purple-200' 
                  : 'bg-white/10 hover:bg-white/20 border-white/10 hover:border-white/30 text-gray-300 hover:text-white'
              }`}
              title={isPinned ? "Pinned" : "Pin event"}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compact content without scrolling */}
      <div className="p-4 h-[calc(100%-64px)] space-y-3">
        {/* Event title */}
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-white mb-1 leading-tight">{event.title}</h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto"></div>
        </div>

        {/* Date section */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Calendar className="w-3 h-3 text-blue-300" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</h3>
          </div>
          <p className="text-white font-medium ml-8">{event.date}</p>
        </div>

        {/* Description section */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-lg flex items-center justify-center border border-green-500/30">
              <Info className="w-3 h-3 text-green-300" />
            </div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</h3>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed ml-8">{event.description}</p>
        </div>

        {/* Category section */}
        {event.category && (
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-600/30 to-red-600/30 rounded-lg flex items-center justify-center border border-orange-500/30">
                <Folder className="w-3 h-3 text-orange-300" />
              </div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</h3>
            </div>
            <div className="ml-8">
              <span className="bg-gradient-to-r from-orange-600/25 to-red-600/25 text-orange-200 px-3 py-1 rounded-full text-xs font-medium border border-orange-500/30 backdrop-blur-sm">
                {event.category}
              </span>
            </div>
          </div>
        )}

        {/* Tags section */}
        {event.tags && event.tags.length > 0 && (
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg flex items-center justify-center border border-purple-500/30">
                <TagIcon className="w-3 h-3 text-purple-300" />
              </div>
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-1 ml-8">
              {event.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-gradient-to-r from-purple-600/25 to-pink-600/25 text-purple-200 px-2 py-0.5 rounded-full text-xs font-medium border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 