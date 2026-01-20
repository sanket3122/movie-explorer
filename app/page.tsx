"use client";

import { useEffect, useMemo, useState } from "react";
import MovieCard from "../components/MovieCard";
import MovieDetailsModal from "../components/MovieDetailsModal";
import type { TmdbMovie, TmdbMovieDetails, TmdbSearchResponse } from "../types/movie";
import { useFavorites } from "../hooks/useFavorites";

const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p/w500";

export default function HomePage() {
  const fav = useFavorites();

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<TmdbMovie[]>([]);

  const [open, setOpen] = useState(false);
  const [dLoading, setDLoading] = useState(false);
  const [dErr, setDErr] = useState<string | null>(null);
  const [details, setDetails] = useState<TmdbMovieDetails | null>(null);

  const isFav = useMemo(
    () => (details ? fav.isFavorite(details.id) : false),
    [details, fav]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("movie-search")?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (m: TmdbMovie) => (fav.isFavorite(m.id) ? fav.remove(m.id) : fav.add(m));

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();

    setErr(null);
    setResults([]);

    if (!query) return setErr("Type a movie title first.");
    if (query.length < 3) return setErr("Type at least 3 characters.");

    setLoading(true);
    try {
      const r = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = (await r.json()) as TmdbSearchResponse & { error?: string };
      if (!r.ok) throw new Error(data?.error ?? "Search failed");

      setResults(data.results ?? []);
      if (!data.results?.length) setErr("No results found.");
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(id: number) {
    setOpen(true);
    setDLoading(true);
    setDErr(null);
    setDetails(null);

    try {
      const r = await fetch(`/api/tmdb/movie/${id}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Failed to load details");
      setDetails(data);
    } catch (e: any) {
      setDErr(e?.message ?? "Network error");
    } finally {
      setDLoading(false);
    }
  }

  return (
    <main className="page">
      <h1 className="pageTitle">Movie Explorer</h1>

      <form onSubmit={onSearch} className="searchRow">
        <input
          id="movie-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title (e.g., Interstellar)"
          className="searchInput"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {err && <div className="card soft mt12">{err}</div>}

      <div
        className="mainGrid"
        style={{ gridTemplateColumns: "1fr 360px" }}
      >
        <section className="resultsCol">
          {loading && <div className="muted">Loading results...</div>}
          {results.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              favorite={fav.isFavorite(m.id)}
              onToggleFavorite={() => toggle(m)}
              onDetails={() => openDetails(m.id)}
            />
          ))}
        </section>

        <aside className="card favPanel">
          <div className="favTitle">Favorites</div>

          {!fav.loaded && <div className="muted mt10">Loading...</div>}

          {fav.loaded && fav.favorites.length === 0 && (
            <div className="card soft mt10">No favorites yet.</div>
          )}

          <div className="favList">
            {fav.favorites.map((m) => {
              const poster = m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null;

              return (
                <div key={m.id} className="card favItem">
                  <div className="favRow">
                    <div className="favPoster">
                      {poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={poster} alt={m.title} className="imgRounded" />
                      ) : (
                        <div className="soft posterFallbackSmall" />
                      )}
                    </div>

                    <div className="favBody">
                      <div className="favMovieTitle">{m.title}</div>

                      <div className="favControls">
                        <label className="favLabel">
                          Rating:
                          <select
                            value={m.rating}
                            onChange={(e) =>
                              fav.update(m.id, { rating: Number(e.target.value) })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((x) => (
                              <option key={x} value={x}>
                                {x}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button className="btnSmall" onClick={() => fav.remove(m.id)}>
                          Remove
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={m.note}
                        onChange={(e) => fav.update(m.id, { note: e.target.value })}
                        placeholder="Note..."
                        className="favNote"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      <MovieDetailsModal
        open={open}
        loading={dLoading}
        error={dErr}
        movie={details}
        isFavorite={isFav}
        onClose={() => setOpen(false)}
        onToggleFavorite={() => details && toggle(details)}
      />
    </main>
  );
}
