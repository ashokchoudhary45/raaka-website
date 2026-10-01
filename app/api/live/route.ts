import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

type CountResult = {
  count: number;
};

type LivePageRow = {
  page: string;
  live: number;
};

type AnalyticsSummaryRow = {
  total_views: number;
  total_unique: number;
  today_views: number;
  today_unique: number;
  seven_views: number;
  seven_unique: number;
  thirty_views: number;
  thirty_unique: number;
};

type PageStatsRow = {
  page: string;
  views: number;
  unique_visitors: number;
};

/*
 * --------------------------------------------------
 * LIVE STATS CACHE
 * --------------------------------------------------
 * Cached per Worker isolate for 30 seconds.
 */
type LiveStatsCache = {
  expiresAt: number;
  visitors: number;
  pages: LivePageRow[];
} | null;

let liveStatsCache: LiveStatsCache = null;
const LIVE_STATS_CACHE_TTL_MS = 30_000;

/*
 * --------------------------------------------------
 * ANALYTICS CACHE
 * --------------------------------------------------
 * The dashboard does not need fresh D1 aggregation every
 * second. Cache the complete page_views analytics response
 * for 5 minutes per Worker isolate.
 */
type AnalyticsCache = {
  expiresAt: number;
  payload: {
    total: { views: number; uniqueVisitors: number };
    today: { views: number; uniqueVisitors: number };
    last7Days: { views: number; uniqueVisitors: number };
    last30Days: { views: number; uniqueVisitors: number };
    pages: Array<{
      page: string;
      views: number;
      uniqueVisitors: number;
      live: number;
    }>;
  };
} | null;

let analyticsCache: AnalyticsCache = null;
const ANALYTICS_CACHE_TTL_MS = 5 * 60_000;

async function getLiveStats(
  db: ReturnType<typeof getD1>,
  minuteAgo: number
) {
  const now = Date.now();

  if (liveStatsCache && liveStatsCache.expiresAt > now) {
    return {
      visitors: liveStatsCache.visitors,
      pages: liveStatsCache.pages,
    };
  }

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

  const visitors = Number(liveResult?.count || 0);
  const pages = livePagesResult.results || [];

  liveStatsCache = {
    expiresAt: now + LIVE_STATS_CACHE_TTL_MS,
    visitors,
    pages,
  };

  return { visitors, pages };
}

async function getPageAnalytics(
  db: ReturnType<typeof getD1>,
  now: number,
  liveStats: { visitors: number; pages: LivePageRow[] }
) {
  const cached = analyticsCache;

  if (cached && cached.expiresAt > now) {
    return cached.payload;
  }

  const dayAgo = now - 86_400_000;
  const sevenDaysAgo = now - 7 * 86_400_000;
  const thirtyDaysAgo = now - 30 * 86_400_000;

  /*
   * ONE scan for all overall totals.
   *
   * Instead of 8 separate COUNT / COUNT(DISTINCT) queries,
   * SQLite calculates all eight values in one pass.
   */
  const summaryResult = await db
    .prepare(
      `
        SELECT
          COUNT(*) AS total_views,
          COUNT(DISTINCT visitor_id) AS total_unique,

          SUM(CASE WHEN viewed_at >= ? THEN 1 ELSE 0 END) AS today_views,
          COUNT(
            DISTINCT CASE
              WHEN viewed_at >= ? THEN visitor_id
              ELSE NULL
            END
          ) AS today_unique,

          SUM(CASE WHEN viewed_at >= ? THEN 1 ELSE 0 END) AS seven_views,
          COUNT(
            DISTINCT CASE
              WHEN viewed_at >= ? THEN visitor_id
              ELSE NULL
            END
          ) AS seven_unique,

          SUM(CASE WHEN viewed_at >= ? THEN 1 ELSE 0 END) AS thirty_views,
          COUNT(
            DISTINCT CASE
              WHEN viewed_at >= ? THEN visitor_id
              ELSE NULL
            END
          ) AS thirty_unique

        FROM page_views
      `
    )
    .bind(
      dayAgo,
      dayAgo,
      sevenDaysAgo,
      sevenDaysAgo,
      thirtyDaysAgo,
      thirtyDaysAgo
    )
    .first<AnalyticsSummaryRow>();

  /*
   * ONE page-wise query.
   *
   * Keep this separate because the dashboard needs a row per page.
   */
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

  const livePageMap = new Map<string, number>();

  for (const item of liveStats.pages) {
    livePageMap.set(item.page, Number(item.live || 0));
  }

  const pages = (pageStatsResult.results || []).map((item) => ({
    page: item.page,
    views: Number(item.views || 0),
    uniqueVisitors: Number(item.unique_visitors || 0),
    live: livePageMap.get(item.page) || 0,
  }));

  const payload = {
    total: {
      views: Number(summaryResult?.total_views || 0),
      uniqueVisitors: Number(summaryResult?.total_unique || 0),
    },
    today: {
      views: Number(summaryResult?.today_views || 0),
      uniqueVisitors: Number(summaryResult?.today_unique || 0),
    },
    last7Days: {
      views: Number(summaryResult?.seven_views || 0),
      uniqueVisitors: Number(summaryResult?.seven_unique || 0),
    },
    last30Days: {
      views: Number(summaryResult?.thirty_views || 0),
      uniqueVisitors: Number(summaryResult?.thirty_unique || 0),
    },
    pages,
  };

  analyticsCache = {
    expiresAt: now + ANALYTICS_CACHE_TTL_MS,
    payload,
  };

  return payload;
}

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

    /*
     * 1. Keep existing live visitor heartbeat behavior.
     */
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

    /*
     * 2. Keep existing page-view recording behavior.
     */
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

    const liveStats = await getLiveStats(db, minuteAgo);

    /*
     * 3. Normal heartbeat: no page_views analytics.
     */
    if (!recordView) {
      return Response.json({
        success: true,
        live: {
          visitors: liveStats.visitors,
          pages: liveStats.pages,
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

    /*
     * 4. Expensive analytics are now:
     *    - one aggregate query
     *    - one page-wise query
     *    - cached for 5 minutes
     *
     * Existing response shape is preserved.
     */
    const analytics = await getPageAnalytics(db, now, liveStats);

    return Response.json({
      success: true,
      live: {
        visitors: liveStats.visitors,
        pages: liveStats.pages,
      },
      ...analytics,
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
