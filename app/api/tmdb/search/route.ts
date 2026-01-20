import { NextResponse } from "next/server";
import { TMDB_BASE_URL, getTmdbKey } from "@/lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json({ error: "Missing query param q" }, { status: 400 });
    }

    const key = getTmdbKey();
    const url =
      `${TMDB_BASE_URL}/search/movie` +
      `?api_key=${encodeURIComponent(key)}` +
      `&query=${encodeURIComponent(q)}` +
      `&include_adult=false`;

    const r = await fetch(url, { next: { revalidate: 60 } }); // caching helps
    if (!r.ok) {
      const details = await r.text();
      return NextResponse.json({ error: "TMDB error", details }, { status: r.status });
    }

    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
