export const STREAM_SERVERS = [
  {
    id: 'vidking',
    name: 'VidKing Ultra HD Player',
    getMovieUrl: (id) => `https://www.vidking.net/embed/movie/${id}?color=e50914&autoPlay=true`,
    getTvUrl: (id, season = 1, episode = 1) =>
      `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=e50914&autoPlay=true&autoNext=true`,
  },
];

export function getStreamUrl(type, id, season = 1, episode = 1) {
  const server = STREAM_SERVERS[0];
  if (type === 'tv' || type === 'show') {
    return server.getTvUrl(id, season, episode);
  }
  return server.getMovieUrl(id);
}

// Download Link Resolvers
export function getDownloadLinks(type, id, season = 1, episode = 1, title = '') {
  const isTv = type === 'tv' || type === 'show';

  return [
    {
      name: 'VidKing High-Speed Direct Downloader (1080p Ultra HD)',
      quality: '1080p Ultra HD',
      url: isTv
        ? `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=e50914&autoPlay=true`
        : `https://www.vidking.net/embed/movie/${id}?color=e50914&autoPlay=true`,
      badge: 'VidKing 1080p',
    },
    {
      name: 'VidKing 4K Cinema Download Mirror',
      quality: '4K Ultra HD',
      url: isTv
        ? `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=e50914&autoPlay=true`
        : `https://www.vidking.net/embed/movie/${id}?color=e50914&autoPlay=true`,
      badge: 'VidKing 4K',
    },
  ];
}
