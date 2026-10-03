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
 * SHARED CLOUDFLARE CACHE
 * --------------------------------------------------
 * Worker memory is isolate-local, so an in-memory cache
 * does not reliably protect D1. Use Cloudflare's shared
 * Cache API for aggregate reads.
 * --------------------------------------------------
 */

type SharedCache = {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
};

function getSharedCache(): SharedCache {
  return (globalThis.caches as unknown as {
    default: SharedCache;
  }).default;
}

const LIVE_STATS_CACHE_TTL_SECONDS = 30;
const PAGE_ANALYTICS_CACHE_TTL_SECONDS = 300;

function makeCacheKey(request: Request, path: string) {
  const url = new URL(request.url);
  return new Request(`${url.origin}${path}`, { method: "GET" });
}

type LiveStats = {
  visitors: number;
  pages: LivePageRow[];
  timestamp: number;
};

async function getLiveStats(
  db: ReturnType<typeof getD1>,
  minuteAgo: number,
  request: Request
): Promise<LiveStats> {
  const cache = getSharedCache();
  const cacheKey = makeCacheKey(request, "/__raaka_live_stats__");

  const cached = await cache.match(cacheKey);

  if (cached) {
    try {
      const data = (await cached.json()) as LiveStats;
      if (
        typeof data.visitors === "number" &&
        Array.isArray(data.pages)
      ) {
        return data;
      }
    } catch {
      // Ignore malformed cache entries.
    }
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

  const result: LiveStats = {
    visitors: Number(liveResult?.count || 0),
    pages: livePagesResult.results || [],
    timestamp: Date.now(),
  };

  const response = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${LIVE_STATS_CACHE_TTL_SECONDS}`,
    },
  });

  void cache.put(cacheKey, response.clone());

  return result;
}

async function getPageAnalytics(
  db: ReturnType<typeof getD1>,
  now: number,
  request: Request
) {
  const cache = getSharedCache();
  const cacheKey = makeCacheKey(request, "/__raaka_page_analytics__");

  type CachedAnalytics = {
    total: { views: number; uniqueVisitors: number };
    today: { views: number; uniqueVisitors: number };
    last7Days: { views: number; uniqueVisitors: number };
    last30Days: { views: number; uniqueVisitors: number };
    pages: Array<{
      page: string;
      views: number;
      uniqueVisitors: number;
    }>;
  };

  const cached = await cache.match(cacheKey);

  if (cached) {
    try {
      const data = (await cached.json()) as CachedAnalytics;
      if (data && data.total && Array.isArray(data.pages)) {
        return data;
      }
    } catch {
      // Ignore malformed cache.
    }
  }

  const dayAgo = now - 86_400_000;
  const sevenDaysAgo = now - 7 * 86_400_000;
  const thirtyDaysAgo = now - 30 * 86_400_000;

  /*
   * ONE scan for all overall totals.
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

  const payload: CachedAnalytics = {
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
    pages: (pageStatsResult.results || []).map((item) => ({
      page: item.page,
      views: Number(item.views || 0),
      uniqueVisitors: Number(item.unique_visitors || 0),
    })),
  };

  const response = new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${PAGE_ANALYTICS_CACHE_TTL_SECONDS}`,
    },
  });

  void cache.put(cacheKey, response.clone());

  return payload;
}

export async function GET(request: Request) {
  try {
    const db = getD1();
    const url = new URL(request.url);

    const mode = url.searchParams.get("mode") || "heartbeat";
    const visitorId = url.searchParams.get("visitorId");
    const page = url.searchParams.get("page") || "/";
    const recordView = url.searchParams.get("view") === "1";

    const now = Date.now();
    const minuteAgo = now - 60_000;

    /*
     * Analytics mode is READ-ONLY.
     * It must never create a live visitor or page view.
     */
    if (mode === "analytics") {
      const liveStats = await getLiveStats(db, minuteAgo, request);
      const analytics = await getPageAnalytics(db, now, request);

      const livePageMap = new Map<string, number>();
      for (const item of liveStats.pages) {
        livePageMap.set(item.page, Number(item.live || 0));
      }

      return Response.json({
        success: true,
        live: liveStats,
        total: analytics.total,
        today: analytics.today,
        last7Days: analytics.last7Days,
        last30Days: analytics.last30Days,
        pages: analytics.pages.map((item) => ({
          ...item,
          live: livePageMap.get(item.page) || 0,
        })),
        timestamp: now,
      }, {
        headers: {
          "Cache-Control": "no-store",
          "X-Raaka-Analytics-Mode": "readonly",
        },
      });
    }

    if (!visitorId) {
      return Response.json(
        {
          success: false,
          error: "visitorId is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Heartbeat / normal tracking request.
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

    const liveStats = await getLiveStats(db, minuteAgo, request);

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
