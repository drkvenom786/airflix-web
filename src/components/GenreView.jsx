import React, { useState, useEffect } from 'react';
import { GENRES, tmdbApi } from '../services/tmdb';
import { MovieCard } from './MovieCard';
import { Filter, Sparkles, Film, Tv } from 'lucide-react';

export function GenreView({
  initialGenreId = 28,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isFavorite,
}) {
  const [activeGenre, setActiveGenre] = useState(initialGenreId);
  const [mediaType, setMediaType] = useState('movie'); // movie or tv
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const fetchGenreItems = async () => {
      try {
        const data = await tmdbApi.getByGenre(activeGenre, mediaType, page);
        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error('Failed to fetch genre items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenreItems();
  }, [activeGenre, mediaType, page]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Filter className="w-8 h-8 text-red-600" />
            Explore by Genre: <span className="text-red-500">{GENRES[activeGenre] || 'All'}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Discover thousands of top-rated titles filtered by category
          </p>
        </div>

        {/* Media Type Toggle */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-full w-fit">
          <button
            onClick={() => {
              setMediaType('movie');
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              mediaType === 'movie'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies
          </button>
          <button
            onClick={() => {
              setMediaType('tv');
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              mediaType === 'tv'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> TV Shows
          </button>
        </div>
      </div>

      {/* Genre Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {Object.entries(GENRES).map(([id, name]) => {
          const gid = Number(id);
          const isActive = gid === activeGenre;
          return (
            <button
              key={gid}
              onClick={() => {
                setActiveGenre(gid);
                setPage(1);
              }}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-full aspect-[2/3] skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <MovieCard
              key={item.id}
              media={{ ...item, media_type: mediaType }}
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
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="btn-secondary px-6 py-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          Previous Page
        </button>

        <span className="text-sm font-bold text-gray-300">
          Page {page} of {Math.min(totalPages, 500)}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="btn-secondary px-6 py-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
