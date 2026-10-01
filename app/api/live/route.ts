import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

type CountResult = {
  count: number;
};

type LivePageRow = {
  page: string;
  live: number;
};

type PageStatsRow = {
  page: string;
  views: number;
  unique_visitors: number;
};

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

    // --------------------------------------------------
    // 1. UPDATE LIVE VISITOR
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. RECORD PAGE VIEW ONLY WHEN view=1
    //
    // IMPORTANT:
    // Normal 20-second heartbeat requests do NOT create
    // page views.
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 3. LIVE VISITOR COUNT
    //
    // This is lightweight and runs on every heartbeat.
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
      .first<CountResult>();

    // --------------------------------------------------
    // 4. LIVE VISITORS BY PAGE
    // --------------------------------------------------

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
      .all<LivePageRow>();

    const livePages = livePagesResult.results || [];

    // --------------------------------------------------
    // 5. NORMAL HEARTBEAT RESPONSE
    //
    // Most visitors hit this every 20 seconds.
    //
    // DO NOT run expensive page_views analytics here.
    // --------------------------------------------------

    if (!recordView) {
      return Response.json({
        success: true,

        live: {
          visitors: Number(liveResult?.count || 0),
          pages: livePages,
        },

        total: {
          views: 0,
          uniqueVisitors: 0,
        },

        today: {
          views: 0,
          uniqueVisitors: 0,
        },

        last7Days: {
          views: 0,
          uniqueVisitors: 0,
        },

        last30Days: {
          views: 0,
          uniqueVisitors: 0,
        },

        pages: [],

        timestamp: now,
      });
    }

    // --------------------------------------------------
    // 6. ANALYTICS
    //
    // These expensive queries now run ONLY when
    // ?view=1 is explicitly requested.
    // --------------------------------------------------

    const dayAgo = now - 86_400_000;
    const sevenDaysAgo = now - 7 * 86_400_000;
    const thirtyDaysAgo = now - 30 * 86_400_000;

    // --------------------------------------------------
    // TOTAL
    // --------------------------------------------------

    const totalViewsResult = await db
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM page_views
        `
      )
      .first<CountResult>();

    const uniqueVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        `
      )
      .first<CountResult>();

    // --------------------------------------------------
    // TODAY / LAST 24 HOURS
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
      .first<CountResult>();

    const todayVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(dayAgo)
      .first<CountResult>();

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
      .first<CountResult>();

    const sevenDaysVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .first<CountResult>();

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
      .first<CountResult>();

    const thirtyDaysVisitorsResult = await db
      .prepare(
        `
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM page_views
        WHERE viewed_at >= ?
        `
      )
      .bind(thirtyDaysAgo)
      .first<CountResult>();

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
      .all<PageStatsRow>();

    // --------------------------------------------------
    // MERGE LIVE + PAGE ANALYTICS
    // --------------------------------------------------

    const livePageMap = new Map<string, number>();

    for (const item of livePages) {
      livePageMap.set(item.page, Number(item.live || 0));
    }

    const pages = (pageStatsResult.results || []).map((item) => ({
      page: item.page,
      views: Number(item.views || 0),
      uniqueVisitors: Number(item.unique_visitors || 0),
      live: livePageMap.get(item.page) || 0,
    }));

    // --------------------------------------------------
    // FULL ANALYTICS RESPONSE
    // --------------------------------------------------

    return Response.json({
      success: true,

      live: {
        visitors: Number(liveResult?.count || 0),
        pages: livePages,
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