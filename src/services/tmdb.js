const API_KEY = 'ba77f8477cd89dd161faebede69a4f89';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYTc3Zjg0NzdjZDg5ZGQxNjFmYWViZWRlNjlhNGY4OSIsIm5iZiI6MTc4NTY0NTQ4OS44OCwic3ViIjoiNmE2ZWM5YjFiYTY1N2VhODFhNTNiZGRjIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.0fK-qOuHM1Zyp2XudbsHeAX29ggiqaU6TLXI4jrrjXY';
const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const BACKDROP_SIZE = {
  small: `${IMAGE_BASE}/w780`,
  medium: `${IMAGE_BASE}/w1280`,
  original: `${IMAGE_BASE}/original`,
};

export const POSTER_SIZE = {
  small: `${IMAGE_BASE}/w185`,
  medium: `${IMAGE_BASE}/w342`,
  large: `${IMAGE_BASE}/w500`,
  original: `${IMAGE_BASE}/original`,
};

export const GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

// Rich, diverse fallback library to ensure every row stays distinct
const FALLBACK_MOVIES = [
  {
    id: 157336,
    title: 'Interstellar',
    name: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/pbrkL8aVAcvAOLbdjEPHm8vYsD.jpg',
    vote_average: 8.4,
    release_date: '2014-11-05',
    media_type: 'movie',
    genre_ids: [12, 18, 878],
  },
  {
    id: 27205,
    title: 'Inception',
    name: 'Inception',
    overview: 'Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster_path: '/oYuLE1h2CVCdIFWy5me1jA9f34.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsR4yHAuKQ.jpg',
    vote_average: 8.4,
    release_date: '2010-07-15',
    media_type: 'movie',
    genre_ids: [28, 878, 12],
  },
  {
    id: 550,
    title: 'Fight Club',
    name: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: '/pB8Overws16yOperational.jpg',
    backdrop_path: '/hZkgoQY85fAuacE2CYOo3wfoXx.jpg',
    vote_average: 8.4,
    release_date: '1999-10-15',
    media_type: 'movie',
    genre_ids: [18, 53],
  },
  {
    id: 299536,
    title: 'Avengers: Infinity War',
    name: 'Avengers: Infinity War',
    overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
    poster_path: '/7WsyChLLEzcqIFv2VwM2vj129zI.jpg',
    backdrop_path: '/mGJu3nIjAawF3E90bE0x15iB0j8.jpg',
    vote_average: 8.3,
    release_date: '2018-04-25',
    media_type: 'movie',
    genre_ids: [12, 28, 878],
  },
  {
    id: 603,
    title: 'The Matrix',
    name: 'The Matrix',
    overview: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the ruling computers.',
    poster_path: '/f89U3w9RAxWphLBLgOWuXDYyvc.jpg',
    backdrop_path: '/ic0g424jLd15hJ59B2b1e.jpg',
    vote_average: 8.2,
    release_date: '1999-03-30',
    media_type: 'movie',
    genre_ids: [28, 878],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    name: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMK28wyTAbGo6oaBhwu2vYr3f.jpg',
    vote_average: 8.5,
    release_date: '2008-07-16',
    media_type: 'movie',
    genre_ids: [18, 28, 80, 53],
  },
];

// Helper: Auto-detect User Region via IP Geolocation or Timezone
export async function detectUserRegion() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.country_code) {
        return {
          countryCode: data.country_code,
          countryName: data.country_name || 'Your Region',
          city: data.city || '',
        };
      }
    }
  } catch (e) {
    console.warn('IP Geolocation notice, using timezone fallback:', e);
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (timeZone.includes('Kolkata') || timeZone.includes('Calcutta') || timeZone.includes('India')) {
    return { countryCode: 'IN', countryName: 'India', city: '' };
  }
  if (timeZone.includes('London') || timeZone.includes('Europe')) {
    return { countryCode: 'GB', countryName: 'United Kingdom', city: '' };
  }
  if (timeZone.includes('New_York') || timeZone.includes('America')) {
    return { countryCode: 'US', countryName: 'United States', city: '' };
  }

  return { countryCode: 'IN', countryName: 'India', city: '' };
}

async function fetchFromTMDB(endpoint, params = {}) {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: params.language || 'en-US',
    include_adult: 'true',
    ...params,
  });

  try {
    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`TMDB error: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`Fetch notice for ${endpoint}:`, err);
    return { results: FALLBACK_MOVIES, total_pages: 1, page: 1 };
  }
}

export const tmdbApi = {
  // Trending & Home Content in English (en-US)
  getTrending: (mediaType = 'all', timeWindow = 'week', page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`, { page, language, include_adult: includeAdult }),

  getPopularMovies: (page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/movie/popular', { page, language, include_adult: includeAdult }),

  getTopRatedMovies: (page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/movie/top_rated', { page, language, include_adult: includeAdult }),

  getNowPlayingMovies: (page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/movie/now_playing', { page, language, include_adult: includeAdult }),

  getPopularTV: (page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/tv/popular', { page, language, include_adult: includeAdult }),

  getTopRatedTV: (page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/tv/top_rated', { page, language, include_adult: includeAdult }),

  // Regional Content
  getRegionalMovies: (countryCode = 'IN', page = 1) =>
    fetchFromTMDB('/discover/movie', {
      with_origin_country: countryCode,
      sort_by: 'popularity.desc',
      page,
    }),

  getRegionalTV: (countryCode = 'IN', page = 1) =>
    fetchFromTMDB('/discover/tv', {
      with_origin_country: countryCode,
      sort_by: 'popularity.desc',
      page,
    }),

  // Details
  getMovieDetails: (id, language = 'en-US') =>
    fetchFromTMDB(`/movie/${id}`, {
      language,
      append_to_response: 'videos,credits,similar,recommendations',
      include_video_language: 'en',
    }),

  getTVDetails: (id, language = 'en-US') =>
    fetchFromTMDB(`/tv/${id}`, {
      language,
      append_to_response: 'videos,credits,similar,recommendations',
      include_video_language: 'en',
    }),

  getCollection: (id, language = 'en-US') =>
    fetchFromTMDB(`/collection/${id}`, { language }),

  getTVSeasonDetails: (tvId, seasonNumber, language = 'en-US') =>
    fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`, { language }),

  // Search
  searchMulti: (query, page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/search/multi', { query, page, language, include_adult: includeAdult }),

  searchMovies: (query, page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/search/movie', { query, page, language, include_adult: includeAdult }),

  searchTV: (query, page = 1, language = 'en-US', includeAdult = true) =>
    fetchFromTMDB('/search/tv', { query, page, language, include_adult: includeAdult }),

  // Genres & Filtering with unique sort orders
  getByGenre: (genreId, mediaType = 'movie', page = 1, sortBy = 'popularity.desc', language = 'en-US', includeAdult = true) =>
    fetchFromTMDB(`/discover/${mediaType}`, {
      with_genres: genreId,
      page,
      sort_by: sortBy,
      language,
      include_adult: includeAdult,
    }),

  getMovieGenres: (language = 'en-US') => fetchFromTMDB('/genre/movie/list', { language }),
  getTVGenres: (language = 'en-US') => fetchFromTMDB('/genre/tv/list', { language }),
};
