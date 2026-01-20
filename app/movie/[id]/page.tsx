"use client";

import { useEffect, useState } from "react";
import type { TmdbMovieDetails } from "@/types/movie";
import { useFavorites } from "@/hooks/useFavorites";
import { yearFromReleaseDate } from "@/lib/tmdb";

const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

const FALLBACK_POSTER =
  "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg";

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  const fav = useFavorites();

  const [movie, setMovie] = useState<TmdbMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (Number.isNaN(idNum)) {
        setErr("Invalid movie id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);

      try {
        const r = await fetch(`/api/tmdb/movie/${idNum}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Failed to load movie");
        setMovie(data);
      } catch (e: any) {
        setErr(e?.message ?? "Network error");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [idNum]);

  if (loading) {
    return (
      <main className="page detailPage">
        <a className="backLink" href="/">← Back</a>
        <div className="mt12 muted">Loading details...</div>
      </main>
    );
  }

  if (err || !movie) {
    return (
      <main className="page detailPage">
        <a className="backLink" href="/">← Back</a>
        <div className="card soft mt12">{err ?? "Movie not found."}</div>
      </main>
    );
  }

  const poster = movie.poster_path
    ? `${IMAGE_BASE}${movie.poster_path}`
    : `${FALLBACK_POSTER}`;

  const isFav = fav.isFavorite(movie.id);
  const favItem = fav.favorites.find((x) => x.id === movie.id);

  return (
    <main className="page detailPage">
      <header className="detailHeader">
        <a className="backLink" href="/">← Back</a>
      </header>

      <div className="detailGrid">
        <div className="detailPosterCol">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={movie.title}
            className="detailPosterImg"
            onError={(e) => {
              e.currentTarget.src = `${FALLBACK_POSTER}`;
            }}
          />

          <button
            className="detailFavBtn"
            onClick={() => (isFav ? fav.remove(movie.id) : fav.add(movie))}
          >
            {isFav ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>

        <div className="detailInfoCol">
          <h1 className="detailTitle">{movie.title}</h1>

          <div className="muted detailMetaRow">
            <div>Year: {yearFromReleaseDate(movie.release_date)}</div>
            <div>Runtime: {movie.runtime ? `${movie.runtime} min` : "—"}</div>
          </div>

          <p className="detailOverview">{movie.overview || "—"}</p>

          {isFav && (
            <div className="card detailFavBox">
              <div className="detailFavBoxTitle">Your favorite settings</div>

              <div className="detailFavRow">
                <label className="detailLabel">
                  Rating:
                  <select
                    value={favItem?.rating ?? 3}
                    onChange={(e) =>
                      fav.update(movie.id, { rating: Number(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="detailNoteBox">
                <label className="detailNoteLabel">Note</label>
                <textarea
                  rows={3}
                  className="detailNoteInput"
                  value={favItem?.note ?? ""}
                  onChange={(e) => fav.update(movie.id, { note: e.target.value })}
                  placeholder="Optional note..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
