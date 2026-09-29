"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

type PageStat = {
  page: string;
  views: number;
  uniqueVisitors: number;
  live: number;
};

type D1AnalyticsResponse = {
  success: boolean;
  live?: {
    visitors: number;
    pages: { page: string; live: number }[];
  };
  total?: { views: number; uniqueVisitors: number };
  today?: { views: number; uniqueVisitors: number };
  last7Days?: { views: number; uniqueVisitors: number };
  last30Days?: { views: number; uniqueVisitors: number };
  pages?: PageStat[];
  error?: string;
};

type TrafficRow = {
  visits: number;
  requests: number;
  bytes: number;
};

type CloudflareAnalyticsResponse = {
  success: boolean;
  totalVisits?: number;
  totalRequests?: number;
  hourly?: { hour: string | null; visits: number; requests: number; bytes: number }[];
  hourlyByClock?: { hour: string; visits: number; requests: number; bytes: number }[];
  daily?: { date: string; visits: number; requests: number; bytes: number }[];
  countries?: (TrafficRow & { country: string; percentage: number })[];
  hostnames?: (TrafficRow & { hostname: string })[];
  paths?: (TrafficRow & { path: string })[];
  devices?: (TrafficRow & { device: string })[];
  referrers?: (TrafficRow & { referrer: string })[];
  browsers?: (TrafficRow & { browser: string })[];
  operatingSystems?: (TrafficRow & { os: string })[];
  userAgents?: (TrafficRow & { userAgent: string })[];
  colos?: (TrafficRow & { colo: string })[];
  totals?: {
    visits: number;
    requests: number;
    bytes: number;
    dataTransferGB: number;
  };
  cloudflareDashboard?: {
    available: boolean;
    totalRequests: number;
    cachedRequests: number;
    uncachedRequests: number;
    totalBytes: number;
    cachedBytes: number;
    uncachedBytes: number;
    cacheHitRate: number | null;
    cachedBytesRate: number | null;
    pageViews: number;
    uniqueVisitors: number;
    dataTransferGB: number;
  };
  meta?: Record<string, number>;
  error?: string;
};

type Preset = "today" | "yesterday" | "7days" | "30days" | "custom";
type Metric = "visits" | "requests" | "bytes";
type SortOrder = "desc" | "asc";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function getVisitorId() {
  const key = "raaka-live-visitor-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value || 0));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
}

function getDateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getPresetDates(preset: Preset) {
  const today = new Date();
  const todayString = getDateString(today);

  if (preset === "today") return { from: todayString, to: todayString };

  if (preset === "yesterday") {
    const date = new Date(today);
    date.setDate(date.getDate() - 1);
    const value = getDateString(date);
    return { from: value, to: value };
  }

  if (preset === "7days") {
    const date = new Date(today);
    date.setDate(date.getDate() - 6);
    return { from: getDateString(date), to: todayString };
  }

  if (preset === "30days") {
    const date = new Date(today);
    date.setDate(date.getDate() - 29);
    return { from: getDateString(date), to: todayString };
  }

  return { from: todayString, to: todayString };
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function percentage(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function metricValue(item: TrafficRow, metric: Metric) {
  if (metric === "requests") return item.requests;
  if (metric === "bytes") return item.bytes;
  return item.visits;
}

export default function LiveAudiencePage() {
  const [data, setData] = useState<D1AnalyticsResponse | null>(null);
  const [cloudflare, setCloudflare] =
    useState<CloudflareAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudflareLoading, setCloudflareLoading] = useState(true);
  const [error, setError] = useState("");
  const [cloudflareError, setCloudflareError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [preset, setPreset] = useState<Preset>("30days");
  const initialDates = getPresetDates("30days");
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);

  const [metric, setMetric] = useState<Metric>("visits");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [country, setCountry] = useState("");
  const [hostname, setHostname] = useState("");
  const [path, setPath] = useState("");
  const [device, setDevice] = useState("");
  const [referrer, setReferrer] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [source, setSource] = useState("eyeball");
  const [mapCountry, setMapCountry] = useState("");
  const [mapPosition, setMapPosition] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState(1);

  const fetchD1Analytics = useCallback(async () => {
    try {
      const visitorId = getVisitorId();
      const params = new URLSearchParams({
        visitorId,
        page: "/live-audience",
      });
      const response = await fetch(`/api/live?${params.toString()}`, {
        cache: "no-store",
      });
      const result: D1AnalyticsResponse = await response.json();
      if (!result.success) throw new Error(result.error || "Unable to load analytics.");
      setData(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load live analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCloudflareAnalytics = useCallback(async () => {
    try {
      setCloudflareLoading(true);
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        source,
      });
      if (country) params.set("country", country);
      if (hostname) params.set("hostname", hostname);
      if (path) params.set("path", path);
      if (device) params.set("device", device);
      if (referrer) params.set("referrer", referrer);
      if (userAgent) params.set("userAgent", userAgent);

      params.set("_t", String(Date.now()));

      const response = await fetch(
        `/api/cloudflare-analytics?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, max-age=0",
          },
        }
      );
      const result: CloudflareAnalyticsResponse = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Unable to load Cloudflare Analytics.");
      }
      setCloudflare(result);
      setCloudflareError("");
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (err) {
      console.error(err);
      setCloudflareError(
        err instanceof Error
          ? `Cloudflare analytics error: ${err.message}`
          : "Unable to load Cloudflare historical analytics."
      );
    } finally {
      setCloudflareLoading(false);
    }
  }, [fromDate, toDate, country, hostname, path, device, referrer, userAgent, source]);

  useEffect(() => {
    fetchD1Analytics();
  }, [fetchD1Analytics]);

  useEffect(() => {
    fetchCloudflareAnalytics();
  }, [fetchCloudflareAnalytics]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchD1Analytics();
    }, 20_000);
    return () => clearInterval(interval);
  }, [fetchD1Analytics]);

  const dailyData = cloudflare?.daily || [];
  const hourlyData = cloudflare?.hourly || [];

  const filteredDailyData = useMemo(() => {
    const rows = [...dailyData];
    rows.sort((a, b) => {
      const av = metricValue(a, metric);
      const bv = metricValue(b, metric);
      return sortOrder === "desc" ? bv - av : av - bv;
    });
    return rows;
  }, [dailyData, metric, sortOrder]);

  const peakDay = useMemo(() => {
    if (!dailyData.length) return null;
    return dailyData.reduce((best, item) =>
      item.visits > best.visits ? item : best
    );
  }, [dailyData]);

  const peakHour = useMemo(() => {
    if (!hourlyData.length) return null;
    return hourlyData.reduce((best, item) =>
      item.requests > best.requests ? item : best
    );
  }, [hourlyData]);

  const averageVisits =
    dailyData.length > 0
      ? dailyData.reduce((sum, item) => sum + item.visits, 0) / dailyData.length
      : 0;

  const maxDailyValue = Math.max(
    ...dailyData.map((item) => metricValue(item, metric)),
    1
  );

  const maxHourlyValue = Math.max(
    ...hourlyData.map((item) => metricValue(item, metric)),
    1
  );

  const live = data?.live?.visitors || 0;
  const totalViews = data?.total?.views || 0;
  const uniqueVisitors = data?.total?.uniqueVisitors || 0;

  const totals = cloudflare?.totals;
  const dashboard = cloudflare?.cloudflareDashboard;

  const refreshAll = () => {
    fetchD1Analytics();
    fetchCloudflareAnalytics();
  };

  const applyPreset = (value: Preset) => {
    setPreset(value);
    if (value !== "custom") {
      const dates = getPresetDates(value);
      setFromDate(dates.from);
      setToDate(dates.to);
    }
  };

  const clearFilters = () => {
    const dates = getPresetDates("30days");
    setPreset("30days");
    setFromDate(dates.from);
    setToDate(dates.to);
    setCountry("");
    setHostname("");
    setPath("");
    setDevice("");
    setReferrer("");
    setUserAgent("");
    setSource("eyeball");
  };

  const countryLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cloudflare?.countries || []) {
      map.set(item.country.toUpperCase(), item.requests);
    }
    return map;
  }, [cloudflare?.countries]);

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.5em] text-red-400">
                World of RAAKA
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
                Live Analytics
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
                Real-time audience, Cloudflare traffic, geography, devices,
                browsers, operating systems, referrers, pages and transfer data.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live • Auto refresh 20s
              </div>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/25">
                <span>{lastUpdated ? `Updated ${lastUpdated}` : "Waiting for live data"}</span>
                <button
                  onClick={refreshAll}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-white/50 transition hover:border-red-400/30 hover:text-white"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && <Alert text={error} danger />}
        {cloudflareError && <Alert text={cloudflareError} />}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Live Now" value={live} subtitle="Visitors online" live loading={loading} />
          <StatCard title="Visits" value={totals?.visits || 0} subtitle="Selected period" loading={cloudflareLoading} />
          <StatCard title="Requests" value={totals?.requests || 0} subtitle="HTTP requests" loading={cloudflareLoading} />
          <StatCard
            title="Data Transfer"
            valueText={formatBytes(totals?.bytes || 0)}
            subtitle={`${totals?.dataTransferGB || 0} GB`}
            loading={cloudflareLoading}
          />
          <StatCard title="D1 Views" value={totalViews} subtitle={`${formatNumber(uniqueVisitors)} tracked unique visitors`} loading={loading} />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MiniStat title="Cache Hit Rate" value={dashboard?.cacheHitRate == null ? "—" : `${dashboard.cacheHitRate}%`} />
          <MiniStat title="Cached Requests" value={formatNumber(dashboard?.cachedRequests || 0)} />
          <MiniStat title="Uncached Requests" value={formatNumber(dashboard?.uncachedRequests || 0)} />
          <MiniStat title="Avg Visits / Day" value={formatNumber(averageVisits)} />
          <MiniStat title="Peak Day" value={peakDay ? formatDateLabel(peakDay.date) : "—"} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <PeriodCard title="D1 Today" views={data?.today?.views || 0} visitors={data?.today?.uniqueVisitors || 0} loading={loading} />
          <PeriodCard title="D1 Last 7 Days" views={data?.last7Days?.views || 0} visitors={data?.last7Days?.uniqueVisitors || 0} loading={loading} />
          <PeriodCard title="D1 Last 30 Days" views={data?.last30Days?.views || 0} visitors={data?.last30Days?.uniqueVisitors || 0} loading={loading} />
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wide">Traffic Filters</h2>
                <p className="mt-1 text-xs text-white/35">
                  Every change reloads the Cloudflare analytics for the selected scope.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="rounded-xl border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50 transition hover:border-red-400/30 hover:text-white"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <FilterSelect label="Date Range" value={preset} onChange={(v) => applyPreset(v as Preset)} options={[
              ["today", "Today"],
              ["yesterday", "Yesterday"],
              ["7days", "Last 7 Days"],
              ["30days", "Last 30 Days"],
              ["custom", "Custom Range"],
            ]} />
            <FilterSelect label="Metric" value={metric} onChange={(v) => setMetric(v as Metric)} options={[
              ["visits", "Visits"],
              ["requests", "Requests"],
              ["bytes", "Data Transfer"],
            ]} />
            <FilterSelect label="Sort" value={sortOrder} onChange={(v) => setSortOrder(v as SortOrder)} options={[
              ["desc", "Highest First"],
              ["asc", "Lowest First"],
            ]} />
            <FilterSelect label="Traffic Source" value={source} onChange={setSource} options={[
              ["eyeball", "Visitors"],
              ["all", "All Traffic"],
            ]} />
            <TextFilter label="Country" value={country} onChange={setCountry} placeholder="India" />
            <TextFilter label="Hostname" value={hostname} onChange={setHostname} placeholder="worldofraaka.online" />
            <TextFilter label="Path" value={path} onChange={setPath} placeholder="/news" />
            <TextFilter label="Device" value={device} onChange={setDevice} placeholder="desktop" />
            <TextFilter label="Referrer" value={referrer} onChange={setReferrer} placeholder="google.com" />
            <TextFilter label="User Agent" value={userAgent} onChange={setUserAgent} placeholder="Chrome" />

            {preset === "custom" && (
              <>
                <DateInput label="From" value={fromDate} onChange={setFromDate} />
                <DateInput label="To" value={toDate} onChange={setToDate} />
              </>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <TrafficCard title="Peak Day" value={peakDay ? formatDateLabel(peakDay.date) : "—"} detail={peakDay ? `${formatNumber(peakDay.visits)} visits • ${formatNumber(peakDay.requests)} requests` : "No data"} />
          <TrafficCard title="Peak Hour" value={peakHour?.hour ? new Date(peakHour.hour).toLocaleString("en-IN") : "—"} detail={peakHour ? `${formatNumber(peakHour.requests)} requests` : "No data"} />
          <TrafficCard title="Selected Transfer" value={formatBytes(totals?.bytes || 0)} detail={`${formatNumber(totals?.requests || 0)} requests`} />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Requests Over Time" subtitle="Hourly HTTP requests">
            {cloudflareLoading ? <Loading /> : (
              <div className="flex h-64 items-end gap-1 overflow-x-auto rounded-2xl border border-white/5 bg-black/20 p-4">
                {hourlyData.map((item) => {
                  const value = metricValue(item, metric);
                  const height = Math.max((value / maxHourlyValue) * 100, 2);
                  return (
                    <div key={item.hour} className="group flex h-full min-w-[10px] flex-1 items-end" title={`${item.hour || ""} • ${formatNumber(item.requests)} requests • ${formatNumber(item.visits)} visits`}>
                      <div className="w-full rounded-t bg-red-500/70 transition group-hover:bg-red-400" style={{ height: `${height}%` }} />
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Daily Traffic" subtitle="Day-by-day selected period">
            {cloudflareLoading ? <Loading /> : (
              <div className="flex h-64 items-end gap-2 overflow-x-auto rounded-2xl border border-white/5 bg-black/20 p-4">
                {dailyData.map((item) => {
                  const value = metricValue(item, metric);
                  const height = Math.max((value / maxDailyValue) * 100, 2);
                  return (
                    <div key={item.date} className="group flex h-full min-w-[18px] flex-1 items-end" title={`${formatDateLabel(item.date)} • ${formatNumber(value)}`}>
                      <div className="w-full rounded-t bg-red-500/70 transition group-hover:bg-red-400" style={{ height: `${height}%` }} />
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionTitle title="World Audience" subtitle="Country traffic with an interactive world map." />
          <div className="grid gap-6 p-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-white/5 bg-black/20">
              <ComposableMap projection="geoMercator" projectionConfig={{ scale: 145 }}>
                <ZoomableGroup center={mapPosition} zoom={mapZoom} onMoveEnd={({ coordinates, zoom }) => {
                  setMapPosition(coordinates as [number, number]);
                  setMapZoom(zoom ?? 1);
                }}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const rawName = String(geo.properties?.name || "");
                        const key = rawName.toUpperCase();
                        const value = countryLookup.get(key) || 0;
                        const max = Math.max(...Array.from(countryLookup.values()), 1);
                        const intensity = value > 0 ? 0.15 + (value / max) * 0.75 : 0.04;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setMapCountry(rawName)}
                            onMouseLeave={() => setMapCountry("")}
                            style={{
                              default: {
                                fill: `rgba(239,68,68,${intensity})`,
                                stroke: "rgba(255,255,255,0.12)",
                                strokeWidth: 0.35,
                                outline: "none",
                              },
                              hover: {
                                fill: "rgba(248,113,113,0.95)",
                                stroke: "rgba(255,255,255,0.65)",
                                strokeWidth: 0.6,
                                outline: "none",
                              },
                              pressed: { fill: "rgba(220,38,38,1)", outline: "none" },
                            } as any}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-xs text-white/35">
                <span>{mapCountry || "Hover a country"}</span>
                <div className="flex gap-2">
                  <button onClick={() => setMapZoom((v) => Math.max(1, v - 0.5))} className="rounded-lg border border-white/10 px-3 py-1">−</button>
                  <button onClick={() => { setMapZoom(1); setMapPosition([0, 20]); }} className="rounded-lg border border-white/10 px-3 py-1">Reset</button>
                  <button onClick={() => setMapZoom((v) => Math.min(4, v + 0.5))} className="rounded-lg border border-white/10 px-3 py-1">+</button>
                </div>
              </div>
            </div>

            <DataTable
              title="Top Countries"
              headers={["Country", "Visits", "Requests", "%"]}
              rows={(cloudflare?.countries || []).slice(0, 15).map((item) => [
                item.country,
                formatNumber(item.visits),
                formatNumber(item.requests),
                `${item.percentage}%`,
              ])}
            />
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Device Type"
            headers={["Device", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.devices || []).map((item) => [
              item.device,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
          <DataTable
            title="Browsers"
            headers={["Browser", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.browsers || []).map((item) => [
              item.browser,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Operating Systems"
            headers={["OS", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.operatingSystems || []).map((item) => [
              item.os,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
          <DataTable
            title="Referrers"
            headers={["Referrer", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.referrers || []).slice(0, 20).map((item) => [
              item.referrer,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Top Pages"
            headers={["Path", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.paths || []).slice(0, 25).map((item) => [
              item.path,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
          <DataTable
            title="Hostnames"
            headers={["Hostname", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.hostnames || []).map((item) => [
              item.hostname,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionTitle title="Daily Traffic Table" subtitle="Complete day-by-day breakdown." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.2em] text-white/30">
                  {["Date", "Visits", "Requests", "Transfer", "Requests / Visit", "Traffic"].map((h) => (
                    <th key={h} className="px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDailyData.map((item) => {
                  const value = metricValue(item, metric);
                  const width = (value / maxDailyValue) * 100;
                  return (
                    <tr key={item.date} className="transition hover:bg-white/[0.025]">
                      <td className="px-6 py-4 text-sm font-medium text-white/75">{formatDateLabel(item.date)}</td>
                      <td className="px-6 py-4 text-sm font-bold">{formatNumber(item.visits)}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{formatNumber(item.requests)}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{formatBytes(item.bytes)}</td>
                      <td className="px-6 py-4 text-sm text-white/60">{item.visits ? (item.requests / item.visits).toFixed(2) : "0.00"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-red-500/70" style={{ width: `${width}%` }} />
                          </div>
                          <span className="text-xs text-white/40">{metric === "bytes" ? formatBytes(value) : formatNumber(value)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <DataTable
            title="24-Hour Traffic Pattern"
            headers={["Hour", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.hourlyByClock || []).map((item) => [
              `${item.hour}:00`,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
          <DataTable
            title="Cloudflare Edge / Colo"
            headers={["Colo", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.colos || []).slice(0, 25).map((item) => [
              item.colo,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-2">
          <LivePages data={data} live={live} />
          <D1Pages data={data} />
        </section>

        <section className="mt-8">
          <DataTable
            title="User Agents"
            headers={["User Agent", "Visits", "Requests", "Transfer"]}
            rows={(cloudflare?.userAgents || []).slice(0, 30).map((item) => [
              item.userAgent,
              formatNumber(item.visits),
              formatNumber(item.requests),
              formatBytes(item.bytes),
            ])}
          />
        </section>

        <footer className="py-10 text-center text-[10px] uppercase tracking-[0.25em] text-white/20">
          World of RAAKA • Live Analytics
        </footer>
      </div>
    </main>
  );
}

function Alert({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <div className={`mb-5 rounded-2xl border px-5 py-4 text-sm ${
      danger
        ? "border-red-500/20 bg-red-500/5 text-red-300"
        : "border-yellow-500/20 bg-yellow-500/5 text-yellow-300"
    }`}>
      {text}
    </div>
  );
}

function StatCard({
  title,
  value,
  valueText,
  subtitle,
  live,
  loading,
}: {
  title: string;
  value?: number;
  valueText?: string;
  subtitle: string;
  live?: boolean;
  loading: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">{title}</span>
        {live && <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-300"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Live</span>}
      </div>
      <div className="mt-5 text-3xl font-black sm:text-4xl">
        {loading ? "—" : valueText ?? formatNumber(value || 0)}
      </div>
      <p className="mt-2 text-xs text-white/30">{subtitle}</p>
    </div>
  );
}

function MiniStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">{title}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function PeriodCard({
  title,
  views,
  visitors,
  loading,
}: {
  title: string;
  views: number;
  visitors: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">{title}</p>
      <div className="mt-5 flex flex-wrap gap-10">
        <div>
          <div className="text-3xl font-black">{loading ? "—" : formatNumber(views)}</div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-white/30">Views</p>
        </div>
        <div>
          <div className="text-3xl font-black">{loading ? "—" : formatNumber(visitors)}</div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-white/30">Unique Visitors</p>
        </div>
      </div>
    </div>
  );
}

function TrafficCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35">{title}</p>
      <p className="mt-4 text-xl font-black">{value}</p>
      <p className="mt-2 text-xs text-white/30">{detail}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-black uppercase tracking-wide">{title}</h2>
        <p className="mt-1 text-xs text-white/35">{subtitle}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Loading() {
  return <div className="flex h-64 items-center justify-center text-sm text-white/30">Loading analytics...</div>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-white/10 px-6 py-5">
      <h2 className="text-lg font-black uppercase tracking-wide">{title}</h2>
      <p className="mt-1 text-xs text-white/35">{subtitle}</p>
    </div>
  );
}

function DataTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-lg font-black uppercase tracking-wide">{title}</h2>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[620px]">
          <thead className="sticky top-0 bg-[#090909]">
            <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.18em] text-white/30">
              {headers.map((header) => <th key={header} className="px-6 py-4">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="transition hover:bg-white/[0.025]">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className={`max-w-[440px] truncate px-6 py-4 text-sm ${cellIndex === 0 ? "font-medium text-white/75" : "text-white/55"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={headers.length} className="px-6 py-12 text-center text-sm text-white/30">No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LivePages({ data, live }: { data: D1AnalyticsResponse | null; live: number }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide">Live Pages</h2>
          <p className="mt-1 text-xs text-white/35">Pages currently being viewed.</p>
        </div>
        <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300">
          {formatNumber(live)} Online
        </span>
      </div>
      <div className="divide-y divide-white/5">
        {data?.live?.pages?.length ? data.live.pages.map((item) => (
          <div key={item.page} className="flex items-center justify-between px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
              <span className="truncate text-sm text-white/75">{item.page}</span>
            </div>
            <span className="ml-4 text-sm font-bold">{formatNumber(item.live)}</span>
          </div>
        )) : <div className="px-6 py-10 text-center text-sm text-white/30">No live visitors right now.</div>}
      </div>
    </section>
  );
}

function D1Pages({ data }: { data: D1AnalyticsResponse | null }) {
  return (
    <DataTable
      title="D1 Page Analytics"
      headers={["Page", "Views", "Unique", "Live"]}
      rows={(data?.pages || []).map((item) => [
        item.page,
        formatNumber(item.views),
        formatNumber(item.uniqueVisitors),
        formatNumber(item.live),
      ])}
    />
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-500/50">
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue} className="bg-[#080808]">{optionLabel}</option>)}
      </select>
    </label>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-red-500/50" />
    </label>
  );
}

function TextFilter({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50"
      />
    </label>
  );
}
