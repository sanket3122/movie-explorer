"use client";

import type { TmdbMovieDetails } from "../types/movie";
import { yearFromReleaseDate } from "../lib/tmdb";

const IMG =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

const FALLBACK_POSTER =
  "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg";

export default function MovieDetailsModal({
  open,
  loading,
  error,
  movie,
  isFavorite,
  onClose,
  onToggleFavorite,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  movie: TmdbMovieDetails | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}) {
  if (!open) return null;

  const poster = movie?.poster_path ? `${IMG}${movie.poster_path}` : FALLBACK_POSTER;

  return (
    <div className="modalOverlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modalCard card" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{movie?.title ?? "Movie details"}</div>
          <div className="modalActions">
            <button onClick={onToggleFavorite} disabled={!movie}>
              {isFavorite ? "Remove Favorite" : "Add Favorite"}
            </button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {loading && <div className="muted mt10">Loading...</div>}
        {error && <div className="card soft mt10">{error}</div>}

        {!loading && !error && movie && (
          <div className="modalBody">
            <div className="modalPoster">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster}
                alt={movie.title}
                className="imgRounded"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_POSTER;
                }}
              />
            </div>

            <div className="modalContent">
              <div className="muted metaRow">
                <div>Year: {yearFromReleaseDate(movie.release_date)}</div>
                <div>Runtime: {movie.runtime ? `${movie.runtime} min` : "—"}</div>
              </div>
              <p className="modalOverview">{movie.overview || "—"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
