"use client";

import { useEffect, useMemo, useState } from "react";
import type { FavoriteMovie, TmdbMovie } from "@/types/movie";

const LS_KEY = "movie_explorer_favorites_v1";

const FALLBACK_POSTER_PATH = "/1E5baAaEse26fej7uHcjOgEE2t2.jpg";
// NOTE: This is a TMDB path (not full URL). UI already prefixes IMAGE_BASE.

function safeRead(): FavoriteMovie[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(val: FavoriteMovie[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(val));
  } catch {
    // ignore write errors (private mode etc.)
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFavorites(safeRead());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    safeWrite(favorites);
  }, [favorites, loaded]);

  const byId = useMemo(() => {
    const map = new Map<number, FavoriteMovie>();
    for (const f of favorites) map.set(f.id, f);
    return map;
  }, [favorites]);

  function isFavorite(id: number) {
    return byId.has(id);
  }

  function add(movie: TmdbMovie) {
    setFavorites((prev) => {
      if (prev.some((x) => x.id === movie.id)) return prev;

      const next: FavoriteMovie = {
        id: movie.id,
        title: movie.title,
        overview: movie.overview ?? "",
        release_date: movie.release_date,
        poster_path: movie.poster_path ?? FALLBACK_POSTER_PATH, 
        rating: 3,
        note: "",
        savedAt: new Date().toISOString(),
      };

      return [next, ...prev];
    });
  }

  function remove(id: number) {
    setFavorites((prev) => prev.filter((x) => x.id !== id));
  }

  function update(
    id: number,
    patch: Partial<Pick<FavoriteMovie, "rating" | "note">>
  ) {
    setFavorites((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  return { favorites, loaded, isFavorite, add, remove, update };
}
