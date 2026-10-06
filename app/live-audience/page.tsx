"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function metricValue(item: TrafficRow, metric: Metric) {
  if (metric === "requests") return item.requests;
  if (metric === "bytes") return item.bytes;
  return item.visits;
}


// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------
function useInView<T extends HTMLElement>(threshold = 0.08) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold, rootMargin: "0px 0px -4% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`an-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function AnimatedNumber({ value, loading }: { value: number; loading?: boolean }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (loading) return;
    let raf = 0;
    const start = performance.now();
    const base = from.current;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1200, 1);
      const v = Math.round(base + (value - base) * (1 - Math.pow(1 - p, 3)));
      setN(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, loading]);
  return <span className="tabular-nums">{loading ? "—" : formatNumber(n)}</span>;
}

// ---- country matching: Cloudflare sends ISO codes (IN, US…), the map uses names ----
const regionNames: Intl.DisplayNames | null =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function regionName(code: string) {
  try { return regionNames?.of(code) || code; } catch { return code; }
}

function norm(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
}

// extra names used by the world-atlas map for some countries
const CODE_ALIASES: Record<string, string[]> = {
  US: ["United States of America", "United States"], GB: ["United Kingdom"], RU: ["Russia"], KR: ["South Korea"], KP: ["North Korea"],
  SY: ["Syria"], IR: ["Iran"], LA: ["Laos"], VN: ["Vietnam"], TW: ["Taiwan"], BO: ["Bolivia"], TZ: ["Tanzania"], MD: ["Moldova"],
  VE: ["Venezuela"], BN: ["Brunei"], TR: ["Turkey", "Türkiye"], MM: ["Myanmar", "Burma"], CZ: ["Czechia", "Czech Republic"],
  CD: ["Dem. Rep. Congo", "Democratic Republic of the Congo"], CG: ["Congo"], CI: ["Côte d'Ivoire", "Ivory Coast"],
  SZ: ["eSwatini", "Eswatini", "Swaziland"], MK: ["North Macedonia", "Macedonia"], PS: ["Palestine"], CV: ["Cape Verde", "Cabo Verde"],
  FK: ["Falkland Is."], GQ: ["Eq. Guinea"], SB: ["Solomon Is."], DO: ["Dominican Rep."], CF: ["Central African Rep."],
  BA: ["Bosnia and Herz."], SS: ["S. Sudan"], EH: ["W. Sahara"], TF: ["Fr. S. Antarctic Lands"], XK: ["Kosovo"], TL: ["Timor-Leste", "East Timor"],
  HK: ["Hong Kong"], RS: ["Serbia"], AE: ["United Arab Emirates"], NL: ["Netherlands"], CY: ["Cyprus", "N. Cyprus"],
};

function flagOf(code: string) {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

type CountryStat = { name: string; code: string; visits: number; requests: number; percentage: number };

// fire heat colour: log scale so one huge country doesn't wash out the rest
function heatFill(value: number, max: number) {
  if (value <= 0) return "rgba(255,255,255,0.035)";
  const t = Math.log(1 + value) / Math.log(1 + Math.max(max, 1));
  const g = Math.round(55 + t * 150);
  const b = Math.round(8 + t * 30);
  return `rgba(255,${g},${b},${(0.3 + t * 0.65).toFixed(2)})`;
}

const LX_CSS = String.raw`
.lx-root{font-family:var(--font-geist-sans),Arial,Helvetica,sans-serif;background:#09090b}
.lx-root ::selection{background:#ff7a2f;color:#000}
.lx-root :focus-visible{outline:2px solid rgba(255,160,70,.95);outline-offset:2px;border-radius:8px}
.lx-ambient{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(900px 480px at 85% -12%,rgba(255,110,30,.11),transparent 62%),radial-gradient(700px 420px at 10% 110%,rgba(255,90,20,.08),transparent 62%)}
.lx-glowfloor{position:fixed;left:0;right:0;bottom:0;height:26vh;z-index:0;pointer-events:none;background:linear-gradient(to top,rgba(255,100,20,.10),transparent);animation:lxFloor 4s ease-in-out infinite alternate}
@keyframes lxFloor{to{opacity:.55}}

/* progress while reloading */
.lx-progress{position:fixed;left:0;right:0;top:0;height:2px;z-index:80;overflow:hidden;pointer-events:none}
.lx-progress::after{content:"";position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,#ff8a3d,#ffd58a,transparent);animation:lxSlide 1.1s ease-in-out infinite}
@keyframes lxSlide{from{transform:translateX(-100%)}to{transform:translateX(260%)}}

/* sidebar */
.lx-side{background:linear-gradient(180deg,rgba(18,14,12,.9),rgba(10,10,12,.92));-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}
.lx-nav{position:relative;transition:color .25s,background-color .25s}
.lx-nav::before{content:"";position:absolute;left:0;top:22%;bottom:22%;width:3px;border-radius:3px;background:linear-gradient(#ffb454,#ff5a14);box-shadow:0 0 14px rgba(255,110,30,.8);transform:scaleY(0);transition:transform .4s cubic-bezier(.16,1,.3,1)}
.lx-nav.is-active{color:#fff;background:linear-gradient(90deg,rgba(255,110,30,.14),transparent)}
.lx-nav.is-active::before{transform:scaleY(1)}
.lx-nav:hover{color:#fff}

/* cards */
.lx-card{position:relative;border-radius:1.25rem;border:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012));transition:border-color .35s,transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s}
.lx-card.is-lift:hover{transform:translateY(-3px);border-color:rgba(255,150,70,.3);box-shadow:0 18px 50px rgba(0,0,0,.45)}
.lx-num{font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.lx-grad{background:linear-gradient(180deg,#fff7ea 25%,#ffbf66);-webkit-background-clip:text;background-clip:text;color:transparent}

/* live radar */
.lx-live{background:radial-gradient(120% 120% at 0% 0%,rgba(255,110,30,.22),rgba(255,255,255,.015) 60%);overflow:hidden}
.lx-radar{position:absolute;right:-70px;bottom:-70px;width:260px;height:260px;pointer-events:none}
.lx-radar i{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,140,50,.55);animation:lxRadar 3.6s ease-out infinite}
.lx-radar i:nth-child(2){animation-delay:1.2s}.lx-radar i:nth-child(3){animation-delay:2.4s}
@keyframes lxRadar{0%{transform:scale(.15);opacity:.9}100%{transform:scale(1);opacity:0}}
.lx-dot{position:relative;display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff5a14;box-shadow:0 0 12px rgba(255,90,20,.9)}
.lx-dot::after{content:"";position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,120,40,.8);animation:lxPing 1.8s ease-out infinite}
@keyframes lxPing{0%{transform:scale(1);opacity:.9}100%{transform:scale(3);opacity:0}}

/* controls */
.lx-seg{position:relative;display:inline-grid;grid-auto-flow:column;grid-auto-columns:1fr;padding:3px;border-radius:999px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04)}
.lx-seg-thumb{position:absolute;top:3px;bottom:3px;left:3px;border-radius:999px;background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 6px 20px rgba(255,90,20,.35);transition:transform .45s cubic-bezier(.16,1,.3,1)}
.lx-seg button{position:relative;z-index:1;white-space:nowrap;padding:.5rem .9rem;font-size:.75rem;font-weight:600;border-radius:999px;color:rgba(255,255,255,.5);transition:color .25s}
.lx-seg button:hover{color:#fff}.lx-seg button[aria-pressed="true"]{color:#fff}
.lx-select{appearance:none;-webkit-appearance:none;width:100%;border-radius:.85rem;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4);padding:.7rem 2.2rem .7rem .95rem;font-size:.8rem;color:#fff;outline:none;transition:border-color .25s,box-shadow .25s}
.lx-select:focus,.lx-select:hover{border-color:rgba(255,150,70,.55)}
.lx-select:focus{box-shadow:0 0 0 4px rgba(255,120,40,.12)}
.lx-chip{display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;border:1px solid rgba(255,150,70,.3);background:rgba(255,110,30,.1);padding:.3rem .5rem .3rem .8rem;font-size:.72rem;color:#ffd9b0}
.lx-chip button{display:flex;height:1.2rem;width:1.2rem;align-items:center;justify-content:center;border-radius:50%;color:rgba(255,255,255,.6)}
.lx-chip button:hover{background:rgba(255,255,255,.12);color:#fff}
.lx-btn{background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 8px 26px rgba(255,90,20,.32),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s}
.lx-btn:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(255,90,20,.46)}
.lx-btn:active{transform:scale(.97)}
.lx-ghost{border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);transition:background-color .25s,border-color .25s,color .25s}
.lx-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,150,70,.4);color:#fff}
.lx-spin{animation:lxSpin .8s linear infinite}
@keyframes lxSpin{to{transform:rotate(360deg)}}

/* area chart */
.lx-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:lxDraw 1.6s cubic-bezier(.16,1,.3,1) forwards}
@keyframes lxDraw{to{stroke-dashoffset:0}}
.lx-area{animation:lxFade 1.4s ease-out backwards .2s}
@keyframes lxFade{from{opacity:0}}
.lx-cross{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(transparent,rgba(255,170,80,.7),transparent);pointer-events:none}
.lx-pt{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#ffd58a;border:2px solid #ff6a1f;box-shadow:0 0 18px rgba(255,120,30,.9);pointer-events:none}

/* heat cells + share bars */
.lx-cell{transition:transform .25s,box-shadow .25s}
.lx-cell:hover,.lx-cell.is-on{transform:scale(1.12);box-shadow:0 0 18px rgba(255,150,50,.5);position:relative;z-index:2}
.lx-meter{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#ff5a14,#ffc15e);box-shadow:0 0 10px rgba(255,140,40,.45);transform-origin:left;animation:lxMeter 1.1s cubic-bezier(.16,1,.3,1) backwards}
@keyframes lxMeter{from{transform:scaleX(0)}}
.lx-row{transition:background-color .2s}
.lx-row:hover{background:linear-gradient(90deg,rgba(255,110,30,.09),transparent 70%)}
.lx-scroll{scrollbar-width:thin;scrollbar-color:rgba(249,115,22,.45) transparent}
.lx-scroll::-webkit-scrollbar{height:6px;width:6px}.lx-scroll::-webkit-scrollbar-thumb{background:rgba(249,115,22,.45);border-radius:999px}
.lx-skel{background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 70%);background-size:250% 100%;animation:lxSkel 1.5s linear infinite;border-radius:.6rem;color:transparent}
@keyframes lxSkel{to{background-position:-250% 0}}
.lx-dim{opacity:.55;transition:opacity .3s}
.lx-map svg{display:block;width:100%;height:auto;cursor:grab}.lx-map svg:active{cursor:grabbing}
.an-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.an-reveal.is-in{opacity:1;transform:none}
.lx-hide-scroll{scrollbar-width:none}.lx-hide-scroll::-webkit-scrollbar{display:none}
section[id]{scroll-margin-top:7.5rem}
@media (prefers-reduced-motion:reduce){.lx-glowfloor,.lx-radar i,.lx-dot::after,.lx-draw,.lx-area,.lx-meter,.lx-skel,.lx-progress::after{animation:none!important}.lx-draw{stroke-dashoffset:0}.an-reveal{opacity:1;transform:none;transition:none}}
`;

type SortKey = "date" | "visits" | "requests" | "bytes";
type Opts = { countries: string[]; devices: string[]; paths: string[] };

const NAV = [
  { id: "overview", label: "Overview", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { id: "traffic", label: "Traffic", icon: "M4 19V5M4 19h16M8 15l3-4 3 2 4-6" },
  { id: "audience", label: "Audience", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" },
  { id: "pages", label: "Pages", icon: "M7 3h7l4 4v14H7zM14 3v4h4" },
  { id: "log", label: "Daily log", icon: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" },
];

const RANGES: [Preset, string][] = [["today", "Today"], ["yesterday", "Yesterday"], ["7days", "7 days"], ["30days", "30 days"], ["custom", "Custom"]];

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

function uniq(list: string[]) {
  return Array.from(new Set(list.filter(Boolean)));
}

function countryLabel(raw: string) {
  const r = raw.trim();
  return /^[A-Za-z]{2}$/.test(r) ? `${flagOf(r.toUpperCase())}  ${regionName(r.toUpperCase())}` : r;
}

function normalizeRange(from: string, to: string) {
  return from && to && from > to ? { from: to, to: from } : { from, to };
}

export default function LiveAudiencePage() {
  const [data, setData] = useState<D1AnalyticsResponse | null>(null);
  const [cloudflare, setCloudflare] = useState<CloudflareAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudflareLoading, setCloudflareLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cloudflareError, setCloudflareError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  // ---- filters (all sent to the API) ----
  const [preset, setPreset] = useState<Preset>("30days");
  const [fromDate, setFromDate] = useState(getPresetDates("30days").from);
  const [toDate, setToDate] = useState(getPresetDates("30days").to);
  const [country, setCountry] = useState("");
  const [device, setDevice] = useState("");
  const [path, setPath] = useState("");
  const [source, setSource] = useState("eyeball");
  const [opts, setOpts] = useState<Opts>({ countries: [], devices: [], paths: [] });

  // ---- view controls (client-side only) ----
  const [metric, setMetric] = useState<Metric>("visits");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortOrder>("desc");

  // ---- map ----
  const [mapCountry, setMapCountry] = useState("");
  const [mapPosition, setMapPosition] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState(1);

  const [active, setActive] = useState("overview");
  const [hydrated, setHydrated] = useState(false);
  const reqId = useRef(0);

  // ---------- URL <-> filters (shareable links) ----------
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const r = q.get("range") as Preset | null;
    if (r && RANGES.some(([v]) => v === r)) {
      setPreset(r);
      if (r === "custom") {
        const f = q.get("from"), t = q.get("to");
        if (f) setFromDate(f);
        if (t) setToDate(t);
      } else {
        const d = getPresetDates(r);
        setFromDate(d.from); setToDate(d.to);
      }
    }
    setCountry(q.get("country") || "");
    setDevice(q.get("device") || "");
    setPath(q.get("path") || "");
    if (q.get("source") === "all") setSource("all");
    const m = q.get("metric");
    if (m === "requests" || m === "bytes") setMetric(m);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const q = new URLSearchParams();
    if (preset !== "30days") q.set("range", preset);
    if (preset === "custom") { q.set("from", fromDate); q.set("to", toDate); }
    if (country) q.set("country", country);
    if (device) q.set("device", device);
    if (path) q.set("path", path);
    if (source !== "eyeball") q.set("source", source);
    if (metric !== "visits") q.set("metric", metric);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [hydrated, preset, fromDate, toDate, country, device, path, source, metric]);

  // ---------- data ----------
  const fetchD1Analytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/live?${new URLSearchParams({ mode: "analytics" })}`, { cache: "no-store" });
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

  const fetchLiveCount = useCallback(async () => {
    try {
      const response = await fetch(`/api/live?${new URLSearchParams({ mode: "count" })}`, { cache: "no-store" });
      const result: D1AnalyticsResponse = await response.json();
      if (!result.success) throw new Error(result.error || "Unable to load live audience.");
      setData((previous) => ({ ...(previous || result), live: result.live }));
      setError("");
    } catch (err) {
      console.error(err); // keep last successful live count
    }
  }, []);

  const fetchCloudflareAnalytics = useCallback(async () => {
    const id = ++reqId.current; // ignore out-of-order responses
    setRefreshing(true);
    try {
      const range = preset === "custom" ? normalizeRange(fromDate, toDate) : getPresetDates(preset);
      const params = new URLSearchParams({ from: range.from, to: range.to, source });
      if (country) params.set("country", country);
      if (device) params.set("device", device);
      if (path) params.set("path", path);
      params.set("_t", String(Date.now()));

      const response = await fetch(`/api/cloudflare-analytics?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, max-age=0" },
      });
      const result: CloudflareAnalyticsResponse = await response.json();
      if (id !== reqId.current) return;
      if (!result.success) throw new Error(result.error || "Unable to load Cloudflare Analytics.");
      setCloudflare(result);
      setCloudflareError("");
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
      // remember every value we have seen so the dropdowns never shrink while filtering
      setOpts((prev) => ({
        countries: uniq([...prev.countries, ...(result.countries || []).map((c) => c.country)]),
        devices: uniq([...prev.devices, ...(result.devices || []).map((d) => d.device)]),
        paths: uniq([...prev.paths, ...(result.paths || []).slice(0, 40).map((p) => p.path)]),
      }));
    } catch (err) {
      if (id !== reqId.current) return;
      console.error(err);
      setCloudflareError(err instanceof Error ? `Cloudflare analytics error: ${err.message}` : "Unable to load Cloudflare analytics.");
    } finally {
      if (id === reqId.current) { setRefreshing(false); setCloudflareLoading(false); }
    }
  }, [preset, fromDate, toDate, country, device, path, source]);

  useEffect(() => { fetchD1Analytics(); fetchLiveCount(); }, [fetchD1Analytics, fetchLiveCount]);
  useEffect(() => { if (hydrated) fetchCloudflareAnalytics(); }, [hydrated, fetchCloudflareAnalytics]);
  useEffect(() => {
    const t = setInterval(fetchLiveCount, 60_000);
    return () => clearInterval(t);
  }, [fetchLiveCount]);

  // ---------- scroll spy ----------
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => { const v = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (v) setActive(v.target.id); },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ---------- derived ----------
  const dailyData = cloudflare?.daily || [];
  const hourlyClock = cloudflare?.hourlyByClock || [];
  const totals = cloudflare?.totals;
  const dashboard = cloudflare?.cloudflareDashboard;
  const live = data?.live?.visitors || 0;
  const livePages = data?.live?.pages || [];
  const initialLoad = cloudflareLoading && !cloudflare;

  const peakDay = useMemo(() => (dailyData.length ? dailyData.reduce((b, i) => (i.visits > b.visits ? i : b)) : null), [dailyData]);
  const peakHour = useMemo(() => (hourlyClock.length ? hourlyClock.reduce((b, i) => (i.requests > b.requests ? i : b)) : null), [hourlyClock]);
  const averageVisits = dailyData.length ? dailyData.reduce((s, i) => s + i.visits, 0) / dailyData.length : 0;
  const requestsPerVisit = totals && totals.visits > 0 ? (totals.requests / totals.visits).toFixed(1) : "0.0";

  const fmt = (item: TrafficRow) => (metric === "bytes" ? formatBytes(item.bytes) : formatNumber(metricValue(item, metric)));
  const fmtValue = (v: number) => (metric === "bytes" ? formatBytes(v) : formatNumber(v));
  const dailyPoints = dailyData.map((d) => ({ key: d.date, label: formatDateLabel(d.date), value: metricValue(d, metric), display: fmt(d) }));
  const hourlyPoints = hourlyClock.map((h) => ({ key: h.hour, label: `${h.hour}:00`, value: metricValue(h, metric), display: fmt(h) }));

  const sortedDaily = useMemo(() => {
    const rows = [...dailyData];
    rows.sort((a, b) => {
      const av = sortKey === "date" ? a.date : (a as any)[sortKey];
      const bv = sortKey === "date" ? b.date : (b as any)[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return rows;
  }, [dailyData, sortKey, sortDir]);
  const maxDaily = Math.max(...dailyData.map((d) => metricValue(d, metric)), 1);

  const countryIndex = useMemo(() => {
    const m = new Map<string, CountryStat>();
    for (const item of cloudflare?.countries || []) {
      const raw = (item.country || "").trim();
      const isCode = /^[A-Za-z]{2}$/.test(raw);
      const code = isCode ? raw.toUpperCase() : "";
      const name = code ? regionName(code) : raw;
      const stat: CountryStat = { name, code, visits: item.visits, requests: item.requests, percentage: item.percentage };
      const keys = new Set<string>([norm(name)]);
      if (!isCode) keys.add(norm(raw));
      if (code) (CODE_ALIASES[code] || []).forEach((n) => keys.add(norm(n)));
      keys.forEach((k) => m.set(k, stat));
    }
    return m;
  }, [cloudflare?.countries]);
  const countryList = useMemo(() => {
    const s = new Set<CountryStat>();
    countryIndex.forEach((c) => s.add(c));
    return Array.from(s).sort((a, b) => b.requests - a.requests);
  }, [countryIndex]);
  const maxCountry = Math.max(...countryList.map((c) => c.requests), 1);
  const hovered = mapCountry ? countryIndex.get(norm(mapCountry)) : undefined;

  const countryOptions = uniq([...opts.countries, country]).sort((a, b) => countryLabel(a).localeCompare(countryLabel(b)));
  const deviceOptions = uniq([...opts.devices, device]);
  const pathOptions = uniq([...opts.paths, path]);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (preset === "custom") activeChips.push({ key: "range", label: `${formatDateLabel(normalizeRange(fromDate, toDate).from)} – ${formatDateLabel(normalizeRange(fromDate, toDate).to)}`, clear: () => applyPreset("30days") });
  if (country) activeChips.push({ key: "country", label: countryLabel(country).replace(/\s+/g, " "), clear: () => setCountry("") });
  if (device) activeChips.push({ key: "device", label: device, clear: () => setDevice("") });
  if (path) activeChips.push({ key: "path", label: path, clear: () => setPath("") });
  if (source !== "eyeball") activeChips.push({ key: "source", label: "All traffic (incl. bots)", clear: () => setSource("eyeball") });

  const applyPreset = (v: Preset) => {
    setPreset(v);
    if (v !== "custom") { const d = getPresetDates(v); setFromDate(d.from); setToDate(d.to); }
  };
  const clearFilters = () => { applyPreset("30days"); setCountry(""); setDevice(""); setPath(""); setSource("eyeball"); };
  const refreshAll = () => { fetchD1Analytics(); fetchLiveCount(); fetchCloudflareAnalytics(); };
  const toggleSort = (k: SortKey) => { if (sortKey === k) setSortDir((d) => (d === "desc" ? "asc" : "desc")); else { setSortKey(k); setSortDir("desc"); } };

  const dim = refreshing && !initialLoad ? "lx-dim" : "";

  return (
    <main className="lx-root relative min-h-screen overflow-x-hidden text-[#f3ece4]">
      <style>{LX_CSS}</style>
      <div className="lx-ambient" aria-hidden />
      <div className="lx-glowfloor" aria-hidden />
      {refreshing && <div className="lx-progress" role="progressbar" aria-label="Refreshing data" />}

      {/* ===== SIDEBAR (desktop) ===== */}
      <aside className="lx-side fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-white/[0.07] lg:flex">
        <div className="px-7 pb-6 pt-8">
          <a href="/" className="font-serif text-xl font-bold tracking-[0.35em] text-white">RAAKA</a>
          <p className="mt-2 text-xs text-white/35">Live analytics</p>
        </div>

        <div className="mx-5 rounded-2xl border border-orange-400/20 bg-orange-500/[0.07] px-4 py-3.5">
          <p className="flex items-center gap-2 text-xs text-orange-200"><span className="lx-dot" />Online now</p>
          <p className="lx-num mt-1.5 font-serif text-3xl font-black text-white"><AnimatedNumber value={live} loading={loading} /></p>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={`lx-nav flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 ${active === n.id ? "is-active" : ""}`}>
              <Icon d={n.icon} />{n.label}
            </a>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-5">
          <p className="mb-3 text-xs text-white/35">{lastUpdated ? `Updated ${lastUpdated}` : "Waiting for data"} · live count every 60 s</p>
          <button onClick={refreshAll} className="lx-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white">
            <Icon d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" className={`h-4 w-4 ${refreshing ? "lx-spin" : ""}`} />Refresh
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#09090b]/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <a href="/" className="font-serif text-base font-bold tracking-[0.3em] text-white">RAAKA</a>
          <span className="flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-200"><span className="lx-dot" />{formatNumber(live)} online</span>
          <button onClick={refreshAll} aria-label="Refresh" className="lx-ghost flex h-9 w-9 items-center justify-center rounded-full"><Icon d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5" className={`h-4 w-4 ${refreshing ? "lx-spin" : ""}`} /></button>
        </div>
        <nav className="lx-hide-scroll flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Sections">
          {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${active === n.id ? "bg-orange-500/20 text-orange-100" : "text-white/45"}`}>{n.label}</a>)}
        </nav>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 lg:pl-[17rem]">
        {/* filter bar */}
        <div className="border-b border-white/[0.07] bg-[#09090b]/80 backdrop-blur-xl lg:sticky lg:top-0 lg:z-30">
          <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="lx-hide-scroll -mx-1 overflow-x-auto px-1">
                <Segmented options={RANGES} value={preset} onChange={(v) => applyPreset(v as Preset)} />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
                <SelectBox label="All countries" value={country} onChange={setCountry} options={countryOptions.map((c) => [c, countryLabel(c)])} />
                <SelectBox label="All devices" value={device} onChange={setDevice} options={deviceOptions.map((d) => [d, d])} />
                <SelectBox label="All pages" value={path} onChange={setPath} options={pathOptions.map((p) => [p, p])} />
                <SelectBox label="Visitors only" value={source === "all" ? "all" : ""} onChange={(v) => setSource(v === "all" ? "all" : "eyeball")} options={[["all", "All traffic (incl. bots)"]]} />
              </div>
            </div>

            {preset === "custom" && (
              <div className="mt-3 grid max-w-md grid-cols-2 gap-2.5">
                <DateBox label="From" value={fromDate} max={toDate} onChange={setFromDate} />
                <DateBox label="To" value={toDate} min={fromDate} onChange={setToDate} />
              </div>
            )}

            {activeChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {activeChips.map((c) => (
                  <span key={c.key} className="lx-chip">{c.label}<button onClick={c.clear} aria-label={`Remove filter ${c.label}`}>×</button></span>
                ))}
                <button onClick={clearFilters} className="px-2 text-xs text-white/45 underline-offset-4 hover:text-white hover:underline">Clear all</button>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-8 sm:px-8 lg:px-10">
          {error && <Alert text={error} danger onRetry={refreshAll} />}
          {cloudflareError && <Alert text={cloudflareError} onRetry={fetchCloudflareAnalytics} />}

          {/* ---------- OVERVIEW ---------- */}
          <section id="overview">
            <Reveal>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">Overview</h1>
              <p className="mt-2 text-sm text-white/40">Real-time audience and Cloudflare traffic for the selected range.</p>
            </Reveal>

            <Reveal delay={60}>
              <div className={`mt-7 grid gap-4 lg:grid-cols-12 ${dim}`}>
                <div className="lx-card lx-live p-7 lg:col-span-4 lg:row-span-2">
                  <div className="lx-radar" aria-hidden><i /><i /><i /></div>
                  <p className="relative flex items-center gap-2 text-sm font-medium text-orange-200"><span className="lx-dot" />Live now</p>
                  <div className="lx-num lx-grad relative mt-8 font-serif text-[clamp(5rem,12vw,8.5rem)] font-black leading-none"><AnimatedNumber value={live} loading={loading} /></div>
                  <p className="relative mt-3 text-sm text-white/50">visitors on the site right now</p>
                  <div className="relative mt-8 space-y-2">
                    {livePages.slice(0, 3).map((p) => (
                      <div key={p.page} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/30 px-3.5 py-2.5 text-xs">
                        <span className="truncate text-white/70">{p.page}</span><b className="text-orange-200">{p.live}</b>
                      </div>
                    ))}
                    {livePages.length === 0 && !loading && <p className="text-xs text-white/35">No one is browsing at the moment.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:col-span-8 xl:grid-cols-4">
                  <Kpi title="Visits" value={totals?.visits || 0} loading={initialLoad} />
                  <Kpi title="Requests" value={totals?.requests || 0} loading={initialLoad} />
                  <Kpi title="Data transfer" text={formatBytes(totals?.bytes || 0)} sub={`${totals?.dataTransferGB || 0} GB`} loading={initialLoad} />
                  <Kpi title="Tracked views" value={data?.total?.views || 0} sub={`${formatNumber(data?.total?.uniqueVisitors || 0)} unique`} loading={loading} />
                </div>

                <div className="lx-card p-6 lg:col-span-8">
                  <p className="text-sm font-semibold text-white">On-site tracking</p>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-white/[0.07]">
                    {[["Today", data?.today], ["Last 7 days", data?.last7Days], ["Last 30 days", data?.last30Days]].map(([t, v], i) => (
                      <div key={String(t)} className={i ? "sm:pl-6" : ""}>
                        <p className="text-xs text-white/40">{t as string}</p>
                        <p className="lx-num mt-2 font-serif text-3xl font-black text-white"><AnimatedNumber value={(v as any)?.views || 0} loading={loading} /></p>
                        <p className="mt-1 text-xs text-white/35">{formatNumber((v as any)?.uniqueVisitors || 0)} unique visitors</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className={`mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5 ${dim}`}>
                <Mini title="Cache hit rate" value={dashboard?.cacheHitRate == null ? "—" : `${dashboard.cacheHitRate}%`} />
                <Mini title="Cached requests" value={formatNumber(dashboard?.cachedRequests || 0)} />
                <Mini title="Uncached requests" value={formatNumber(dashboard?.uncachedRequests || 0)} />
                <Mini title="Avg visits / day" value={formatNumber(averageVisits)} />
                <Mini title="Requests / visit" value={requestsPerVisit} />
              </div>
            </Reveal>
          </section>

          {/* ---------- TRAFFIC ---------- */}
          <section id="traffic" className="mt-16">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">Traffic</h2>
                  <p className="mt-2 text-sm text-white/40">How your audience moves over time.</p>
                </div>
                <Segmented options={[["visits", "Visits"], ["requests", "Requests"], ["bytes", "Data"]]} value={metric} onChange={(v) => setMetric(v as Metric)} />
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Mini title="Peak day" value={peakDay ? formatDateLabel(peakDay.date) : "—"} sub={peakDay ? `${formatNumber(peakDay.visits)} visits` : undefined} />
                <Mini title="Peak hour" value={peakHour?.hour ? `${peakHour.hour}:00` : "—"} sub={peakHour ? `${formatNumber(peakHour.requests)} requests (clock hour)` : undefined} />
                <Mini title="Selected transfer" value={formatBytes(totals?.bytes || 0)} sub={`${formatNumber(totals?.requests || 0)} requests`} />
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className={`lx-card mt-4 p-6 ${dim}`}>
                <p className="mb-4 text-sm font-semibold text-white">Daily {metric === "bytes" ? "data transfer" : metric}</p>
                {initialLoad ? <div className="lx-skel h-72 w-full" /> : dailyPoints.length === 0 ? <Empty text="No traffic in this range." /> : (
                  <AreaChart key={`${metric}-${dailyPoints.length}-${dailyPoints[0]?.key}`} points={dailyPoints} fmt={fmtValue} />
                )}
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className={`lx-card mt-4 p-6 ${dim}`}>
                <p className="text-sm font-semibold text-white">Busiest hours</p>
                <p className="mb-5 mt-1 text-xs text-white/40">Each square is one clock hour. Brighter means busier.</p>
                {initialLoad ? <div className="lx-skel h-20 w-full" /> : hourlyPoints.length === 0 ? <Empty text="No hourly data." small /> : <HeatStrip points={hourlyPoints} />}
              </div>
            </Reveal>
          </section>

          {/* ---------- AUDIENCE ---------- */}
          <section id="audience" className="mt-16">
            <Reveal>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">Audience</h2>
              <p className="mt-2 text-sm text-white/40">Where your visitors are and what they use. Drag the map, scroll or use +/− to zoom.</p>
            </Reveal>

            <Reveal delay={60}>
              <div className={`mt-6 grid gap-4 xl:grid-cols-12 ${dim}`}>
                <div className="lx-card overflow-hidden xl:col-span-8">
                  <div className="lx-map relative bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,110,30,.08),rgba(0,0,0,.35)_72%)]">
                    <ComposableMap projection="geoEqualEarth" width={980} height={500} projectionConfig={{ scale: 185, center: [0, 8] }}>
                      <ZoomableGroup center={mapPosition} zoom={mapZoom} minZoom={1} maxZoom={8} onMoveEnd={({ coordinates, zoom }) => { setMapPosition(coordinates as [number, number]); setMapZoom(zoom ?? 1); }}>
                        <Geographies geography={GEO_URL}>
                          {({ geographies }) =>
                            geographies.filter((g) => String(g.properties?.name || "") !== "Antarctica").map((geo) => {
                              const rawName = String(geo.properties?.name || "");
                              const stat = countryIndex.get(norm(rawName));
                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  onMouseEnter={() => setMapCountry(rawName)}
                                  onMouseLeave={() => setMapCountry("")}
                                  onClick={() => setMapCountry(rawName)}
                                  style={{
                                    default: { fill: heatFill(stat?.requests || 0, maxCountry), stroke: "rgba(255,255,255,0.14)", strokeWidth: 0.4, outline: "none", transition: "fill .3s" },
                                    hover: { fill: "rgba(255,214,120,0.98)", stroke: "rgba(255,255,255,0.8)", strokeWidth: 0.7, outline: "none" },
                                    pressed: { fill: "rgba(255,150,40,1)", outline: "none" },
                                  } as any}
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ZoomableGroup>
                    </ComposableMap>

                    <div className="pointer-events-none absolute left-3 top-3 max-w-[75%] rounded-xl border border-white/12 bg-black/70 px-4 py-3 backdrop-blur-md">
                      {mapCountry ? (
                        <>
                          <p className="text-sm font-semibold text-white">{hovered?.code ? `${flagOf(hovered.code)} ` : ""}{hovered?.name || mapCountry}</p>
                          <p className="mt-0.5 text-xs text-white/55">{hovered ? `${formatNumber(hovered.visits)} visits · ${formatNumber(hovered.requests)} requests · ${hovered.percentage}%` : "No traffic recorded"}</p>
                        </>
                      ) : <p className="text-xs text-white/45">Hover or tap a country</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3">
                    <div className="flex items-center gap-3 text-[11px] text-white/40">
                      <span>Less</span><span className="h-2 w-28 rounded-full bg-gradient-to-r from-[rgba(255,60,10,.35)] via-[rgba(255,130,25,.7)] to-[rgba(255,205,40,.95)]" /><span>More</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setMapZoom((v) => Math.max(1, +(v / 1.5).toFixed(2)))} aria-label="Zoom out" className="lx-ghost h-9 w-9 rounded-full text-lg">−</button>
                      <button onClick={() => { setMapZoom(1); setMapPosition([0, 20]); }} className="lx-ghost rounded-full px-4 text-xs">Reset</button>
                      <button onClick={() => setMapZoom((v) => Math.min(8, +(v * 1.5).toFixed(2)))} aria-label="Zoom in" className="lx-ghost h-9 w-9 rounded-full text-lg">+</button>
                    </div>
                  </div>
                </div>

                <div className="lx-card lx-scroll max-h-[620px] overflow-auto xl:col-span-4">
                  <p className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#0d0c0c]/95 px-5 py-4 text-sm font-semibold text-white backdrop-blur">Top countries</p>
                  {countryList.length === 0 ? <Empty text="No country data." small /> : countryList.slice(0, 15).map((c, i) => (
                    <button key={c.name} type="button" onMouseEnter={() => setMapCountry(c.name)} onMouseLeave={() => setMapCountry("")} onClick={() => c.code && setCountry(c.code)} title="Click to filter by this country" className="lx-row block w-full border-b border-white/5 px-5 py-3.5 text-left last:border-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-3 text-sm text-white/85"><span className="w-4 text-right text-xs text-white/25">{i + 1}</span><span className="text-lg leading-none">{flagOf(c.code)}</span><span className="truncate">{c.name}</span></span>
                        <span className="shrink-0 text-xs tabular-nums text-white/50">{formatNumber(c.visits)} · {c.percentage}%</span>
                      </div>
                      <div className="ml-7 mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><span className="lx-meter" style={{ width: `${Math.max((c.requests / maxCountry) * 100, 2)}%`, animationDelay: `${i * 50}ms` }} /></div>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className={`mt-4 grid gap-4 lg:grid-cols-2 ${dim}`}>
                <ShareList title="Devices" rows={(cloudflare?.devices || []).map((d) => ({ label: d.device, value: d.visits, sub: formatBytes(d.bytes) }))} />
                <ShareList title="Operating systems" rows={(cloudflare?.operatingSystems || []).map((o) => ({ label: o.os, value: o.visits, sub: formatBytes(o.bytes) }))} />
              </div>
            </Reveal>
          </section>

          {/* ---------- PAGES ---------- */}
          <section id="pages" className="mt-16">
            <Reveal>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">Pages</h2>
              <p className="mt-2 text-sm text-white/40">What people are reading, now and over the selected range.</p>
            </Reveal>
            <Reveal delay={60}>
              <div className={`mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr] ${dim}`}>
                <ShareList title="Top pages" onPick={(p) => setPath(p)} rows={(cloudflare?.paths || []).slice(0, 15).map((p) => ({ label: p.path, value: p.visits, sub: `${formatNumber(p.requests)} req` }))} />
                <div className="lx-card">
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
                    <p className="text-sm font-semibold text-white">Live pages</p>
                    <span className="flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200"><span className="lx-dot" />{formatNumber(live)}</span>
                  </div>
                  <div className="lx-scroll max-h-[420px] overflow-auto">
                    {livePages.length ? livePages.map((p) => (
                      <div key={p.page} className="lx-row flex items-center justify-between gap-4 border-b border-white/5 px-5 py-3.5 last:border-0">
                        <span className="truncate text-sm text-white/80">{p.page}</span><b className="font-serif text-lg text-amber-200">{p.live}</b>
                      </div>
                    )) : <Empty text="No live visitors right now." small />}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ---------- DAILY LOG ---------- */}
          <section id="log" className="mt-16">
            <Reveal>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">Daily log</h2>
              <p className="mt-2 text-sm text-white/40">Click a column heading to sort.</p>
            </Reveal>
            <Reveal delay={60}>
              <div className={`lx-card mt-6 overflow-hidden ${dim}`}>
                <div className="lx-scroll overflow-x-auto">
                  <table className="w-full min-w-[780px]">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-left text-xs text-white/40">
                        {([["date", "Date"], ["visits", "Visits"], ["requests", "Requests"], ["bytes", "Transfer"]] as [SortKey, string][]).map(([k, l]) => (
                          <th key={k} className="px-6 py-4 font-medium"><button onClick={() => toggleSort(k)} className={`flex items-center gap-1.5 hover:text-white ${sortKey === k ? "text-orange-200" : ""}`}>{l}<span className="text-[10px]">{sortKey === k ? (sortDir === "desc" ? "▼" : "▲") : ""}</span></button></th>
                        ))}
                        <th className="px-6 py-4 font-medium">Req / visit</th>
                        <th className="px-6 py-4 font-medium">Share of peak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDaily.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-white/30">No data available.</td></tr>}
                      {sortedDaily.map((d) => (
                        <tr key={d.date} className="lx-row border-b border-white/5 last:border-0">
                          <td className="px-6 py-3.5 text-sm font-medium text-white/85">{formatDateLabel(d.date)}</td>
                          <td className="px-6 py-3.5 text-sm font-bold tabular-nums">{formatNumber(d.visits)}</td>
                          <td className="px-6 py-3.5 text-sm tabular-nums text-white/60">{formatNumber(d.requests)}</td>
                          <td className="px-6 py-3.5 text-sm tabular-nums text-white/60">{formatBytes(d.bytes)}</td>
                          <td className="px-6 py-3.5 text-sm tabular-nums text-white/60">{d.visits ? (d.requests / d.visits).toFixed(2) : "0.00"}</td>
                          <td className="px-6 py-3.5"><div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.06]"><span className="lx-meter" style={{ width: `${(metricValue(d, metric) / maxDaily) * 100}%` }} /></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </section>

          <footer className="pt-20 text-center">
            <p className="font-serif text-lg font-bold tracking-[0.4em] text-white/40">RAAKA</p>
            <p className="mt-3 text-xs text-white/25">World of RAAKA · Live Analytics</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- components */
function Alert({ text, danger = false, onRetry }: { text: string; danger?: boolean; onRetry?: () => void }) {
  return (
    <div role="alert" className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-sm ${danger ? "border-red-500/30 bg-red-500/[0.07] text-red-200" : "border-amber-400/25 bg-amber-400/[0.06] text-amber-200"}`}>
      <span>{text}</span>
      {onRetry && <button onClick={onRetry} className="lx-ghost rounded-full px-4 py-1.5 text-xs font-medium">Try again</button>}
    </div>
  );
}

function Segmented({ options, value, onChange }: { options: [string, string][]; value: string; onChange: (v: string) => void }) {
  const idx = Math.max(0, options.findIndex(([v]) => v === value));
  return (
    <div className="lx-seg" role="group">
      <span className="lx-seg-thumb" style={{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(${idx * 100}%)` }} />
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

function SelectBox({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="lx-select" aria-label={label}>
        <option value="" className="bg-[#0d0c0c]">{label}</option>
        {options.map(([v, l]) => <option key={v} value={v} className="bg-[#0d0c0c]">{l}</option>)}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg>
    </label>
  );
}

function DateBox({ label, value, onChange, min, max }: { label: string; value: string; onChange: (v: string) => void; min?: string; max?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-white/40">{label}</span>
      <input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} className="lx-select [color-scheme:dark]" />
    </label>
  );
}

function Kpi({ title, value, text, sub, loading }: { title: string; value?: number; text?: string; sub?: string; loading: boolean }) {
  return (
    <div className="lx-card is-lift flex flex-col justify-between p-5 sm:p-6">
      <p className="text-sm text-white/45">{title}</p>
      <div className={`lx-num lx-grad mt-5 font-serif text-3xl font-black leading-none sm:text-4xl ${loading ? "lx-skel" : ""}`}>
        {text !== undefined ? (loading ? "—" : text) : <AnimatedNumber value={value || 0} loading={loading} />}
      </div>
      <p className="mt-3 text-xs text-white/35">{sub || "Selected range"}</p>
    </div>
  );
}

function Mini({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="lx-card is-lift px-5 py-4">
      <p className="text-xs text-white/40">{title}</p>
      <p className="mt-2 font-serif text-xl font-bold text-white sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

function Empty({ text, small = false }: { text: string; small?: boolean }) {
  return <div className={`flex items-center justify-center text-sm text-white/30 ${small ? "px-6 py-10" : "h-56"}`}>{text}</div>;
}

type Point = { key: string; label: string; value: number; display: string };

function AreaChart({ points, fmt }: { points: Point[]; fmt: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 1000, H = 300, pad = 14;
  const n = points.length;
  const max = Math.max(...points.map((p) => p.value), 1) * 1.08;
  const xs = points.map((_, i) => (n === 1 ? W / 2 : (i * W) / (n - 1)));
  const ys = points.map((p) => H - pad - (p.value / max) * (H - pad * 2));
  let line = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < n; i++) { const mx = (xs[i - 1] + xs[i]) / 2; line += ` C ${mx} ${ys[i - 1]}, ${mx} ${ys[i]}, ${xs[i]} ${ys[i]}`; }
  const area = `${line} L ${xs[n - 1]} ${H} L ${xs[0]} ${H} Z`;
  const a = hover !== null ? points[hover] : null;
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(Math.min(n - 1, Math.max(0, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  return (
    <div>
      <div className="mb-3 flex h-6 items-center justify-between text-xs">
        <span className="text-white/45">{a ? a.label : "Hover or touch the chart for details"}</span>
        <span className="font-semibold tabular-nums text-amber-200">{a ? a.display : ""}</span>
      </div>
      <div className="relative h-64 sm:h-72" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)} style={{ touchAction: "pan-y" }}>
        {[0, 1, 2, 3].map((g) => (
          <div key={g} className="pointer-events-none absolute inset-x-0 flex items-center gap-2" style={{ top: `${(g / 3) * 100}%` }}>
            <span className="w-14 shrink-0 text-[10px] tabular-nums text-white/25">{fmt(Math.round(max * (1 - g / 3)))}</span>
            <span className="h-px flex-1 border-t border-dashed border-white/[0.07]" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-16 right-0">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="lx-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff7a2f" stopOpacity=".5" /><stop offset="100%" stopColor="#ff5a14" stopOpacity="0" /></linearGradient>
              <linearGradient id="lx-stroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ff5a14" /><stop offset="60%" stopColor="#ffb454" /><stop offset="100%" stopColor="#ffe0a3" /></linearGradient>
            </defs>
            {n > 1 && <path d={area} fill="url(#lx-fill)" className="lx-area" />}
            {n > 1 && <path d={line} pathLength={1} fill="none" stroke="url(#lx-stroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="lx-draw" style={{ filter: "drop-shadow(0 0 8px rgba(255,120,30,.6))" }} />}
          </svg>
          {hover !== null && (
            <>
              <span className="lx-cross" style={{ left: `${(xs[hover] / W) * 100}%` }} />
              <span className="lx-pt" style={{ left: `${(xs[hover] / W) * 100}%`, top: `${(ys[hover] / H) * 100}%` }} />
            </>
          )}
          {n === 1 && <span className="lx-pt" style={{ left: "50%", top: `${(ys[0] / H) * 100}%` }} />}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-16 text-[10px] text-white/30">
        <span>{points[0]?.label}</span>{n > 2 && <span>{points[Math.floor((n - 1) / 2)]?.label}</span>}<span>{n > 1 ? points[n - 1]?.label : ""}</span>
      </div>
    </div>
  );
}

function HeatStrip({ points }: { points: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.value), 1);
  const a = hover !== null ? points[hover] : null;
  return (
    <div>
      <div className="mb-3 flex h-5 items-center justify-between text-xs">
        <span className="text-white/45">{a ? a.label : "Hover or tap an hour"}</span>
        <span className="font-semibold tabular-nums text-amber-200">{a ? a.display : ""}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12 xl:grid-cols-[repeat(24,minmax(0,1fr))]" onMouseLeave={() => setHover(null)}>
        {points.map((p, i) => (
          <button key={p.key} type="button" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)} aria-label={`${p.label}: ${p.display}`}
            className={`lx-cell flex aspect-square items-end justify-center rounded-lg pb-1 text-[9px] text-white/60 ${hover === i ? "is-on" : ""}`}
            style={{ background: heatFill(p.value, max), border: "1px solid rgba(255,255,255,.07)" }}>
            {p.key}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShareList({ title, rows, onPick }: { title: string; rows: { label: string; value: number; sub?: string }[]; onPick?: (label: string) => void }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="lx-card">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-xs text-white/30">{rows.length} items</span>
      </div>
      <div className="lx-scroll max-h-[440px] overflow-auto">
        {rows.length === 0 ? <Empty text="No data available." small /> : rows.map((r, i) => {
          const body = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium capitalize-first text-white/85">{r.label}</span>
                <span className="shrink-0 text-xs tabular-nums text-white/50">{formatNumber(r.value)} · {total ? ((r.value / total) * 100).toFixed(1) : "0.0"}%{r.sub ? ` · ${r.sub}` : ""}</span>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><span className="lx-meter" style={{ width: `${Math.max((r.value / max) * 100, 2)}%`, animationDelay: `${i * 45}ms` }} /></div>
            </>
          );
          return onPick ? (
            <button key={r.label} type="button" onClick={() => onPick(r.label)} title="Click to filter by this page" className="lx-row block w-full border-b border-white/5 px-5 py-3.5 text-left last:border-0">{body}</button>
          ) : (
            <div key={r.label} className="lx-row border-b border-white/5 px-5 py-3.5 last:border-0">{body}</div>
          );
        })}
      </div>
    </div>
  );
}
