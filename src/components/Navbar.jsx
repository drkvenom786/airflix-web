import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Search,
  Bookmark,
  Tv,
  TrendingUp,
  Grid,
  X,
  Menu,
  Heart,
  Sparkles,
} from 'lucide-react';
import { tmdbApi, POSTER_SIZE } from '../services/tmdb';

export function Navbar({
  currentView,
  setCurrentView,
  selectedGenre,
  setSelectedGenre,
  onSelectMedia,
  watchlistCount,
  favoritesCount,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await tmdbApi.searchMulti(searchQuery);
        // Filter out items without posters
        const filtered = (data.results || []).filter(
          (item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
        setSearchResults(filtered.slice(0, 7));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07090e]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-wider flex items-center gap-0.5">
              AIR<span className="text-red-600">FLIX</span>
            </span>
            <span className="text-[10px] text-gray-400 font-extrabold tracking-widest block -mt-1 uppercase">
              4K ULTRA HD
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('movies')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'movies'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Film className="w-4 h-4" />
            Movies
          </button>

          <button
            onClick={() => handleNavClick('tv')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'tv'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Tv className="w-4 h-4" />
            TV Series
          </button>

          <button
            onClick={() => handleNavClick('trending')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'trending'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending
          </button>

          <button
            onClick={() => handleNavClick('genre')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'genre'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-4 h-4" />
            Genres
          </button>

          <button
            onClick={() => handleNavClick('watchlist')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'watchlist'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            My List
            {(watchlistCount > 0 || favoritesCount > 0) && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white font-extrabold rounded-full">
                {watchlistCount + favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={searchRef}>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-36 sm:w-56 md:w-64 bg-black/40 border border-white/15 focus:border-red-500 focus:bg-black/80 text-white text-sm rounded-full pl-9 pr-8 py-2 outline-none transition-all duration-300 focus:w-48 sm:focus:w-72 shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-2.5 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {showSearchDropdown && (searchQuery.trim() !== '' || isSearching) && (
              <div className="absolute right-0 top-12 w-[calc(100vw-32px)] max-w-sm sm:w-96 glass-modal rounded-2xl p-2 shadow-2xl z-50 border border-white/10 overflow-hidden animate-fade-in">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-red-500" />
                    Searching movies & series...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {searchResults.map((item) => {
                      const title = item.title || item.name;
                      const year = (item.release_date || item.first_air_date || '').split('-')[0];
                      const mediaType = item.media_type || (item.title ? 'movie' : 'tv');

                      return (
                        <div
                          key={`${item.id}-${mediaType}`}
                          onClick={() => {
                            onSelectMedia(item);
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                        >
                          <img
                            src={
                              item.poster_path
                                ? `${POSTER_SIZE.small}${item.poster_path}`
                                : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={title}
                            className="w-10 h-14 object-cover rounded-lg shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span className="uppercase font-semibold text-red-400">{mediaType}</span>
                              {year && <span>• {year}</span>}
                              {item.vote_average > 0 && (
                                <span className="text-amber-400 font-bold">
                                  ★ {item.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No movies or TV shows found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-xl bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-modal border-t border-white/10 px-4 py-6 mt-3 space-y-3 animate-fade-in">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
              currentView === 'home' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('movies')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
              currentView === 'movies' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Film className="w-4 h-4" /> Movies
          </button>

          <button
            onClick={() => handleNavClick('tv')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
              currentView === 'tv' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Tv className="w-4 h-4" /> TV Series
          </button>

          <button
            onClick={() => handleNavClick('trending')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
              currentView === 'trending' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Trending
          </button>

          <button
            onClick={() => handleNavClick('genre')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 ${
              currentView === 'genre' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <Grid className="w-4 h-4" /> Genres
          </button>

          <button
            onClick={() => handleNavClick('watchlist')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
              currentView === 'watchlist' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bookmark className="w-4 h-4" /> My List
            </span>
            {watchlistCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white font-extrabold rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
