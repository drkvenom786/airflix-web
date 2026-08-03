import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  Tv,
  Heart,
  Video,
  Sparkles,
  Download,
} from 'lucide-react';
import { tmdbApi, BACKDROP_SIZE, POSTER_SIZE } from '../services/tmdb';
import { MovieCard } from './MovieCard';

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

export function DetailModal({
  media,
  onClose,
  onPlay,
  onToggleWatchlist,
  onToggleFavorite,
  isInWatchlist,
  isFavorite,
}) {
  const [details, setDetails] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, episodes, trailers, cast
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  const mediaType = media?.media_type || (media?.title ? 'movie' : 'tv');
  const inWatchlist = media ? isInWatchlist(media.id) : false;
  const fav = media ? isFavorite(media.id) : false;

  useEffect(() => {
    if (!media) return;
    setLoading(true);
    const fetchDetails = async () => {
      try {
        let data;
        if (mediaType === 'tv') {
          data = await tmdbApi.getTVDetails(media.id);
        } else {
          data = await tmdbApi.getMovieDetails(media.id);
        }
        setDetails(data);

        // Fetch exact related content
        let list = [];
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
        if (data?.recommendations?.results && Array.isArray(data.recommendations.results)) {
          list.push(...data.recommendations.results);
        }
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
        if (data?.similar?.results && Array.isArray(data.similar.results)) {
          list.push(...data.similar.results);
        }

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
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [media, mediaType]);

  // Fetch TV Season Data when tab/season changes
  useEffect(() => {
    if (mediaType !== 'tv' || !details || activeTab !== 'episodes') return;
    setLoadingSeason(true);
    const fetchSeason = async () => {
      try {
        const sData = await tmdbApi.getTVSeasonDetails(media.id, selectedSeason);
        setSeasonData(sData);
      } catch (err) {
        console.error('Failed to fetch season:', err);
      } finally {
        setLoadingSeason(false);
      }
    };
    fetchSeason();
  }, [media, mediaType, details, selectedSeason, activeTab]);

  if (!media) return null;

  const backdropUrl = details?.backdrop_path || media.backdrop_path;
  const posterUrl = details?.poster_path || media.poster_path;
  const title = details?.title || details?.name || media.title || media.name;
  const releaseYear = (
    details?.release_date ||
    details?.first_air_date ||
    media.release_date ||
    media.first_air_date ||
    ''
  ).split('-')[0];
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.episode_run_time?.length
    ? `${details.episode_run_time[0]}m / ep`
    : null;

  const genres = details?.genres || [];
  const cast = details?.credits?.cast?.slice(0, 10) || [];
  const videos = details?.videos?.results || [];
  const youtubeVideos = videos.filter((v) => v.site === 'YouTube');
  const cleanTitle = (title || '').toLowerCase().trim();

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
  let embedUrl = '';
  if (trailerKey) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&autohide=1`;
  } else if (title) {
    const searchQuery = encodeURIComponent(`${title} ${releaseYear || ''} official trailer`);
    embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&fs=0&autohide=1`;
  }

  const similar = relatedContent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl glass-modal rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop & Overlay */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] bg-neutral-950 overflow-hidden">
          {backdropUrl ? (
            <img
              src={`${BACKDROP_SIZE.original}${backdropUrl}`}
              alt={title}
              className="w-full h-full object-cover filter brightness-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-red-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e17] via-[#0b0e17]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e17] via-[#0b0e17]/40 to-transparent" />

          {/* Quick Action Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between flex-wrap gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
                  {mediaType}
                </span>
                {details?.vote_average && (
                  <span className="badge-rating">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {details.vote_average.toFixed(1)} / 10
                  </span>
                )}
                {releaseYear && <span className="text-gray-300 font-semibold">{releaseYear}</span>}
                {runtime && (
                  <span className="text-gray-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {runtime}
                  </span>
                )}
                <span className="badge-quality">HD 1080P</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                {title}
              </h2>

              {details?.tagline && (
                <p className="text-red-400 italic text-sm font-medium">"{details.tagline}"</p>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onPlay(media, 1, 1)}
                className="btn-primary px-6 py-3 text-base shadow-lg shadow-red-600/50"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
                Play Stream
              </button>

              <button
                onClick={() => onPlay(media, 1, 1)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-5 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-600/30 transform hover:scale-105 transition-all"
              >
                <Download className="w-5 h-5" />
                Download HD
              </button>

              <button
                onClick={() => onToggleWatchlist(media)}
                className={`btn-icon ${
                  inWatchlist ? 'bg-red-600 border-red-600 text-white' : ''
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              <button
                onClick={() => onToggleFavorite(media)}
                className={`btn-icon ${
                  fav ? 'bg-red-600 border-red-600 text-white' : ''
                }`}
                title={fav ? 'Remove Favorite' : 'Add Favorite'}
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-white/10 bg-black/40 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-red-600 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Overview & Details
          </button>

          {mediaType === 'tv' && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'episodes'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              Seasons & Episodes
            </button>
          )}

          {videos.length > 0 && (
            <button
              onClick={() => setActiveTab('trailers')}
              className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'trailers'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-red-500" />
              Trailers ({videos.length})
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Plot Overview */}
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">Storyline</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-normal">
                  {details?.overview || media.overview || 'No overview available.'}
                </p>
              </div>

              {/* Genres pill list */}
              {genres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Genres:
                  </span>
                  {genres.map((g) => (
                    <span
                      key={g.id}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Cast Carousel */}
              {cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-white">Top Cast</h3>
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                    {cast.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex-none w-24 text-center space-y-1.5 group"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border border-white/10 bg-neutral-900 group-hover:border-red-500 transition-colors">
                          <img
                            src={
                              actor.profile_path
                                ? `${POSTER_SIZE.small}${actor.profile_path}`
                                : 'https://via.placeholder.com/150?text=No+Photo'
                            }
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Content Carousel */}
              {similar.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-base font-extrabold text-white">You Might Also Like</h3>
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                    {similar.slice(0, 10).map((sim) => (
                      <MovieCard
                        key={sim.id}
                        media={sim}
                        onPlay={onPlay}
                        onOpenDetails={(item) => setDetails(item)}
                        onToggleWatchlist={onToggleWatchlist}
                        onToggleFavorite={onToggleFavorite}
                        isInWatchlist={isInWatchlist}
                        isFavorite={isFavorite}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TV Episodes Tab */}
          {activeTab === 'episodes' && (
            <div className="space-y-4">
              {/* Season Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-300">Select Season:</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-black/60 border border-white/20 text-white rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-red-500"
                >
                  {details?.seasons?.map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-neutral-900">
                      {s.name} ({s.episode_count} Episodes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Episode Grid */}
              {loadingSeason ? (
                <div className="p-8 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin text-red-500" />
                  Loading Season {selectedSeason} Episodes...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {seasonData?.episodes?.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlay(media, selectedSeason, ep.episode_number)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 cursor-pointer transition-all group"
                    >
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                        {ep.still_path ? (
                          <img
                            src={`${POSTER_SIZE.medium}${ep.still_path}`}
                            alt={ep.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            EP {ep.episode_number}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-red-600/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-red-500">
                            E{ep.episode_number}
                          </span>
                          {ep.vote_average > 0 && (
                            <span className="text-[10px] text-amber-400 font-bold">
                              ★ {ep.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate">{ep.name}</h4>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {ep.overview || 'Click to watch episode.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trailers Tab */}
          {activeTab === 'trailers' && embedUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#07090e]">
                <iframe
                  src={embedUrl}
                  title={`${title} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-gray-400 italic">Official Trailer: {trailer?.name || title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
