export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export function getTmdbKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("Missing TMDB_API_KEY in .env.local");
  return key;
}

export function yearFromReleaseDate(release_date?: string) {
  if (!release_date) return "—";
  return release_date.slice(0, 4);
}
