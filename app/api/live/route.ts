import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = getD1();

    const url = new URL(request.url);
    const visitorId = url.searchParams.get("visitorId");
    const page = url.searchParams.get("page") || "/";
    const recordView = url.searchParams.get("view") === "1";

    if (!visitorId) {
      return Response.json(
        {
          success: false,
          error: "visitorId is required.",
        },
        { status: 400 }
      );
    }

    const now = Date.now();

    const minuteAgo = now - 60_000;
    const dayAgo = now - 86_400_000;
    const sevenDaysAgo = now - 7 * 86_400_000;
    const thirtyDaysAgo = now - 30 * 86_400_000;

    // Update current live visitor
    await db
      .prepare(
        `
        INSERT INTO live_visitors (
          visitor_id,
          last_seen,
          page
        )
        VALUES (?, ?, ?)
        ON CONFLICT(visitor_id)
        DO UPDATE SET
          last_seen = excluded.last_seen,
          page = excluded.page
        `
      )
      .bind(visitorId, now, page)
      .run();

    // Record an actual page view only once per page load.
    if (recordView) {
      await db
        .prepare(
          `
          INSERT INTO page_views (
            visitor_id,
            page,
            viewed_at
          )
          VALUES (?, ?, ?)
          `
        )
        .bind(visitorId, page, now)
        .run();
    }

    // Remove visitors inactive for more than 60 seconds.
    await db
      .prepare(
        `
        DELETE FROM live_visitors
        WHERE last_seen < ?
        `
      )
      .bind(minuteAgo)
      .run();

    // --------------------------------------------------
    // LIVE VISITORS
    // --------------------------------------------------

    const liveResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM live_visitors
        WHERE last_seen >= ?
        `
      )
      .bind(minuteAgo)
      .first<{ count: number }>();

    const livePagesResult = await db
      .prepare(
        `
        SELECT
          page,
          COUNT(*) AS live
        FROM live_visitors
        WHERE last_seen >= ?
        GROUP BY page
        ORDER BY live DESC
        `
      )
      .bind(minuteAgo)
      .all<{
        page: string;
        live: number;
      }>();

    // --------------------------------------------------
    // TOTAL ANALYTICS
    // --------------------------------------------------

    const totalViewsResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM page_views
        `
      )
      .first<{ count: number }>();

    const uniqueVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        `
      )
      .first<{ count: number }>();

    // --------------------------------------------------
    // TODAY
    // --------------------------------------------------

    const todayViewsResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(dayAgo)
      .first<{ count: number }>();

    const todayVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(dayAgo)
      .first<{ count: number }>();

    // --------------------------------------------------
    // LAST 7 DAYS
    // --------------------------------------------------

    const sevenDaysViewsResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(sevenDaysAgo)
      .first<{ count: number }>();

    const sevenDaysVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(sevenDaysAgo)
      .first<{ count: number }>();

    // --------------------------------------------------
    // LAST 30 DAYS
    // --------------------------------------------------

    const thirtyDaysViewsResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(thirtyDaysAgo)
      .first<{ count: number }>();

    const thirtyDaysVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(thirtyDaysAgo)
      .first<{ count: number }>();

    // --------------------------------------------------
    // PAGE-WISE ANALYTICS
    // --------------------------------------------------

    const pageStatsResult = await db
      .prepare(
        `
        SELECT
          page,
          COUNT(*) AS views,
          COUNT(DISTINCT visitor_id) AS unique_visitors
        FROM page_views
        GROUP BY page
        ORDER BY views DESC
        LIMIT 100
        `
      )
      .all<{
        page: string;
        views: number;
        unique_visitors: number;
      }>();

    const livePageMap = new Map<string, number>();

    for (const item of livePagesResult.results || []) {
      livePageMap.set(item.page, Number(item.live || 0));
    }

    const pages = (pageStatsResult.results || []).map((item) => ({
      page: item.page,
      views: Number(item.views || 0),
      uniqueVisitors: Number(item.unique_visitors || 0),
      live: livePageMap.get(item.page) || 0,
    }));

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return Response.json({
      success: true,

      live: {
        visitors: Number(liveResult?.count || 0),
        pages: livePagesResult.results || [],
      },

      total: {
        views: Number(totalViewsResult?.count || 0),
        uniqueVisitors: Number(uniqueVisitorsResult?.count || 0),
      },

      today: {
        views: Number(todayViewsResult?.count || 0),
        uniqueVisitors: Number(todayVisitorsResult?.count || 0),
      },

      last7Days: {
        views: Number(sevenDaysViewsResult?.count || 0),
        uniqueVisitors: Number(sevenDaysVisitorsResult?.count || 0),
      },

      last30Days: {
        views: Number(thirtyDaysViewsResult?.count || 0),
        uniqueVisitors: Number(thirtyDaysVisitorsResult?.count || 0),
      },

      pages,

      timestamp: now,
    });
  } catch (error) {
    console.error("Live audience error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load analytics.",
      },
      { status: 500 }
    );
  }
}