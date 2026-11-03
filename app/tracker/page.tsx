"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/* ───────────────────────── Types ───────────────────────── */
type Theatre = {
  id: string; cinemaId?: string; name: string; address?: string; chain?: string;
  city: string; citySlug?: string; date: string; language: string; format: string;
  status?: string; scannedSessions?: number; capacity?: number; available?: number;
  unavailable?: number; booked?: number; unavailableValue?: number; potentialValue?: number;
  error?: string | null;
  formatBreakdown?: Record<string, { shows?: number; capacity?: number; available?: number; booked?: number; value?: number }>;
};
type ScanData = {
  movie?: string; lastCapture?: string; scanDate?: string; dateRange?: { from?: string; to?: string };
  totals?: { cities?: number; theatres?: number; done?: number; failed?: number; shows?: number; capacity?: number; available?: number; booked?: number; unavailableValue?: number; potentialValue?: number };
  theatres?: Theatre[]; progress?: number; stopped?: boolean; scanning?: boolean; lastError?: string | null;
};

/** One normalised slice of numbers (a whole record, or a single format of a record). */
type Part = { shows: number; capacity: number; available: number; booked: number; bookedValue: number; totalValue: number };
type Row = Part & {
  cinema: string; name: string; city: string; state: string; date: string; language: string; chain: string;
  formats: string[]; parts: Record<string, Part>;
};
type Filters = { q: string; state: Set<string>; city: Set<string>; date: Set<string>; language: Set<string>; format: Set<string>; chain: Set<string> };
type FacetKey = Exclude<keyof Filters, "q">;
type Metric = "revenue" | "seats";
type Agg = Part & { name: string; cinemas: Set<string> };

/* ───────────────────────── Constants & helpers ───────────────────────── */
const DATA_URL = "/scan-latest.json";
const MOVIE_NAME = "Ramayana";
const PAGE_NAME = "Box Office Radar";

const number = (n: unknown) => Number(n || 0);
const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
const compact = (n: number) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
const money = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${fmt(n)}`;
const moneyS = (n: number) => n >= 1e7 ? `${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : `${Math.round(n)}`;
const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dateLabel = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return d;
  const t = Date.parse(d);
  return isNaN(t) ? d : new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Puducherry", "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];
const stateFromAddress = (address = "") => {
  const parts = address.split(",").map(p => p.replace(/\b\d{6}\b/g, "").trim()).filter(Boolean);
  const searchable = parts.join(" ").toLowerCase();
  return INDIAN_STATES.find(s => searchable.includes(s.toLowerCase())) || "Unknown";
};
const splitFormats = (s = "") => s.split(",").map(x => x.trim()).filter(Boolean);
const chainGroup = (chain = "Other") => {
  const raw = chain.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return /pvr|inox|cinepolis/.test(raw) ? "PVR + INOX + Cinepolis" : /moviemax/.test(raw) ? "Movie Max" : /rajhans/.test(raw) ? "Rajhans" : (chain || "Other");
};

/**
 * "Total revenue" = booked seats' value + open (non-booked) seats' value.
 * The scan's `potentialValue` could mean either "value of the open seats" or "value of ALL seats".
 * We detect which one it is once, from the dataset itself, by comparing it with avg-ticket-price × seats.
 */
type PotentialMode = "open" | "total";
function detectMode(all: Theatre[]): PotentialMode {
  let b = 0, c = 0, a = 0, bv = 0, pv = 0;
  for (const t of all) { b += number(t.booked ?? t.unavailable); c += number(t.capacity); a += number(t.available); bv += number(t.unavailableValue); pv += number(t.potentialValue); }
  if (!pv || !bv || !b) return "open";
  const price = bv / b;
  return Math.abs(Math.log(pv / (price * c))) < Math.abs(Math.log(pv / (price * a))) ? "total" : "open";
}

function buildRows(all: Theatre[], mode: PotentialMode): Row[] {
  return all.map(t => {
    const capacity = number(t.capacity), available = number(t.available);
    const booked = number(t.booked ?? t.unavailable);
    const bookedValue = number(t.unavailableValue), pv = number(t.potentialValue);
    const price = booked > 0 ? bookedValue / booked : 0;
    const totalValue = pv > 0 ? (mode === "open" ? bookedValue + pv : Math.max(pv, bookedValue)) : bookedValue + available * price;

    const parts: Record<string, Part> = {};
    for (const [name, f] of Object.entries(t.formatBreakdown || {})) {
      const fc = number(f.capacity), fa = number(f.available), fv = number(f.value);
      const fb = f.booked != null ? number(f.booked) : Math.max(0, fc - fa);
      const p = fb > 0 ? fv / fb : price;
      parts[name] = { shows: number(f.shows), capacity: fc, available: fa, booked: fb, bookedValue: fv, totalValue: fv + fa * p };
    }
    const formats = Object.keys(parts).length ? Object.keys(parts) : splitFormats(t.format);
    return {
      cinema: `${(t.city || "").toLowerCase()}|${t.cinemaId || (t.name || "").toLowerCase()}`,
      name: t.name || "Unknown cinema", city: t.city || "Unknown", state: stateFromAddress(t.address),
      date: t.date || "", language: t.language || "Unknown", chain: chainGroup(t.chain),
      shows: number(t.scannedSessions), capacity, available, booked, bookedValue, totalValue, formats, parts,
    };
  });
}

/* ───────────────────────── Filtering ───────────────────────── */
const FACETS: FacetKey[] = ["state", "city", "date", "language", "format", "chain"];
const emptyFilters = (): Filters => ({ q: "", state: new Set(), city: new Set(), date: new Set(), language: new Set(), format: new Set(), chain: new Set() });
const vals = (r: Row, k: FacetKey): string[] => (k === "format" ? r.formats : [r[k]]);

function matches(r: Row, f: Filters, skip?: FacetKey) {
  if (f.q) {
    const q = f.q.toLowerCase();
    if (!(r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.chain.toLowerCase().includes(q))) return false;
  }
  for (const k of FACETS) {
    if (k === skip) continue;
    const s = f[k];
    if (s.size && !vals(r, k).some(v => s.has(v))) return false;
  }
  return true;
}

/** When a format is selected, numbers must reflect only that format – not the whole cinema record. */
function scope(r: Row, fmts: Set<string>): Row {
  if (!fmts.size || !Object.keys(r.parts).length) return r;
  const entries = Object.entries(r.parts).filter(([n]) => fmts.has(n));
  const sum = entries.reduce<Part>((s, [, p]) => ({
    shows: s.shows + p.shows, capacity: s.capacity + p.capacity, available: s.available + p.available,
    booked: s.booked + p.booked, bookedValue: s.bookedValue + p.bookedValue, totalValue: s.totalValue + p.totalValue,
  }), { shows: 0, capacity: 0, available: 0, booked: 0, bookedValue: 0, totalValue: 0 });
  return { ...r, ...sum, formats: r.formats.filter(n => fmts.has(n)), parts: Object.fromEntries(entries) };
}

/* ───────────────────────── Aggregation ───────────────────────── */
const addTo = (m: Map<string, Agg>, name: string, p: Part, cinema: string) => {
  const a = m.get(name) || { name, shows: 0, capacity: 0, available: 0, booked: 0, bookedValue: 0, totalValue: 0, cinemas: new Set<string>() };
  a.shows += p.shows; a.capacity += p.capacity; a.available += p.available; a.booked += p.booked;
  a.bookedValue += p.bookedValue; a.totalValue += p.totalValue; a.cinemas.add(cinema); m.set(name, a);
};
const groupBy = (rows: Row[], key: (r: Row) => string | null) => {
  const m = new Map<string, Agg>();
  rows.forEach(r => { const k = key(r); if (k) addTo(m, k, r, r.cinema); });
  return [...m.values()];
};
const aggState = (rows: Row[]) => groupBy(rows, r => (r.state === "Unknown" ? null : r.state));
const aggCity = (rows: Row[]) => groupBy(rows, r => r.city);
const aggLang = (rows: Row[]) => groupBy(rows, r => r.language);
const aggChain = (rows: Row[]) => groupBy(rows, r => r.chain);
const aggDate = (rows: Row[]) => groupBy(rows, r => r.date || null).sort((a, b) => a.name.localeCompare(b.name));
const aggFormat = (rows: Row[]) => {
  const m = new Map<string, Agg>();
  rows.forEach(r => {
    const e = Object.entries(r.parts);
    if (e.length) e.forEach(([n, p]) => addTo(m, n, p, r.cinema));
    else addTo(m, r.formats.join(" + ") || "Standard", r, r.cinema);
  });
  return [...m.values()];
};

/* ───────────────────────── Small UI pieces ───────────────────────── */
/** Drifting projector-dust. Pauses when the tab is hidden. */
function Dust() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c || reduced()) return;
    const x = c.getContext("2d"); if (!x) return;
    let w = 0, h = 0, raf = 0;
    const ps = Array.from({ length: 38 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .3, s: Math.random() * .00028 + .00008, d: Math.random() * 6.28, a: Math.random() * .5 + .2 }));
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    size(); addEventListener("resize", size);
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      x.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.s; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
        x.beginPath(); x.fillStyle = `rgba(255,228,170,${p.a * (.15 + .6 * (1 - p.y))})`;
        x.arc((p.x + Math.sin(t / 2600 + p.d) * .02) * w, p.y * h, p.r, 0, 6.283); x.fill();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="dust" aria-hidden="true" />;
}

function Count({ to, format = fmt }: { to: number; format?: (n: number) => string }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (reduced()) { setV(to); prev.current = to; return; }
    const from = prev.current, s = performance.now(); let raf = 0;
    const f = (t: number) => {
      const p = Math.min(1, (t - s) / 1100), val = from + (to - from) * (1 - Math.pow(1 - p, 4));
      setV(val); prev.current = val; if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{format(v)}</>;
}

/**
 * Smart loading: children (and the heavy aggregation inside them) are only mounted
 * once the block is about to scroll into view. Whatever is on screen is what gets computed.
 */
function Lazy({ children, minHeight = 260, className }: { children: ReactNode; minHeight?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (on) return;
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "420px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return <div ref={ref} className={className}>{on ? children : <div className="skel" style={{ minHeight }} />}</div>;
}

function Panel({ title, hint, children, wide }: { title: string; hint?: string; children: ReactNode; wide?: boolean }) {
  return <article className={`panel glow rise${wide ? " wide" : ""}`}>
    <div className="panelHead"><h3>{title}</h3>{hint && <small>{hint}</small>}</div>{children}
  </article>;
}

function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub: string }) {
  return <article className="kpi glow rise"><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>;
}

/** 120 seats – lit from the front rows backwards, like a real hall filling up. */
function Seats({ occ }: { occ: number }) {
  const N = 120;
  const lit = occ > 0 ? Math.max(1, Math.round((occ / 100) * N)) : 0;
  return <div className="seats" aria-hidden="true">
    {Array.from({ length: N }, (_, i) => <i key={i} className={N - 1 - i < lit ? "on" : ""} style={{ "--i": N - 1 - i } as CSSProperties} />)}
  </div>;
}

function Board({ title, hint, rows, agg, metric, maxRows = 6, expandLabel = "Show more" }: {
  title: string; hint: string; rows: Row[]; agg: (r: Row[]) => Agg[]; metric: Metric; maxRows?: number; expandLabel?: string;
}) {
  const [all, setAll] = useState(false);
  const list = useMemo(() => agg(rows).sort((a, b) => metric === "revenue" ? b.bookedValue - a.bookedValue : b.booked - a.booked), [rows, agg, metric]);
  const total = (a: Agg) => (metric === "revenue" ? a.totalValue : a.capacity);
  const filled = (a: Agg) => (metric === "revenue" ? a.bookedValue : a.booked);
  const max = Math.max(1, ...list.map(total));
  const shown = all ? list : list.slice(0, maxRows);
  return <Panel title={title} hint={hint}>
    {!list.length ? <p className="none">No data for this selection.</p> : <>
      <div className="board">{shown.map((a, i) => <div className="bRow" key={a.name}>
        <div className="bTop"><span title={a.name}><em>{i + 1}</em>{a.name}</span>
          <b>{metric === "revenue" ? money(filled(a)) : fmt(filled(a))}<small> / {metric === "revenue" ? money(total(a)) : fmt(total(a))}</small></b></div>
        <small className="bDetail">{fmt(a.shows)} shows · {fmt(a.cinemas.size)} cinemas · {pct(a.booked, a.capacity).toFixed(1)}% full</small>
        <div className="bTrack" style={{ width: `${Math.max(2, (total(a) / max) * 100)}%` }}>
          <b style={{ width: `${Math.min(100, pct(filled(a), total(a)))}%`, "--d": `${i * 70}ms` } as CSSProperties} />
        </div>
      </div>)}</div>
      {list.length > maxRows && <button className="more" onClick={() => setAll(v => !v)}>{all ? "Show less" : `${expandLabel} (${list.length - maxRows})`}</button>}
    </>}
  </Panel>;
}

function Timeline({ rows, metric }: { rows: Row[]; metric: Metric }) {
  const list = useMemo(() => aggDate(rows), [rows]);
  const total = (a: Agg) => (metric === "revenue" ? a.totalValue : a.capacity);
  const filled = (a: Agg) => (metric === "revenue" ? a.bookedValue : a.booked);
  const max = Math.max(1, ...list.map(total));
  const lab = (n: number) => (metric === "revenue" ? moneyS(n) : compact(n));
  return <Panel title="Show-date timeline" hint={metric === "revenue" ? "Booked vs total revenue per day" : "Booked vs total seats per day"} wide>
    {!list.length ? <p className="none">No dates in this selection.</p> :
      <div className="tl"><div className="tlIn">{list.map((a, i) => <div className="col" key={a.name} title={`${dateLabel(a.name)} · ${metric === "revenue" ? money(filled(a)) + " of " + money(total(a)) : fmt(filled(a)) + " of " + fmt(total(a)) + " seats"} · ${pct(a.booked, a.capacity).toFixed(1)}%`}>
        <small className="cv">{lab(filled(a))}</small>
        <div className="cBar"><div className="cOut" style={{ height: `${Math.max(3, (total(a) / max) * 100)}%` }}>
          <i style={{ height: `${Math.min(100, pct(filled(a), total(a)))}%`, "--d": `${i * 50}ms` } as CSSProperties} /></div></div>
        <small className="cl">{dateLabel(a.name)}</small>
      </div>)}</div></div>}
  </Panel>;
}

type SortKey = "bookedValue" | "totalValue" | "occ" | "shows" | "name";
type Cin = { key: string; name: string; city: string; state: string; chain: string; shows: number; capacity: number; booked: number; bookedValue: number; totalValue: number };

/** Cinema leaderboard – renders 25 rows at a time, the next 25 only when you scroll to the end. */
function CinemaTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<SortKey>("bookedValue");
  const [limit, setLimit] = useState(25);
  const sentinel = useRef<HTMLDivElement>(null);
  const list = useMemo(() => {
    const m = new Map<string, Cin>();
    rows.forEach(r => {
      const c = m.get(r.cinema) || { key: r.cinema, name: r.name, city: r.city, state: r.state, chain: r.chain, shows: 0, capacity: 0, booked: 0, bookedValue: 0, totalValue: 0 };
      c.shows += r.shows; c.capacity += r.capacity; c.booked += r.booked; c.bookedValue += r.bookedValue; c.totalValue += r.totalValue; m.set(r.cinema, c);
    });
    const occ = (c: Cin) => pct(c.booked, c.capacity);
    return [...m.values()].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "occ" ? occ(b) - occ(a) : b[sort] - a[sort]);
  }, [rows, sort]);
  useEffect(() => { setLimit(25); }, [rows, sort]);
  useEffect(() => {
    const el = sentinel.current; if (!el || limit >= list.length) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setLimit(l => l + 25); }, { rootMargin: "320px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, list.length]);
  const H = ({ k, children }: { k: SortKey; children: ReactNode }) => <button className={sort === k ? "on" : ""} onClick={() => setSort(k)}>{children}{sort === k ? (k === "name" ? " ↑" : " ↓") : ""}</button>;
  return <Panel title="Cinema leaderboard" hint={`${fmt(list.length)} cinemas · tap a column to sort`} wide>
    {!list.length ? <p className="none">No cinemas match these filters.</p> : <div className="tScroll"><div className="tbl">
      <div className="cRow head"><H k="name">Cinema</H><H k="shows">Shows</H><span>Seats booked</span><H k="occ">Occupancy</H><H k="bookedValue">Booked ₹</H><H k="totalValue">Total ₹</H></div>
      {list.slice(0, limit).map((c, i) => {
        const o = pct(c.booked, c.capacity);
        return <div className="cRow" key={c.key}>
          <div className="cName"><b><em>{i + 1}</em>{c.name}</b><small>{c.city}{c.state !== "Unknown" ? ` · ${c.state}` : ""} · {c.chain}</small></div>
          <div className="num">{fmt(c.shows)}</div>
          <div className="num">{fmt(c.booked)}<small> / {fmt(c.capacity)}</small></div>
          <div className="occ"><span>{o.toFixed(1)}%</span><div className="bTrack"><b style={{ width: `${Math.min(100, o)}%` }} /></div></div>
          <div className="num gold">{money(c.bookedValue)}</div>
          <div className="num">{money(c.totalValue)}</div>
        </div>;
      })}
      {limit < list.length && <div ref={sentinel} className="sentinel">Loading more cinemas…</div>}
    </div></div>}
  </Panel>;
}

type Opt = { value: string; count: number };
function Facet({ title, opts, sel, onToggle, onClear, list, fmtVal }: {
  title: string; opts: Opt[]; sel: Set<string>; onToggle: (v: string) => void; onClear: () => void; list?: boolean; fmtVal?: (v: string) => string;
}) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  const shown = list && q ? opts.filter(o => o.value.toLowerCase().includes(q.toLowerCase())) : opts;
  const label = fmtVal || ((v: string) => v);
  return <div className="facet">
    <div className="facetHead">
      <button className="facetTitle" onClick={() => setOpen(v => !v)} aria-expanded={open}><i className={open ? "o" : ""} />{title}{sel.size > 0 && <em>{sel.size}</em>}</button>
      {sel.size > 0 && <button className="mini" onClick={onClear}>Clear</button>}
    </div>
    {open && (!opts.length ? <p className="none sm">Nothing available</p> : list ? <>
      {opts.length > 8 && <input className="facetSearch" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={e => setQ(e.target.value)} />}
      <div className="facetList">{shown.map(o => <button key={o.value} className={sel.has(o.value) ? "on" : ""} onClick={() => onToggle(o.value)} aria-pressed={sel.has(o.value)}>
        <i /><span>{label(o.value)}</span><b>{compact(o.count)}</b></button>)}
        {!shown.length && <p className="none sm">No match</p>}</div>
    </> : <div className="chips">{opts.map(o => <button key={o.value} className={sel.has(o.value) ? "on" : ""} onClick={() => onToggle(o.value)} aria-pressed={sel.has(o.value)}>
      {label(o.value)}<b>{compact(o.count)}</b></button>)}</div>)}
  </div>;
}

/* ───────────────────────── Page ───────────────────────── */
export default function AdvanceBookingPage() {
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const df = useDeferredValue(filters);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [drawer, setDrawer] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`Could not load ${DATA_URL} (${r.status})`);
      setData((await r.json()) as ScanData); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load data"); }
    setBusy(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { document.title = `${data?.movie || MOVIE_NAME} · ${PAGE_NAME} | World of Raaka`; }, [data]);

  // cursor-following spotlight on glass surfaces
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".glow") as HTMLElement | null; if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`); el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [drawer]);

  const rows = useMemo(() => { const all = data?.theatres || []; return buildRows(all, detectMode(all)); }, [data]);
  const cityState = useMemo(() => { const m = new Map<string, string>(); rows.forEach(r => m.set(r.city, r.state)); return m; }, [rows]);

  // Cascading facets: each facet's options are computed with every OTHER filter applied.
  const opts = useMemo(() => {
    const out = {} as Record<FacetKey, Opt[]>;
    for (const k of FACETS) {
      const m = new Map<string, number>();
      for (const r of rows) {
        if (!matches(r, df, k)) continue;
        for (const v of vals(r, k)) { if (k === "state" && v === "Unknown") continue; m.set(v, (m.get(v) || 0) + r.booked); }
      }
      df[k].forEach(v => { if (!m.has(v)) m.set(v, 0); });
      out[k] = [...m.entries()].map(([value, count]) => ({ value, count }))
        .sort((a, b) => k === "date" ? a.value.localeCompare(b.value) : b.count - a.count || a.value.localeCompare(b.value));
    }
    return out;
  }, [rows, df]);

  const view = useMemo(() => rows.filter(r => matches(r, df)).map(r => scope(r, df.format)), [rows, df]);

  const stats = useMemo(() => {
    const s = { capacity: 0, available: 0, booked: 0, bookedValue: 0, totalValue: 0, shows: 0 };
    const cin = new Set<string>(), cities = new Set<string>(), langs = new Set<string>();
    for (const r of view) {
      s.capacity += r.capacity; s.available += r.available; s.booked += r.booked; s.bookedValue += r.bookedValue; s.totalValue += r.totalValue; s.shows += r.shows;
      cin.add(r.cinema); cities.add(r.city); langs.add(r.language);
    }
    const totalValue = Math.max(s.totalValue, s.bookedValue);
    return { ...s, totalValue, openValue: Math.max(0, totalValue - s.bookedValue), cinemas: cin.size, cities: cities.size, langs: langs.size,
      occupancy: pct(s.booked, s.capacity), avgPrice: s.booked ? s.bookedValue / s.booked : 0, bookedShare: pct(s.bookedValue, totalValue) };
  }, [view]);

  const toggle = (k: FacetKey, v: string) => setFilters(p => {
    const s = new Set(p[k]); if (s.has(v)) s.delete(v); else s.add(v);
    const next = { ...p, [k]: s } as Filters;
    if (k === "state" && s.size) next.city = new Set([...p.city].filter(c => s.has(cityState.get(c) || "")));
    return next;
  });
  const clearK = (k: FacetKey) => setFilters(p => ({ ...p, [k]: new Set<string>() }) as Filters);
  const activeCount = FACETS.reduce((n, k) => n + filters[k].size, 0) + (filters.q ? 1 : 0);
  const stale = df !== filters;

  const lastUpdated = data?.lastCapture ? new Date(data.lastCapture).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
  const title = data?.movie || MOVIE_NAME;
  const range = data?.dateRange?.from ? `${dateLabel(data.dateRange.from)}${data.dateRange.to && data.dateRange.to !== data.dateRange.from ? ` – ${dateLabel(data.dateRange.to)}` : ""}` : "";
  const facetCfg: { k: FacetKey; title: string; list?: boolean; fmtVal?: (v: string) => string }[] = [
    { k: "state", title: "State", list: true }, { k: "city", title: "City", list: true },
    { k: "date", title: "Show date", fmtVal: dateLabel }, { k: "language", title: "Language" },
    { k: "format", title: "Format" }, { k: "chain", title: "Cinema chain" },
  ];

  return <><style>{styles}</style><Dust />
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <svg className="reel" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" /><g>{[0, 60, 120, 180, 240, 300].map(a => <circle key={a} cx="24" cy="12" r="4" transform={`rotate(${a} 24 24)`} />)}</g><circle cx="24" cy="24" r="3" className="hub" /></svg>
          <div><div className="brandName">WORLD OF RAAKA</div><div className="brandSub">{PAGE_NAME}</div></div>
        </div>
        <div className="topRight">
          {data?.scanning && <span className="pill warn"><i className="dot" />Scanning {Math.round(number(data.progress))}%</span>}
          {lastUpdated && <span className="pill"><i className="dot live" />Updated {lastUpdated}</span>}
          <button className="iconBtn" onClick={load} disabled={busy} aria-label="Refresh data">{busy ? "…" : "↻"}</button>
          {data && <button className="filterBtn" onClick={() => setDrawer(true)}>Filters{activeCount > 0 && <em>{activeCount}</em>}</button>}
        </div>
      </header>

      {error && <div className="errorBox">Data load nahi ho paya · {error}<br /><small>Place scan-latest.json in the public folder of this Next.js app.</small></div>}
      {!data && !error && <div className="loader"><div className="spool"><i /><i /><i /></div><span>Loading the reels…</span></div>}

      {data && <div className="shell">
        {drawer && <div className="backdrop" onClick={() => setDrawer(false)} />}
        <aside className={`aside${drawer ? " open" : ""}`}>
          <div className="asideHead"><h2>Filters</h2>
            <div>{activeCount > 0 && <button className="mini" onClick={() => setFilters(emptyFilters())}>Reset all</button>}<button className="mini close" onClick={() => setDrawer(false)}>✕</button></div></div>
          <div className="search"><input placeholder="Search cinema, city or chain…" value={filters.q} onChange={e => { const q = e.target.value; setFilters(p => ({ ...p, q })); }} />
            {filters.q && <button onClick={() => setFilters(p => ({ ...p, q: "" }))} aria-label="Clear search">✕</button>}</div>
          {facetCfg.map(c => <Facet key={c.k} title={c.title} list={c.list} fmtVal={c.fmtVal} opts={opts[c.k]} sel={filters[c.k]} onToggle={v => toggle(c.k, v)} onClear={() => clearK(c.k)} />)}
          <p className="asideNote">Numbers beside each option = seats booked. Options narrow automatically as you pick.</p>
          <button className="apply" onClick={() => setDrawer(false)}>Show {fmt(stats.shows)} shows</button>
        </aside>

        <div className={`main${stale ? " stale" : ""}`}>
          <section className="screen">
            <div className="beam" aria-hidden="true" />
            <div className="strip top" aria-hidden="true" /><div className="strip bot" aria-hidden="true" />
            <div className="heroGrid">
              <div className="heroText">
                <span className="eyebrow">Now screening · Advance booking</span>
                <h1 aria-label={title}>{[...title].map((ch, i) => <span key={i} aria-hidden="true" style={{ "--i": i } as CSSProperties}>{ch === " " ? "\u00A0" : ch}</span>)}</h1>
                <p className="tag">Live box-office radar across {fmt(data.totals?.cities || stats.cities)} cities</p>
                <div className="meta">{range && <span>🎞 {range}</span>}<span>{fmt(stats.cinemas)} cinemas</span><span>{fmt(stats.cities)} cities</span><span>{fmt(stats.langs)} languages</span></div>
              </div>
              <div className="console glow">
                <span className="conLabel">Total revenue · booked + open seats</span>
                <div className="conValue"><Count to={stats.totalValue} format={money} /></div>
                <div className="split" role="img" aria-label={`${stats.bookedShare.toFixed(1)}% of total revenue is booked`}>
                  <b style={{ width: `${Math.min(100, stats.bookedShare)}%` }} /><i />
                </div>
                <div className="legend">
                  <div><span className="sw booked" />Booked revenue<strong><Count to={stats.bookedValue} format={money} /></strong><small>{stats.bookedShare.toFixed(1)}% of total</small></div>
                  <div><span className="sw open" />Non-booked revenue<strong><Count to={stats.openValue} format={money} /></strong><small>{(100 - stats.bookedShare).toFixed(1)}% still open</small></div>
                </div>
                <div className="hall"><Seats occ={stats.occupancy} />
                  <div><b><Count to={stats.occupancy} format={n => `${n.toFixed(1)}%`} /></b><small>hall filled</small><small>{compact(stats.booked)} of {compact(stats.capacity)} seats</small></div></div>
              </div>
            </div>
          </section>

          {activeCount > 0 && <div className="tags">
            {filters.q && <button onClick={() => setFilters(p => ({ ...p, q: "" }))}>“{filters.q}” ✕</button>}
            {facetCfg.flatMap(c => [...filters[c.k]].map(v => <button key={c.k + v} onClick={() => toggle(c.k, v)}><small>{c.title}</small>{(c.fmtVal || ((x: string) => x))(v)} ✕</button>))}
            <button className="clearAll" onClick={() => setFilters(emptyFilters())}>Clear all</button>
          </div>}

          {!view.length ? <div className="empty glow"><h3>No shows match these filters</h3><p>Try removing a filter — the options on the left only list what exists for the current selection.</p>
            <button className="more" onClick={() => setFilters(emptyFilters())}>Reset filters</button></div> : <>
            <section className="kpis">
              <Kpi label="Shows" value={<Count to={stats.shows} />} sub={`${fmt(stats.cinemas)} cinemas`} />
              <Kpi label="Total seats" value={<Count to={stats.capacity} />} sub="Capacity in view" />
              <Kpi label="Booked seats" value={<Count to={stats.booked} />} sub={`${stats.occupancy.toFixed(1)}% occupancy`} />
              <Kpi label="Open seats" value={<Count to={stats.available} />} sub="Still available" />
              <Kpi label="Avg ticket" value={<Count to={stats.avgPrice} format={n => `₹${Math.round(n)}`} />} sub="Booked value ÷ booked seats" />
              <Kpi label="Cities" value={<Count to={stats.cities} />} sub={`${fmt(stats.langs)} languages`} />
            </section>

            <div className="secHead"><div><h2>Where the money is</h2><p>Gold = booked · faded = still open. Bars scale to total potential.</p></div>
              <div className="seg" role="tablist"><button className={metric === "revenue" ? "on" : ""} onClick={() => setMetric("revenue")}>Revenue ₹</button><button className={metric === "seats" ? "on" : ""} onClick={() => setMetric("seats")}>Seats</button></div></div>

            <section className="grid">
              <Lazy minHeight={300}><Board title="State-wise" hint="Top states" rows={view} agg={aggState} metric={metric} /></Lazy>
              <Lazy minHeight={300}><Board title="City-wise" hint="Top cities" rows={view} agg={aggCity} metric={metric} /></Lazy>
              <Lazy minHeight={300}><Board title="Language-wise" hint="Per language" rows={view} agg={aggLang} metric={metric} /></Lazy>
              <Lazy minHeight={300}><Board title="Format-wise" hint="2D · 3D · IMAX · …" rows={view} agg={aggFormat} metric={metric} /></Lazy>
              <Lazy minHeight={300}><Board title="Cinema chain-wise" hint="PVR + INOX + Cinepolis, Movie Max, Rajhans" rows={view} agg={aggChain} metric={metric} maxRows={4} expandLabel="More chains" /></Lazy>
              <Lazy minHeight={300}><Panel title="Reading this page" hint="How numbers are calculated">
                <ul className="how"><li><b>Total revenue</b> = value of booked seats + value of non-booked seats.</li><li><b>Format filter</b> recalculates every number for just that format.</li><li><b>Occupancy</b> = booked ÷ total seats.</li><li>Blocks load as you scroll, so the page stays fast.</li></ul></Panel></Lazy>
              <Lazy className="span" minHeight={300}><Timeline rows={view} metric={metric} /></Lazy>
              <Lazy className="span" minHeight={420}><CinemaTable rows={view} /></Lazy>
            </section></>}

          <footer className="foot"><span>WORLD OF RAAKA · {PAGE_NAME.toUpperCase()}</span>{lastUpdated && <span>Last updated {lastUpdated}</span>}</footer>
        </div>
      </div>}
    </main></>;
}

/* ───────────────────────── Styles ───────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
body{background:#05060a;margin:0}
.page{--gold:#f4c870;--gold2:#ffe6b0;--amber:#ff9a3d;--crim:#d4202f;--ink:#05060a;--text:#f6f0e4;--muted:#9b97a4;--line:rgba(255,255,255,.09);--open:#5d6b87;
position:relative;z-index:1;min-height:100vh;padding:20px clamp(12px,2.4vw,40px) 40px;color:var(--text);font:14px/1.5 Manrope,ui-sans-serif,system-ui,sans-serif}
.page:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 60% 45% at 50% -8%,rgba(255,170,80,.16),transparent 70%),radial-gradient(ellipse 45% 40% at 105% 55%,rgba(212,32,47,.13),transparent 70%),radial-gradient(ellipse 40% 35% at -5% 85%,rgba(93,107,135,.12),transparent 70%),#05060a}
.page:after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.dust{position:fixed;inset:0;z-index:0;pointer-events:none}
button{font:inherit;color:inherit}
.topbar{max-width:1680px;margin:0 auto 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:12px}.reel{width:42px;height:42px;fill:none;stroke:var(--gold);stroke-width:1.8;filter:drop-shadow(0 0 8px rgba(255,160,60,.55))}.reel g{transform-origin:24px 24px;animation:spin 14s linear infinite}.reel .hub{fill:var(--amber);stroke:none}
.brandName{font:400 22px/1 'Bebas Neue',sans-serif;letter-spacing:.28em;color:var(--gold2)}.brandSub{font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:var(--muted);margin-top:3px}
.topRight{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:99px;border:1px solid var(--line);background:rgba(255,255,255,.04);font-size:11px;color:#d8d2c4;backdrop-filter:blur(8px)}.pill.warn{border-color:rgba(255,154,61,.45);color:var(--gold2)}
.dot{width:7px;height:7px;border-radius:50%;background:var(--amber)}.dot.live{background:#4ade80;box-shadow:0 0 10px #4ade80;animation:pulse 2s infinite}
.iconBtn,.filterBtn{border:1px solid var(--line);background:rgba(255,255,255,.05);border-radius:99px;height:34px;min-width:34px;padding:0 14px;cursor:pointer;transition:background .25s,border-color .25s}.iconBtn:hover,.filterBtn:hover{background:rgba(244,200,112,.14);border-color:rgba(244,200,112,.5)}.iconBtn{padding:0;font-size:16px}
.filterBtn{display:none;font-weight:700}.filterBtn em{font-style:normal;margin-left:7px;background:var(--gold);color:#1a1004;border-radius:99px;padding:1px 7px;font-size:11px}
.shell{max-width:1680px;margin:0 auto;display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;align-items:start}
.aside{position:sticky;top:14px;max-height:calc(100vh - 28px);overflow:auto;padding:16px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(160deg,rgba(24,24,32,.82),rgba(10,10,15,.88));backdrop-filter:blur(14px);scrollbar-width:thin;scrollbar-color:rgba(244,200,112,.3) transparent}
.asideHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.asideHead h2{margin:0;font:400 22px/1 'Bebas Neue',sans-serif;letter-spacing:.14em;color:var(--gold2)}.asideHead>div{display:flex;gap:6px}
.mini{border:1px solid var(--line);background:rgba(255,255,255,.05);border-radius:99px;padding:3px 11px;font-size:11px;font-weight:700;cursor:pointer;color:var(--gold2)}.mini:hover{background:rgba(244,200,112,.15)}.mini.close{display:none}
.search{position:relative;margin-bottom:6px}.search input,.facetSearch{width:100%;border:1px solid var(--line);background:rgba(0,0,0,.35);border-radius:12px;padding:10px 34px 10px 13px;color:var(--text);font:inherit;outline:none;transition:border-color .25s,box-shadow .25s}.facetSearch{padding:8px 12px;margin:8px 0 6px;font-size:12px}
.search input:focus,.facetSearch:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(244,200,112,.12)}.search button{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--muted);cursor:pointer}
.facet{padding:12px 0;border-top:1px solid var(--line)}.facet:first-of-type{border-top:0}
.facetHead{display:flex;justify-content:space-between;align-items:center}.facetTitle{display:flex;align-items:center;gap:8px;border:0;background:none;cursor:pointer;font-weight:800;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d9d3c6;padding:0}
.facetTitle i{width:6px;height:6px;border-right:2px solid var(--gold);border-bottom:2px solid var(--gold);transform:rotate(-45deg);transition:transform .25s}.facetTitle i.o{transform:rotate(45deg)}.facetTitle em{font-style:normal;background:var(--gold);color:#1a1004;border-radius:99px;padding:0 7px;font-size:10px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.chips button{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:99px;padding:6px 11px;font-size:12px;font-weight:600;cursor:pointer;transition:all .22s}.chips button b{font-weight:600;font-size:10px;color:var(--muted)}
.chips button:hover{border-color:rgba(244,200,112,.5);transform:translateY(-1px)}.chips button.on{background:linear-gradient(120deg,var(--gold2),var(--gold) 55%,var(--amber));color:#1a1004;border-color:transparent;box-shadow:0 6px 20px -8px rgba(255,154,61,.8)}.chips button.on b{color:#4a3512}
.facetList{max-height:190px;overflow:auto;margin-top:8px;display:flex;flex-direction:column;gap:2px;scrollbar-width:thin;scrollbar-color:rgba(244,200,112,.3) transparent}
.facetList button{display:flex;align-items:center;gap:10px;border:0;background:none;text-align:left;padding:6px 8px;border-radius:9px;cursor:pointer;font-size:12.5px;transition:background .2s}.facetList button:hover{background:rgba(255,255,255,.06)}
.facetList button i{flex:none;width:14px;height:14px;border-radius:4px;border:1.5px solid rgba(255,255,255,.28);transition:all .2s}.facetList button.on i{background:var(--gold);border-color:var(--gold);box-shadow:0 0 10px rgba(244,200,112,.6)}.facetList button.on{background:rgba(244,200,112,.09)}
.facetList button span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.facetList button b{font-size:10px;color:var(--muted);font-weight:600}
.asideNote{font-size:10.5px;color:#7a7683;margin:6px 2px 0}.apply{display:none;width:100%;margin-top:12px;border:0;border-radius:12px;padding:12px;font-weight:800;color:#1a1004;cursor:pointer;background:linear-gradient(120deg,var(--gold2),var(--gold) 55%,var(--amber))}
.backdrop{display:none}
.main{min-width:0;transition:opacity .25s}.main.stale{opacity:.72}
.screen{position:relative;overflow:hidden;border-radius:24px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,154,61,.07),rgba(8,8,12,.7));padding:clamp(34px,4.6vw,64px) clamp(16px,3vw,44px)}
.beam{position:absolute;inset:0;pointer-events:none;overflow:hidden}.beam:before{content:"";position:absolute;left:50%;top:-12%;width:150%;height:125%;transform:translateX(-50%);background:conic-gradient(from 180deg at 50% 0%,transparent 158deg,rgba(255,226,170,.10) 172deg,rgba(255,226,170,.20) 180deg,rgba(255,226,170,.10) 188deg,transparent 202deg);-webkit-mask:linear-gradient(#000,transparent 88%);mask:linear-gradient(#000,transparent 88%);animation:flicker 6s infinite}
.strip{position:absolute;left:0;right:0;height:14px;opacity:.5;background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 10px,transparent 10px 24px);-webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}.strip.top{top:8px}.strip.bot{bottom:8px}
.heroGrid{position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(18px,3vw,44px);align-items:center}
.eyebrow{display:inline-block;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--amber);font-weight:700;margin-bottom:6px;animation:rise .9s both}
.heroText h1{margin:0;display:flex;flex-wrap:wrap;font:400 clamp(64px,10.5vw,156px)/.9 'Bebas Neue',sans-serif;letter-spacing:.05em;filter:drop-shadow(0 8px 40px rgba(255,140,50,.35))}
.heroText h1 span{display:inline-block;background:linear-gradient(180deg,#fff3d2 8%,var(--gold) 52%,#c4672a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:0;transform:translateY(55%) scale(.92);filter:blur(10px);animation:letter 1s calc(.25s + var(--i)*.07s) forwards cubic-bezier(.2,.8,.2,1)}
.tag{margin:14px 0 0;color:var(--muted);font-size:13px;letter-spacing:.06em;animation:rise 1s 1s both}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;animation:rise 1s 1.2s both}.meta span{padding:6px 13px;border-radius:99px;border:1px solid var(--line);background:rgba(255,255,255,.05);font-size:11.5px;color:#e6dfcf}
.glow{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:linear-gradient(150deg,rgba(26,26,34,.78),rgba(11,11,16,.84));backdrop-filter:blur(10px);transition:transform .45s cubic-bezier(.2,.8,.2,1),border-color .35s,box-shadow .35s}
.glow:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .35s;background:radial-gradient(340px circle at var(--mx,50%) var(--my,50%),rgba(255,176,80,.14),transparent 60%)}.glow:hover{border-color:rgba(244,200,112,.38);box-shadow:0 18px 50px -22px rgba(255,140,50,.5)}.glow:hover:before{opacity:1}
.console{padding:clamp(16px,2vw,26px);border-radius:22px;border-color:rgba(244,200,112,.25);animation:rise 1s .5s both}
.conLabel{font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);font-weight:700}
.conValue{font:400 clamp(46px,6.2vw,92px)/1 'Bebas Neue',sans-serif;letter-spacing:.03em;margin:6px 0 14px;background:linear-gradient(180deg,#fff3d2,var(--gold) 60%,var(--amber));-webkit-background-clip:text;background-clip:text;color:transparent;font-variant-numeric:tabular-nums;text-shadow:0 0 40px rgba(255,160,60,.25)}
.split{display:flex;height:12px;border-radius:99px;overflow:hidden;background:repeating-linear-gradient(135deg,rgba(93,107,135,.45) 0 6px,rgba(93,107,135,.2) 6px 12px)}.split b{display:block;border-radius:99px;background:linear-gradient(90deg,var(--crim),var(--amber) 55%,var(--gold2));box-shadow:0 0 18px rgba(255,140,50,.7);transform-origin:left;animation:grow 1.4s .4s both cubic-bezier(.2,.8,.2,1);transition:width 1s cubic-bezier(.2,.8,.2,1)}.split i{flex:1}
.legend{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.legend>div{display:flex;flex-direction:column;font-size:11.5px;color:var(--muted)}.legend strong{font:400 clamp(24px,2.4vw,34px)/1.1 'Bebas Neue',sans-serif;letter-spacing:.04em;color:var(--text);margin:2px 0}.legend small{font-size:10.5px;color:#7f7b8a}
.sw{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:7px}.sw.booked{background:linear-gradient(135deg,var(--crim),var(--gold))}.sw.open{background:var(--open)}
.hall{display:flex;align-items:center;gap:18px;margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}.hall>div:last-child{display:flex;flex-direction:column}.hall b{font:400 38px/1 'Bebas Neue',sans-serif;letter-spacing:.04em;color:var(--gold2)}.hall small{font-size:11px;color:var(--muted)}
.seats{flex:1;min-width:0;display:grid;grid-template-columns:repeat(20,1fr);gap:4px;max-width:340px;padding:8px 10px 6px;border-radius:50% 50% 12px 12px/22px 22px 12px 12px}.seats i{aspect-ratio:1;border-radius:3px 3px 5px 5px;background:rgba(255,255,255,.1);transition:background .5s,box-shadow .5s}.seats i.on{background:linear-gradient(180deg,var(--gold2),var(--amber));box-shadow:0 0 8px rgba(255,154,61,.7);animation:pop .5s calc(var(--i)*7ms) both}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 0}.tags button{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(244,200,112,.35);background:rgba(244,200,112,.09);border-radius:99px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;color:var(--gold2);transition:background .2s}.tags button:hover{background:rgba(212,32,47,.25)}.tags small{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.1em}.tags .clearAll{border-color:var(--line);background:none;color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:14px 0 8px}
.kpi{padding:15px 17px;min-height:96px}.kpi span{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:700}.kpi strong{display:block;font:400 clamp(26px,2.6vw,38px)/1.1 'Bebas Neue',sans-serif;letter-spacing:.04em;color:var(--gold2);margin:4px 0 1px;font-variant-numeric:tabular-nums}.kpi small{font-size:10.5px;color:#7f7b8a}
.kpi:after{content:"";position:absolute;left:17px;top:0;width:28px;height:2px;background:var(--amber);box-shadow:0 0 12px var(--amber);transition:width .5s}.kpi:hover:after{width:calc(100% - 34px)}
.secHead{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:26px 2px 12px}.secHead h2{margin:0;font:400 30px/1 'Bebas Neue',sans-serif;letter-spacing:.12em;color:var(--text)}.secHead p{margin:4px 0 0;font-size:12px;color:var(--muted)}
.seg{display:inline-flex;padding:3px;border:1px solid var(--line);border-radius:99px;background:rgba(0,0,0,.35)}.seg button{border:0;background:none;border-radius:99px;padding:7px 16px;font-size:12px;font-weight:700;cursor:pointer;color:var(--muted);transition:all .25s}.seg button.on{background:linear-gradient(120deg,var(--gold2),var(--gold) 55%,var(--amber));color:#1a1004}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.grid>.span{grid-column:1/-1}
.panel{min-width:0;padding:18px 20px;height:100%}.rise{animation:rise .8s both cubic-bezier(.2,.8,.2,1)}
.panelHead{margin-bottom:16px}.panelHead h3{margin:0;font:400 20px/1.1 'Bebas Neue',sans-serif;letter-spacing:.14em;color:var(--gold2)}.panelHead small{font-size:11px;color:var(--muted)}
.board{display:flex;flex-direction:column;gap:14px}.bTop{display:flex;justify-content:space-between;gap:10px;font-size:12.5px}.bTop span{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bTop em,.cName em{font-style:normal;color:#6f6b7a;font-size:10px;margin-right:8px;font-weight:700}
.bTop b{white-space:nowrap;color:var(--gold2);font-variant-numeric:tabular-nums}.bTop b small{color:#6f6b7a;font-weight:500;font-size:10.5px}.bDetail{display:block;color:#7f7b8a;font-size:10.5px;margin:1px 0 6px}
.bTrack{height:7px;border-radius:99px;background:repeating-linear-gradient(135deg,rgba(93,107,135,.5) 0 5px,rgba(93,107,135,.22) 5px 10px);overflow:hidden;min-width:8px}.bTrack b{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--crim),var(--amber) 55%,var(--gold2));box-shadow:0 0 12px rgba(255,140,50,.6);transform-origin:left;animation:grow 1.2s var(--d,0ms) both cubic-bezier(.2,.8,.2,1);transition:width .8s cubic-bezier(.2,.8,.2,1)}
.more{margin-top:14px;border:1px solid var(--line);background:rgba(244,200,112,.08);color:var(--gold2);border-radius:99px;padding:7px 15px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .25s}.more:hover{background:rgba(244,200,112,.18);transform:translateY(-2px)}
.none{color:var(--muted);font-size:12.5px;margin:8px 0}.none.sm{font-size:11px}
.how{margin:0;padding-left:18px;color:#c9c3b6;font-size:12.5px;display:flex;flex-direction:column;gap:9px}.how b{color:var(--gold2)}
.tl{overflow-x:auto;padding-bottom:6px;scrollbar-width:thin;scrollbar-color:rgba(244,200,112,.3) transparent}.tlIn{display:flex;gap:8px;min-width:100%;width:max-content}.col{flex:1;min-width:52px;display:flex;flex-direction:column;align-items:center;gap:6px}
.cBar{width:100%;height:180px;display:flex;align-items:flex-end}.cOut{width:100%;border-radius:8px 8px 3px 3px;background:repeating-linear-gradient(135deg,rgba(93,107,135,.5) 0 5px,rgba(93,107,135,.22) 5px 10px);display:flex;align-items:flex-end;overflow:hidden;transition:height .8s cubic-bezier(.2,.8,.2,1)}
.cOut i{display:block;width:100%;background:linear-gradient(0deg,var(--crim),var(--amber) 55%,var(--gold2));box-shadow:0 0 14px rgba(255,140,50,.6);transform-origin:bottom;animation:growY 1.1s var(--d,0ms) both cubic-bezier(.2,.8,.2,1);transition:height .8s}
.cv{font-size:10px;color:var(--gold2);font-weight:700;white-space:nowrap}.cl{font-size:10.5px;color:var(--muted);white-space:nowrap}
.tScroll{overflow-x:auto}.tbl{min-width:760px}
.cRow{display:grid;grid-template-columns:minmax(220px,2.4fr) .7fr 1.1fr 1.3fr 1fr 1fr;gap:12px;align-items:center;padding:11px 8px;border-top:1px solid var(--line);font-size:12.5px;transition:background .2s}.cRow:not(.head):hover{background:rgba(244,200,112,.05)}
.cRow.head{border-top:0;padding-top:0;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:800}.cRow.head button,.cRow.head span{border:0;background:none;padding:0;text-align:left;cursor:pointer;color:inherit;font:inherit;letter-spacing:inherit;text-transform:inherit}.cRow.head span{cursor:default}.cRow.head button.on{color:var(--gold2)}
.cName{min-width:0}.cName b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.cName small{display:block;color:#7f7b8a;font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-left:22px}
.num{font-variant-numeric:tabular-nums;font-weight:600}.num small{color:#6f6b7a;font-weight:500}.num.gold{color:var(--gold2)}.occ{display:flex;flex-direction:column;gap:4px;font-size:11.5px;font-weight:700}.occ .bTrack{height:5px}
.sentinel{text-align:center;color:var(--muted);font-size:11.5px;padding:16px}
.skel{border-radius:18px;border:1px solid var(--line);background:linear-gradient(100deg,rgba(255,255,255,.03) 30%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.03) 70%);background-size:250% 100%;animation:shimmer 1.6s infinite}
.empty{margin-top:14px;padding:50px 20px;text-align:center}.empty h3{margin:0 0 6px;font:400 28px/1 'Bebas Neue',sans-serif;letter-spacing:.1em;color:var(--gold2)}.empty p{margin:0;color:var(--muted)}
.foot{margin-top:26px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#6f6b7a;font:400 13px 'Bebas Neue',sans-serif;letter-spacing:.24em}
.errorBox{max-width:1680px;margin:20px auto;padding:20px;border:1px solid rgba(212,32,47,.5);background:rgba(60,12,16,.6);border-radius:14px;color:#ffb6b0}
.loader{display:flex;flex-direction:column;align-items:center;gap:14px;padding:90px 0;color:var(--muted);letter-spacing:.2em;font-size:12px;text-transform:uppercase}.spool{display:flex;gap:10px}.spool i{width:11px;height:11px;border-radius:50%;background:var(--amber);box-shadow:0 0 16px var(--amber);animation:bounce 1s infinite ease-in-out}.spool i:nth-child(2){animation-delay:.15s}.spool i:nth-child(3){animation-delay:.3s}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes flicker{0%,100%{opacity:1}46%{opacity:.82}48%{opacity:1}72%{opacity:.9}}
@keyframes letter{to{opacity:1;transform:none;filter:blur(0)}}@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleX(0)}}@keyframes growY{from{transform:scaleY(0)}}@keyframes pop{from{opacity:0;transform:scale(.3)}}@keyframes pulse{50%{opacity:.35}}@keyframes bounce{50%{transform:translateY(-10px);opacity:.4}}@keyframes shimmer{to{background-position:-250% 0}}
@media(max-width:1180px){.shell{grid-template-columns:minmax(0,1fr)}.filterBtn{display:inline-flex;align-items:center}.mini.close{display:inline-block}.apply{display:block}
.aside{position:fixed;z-index:50;left:0;top:0;bottom:0;width:min(340px,92vw);max-height:none;border-radius:0 20px 20px 0;transform:translateX(-105%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}.aside.open{transform:none}
.backdrop{display:block;position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.6);backdrop-filter:blur(3px)}
.heroGrid{grid-template-columns:minmax(0,1fr)}.kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:700px){.page{padding:14px 10px 30px}.screen{border-radius:18px}.kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.grid{grid-template-columns:minmax(0,1fr)}.legend{grid-template-columns:1fr}.hall{flex-direction:column;align-items:flex-start}.seats{max-width:100%;width:100%}.pill{display:none}.brandName{font-size:18px}.panel{padding:16px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}.heroText h1 span{opacity:1;transform:none;filter:none}}
`;
