import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const ZONE_ID = "09dc54ff7b3251c3d50f53ea09380776";
const GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;
const ANALYTICS_CACHE_TTL_MS = 60 * 1000;

let analyticsCache: {
  key: string;
  expiresAt: number;
  payload: unknown;
} | null = null;

type AnalyticsGroup = {
  count?: number;
  sum?: {
    visits?: number;
    edgeResponseBytes?: number;
  };
  dimensions?: {
    datetimeHour?: string | null;
    clientCountryName?: string | null;
    clientRequestHTTPHost?: string | null;
    clientRequestPath?: string | null;
    clientDeviceType?: string | null;
    userAgent?: string | null;
    clientRefererHost?: string | null;
    coloCode?: string | null;
  };
};

type AnalyticsResult = {
  errors?: unknown;
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequestsAdaptiveGroups?: AnalyticsGroup[];
      }>;
    };
  };
};

type FilterInput = {
  datetime_geq: string;
  datetime_lt: string;
  requestSource?: string;
  clientCountryName?: string;
  clientRequestHTTPHost?: string;
  clientRequestPath?: string;
  clientDeviceType?: string;
  clientRefererHost?: string;
  userAgent_like?: string;
};

type LegacyAnalytics = {
  success?: boolean;
  result?: {
    totals?: {
      requests?: {
        all?: number;
        cached?: number;
        uncached?: number;
      };
      bandwidth?: {
        all?: number;
        cached?: number;
        uncached?: number;
      };
      pageviews?: {
        all?: number;
      };
      uniques?: {
        all?: number;
      };
    };
  };
};

function cleanValue(value: string | null) {
  return value?.trim() || "";
}

function safeNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function buildFilter(
  start: string,
  end: string,
  searchParams: URLSearchParams
): FilterInput {
  const filter: FilterInput = {
    datetime_geq: start,
    datetime_lt: end,
  };

  const source = cleanValue(searchParams.get("source"));
  const country = cleanValue(searchParams.get("country"));
  const hostname = cleanValue(searchParams.get("hostname"));
  const path = cleanValue(searchParams.get("path"));
  const device = cleanValue(searchParams.get("device"));
  const referrer = cleanValue(searchParams.get("referrer"));
  const userAgent = cleanValue(searchParams.get("userAgent"));

  if (source !== "all") {
    filter.requestSource = "eyeball";
  }

  if (country) filter.clientCountryName = country;
  if (hostname) filter.clientRequestHTTPHost = hostname;
  if (path) filter.clientRequestPath = path;
  if (device) filter.clientDeviceType = device;
  if (referrer) filter.clientRefererHost = referrer;
  if (userAgent) filter.userAgent_like = `%${userAgent}%`;

  return filter;
}

async function runGraphQL(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<AnalyticsResult> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const result = (await response.json()) as AnalyticsResult;

  if (!response.ok || result.errors) {
    const detail = result.errors
      ? JSON.stringify(result.errors)
      : `HTTP ${response.status} ${response.statusText}`;

    console.error("Cloudflare GraphQL error:", detail);
    throw new Error(detail);
  }

  return result;
}

async function runLegacyAnalytics(
  token: string,
  since: string,
  until: string
): Promise<LegacyAnalytics | null> {
  try {
    const url = new URL(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/analytics/dashboard`
    );

    url.searchParams.set("since", since);
    url.searchParams.set("until", until);
    url.searchParams.set("continuous", "false");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn("Cloudflare legacy analytics unavailable:", response.status);
      return null;
    }

    return (await response.json()) as LegacyAnalytics;
  } catch (error) {
    console.warn("Cloudflare legacy analytics error:", error);
    return null;
  }
}

function getGroups(result: AnalyticsResult) {
  return (
    result.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || []
  );
}

function aggregateRows(
  groups: AnalyticsGroup[],
  keyGetter: (group: AnalyticsGroup) => string
) {
  const map = new Map<
    string,
    { key: string; visits: number; requests: number; bytes: number }
  >();

  for (const group of groups) {
    const key = keyGetter(group) || "Unknown";
    const existing = map.get(key);

    const visits = safeNumber(group.sum?.visits);
    const requests = safeNumber(group.count);
    const bytes = safeNumber(group.sum?.edgeResponseBytes);

    if (existing) {
      existing.visits += visits;
      existing.requests += requests;
      existing.bytes += bytes;
    } else {
      map.set(key, { key, visits, requests, bytes });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.visits !== a.visits) return b.visits - a.visits;
    return b.requests - a.requests;
  });
}

function parseBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/")) return "Microsoft Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("googlebot")) return "Googlebot";
  if (ua.includes("bingbot")) return "Bingbot";
  if (ua.includes("facebookexternalhit")) return "Facebook";
  if (ua.includes("instagram")) return "Instagram";
  return "Other";
}

function parseOS(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("windows")) return "Windows";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) {
    return "iOS";
  }
  if (ua.includes("mac os x") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("cros")) return "ChromeOS";
  return "Other";
}

function aggregateUserAgents(groups: AnalyticsGroup[]) {
  const raw = aggregateRows(
    groups,
    (group) => group.dimensions?.userAgent || "Unknown"
  );

  const browsers = new Map<
    string,
    { browser: string; visits: number; requests: number; bytes: number }
  >();

  const operatingSystems = new Map<
    string,
    { os: string; visits: number; requests: number; bytes: number }
  >();

  for (const item of raw) {
    const browser = parseBrowser(item.key);
    const os = parseOS(item.key);

    const browserRow = browsers.get(browser);
    if (browserRow) {
      browserRow.visits += item.visits;
      browserRow.requests += item.requests;
      browserRow.bytes += item.bytes;
    } else {
      browsers.set(browser, {
        browser,
        visits: item.visits,
        requests: item.requests,
        bytes: item.bytes,
      });
    }

    const osRow = operatingSystems.get(os);
    if (osRow) {
      osRow.visits += item.visits;
      osRow.requests += item.requests;
      osRow.bytes += item.bytes;
    } else {
      operatingSystems.set(os, {
        os,
        visits: item.visits,
        requests: item.requests,
        bytes: item.bytes,
      });
    }
  }

  return {
    userAgents: raw.slice(0, 100).map((item) => ({
      userAgent: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    })),
    browsers: Array.from(browsers.values()).sort(
      (a, b) => b.requests - a.requests
    ),
    operatingSystems: Array.from(operatingSystems.values()).sort(
      (a, b) => b.requests - a.requests
    ),
  };
}

function getDateKey(iso: string) {
  return iso.slice(0, 10);
}

function getHourKey(iso: string) {
  return iso.slice(11, 13);
}

export async function GET(request: Request) {
  try {
    const { env } = getCloudflareContext();
    const token = env.CLOUDFLARE_ANALYTICS_TOKEN;

    if (!token) {
      return Response.json(
        {
          success: false,
          error: "CLOUDFLARE_ANALYTICS_TOKEN is missing.",
        },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const now = new Date();

    // The dashboard polls frequently, but Cloudflare GraphQL has request-rate limits.
    // Ignore the frontend cache-busting `_t` parameter and serve the same analytics
    // result for 60 seconds instead of issuing 9 GraphQL requests on every poll.
    const cacheParams = new URLSearchParams(url.searchParams);
    cacheParams.delete("_t");
    const cacheKey = cacheParams.toString();

    if (
      analyticsCache &&
      analyticsCache.key === cacheKey &&
      analyticsCache.expiresAt > Date.now()
    ) {
      return Response.json(analyticsCache.payload, {
        headers: {
          "Cache-Control": "private, max-age=60",
          "X-Raaka-Analytics-Cache": "HIT",
        },
      });
    }

    const requestedFrom = cleanValue(url.searchParams.get("from"));
    const requestedTo = cleanValue(url.searchParams.get("to"));

    let startDate = requestedFrom
      ? new Date(`${requestedFrom}T00:00:00.000Z`)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let endDate = requestedTo
      ? new Date(`${requestedTo}T23:59:59.999Z`)
      : now;

    if (Number.isNaN(startDate.getTime())) {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (Number.isNaN(endDate.getTime())) {
      endDate = now;
    }

    if (startDate.getTime() > endDate.getTime()) {
      return Response.json(
        {
          success: false,
          error: "Invalid analytics date range.",
        },
        { status: 400 }
      );
    }

    if (endDate.getTime() - startDate.getTime() > MAX_RANGE_MS) {
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const since = startDate.toISOString();
    const until = endDate.toISOString();
    const filter = buildFilter(since, until, url.searchParams);

    const baseQuery = `
      query Analytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 1000
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                datetimeHour
              }
            }
          }
        }
      }
    `;

    const countryQuery = `
      query CountryAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 250
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                clientCountryName
              }
            }
          }
        }
      }
    `;

    const hostnameQuery = `
      query HostAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 100
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                clientRequestHTTPHost
              }
            }
          }
        }
      }
    `;

    const pathQuery = `
      query PathAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 250
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                clientRequestPath
              }
            }
          }
        }
      }
    `;

    const deviceQuery = `
      query DeviceAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 50
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                clientDeviceType
              }
            }
          }
        }
      }
    `;

    const referrerQuery = `
      query ReferrerAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 250
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                clientRefererHost
              }
            }
          }
        }
      }
    `;

    const userAgentQuery = `
      query UserAgentAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 250
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                userAgent
              }
            }
          }
        }
      }
    `;

    const coloQuery = `
      query ColoAnalytics($zoneTag: string, $filter: filter) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            httpRequestsAdaptiveGroups(
              limit: 100
              filter: $filter
            ) {
              count
              sum {
                visits
                edgeResponseBytes
              }
              dimensions {
                coloCode
              }
            }
          }
        }
      }
    `;

    const variables = {
      zoneTag: ZONE_ID,
      filter,
    };

    /*
     * Run the GraphQL datasets independently.
     *
     * Cloudflare can reject an individual dimension/query even when the
     * main HTTP analytics dataset is available. We therefore fail only
     * when the core hourly query fails; optional breakdowns are allowed
     * to return empty data instead of taking down the entire dashboard.
     */
    const settled = await Promise.allSettled([
      runGraphQL(token, baseQuery, variables),
      runGraphQL(token, countryQuery, variables),
      runGraphQL(token, hostnameQuery, variables),
      runGraphQL(token, pathQuery, variables),
      runGraphQL(token, deviceQuery, variables),
      runGraphQL(token, referrerQuery, variables),
      runGraphQL(token, userAgentQuery, variables),
      runGraphQL(token, coloQuery, variables),
      runLegacyAnalytics(token, since, until),
    ]);

    const queryNames = [
      "hourly",
      "country",
      "hostname",
      "path",
      "device",
      "referrer",
      "userAgent",
      "colo",
      "legacy",
    ];

    const warnings: string[] = [];

    function getSettledResult<T>(index: number): T | null {
      const item = settled[index];

      if (item.status === "fulfilled") {
        return item.value as T;
      }

      const message =
        item.reason instanceof Error
          ? item.reason.message
          : String(item.reason);

      warnings.push(`${queryNames[index]}: ${message}`);
      console.error(
        `Cloudflare Analytics ${queryNames[index]} query failed:`,
        message
      );

      return null;
    }

    const hourlyResult = getSettledResult<AnalyticsResult>(0);
    const countryResult = getSettledResult<AnalyticsResult>(1);
    const hostnameResult = getSettledResult<AnalyticsResult>(2);
    const pathResult = getSettledResult<AnalyticsResult>(3);
    const deviceResult = getSettledResult<AnalyticsResult>(4);
    const referrerResult = getSettledResult<AnalyticsResult>(5);
    const userAgentResult = getSettledResult<AnalyticsResult>(6);
    const coloResult = getSettledResult<AnalyticsResult>(7);
    const legacyResult = getSettledResult<LegacyAnalytics>(8);

    if (!hourlyResult) {
      return Response.json(
        {
          success: false,
          error:
            warnings.find((item) => item.startsWith("hourly:")) ||
            "Cloudflare core analytics query failed.",
          warnings,
        },
        { status: 500 }
      );
    }

    const hourlyGroups = getGroups(hourlyResult);
    const countryGroups = countryResult ? getGroups(countryResult) : [];
    const hostnameGroups = hostnameResult ? getGroups(hostnameResult) : [];
    const pathGroups = pathResult ? getGroups(pathResult) : [];
    const deviceGroups = deviceResult ? getGroups(deviceResult) : [];
    const referrerGroups = referrerResult ? getGroups(referrerResult) : [];
    const userAgentGroups = userAgentResult ? getGroups(userAgentResult) : [];
    const coloGroups = coloResult ? getGroups(coloResult) : [];

    const totalVisits = hourlyGroups.reduce(
      (total, item) => total + safeNumber(item.sum?.visits),
      0
    );

    const totalRequests = hourlyGroups.reduce(
      (total, item) => total + safeNumber(item.count),
      0
    );

    const totalBytes = hourlyGroups.reduce(
      (total, item) => total + safeNumber(item.sum?.edgeResponseBytes),
      0
    );

    const hourly = hourlyGroups
      .filter((item) => item.dimensions?.datetimeHour)
      .map((item) => ({
        hour: item.dimensions?.datetimeHour || null,
        visits: safeNumber(item.sum?.visits),
        requests: safeNumber(item.count),
        bytes: safeNumber(item.sum?.edgeResponseBytes),
      }))
      .sort((a, b) => (a.hour || "").localeCompare(b.hour || ""));

    const dailyMap = new Map<
      string,
      { date: string; visits: number; requests: number; bytes: number }
    >();

    for (const item of hourly) {
      if (!item.hour) continue;

      const date = getDateKey(item.hour);
      const existing = dailyMap.get(date);

      if (existing) {
        existing.visits += item.visits;
        existing.requests += item.requests;
        existing.bytes += item.bytes;
      } else {
        dailyMap.set(date, {
          date,
          visits: item.visits,
          requests: item.requests,
          bytes: item.bytes,
        });
      }
    }

    const daily = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const hourlyByClockMap = new Map<
      string,
      { hour: string; visits: number; requests: number; bytes: number }
    >();

    for (const item of hourly) {
      if (!item.hour) continue;

      const hour = getHourKey(item.hour);
      const existing = hourlyByClockMap.get(hour);

      if (existing) {
        existing.visits += item.visits;
        existing.requests += item.requests;
        existing.bytes += item.bytes;
      } else {
        hourlyByClockMap.set(hour, {
          hour,
          visits: item.visits,
          requests: item.requests,
          bytes: item.bytes,
        });
      }
    }

    const hourlyByClock = Array.from(hourlyByClockMap.values()).sort(
      (a, b) => a.hour.localeCompare(b.hour)
    );

    const countries = aggregateRows(
      countryGroups,
      (group) => group.dimensions?.clientCountryName || "Unknown"
    ).map((item) => ({
      country: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
      percentage:
        totalRequests > 0
          ? Number(((item.requests / totalRequests) * 100).toFixed(2))
          : 0,
    }));

    const hostnames = aggregateRows(
      hostnameGroups,
      (group) => group.dimensions?.clientRequestHTTPHost || "Unknown"
    ).map((item) => ({
      hostname: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    }));

    const paths = aggregateRows(
      pathGroups,
      (group) => group.dimensions?.clientRequestPath || "/"
    ).map((item) => ({
      path: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    }));

    const devices = aggregateRows(
      deviceGroups,
      (group) => group.dimensions?.clientDeviceType || "Unknown"
    ).map((item) => ({
      device: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    }));

    const referrers = aggregateRows(
      referrerGroups,
      (group) => group.dimensions?.clientRefererHost || "Direct / Unknown"
    ).map((item) => ({
      referrer: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    }));

    const colos = aggregateRows(
      coloGroups,
      (group) => group.dimensions?.coloCode || "Unknown"
    ).map((item) => ({
      colo: item.key,
      visits: item.visits,
      requests: item.requests,
      bytes: item.bytes,
    }));

    const {
      userAgents,
      browsers,
      operatingSystems,
    } = aggregateUserAgents(userAgentGroups);

    const legacyTotals = legacyResult?.result?.totals;

    const legacyRequests = safeNumber(legacyTotals?.requests?.all);
    const cachedRequests = safeNumber(legacyTotals?.requests?.cached);
    const uncachedRequests = safeNumber(
      legacyTotals?.requests?.uncached
    );

    const legacyBytes = safeNumber(legacyTotals?.bandwidth?.all);
    const cachedBytes = safeNumber(legacyTotals?.bandwidth?.cached);
    const uncachedBytes = safeNumber(
      legacyTotals?.bandwidth?.uncached
    );

    const cacheHitRate =
      legacyRequests > 0
        ? Number(((cachedRequests / legacyRequests) * 100).toFixed(2))
        : null;

    const cachedBytesRate =
      legacyBytes > 0
        ? Number(((cachedBytes / legacyBytes) * 100).toFixed(2))
        : null;

    const legacyPageViews = safeNumber(
      legacyTotals?.pageviews?.all
    );

    const legacyUniques = safeNumber(
      legacyTotals?.uniques?.all
    );

    const payload = {
      success: true,

      period: {
        since,
        until,
      },

      filters: {
        country: filter.clientCountryName || null,
        hostname: filter.clientRequestHTTPHost || null,
        path: filter.clientRequestPath || null,
        device: filter.clientDeviceType || null,
        referrer: filter.clientRefererHost || null,
        userAgent: filter.userAgent_like || null,
        source: filter.requestSource || "all",
      },

      totals: {
        visits: totalVisits,
        requests: totalRequests,
        bytes: totalBytes,
        dataTransferGB: Number(
          (totalBytes / 1024 / 1024 / 1024).toFixed(2)
        ),
      },

      cloudflareDashboard: {
        available: Boolean(legacyResult),

        totalRequests: legacyRequests,
        cachedRequests,
        uncachedRequests,

        totalBytes: legacyBytes,
        cachedBytes,
        uncachedBytes,

        cacheHitRate,
        cachedBytesRate,

        pageViews: legacyPageViews,
        uniqueVisitors: legacyUniques,

        dataTransferGB: Number(
          (legacyBytes / 1024 / 1024 / 1024).toFixed(2)
        ),
      },

      totalVisits,
      totalRequests,

      hourly,
      hourlyByClock,
      daily,

      countries,
      hostnames,
      paths,
      devices,
      referrers,
      userAgents,
      browsers,
      operatingSystems,
      colos,

      meta: {
        countryCount: countries.length,
        hostnameCount: hostnames.length,
        pathCount: paths.length,
        deviceCount: devices.length,
        referrerCount: referrers.length,
        browserCount: browsers.length,
        operatingSystemCount: operatingSystems.length,
        userAgentCount: userAgents.length,
        coloCount: colos.length,
      },

      warnings,

      timestamp: Date.now(),
    };

    analyticsCache = {
      key: cacheKey,
      expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
      payload,
    };

    return Response.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=60",
        "X-Raaka-Analytics-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Cloudflare Analytics route error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
