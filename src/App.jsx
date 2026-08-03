import React, { useState, useEffect } from 'react';
import { tmdbApi, detectUserRegion } from './services/tmdb';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieRow } from './components/MovieRow';
import { MediaDetailView } from './components/MediaDetailView';
import { PlayerModal } from './components/PlayerModal';
import { GenreView } from './components/GenreView';
import { WatchlistView } from './components/WatchlistView';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedGenre, setSelectedGenre] = useState(28);

  // Region detection state
  const [userRegion, setUserRegion] = useState({
    countryCode: 'IN',
    countryName: 'India',
  });

  // Content state
  const [trending, setTrending] = useState([]);
  const [regionalMovies, setRegionalMovies] = useState([]);
  const [regionalTV, setRegionalTV] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / View state
  const [detailMedia, setDetailMedia] = useState(null);
  const [playerState, setPlayerState] = useState(null); // { media, season, episode }

  // LocalStorage saved lists
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('airflix_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('airflix_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('airflix_watchlist', JSON.stringify(watchlist));
    } catch (err) {
      console.error('Error saving watchlist:', err);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('airflix_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Error saving favorites:', err);
    }
  }, [favorites]);

  // Detect Region & Load Feed with Regional Datasets
  useEffect(() => {
    async function loadFeed() {
      setLoading(true);

      // Auto-detect user region
      const regionData = await detectUserRegion();
      setUserRegion(regionData);

      const promises = [
        tmdbApi.getTrending('all', 'week', 1),
        tmdbApi.getRegionalMovies(regionData.countryCode, 1),
        tmdbApi.getRegionalTV(regionData.countryCode, 1),
        tmdbApi.getPopularMovies(1),
        tmdbApi.getTopRatedMovies(1),
        tmdbApi.getNowPlayingMovies(1),
        tmdbApi.getPopularTV(1),
        tmdbApi.getTopRatedTV(1),
        tmdbApi.getByGenre(28, 'movie', 1, 'popularity.desc'), // Action
        tmdbApi.getByGenre(878, 'movie', 1, 'vote_count.desc'), // Sci-Fi
        tmdbApi.getByGenre(35, 'movie', 1, 'revenue.desc'), // Comedy
        tmdbApi.getByGenre(27, 'movie', 1, 'popularity.desc'), // Horror
      ];

      try {
        const results = await Promise.allSettled(promises);
        const getData = (res) => (res.status === 'fulfilled' && res.value?.results ? res.value.results : []);

        setTrending(getData(results[0]));
        setRegionalMovies(getData(results[1]));
        setRegionalTV(getData(results[2]));
        setPopularMovies(getData(results[3]));
        setTopRatedMovies(getData(results[4]));
        setNowPlayingMovies(getData(results[5]));
        setPopularTV(getData(results[6]));
        setTopRatedTV(getData(results[7]));
        setActionMovies(getData(results[8]));
        setScifiMovies(getData(results[9]));
        setComedyMovies(getData(results[10]));
        setHorrorMovies(getData(results[11]));
      } catch (err) {
        console.error('Failed to load feed:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  // Helper watchlist & favorite functions
  const isInWatchlist = (id) => (id ? watchlist.some((item) => item.id === id) : false);
  const isFavorite = (id) => (id ? favorites.some((item) => item.id === id) : false);

  const toggleWatchlist = (media) => {
    if (!media || !media.id) return;
    if (isInWatchlist(media.id)) {
      setWatchlist((prev) => prev.filter((item) => item.id !== media.id));
    } else {
      setWatchlist((prev) => [media, ...prev]);
    }
  };

  const toggleFavorite = (media) => {
    if (!media || !media.id) return;
    if (isFavorite(media.id)) {
      setFavorites((prev) => prev.filter((item) => item.id !== media.id));
    } else {
      setFavorites((prev) => [media, ...prev]);
    }
  };

  const handlePlayMedia = (media, season = 1, episode = 1) => {
    if (!media) return;
    setPlayerState({ media, season, episode });
  };

  const handleOpenDetailView = (media) => {
    if (!media) return;
    setDetailMedia(media);
    setCurrentView('detail');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        onSelectMedia={handleOpenDetailView}
        watchlistCount={watchlist.length}
        favoritesCount={favorites.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div className="space-y-6 pb-12">
            {/* Spotlight Banner */}
            <HeroBanner
              items={trending.length > 0 ? trending : popularMovies}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            {/* Trending Row */}
            <MovieRow
              title="Trending This Week"
              subtitle="The most watched movies & TV series right now"
              items={trending}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            {/* Region Auto-Detected Movie Row */}
            <MovieRow
              title={`Top Movies in ${userRegion.countryName}`}
              subtitle={`Trending movies automatically tailored for ${userRegion.countryName}`}
              items={regionalMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            {/* Region Auto-Detected TV Show Row */}
            <MovieRow
              title={`Popular TV Series in ${userRegion.countryName}`}
              subtitle={`Top rated regional series popular in ${userRegion.countryName}`}
              items={regionalTV}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            {/* Global Popular Movies */}
            <MovieRow
              title="Popular Blockbusters"
              subtitle="Critically acclaimed movies loved by fans worldwide"
              items={popularMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Popular TV Shows"
              subtitle="Binge-worthy series and trending TV episodes"
              items={popularTV}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Action & Thrillers"
              subtitle="High octane action, explosions, and suspense"
              items={actionMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Sci-Fi & Cyberpunk"
              subtitle="Futuristic worlds, space adventures, and alien encounters"
              items={scifiMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Top Rated Masterpieces"
              subtitle="Highest community rated movies of all time"
              items={topRatedMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Comedy & Laughs"
              subtitle="Funniest comedy films for the perfect weekend"
              items={comedyMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />

            <MovieRow
              title="Horror & Spooky Thrills"
              subtitle="Dark nightmares, supernatural haunts, and jump scares"
              items={horrorMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
          </div>
        )}

        {currentView === 'movies' && (
          <div className="pt-20">
            <HeroBanner
              items={popularMovies}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
            <MovieRow
              title="Now Playing in Theaters"
              items={nowPlayingMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
            <MovieRow
              title="Popular Movies"
              items={popularMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
            <MovieRow
              title="Top Rated Cinema"
              items={topRatedMovies}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
          </div>
        )}

        {currentView === 'tv' && (
          <div className="pt-20">
            <HeroBanner
              items={popularTV}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
            <MovieRow
              title="Popular TV Shows"
              items={popularTV}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
            <MovieRow
              title="Top Rated TV Series"
              items={topRatedTV}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
          </div>
        )}

        {currentView === 'trending' && (
          <div className="pt-20">
            <HeroBanner
              items={trending}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
            <MovieRow
              title="Trending This Week"
              items={trending}
              loading={loading}
              onPlay={(m) => handlePlayMedia(m)}
              onOpenDetails={handleOpenDetailView}
              onToggleWatchlist={toggleWatchlist}
              onToggleFavorite={toggleFavorite}
              isInWatchlist={isInWatchlist}
              isFavorite={isFavorite}
            />
          </div>
        )}

        {currentView === 'genre' && (
          <GenreView
            initialGenreId={selectedGenre}
            onPlay={(m) => handlePlayMedia(m)}
            onOpenDetails={handleOpenDetailView}
            onToggleWatchlist={toggleWatchlist}
            onToggleFavorite={toggleFavorite}
            isInWatchlist={isInWatchlist}
            isFavorite={isFavorite}
          />
        )}

        {currentView === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            favorites={favorites}
            onPlay={(m) => handlePlayMedia(m)}
            onOpenDetails={handleOpenDetailView}
            onToggleWatchlist={toggleWatchlist}
            onToggleFavorite={toggleFavorite}
            isInWatchlist={isInWatchlist}
            isFavorite={isFavorite}
          />
        )}

        {/* Dedicated Full-Page Media Detail View */}
        {currentView === 'detail' && detailMedia && (
          <MediaDetailView
            media={detailMedia}
            onBack={() => setCurrentView('home')}
            onPlay={(m) => handlePlayMedia(m)}
            onOpenDetails={handleOpenDetailView}
            onToggleWatchlist={toggleWatchlist}
            onToggleFavorite={toggleFavorite}
            isInWatchlist={isInWatchlist}
            isFavorite={isFavorite}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Stream Video Player Modal (VidKing Exclusive) */}
      {playerState && (
        <PlayerModal
          media={playerState.media}
          initialSeason={playerState.season}
          initialEpisode={playerState.episode}
          onClose={() => setPlayerState(null)}
        />
      )}
    </div>
  );
}
