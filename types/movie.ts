export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
};

export type TmdbSearchResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

export type TmdbMovieDetails = TmdbMovie & {
  runtime?: number | null;
};

export type FavoriteMovie = {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  poster_path?: string | null;
  rating: number; // 1-5
  note: string;
  savedAt: string;
};
