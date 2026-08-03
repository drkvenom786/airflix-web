import React, { useState } from 'react';
import { Bookmark, Heart, Film, Trash2, Sparkles } from 'lucide-react';
import { MovieCard } from './MovieCard';

export function WatchlistView({
  watchlist = [],
  favorites = [],
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isFavorite,
  onClearAll,
}) {
  const [activeTab, setActiveTab] = useState('watchlist'); // watchlist or favorites

  const displayItems = activeTab === 'watchlist' ? watchlist : favorites;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-red-600" />
            My Saved Library
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Access your personal collection of saved movies and series anytime
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full w-fit">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" /> Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 fill-current text-rose-400" /> Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {displayItems.map((item) => (
            <MovieCard
              key={item.id}
              media={item}
              className="w-full max-w-full"
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-modal rounded-3xl p-8 border border-white/10 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
            {activeTab === 'watchlist' ? <Bookmark className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-black text-white">Your {activeTab} is empty</h3>
          <p className="text-sm text-gray-400">
            Browse trending movies or TV series and click the "+" or heart button to add them here.
          </p>
        </div>
      )}
    </div>
  );
}
