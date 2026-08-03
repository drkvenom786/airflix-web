import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Tv,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  RotateCw,
} from 'lucide-react';
import { getStreamUrl } from '../services/vidsrc';
import { tmdbApi } from '../services/tmdb';

export function PlayerModal({
  media,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
}) {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(true);
  const [tvDetails, setTvDetails] = useState(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const mediaType = media?.media_type || (media?.title ? 'movie' : 'tv');
  const title = media?.title || media?.name || 'AirFlix Stream';

  // Fetch TV season count if TV show
  useEffect(() => {
    if (mediaType !== 'tv' || !media) return;
    const fetchTV = async () => {
      try {
        const data = await tmdbApi.getTVDetails(media.id);
        setTvDetails(data);
      } catch (err) {
        console.error('Error fetching TV details for player:', err);
      }
    };
    fetchTV();
  }, [media, mediaType]);

  // Enforce Direct DOM Level Fullscreen Permissions on Iframe
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.setAttribute('allowfullscreen', 'true');
      iframeRef.current.setAttribute('webkitallowfullscreen', 'true');
      iframeRef.current.setAttribute('mozallowfullscreen', 'true');
      iframeRef.current.setAttribute(
        'allow',
        'fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope'
      );
    }
  }, [loading]);

  // Pure JS Anti-Popup & Anti-Redirect Protection Engine
  useEffect(() => {
    const originalOpen = window.open;
    window.open = function (...args) {
      console.warn('AirFlix Pure JS Shield: Blocked popup window');
      return null;
    };

    const handleBlur = () => {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        setTimeout(() => window.focus(), 0);
      }
    };

    const handleBeforeUnload = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.open = originalOpen;
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Native Fullscreen Toggle
  const handleToggleFullscreen = () => {
    const target = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Mobile Screen Rotation / Landscape Lock
  const handleRotateScreen = async () => {
    try {
      const target = containerRef.current || document.documentElement;
      if (!document.fullscreenElement) {
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen();
        }
      }

      if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
        if (window.screen.orientation.type.includes('landscape')) {
          await window.screen.orientation.unlock();
        } else {
          await window.screen.orientation.lock('landscape');
        }
      } else if (window.screen && window.screen.lockOrientation) {
        window.screen.lockOrientation('landscape');
      }
    } catch (err) {
      console.warn('Screen rotation request notice:', err);
    }
  };

  if (!media) return null;

  const currentStreamUrl = getStreamUrl(
    mediaType,
    media.id,
    season,
    episode
  );

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const totalSeasons = tvDetails?.number_of_seasons || 5;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#07090e] flex flex-col justify-between animate-fade-in select-none h-screen w-screen overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="w-full px-4 py-3 bg-[#0c0e14] border-b border-white/10 flex items-center justify-between gap-4 shrink-0 shadow-lg z-20">
        {/* Back Button & Title Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 backdrop-blur-xl transition-all shadow-md hover:scale-105 active:scale-95"
            title="Back to Details"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white truncate max-w-xs sm:max-w-md">
                {title}
              </h2>
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AirFlix Ultra HD
              </span>
            </div>
            <p className="text-xs text-red-400 font-semibold flex items-center gap-2 mt-0.5">
              <span className="uppercase">{mediaType}</span>
              {mediaType === 'tv' && (
                <span>
                  • Season {season}, Episode {episode}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rotate Screen Button (Mobile Only - Hidden on Desktop) */}
          <button
            onClick={handleRotateScreen}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 flex items-center gap-1 text-xs font-bold"
            title="Rotate Screen to Landscape"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title="Toggle Native Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Refresh stream */}
          <button
            onClick={() => setLoading(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            title="Reload Stream"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/50"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Frame Container */}
      <div className="relative flex-1 w-full min-h-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-neutral-950 flex flex-col items-center justify-center gap-3 text-white">
            <Sparkles className="w-10 h-10 animate-spin text-red-600" />
            <p className="text-sm font-bold tracking-wide">
              Connecting to AirFlix Ultra HD Player...
            </p>
          </div>
        )}

        {/* Full Viewport Video Iframe Embed with DOM-Level Fullscreen Attributes */}
        <iframe
          ref={iframeRef}
          key={`${currentStreamUrl}-${season}-${episode}`}
          src={currentStreamUrl}
          title={title}
          onLoad={handleIframeLoad}
          className="w-full h-full border-0 absolute inset-0 z-10"
          allowFullScreen
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          referrerPolicy="origin"
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full px-4 py-3 bg-[#0c0e14] border-t border-white/10 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-lg z-20">
        {mediaType === 'tv' ? (
          <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
            {/* Season Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300">Season:</span>
              <select
                value={season}
                onChange={(e) => {
                  setLoading(true);
                  setSeason(Number(e.target.value));
                  setEpisode(1);
                }}
                className="bg-black/60 border border-white/20 text-white rounded-lg px-3 py-1 text-xs font-bold outline-none"
              >
                {Array.from({ length: totalSeasons }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1} className="bg-neutral-900">
                    Season {idx + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Episode Navigation */}
            <div className="flex items-center gap-2">
              <button
                disabled={episode <= 1}
                onClick={() => {
                  setLoading(true);
                  setEpisode((prev) => Math.max(1, prev - 1));
                }}
                className="btn-secondary px-3 py-1 text-xs disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Prev Ep
              </button>

              <span className="text-xs font-black text-white px-2">
                Episode {episode}
              </span>

              <button
                onClick={() => {
                  setLoading(true);
                  setEpisode((prev) => prev + 1);
                }}
                className="btn-secondary px-3 py-1 text-xs"
              >
                Next Ep <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AirFlix Ultra HD Active • Fullscreen enabled.</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">• Media ID: {media.id}</span>
        </div>
      </div>
    </div>
  );
}
