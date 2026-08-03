import React from 'react';
import { Star } from 'lucide-react';
import { POSTER_SIZE } from '../services/tmdb';

export function MovieCard({
  media,
  onOpenDetails,
  className = '',
}) {
  if (!media) return null;

  const title = media.title || media.name || 'Untitled';
  const posterUrl = media.poster_path
    ? `${POSTER_SIZE.medium}${media.poster_path}`
    : 'https://via.placeholder.com/342x513?text=No+Poster';

  const year = (media.release_date || media.first_air_date || '').split('-')[0];
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

  const handleClickCard = () => {
    if (onOpenDetails) {
      onOpenDetails(media);
    }
  };

  return (
    <div
      onClick={handleClickCard}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-red-900/30 border border-white/5 hover:border-red-500/40 bg-[#0c0f17] ${
        className || 'flex-none w-[135px] sm:w-[180px] md:w-[210px]'
      }`}
    >
      {/* Poster Aspect Ratio Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-300">{rating}</span>
          </div>
        )}

        {/* Media Type Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600/80 text-white backdrop-blur-sm shadow-md">
          {mediaType}
        </div>

        {/* Clean Hover Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5">
          <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-red-400 transition-colors">
            {title}
          </h3>
          {year && <p className="text-xs text-gray-300 font-medium mt-0.5">{year}</p>}
        </div>
      </div>
    </div>
  );
}
