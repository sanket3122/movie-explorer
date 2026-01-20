"use client";

import type { TmdbMovie } from "../types/movie";
import { yearFromReleaseDate } from "../lib/tmdb";

const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

const FALLBACK_POSTER =
  "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg";

export default function MovieCard({
  movie,
  favorite,
  onToggleFavorite,
  onDetails,
}: {
  movie: TmdbMovie;
  favorite: boolean;
  onToggleFavorite: () => void;
  onDetails: () => void;
}) {
  const src = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : FALLBACK_POSTER;

  return (
    <div className="card movieCard">
      <div className="moviePoster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="imgRounded"
          src={src}
          alt={movie.title}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_POSTER;
          }}
        />
      </div>

      <div className="movieInfo">
        <div className="movieTop">
          <div>
            <div className="movieTitle">{movie.title}</div>
            <div className="muted movieYear">{yearFromReleaseDate(movie.release_date)}</div>
          </div>

          <button onClick={onToggleFavorite}>
            {favorite ? "★ Favorited" : "☆ Favorite"}
          </button>
        </div>

        <p className="movieOverview">
          {(movie.overview ?? "").slice(0, 160)}
          {(movie.overview ?? "").length > 160 ? "..." : ""}
        </p>

        <button className="detailsBtn" onClick={onDetails}>
          View details →
        </button>
      </div>
    </div>
  );
}
