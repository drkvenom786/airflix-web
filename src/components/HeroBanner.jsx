import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { BACKDROP_SIZE, GENRES } from '../services/tmdb';

export function HeroBanner({
  items = [],
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  isInWatchlist,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto cycle every 8 seconds
  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 6));
    }, 8000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="w-full h-[70vh] bg-neutral-900 animate-pulse flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <Sparkles className="w-6 h-6 animate-spin" />
          Loading AirFlix Spotlight...
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex] || items[0] || {};
  const title = currentItem.title || currentItem.name || 'Featured Cinema';
  const year = (currentItem.release_date || currentItem.first_air_date || '').split('-')[0];
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '8.5';
  const overview = currentItem.overview || '';
  const mediaType = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');
  const inWatchlist = typeof isInWatchlist === 'function' ? isInWatchlist(currentItem.id) : false;

  // Map genre IDs
  const itemGenres = (currentItem.genre_ids || [])
    .slice(0, 3)
    .map((gid) => GENRES[gid])
    .filter(Boolean);

  return (
    <div className="relative w-full h-[82vh] sm:h-[88vh] overflow-hidden select-none">
      {/* Dynamic Backdrop Image */}
      <div className="absolute inset-0 transition-all duration-700 ease-out transform scale-105">
        <img
          src={`${BACKDROP_SIZE.original}${currentItem.backdrop_path}`}
          alt={title}
          className="w-full h-full object-cover object-center filter brightness-90"
        />
        {/* Layered Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/70 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/40 via-transparent to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl animate-fade-in space-y-4">
          {/* Top Badge Tag */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-red-600/90 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              #{(currentIndex % 5) + 1} Spotlight
            </span>
            <span className="badge-rating text-amber-400 font-bold bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-md text-xs flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
            {year && <span className="text-gray-300 font-semibold text-xs">{year}</span>}
            <span className="badge-quality">4K ULTRA HD</span>
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-white/10 border border-white/15 text-gray-200">
              {mediaType}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-none">
            {title}
          </h1>

          {/* Genre Tags */}
          {itemGenres.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-medium text-gray-300">
              {itemGenres.map((g, idx) => (
                <React.Fragment key={g}>
                  <span className="hover:text-red-400 transition-colors">{g}</span>
                  {idx < itemGenres.length - 1 && <span className="text-red-500 font-extrabold">•</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Overview text */}
          <p className="text-gray-300 text-xs sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-md font-normal">
            {overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 pt-2 flex-wrap">
            <button
              onClick={() => onPlay(currentItem)}
              className="btn-primary text-xs sm:text-base px-4 py-2.5 sm:px-6 sm:py-3"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              Play Now
            </button>

            <button
              onClick={() => onOpenDetails(currentItem)}
              className="btn-secondary text-xs sm:text-base px-4 py-2.5 sm:px-6 sm:py-3"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              More Info
            </button>

            <button
              onClick={() => onToggleWatchlist(currentItem)}
              className={`btn-icon ${
                inWatchlist ? 'bg-red-600 border-red-600 text-white' : ''
              }`}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Carousel Indicators / Dots (Horizontal) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {items.slice(0, 6).map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-7 bg-red-600 shadow-md shadow-red-600/50'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
