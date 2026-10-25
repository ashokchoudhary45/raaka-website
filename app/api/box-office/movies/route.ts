import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { cacheGet, cacheSet, cacheTTL } from "@/lib/boxoffice-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = "boxoffice:movies:v1";
  const ttl = cacheTTL();
  const cached = cacheGet<unknown[]>(key);
  if (cached) return NextResponse.json({ success: true, cached: true, movies: cached }, {
    headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=300` }
  });

  try {
    const result = await turso.execute(`
      SELECT m.id,m.slug,m.title,m.language,m.release_date,m.budget_amount,m.budget_currency,
        (SELECT d.amount FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_collection,
        (SELECT d.metric FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_metric,
        (SELECT d.collection_date FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_collection_date,
        (SELECT b.tickets_sold FROM boxoffice_booking_snapshots b WHERE b.movie_id=m.id ORDER BY b.captured_at DESC LIMIT 1) AS tickets_sold,
        (SELECT b.collection_amount FROM boxoffice_booking_snapshots b WHERE b.movie_id=m.id ORDER BY b.captured_at DESC LIMIT 1) AS booking_collection,
        (SELECT b.shows_count FROM boxoffice_booking_snapshots b WHERE b.movie_id=m.id ORDER BY b.captured_at DESC LIMIT 1) AS booking_shows,
        (SELECT o.occupancy_percent FROM boxoffice_occupancy_snapshots o WHERE o.movie_id=m.id ORDER BY o.captured_at DESC LIMIT 1) AS occupancy_percent
      FROM boxoffice_movies m ORDER BY m.title COLLATE NOCASE
    `);
    const movies = result.rows.map(r => ({
      ...r, id: Number(r.id),
      latest_collection: r.latest_collection == null ? null : Number(r.latest_collection),
      tickets_sold: r.tickets_sold == null ? null : Number(r.tickets_sold),
      booking_collection: r.booking_collection == null ? null : Number(r.booking_collection),
      booking_shows: r.booking_shows == null ? null : Number(r.booking_shows),
      occupancy_percent: r.occupancy_percent == null ? null : Number(r.occupancy_percent),
      budget_amount: r.budget_amount == null ? null : Number(r.budget_amount)
    }));
    cacheSet(key, movies, ttl);
    return NextResponse.json({ success: true, cached: false, movies }, {
      headers: { "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=300` }
    });
  } catch (error) {
    console.error("boxoffice movies API:", error);
    return NextResponse.json({ success: false, error: "Box-office data unavailable" }, { status: 503 });
  }
}
