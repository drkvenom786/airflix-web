import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';

export function MovieRow({
  title,
  subtitle,
  items = [],
  loading = false,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isFavorite,
}) {
  const rowRef = useRef(null);

  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    rowRef.current.scrollTo({
      left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-3 py-4 px-4 sm:px-6 lg:px-8 relative group">
      {/* Header Row */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full" />
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-400 font-medium ml-3.5">{subtitle}</p>}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-16 bg-black/70 hover:bg-red-600 text-white rounded-r-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl border-y border-r border-white/10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-[135px] sm:w-[180px] md:w-[210px] aspect-[2/3] skeleton rounded-2xl"
                />
              ))
            : items.map((item) => (
                <MovieCard
                  key={item.id}
                  media={item}
                  className="flex-none w-[135px] sm:w-[180px] md:w-[210px]"
                  onPlay={onPlay}
                  onOpenDetails={onOpenDetails}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleFavorite={onToggleFavorite}
                  isInWatchlist={isInWatchlist}
                  isFavorite={isFavorite}
                />
              ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-16 bg-black/70 hover:bg-red-600 text-white rounded-l-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl border-y border-l border-white/10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
