import React, { useState, useEffect } from 'react';
import {
  Play,
  Plus,
  Check,
  Heart,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { tmdbApi, BACKDROP_SIZE, POSTER_SIZE } from '../services/tmdb';
import { MovieRow } from './MovieRow';

function extractFranchiseName(title) {
  if (!title) return '';
  const clean = title.split(/[:\-\–\—\(\)]/)[0].trim();
  const base = clean.replace(/\s+\d+$/, '').trim();
  const genericWords = ['the', 'a', 'an', 'movie', 'show', 'film', 'official'];
  if (base && base.length >= 3 && !genericWords.includes(base.toLowerCase())) {
    return base;
  }
  return '';
}

export function MediaDetailView({
  media,
  onBack,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isFavorite,
}) {
  const [details, setDetails] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const mediaType = media?.media_type || (media?.title ? 'movie' : 'tv');

  useEffect(() => {
    if (!media || !media.id) return;
    async function fetchFullDetails() {
      setLoading(true);
      try {
        const data =
          mediaType === 'tv'
            ? await tmdbApi.getTVDetails(media.id)
            : await tmdbApi.getMovieDetails(media.id);
        setDetails(data);

        // Build exact related content (Collection + Recommendations + Franchise search)
        let list = [];

        // 1. Collection (e.g. Spider-Man Collection)
        if (data?.belongs_to_collection?.id) {
          try {
            const col = await tmdbApi.getCollection(data.belongs_to_collection.id);
            if (col?.parts && Array.isArray(col.parts)) {
              list.push(...col.parts);
            }
          } catch (e) {
            console.warn('Collection fetch error:', e);
          }
        }

        // 2. TMDB Recommendations
        if (data?.recommendations?.results && Array.isArray(data.recommendations.results)) {
          list.push(...data.recommendations.results);
        }

        // 3. Franchise Keyword Search (e.g. "Spider-Man")
        const mainTitle = data?.title || data?.name || media?.title || media?.name || '';
        const franchise = extractFranchiseName(mainTitle);
        if (franchise) {
          try {
            const searchRes =
              mediaType === 'tv'
                ? await tmdbApi.searchTV(franchise)
                : await tmdbApi.searchMovies(franchise);
            if (searchRes?.results && Array.isArray(searchRes.results)) {
              list.push(...searchRes.results);
            }
          } catch (e) {
            console.warn('Franchise search error:', e);
          }
        }

        // 4. Fallback TMDB Similar
        if (data?.similar?.results && Array.isArray(data.similar.results)) {
          list.push(...data.similar.results);
        }

        // Deduplicate items
        const uniqueMap = new Map();
        list.forEach((item) => {
          if (item && item.id && item.id !== media.id && !uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, {
              ...item,
              media_type: item.media_type || mediaType,
            });
          }
        });

        setRelatedContent(Array.from(uniqueMap.values()));
      } catch (err) {
        console.error('Error fetching full media details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFullDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [media, mediaType]);

  const [trailerReady, setTrailerReady] = useState(false);

  if (!media) return null;

  const currentData = details || media;
  const title = currentData.title || currentData.name || 'Untitled';
  const year = (currentData.release_date || currentData.first_air_date || '').split('-')[0];
  const runtime = currentData.runtime
    ? `${Math.floor(currentData.runtime / 60)}h ${currentData.runtime % 60}m`
    : currentData.number_of_seasons
    ? `${currentData.number_of_seasons} Season${currentData.number_of_seasons > 1 ? 's' : ''}`
    : '';

  // Extract YouTube Trailer Key with strict title matching or exact search fallback
  const videos = details?.videos?.results || [];
  const youtubeVideos = videos.filter((v) => v.site === 'YouTube');
  const cleanTitle = (title || '').toLowerCase().trim();

  // Find trailer whose name contains the movie title or is marked official
  const trailer =
    youtubeVideos.find(
      (v) => v.type === 'Trailer' && v.official && v.name?.toLowerCase().includes(cleanTitle)
    ) ||
    youtubeVideos.find(
      (v) => (v.type === 'Trailer' || v.type === 'Teaser') && v.name?.toLowerCase().includes(cleanTitle)
    ) ||
    youtubeVideos.find((v) => v.type === 'Trailer' && v.official) ||
    youtubeVideos.find((v) => v.type === 'Trailer') ||
    youtubeVideos[0];

  const trailerKey = trailer?.key;

  // Build exact embed URL (using key if valid, else search fallback for title)
  let embedUrl = '';
  if (trailerKey) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${
      isMuted ? 1 : 0
    }&controls=0&loop=1&playlist=${trailerKey}&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&autohide=1`;
  } else if (title) {
    const searchQuery = encodeURIComponent(`${title} ${year || ''} official trailer`);
    embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1&mute=${
      isMuted ? 1 : 0
    }&controls=0&loop=1&playsinline=1&enablejsapi=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&autohide=1`;
  }

  // Pitch-black loading curtain for 4 seconds so YouTube player icons & overlays load hidden
  useEffect(() => {
    setTrailerReady(false);
    if (!embedUrl) return;
    const timer = setTimeout(() => {
      setTrailerReady(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [embedUrl, media?.id]);

  // Extract Cast & Similar Content
  const cast = details?.credits?.cast || [];
  const similar = relatedContent;

  const inWatchlist = isInWatchlist(media.id);
  const fav = isFavorite(media.id);

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 animate-fade-in pt-16 selection:bg-red-600 selection:text-white">
      {/* HERO SPOTLIGHT HEADER WITH AUTOPLAY TRAILER BACKGROUND */}
      <div className="relative w-full h-[80vh] min-h-[600px] max-h-[850px] overflow-hidden bg-black select-none">
        {/* Background YouTube Trailer (Autoplay Muted) or High-Res Backdrop */}
        {embedUrl ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center bg-[#07090e] select-none">
            <iframe
              key={`${embedUrl}-${isMuted}`}
              src={embedUrl}
              title={`${title} Official Trailer`}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] min-w-[200vw] min-h-[200vh] object-cover border-0 pointer-events-none scale-150 origin-center transition-opacity duration-1000 ${
                trailerReady ? 'opacity-100' : 'opacity-0'
              }`}
              allow="autoplay; encrypted-media"
            />
            {/* Pitch Black Curtain Mask for First 4 Seconds to Hide Initial YouTube Icons */}
            <div
              className={`absolute inset-0 bg-[#07090e] z-20 transition-opacity duration-1000 pointer-events-none ${
                trailerReady ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{
              backgroundImage: `url(${BACKDROP_SIZE.original}${
                currentData.backdrop_path || currentData.poster_path
              })`,
            }}
          />
        )}

        {/* Dark Vignette Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/40 to-transparent z-10" />

        {/* Floating Top Controls (Back Button & Sound Toggle) */}
        <div className="absolute top-6 left-4 sm:left-12 right-4 sm:right-12 z-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/90 text-white font-bold text-xs sm:text-sm border border-white/15 backdrop-blur-xl transition-all shadow-xl hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </button>

          {trailerKey && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 backdrop-blur-xl transition-all shadow-xl"
              title={isMuted ? 'Unmute Trailer' : 'Mute Trailer'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-red-500" />}
            </button>
          )}
        </div>

        {/* Hero Spotlight Details Overlay */}
        <div className="absolute bottom-12 left-4 sm:left-12 right-4 sm:right-12 z-20 max-w-3xl space-y-4">
          {/* Metadata Badges */}
          <div className="flex items-center gap-3 flex-wrap text-xs sm:text-sm">
            <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              {mediaType}
            </span>
            {year && (
              <span className="flex items-center gap-1 text-gray-300 font-semibold">
                <Calendar className="w-4 h-4 text-red-500" /> {year}
              </span>
            )}
            {runtime && (
              <span className="flex items-center gap-1 text-gray-300 font-semibold">
                <Clock className="w-4 h-4 text-red-500" /> {runtime}
              </span>
            )}
            {currentData.vote_average > 0 && (
              <span className="flex items-center gap-1 text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                <Star className="w-4 h-4 fill-amber-400" /> {currentData.vote_average.toFixed(1)} Rating
              </span>
            )}
          </div>

          {/* Media Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
            {title}
          </h1>

          {/* Genre Badges */}
          {currentData.genres && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {currentData.genres.map((g) => (
                <span
                  key={g.id}
                  className="bg-white/10 backdrop-blur-md border border-white/15 text-gray-200 text-xs font-bold px-3 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Tagline / Overview */}
          {currentData.tagline && (
            <p className="text-sm font-semibold italic text-red-400">{currentData.tagline}</p>
          )}

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-2xl font-normal">
            {currentData.overview}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 pt-3 flex-wrap">
            <button
              onClick={() => onPlay(media)}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl shadow-red-600/40 transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" /> Play Stream
            </button>

            <button
              onClick={() => onToggleWatchlist(media)}
              className={`px-5 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all transform hover:scale-105 border ${
                inWatchlist
                  ? 'bg-red-600/20 text-red-400 border-red-500'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{inWatchlist ? 'In Watchlist' : 'Add Watchlist'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(media)}
              className={`p-3.5 rounded-2xl transition-all transform hover:scale-105 border ${
                fav
                  ? 'bg-red-600/20 border-red-500 text-red-500'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border-white/20'
              }`}
              title={fav ? 'Remove Favorite' : 'Add Favorite'}
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* CAST & ACTORS SECTION */}
      {cast.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Cast & Star Actors
            </h2>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-white/5">
            {cast.slice(0, 15).map((actor) => (
              <div
                key={actor.id}
                className="flex-shrink-0 w-32 sm:w-36 bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/10 transition-all text-center space-y-2 group"
              >
                <img
                  src={
                    actor.profile_path
                      ? `${POSTER_SIZE.small}${actor.profile_path}`
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={actor.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto border-2 border-white/10 group-hover:border-red-500 transition-colors shadow-lg"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                    {actor.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {actor.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SIMILAR & RELATED MOVIES SECTION */}
      {similar.length > 0 && (
        <section className="py-6">
          <MovieRow
            title="More Like This"
            subtitle="Recommended movies and shows you might also enjoy"
            items={similar}
            loading={loading}
            onPlay={(m) => onPlay(m)}
            onOpenDetails={(m) => onOpenDetails(m)}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            isInWatchlist={isInWatchlist}
            isFavorite={isFavorite}
          />
        </section>
      )}
    </div>
  );
}
