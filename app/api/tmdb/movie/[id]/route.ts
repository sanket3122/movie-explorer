import { NextResponse } from "next/server";
import { TMDB_BASE_URL, getTmdbKey } from "@/lib/tmdb";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid movie id" }, { status: 400 });
    }

    const key = getTmdbKey();
    const url = `${TMDB_BASE_URL}/movie/${encodeURIComponent(
      id
    )}?api_key=${encodeURIComponent(key)}`;

    const r = await fetch(url, { next: { revalidate: 300 } });

    if (!r.ok) {
      const details = await r.text();
      return NextResponse.json(
        { error: "TMDB error", details },
        { status: r.status }
      );
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
