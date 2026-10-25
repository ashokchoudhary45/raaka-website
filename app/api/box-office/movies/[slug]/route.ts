import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { cacheGet, cacheSet, cacheTTL } from "@/lib/boxoffice-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const requested = Number(new URL(req.url).searchParams.get("days") ?? 30);
  const days = Number.isFinite(requested) ? Math.max(1, Math.min(365, Math.floor(requested))) : 30;
  const key = `boxoffice:movie:${slug}:${days}`;
  const ttl = cacheTTL();
  const cached = cacheGet<Record<string, unknown>>(key);
  if (cached) return NextResponse.json({ success: true, cached: true, ...cached }, {
    headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=300` }
  });

  try {
    const found = await turso.execute({
      sql: "SELECT id,slug,title,language,release_date,budget_amount,budget_currency FROM boxoffice_movies WHERE slug=? LIMIT 1",
      args: [slug.toLowerCase()]
    });
    if (!found.rows.length) return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    const id = Number(found.rows[0].id);
    const [collections, bookings, occupancy] = await Promise.all([
      turso.execute({ sql: `SELECT collection_date,territory,metric,amount,currency,is_estimate,source_name,source_url,source_updated_at
        FROM boxoffice_daily_collections WHERE movie_id=? AND collection_date>=date('now',?)
        ORDER BY collection_date DESC LIMIT 500`, args: [id, `-${days} days`] }),
      turso.execute({ sql: `SELECT captured_at,territory,tickets_sold,collection_amount,currency,shows_count,source_name,source_url
        FROM boxoffice_booking_snapshots WHERE movie_id=? ORDER BY captured_at DESC LIMIT 50`, args: [id] }),
      turso.execute({ sql: `SELECT captured_at,territory,city,occupancy_percent,shows_count,source_name,source_url
        FROM boxoffice_occupancy_snapshots WHERE movie_id=? ORDER BY captured_at DESC LIMIT 50`, args: [id] })
    ]);
    const payload = { movie: found.rows[0], collections: collections.rows, bookings: bookings.rows, occupancy: occupancy.rows, days };
    cacheSet(key, payload, ttl);
    return NextResponse.json({ success: true, cached: false, ...payload }, {
      headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=300` }
    });
  } catch (error) {
    console.error("box-office movie detail API:", error);
    return NextResponse.json({ success: false, error: "Box-office data unavailable" }, { status: 503 });
  }
}
