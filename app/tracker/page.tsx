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
/** The scan file sometimes carries a generic placeholder ("District Movie") – never show that as the film title. */
const cleanTitle = (raw?: string) => {
  const t = (raw || "").replace(/\s+/g, " ").trim();
  return !t || /^(district|movie|untitled|unknown)$/i.test(t) || /^district\b.*\bmovie$/i.test(t) ? MOVIE_NAME : t;
};

const number = (n: unknown) => Number(n || 0);
const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
const compact = (n: number) => { n = n || 0; const a = Math.abs(n), t = (x: number) => String(+x.toFixed(1)); return a >= 1e7 ? `${t(n / 1e7)}Cr` : a >= 1e5 ? `${t(n / 1e5)}L` : a >= 1e3 ? `${t(n / 1e3)}K` : String(Math.round(n)); };
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

/** Title splits by WORD (never mid-word) and scales its size to the name length. */
function Title({ text }: { text: string }) {
  const L = text.length;
  const fs = L <= 9 ? "clamp(68px,10.5vw,168px)" : L <= 14 ? "clamp(54px,7.4vw,120px)" : L <= 22 ? "clamp(42px,5.4vw,88px)" : "clamp(34px,4vw,64px)";
  let n = 0;
  return <h1 aria-label={text} style={{ "--fs": fs } as CSSProperties}>
    {text.split(" ").filter(Boolean).map((w, wi) => <span className="w" key={wi} aria-hidden="true">
      {[...w].map((ch, ci) => { const i = n++; return <span className="l" key={ci} style={{ "--i": i } as CSSProperties}>{ch}</span>; })}
    </span>)}
  </h1>;
}

type Opt = { value: string; count: number };
/** Filter dropdown – opens as a popover on desktop and a bottom sheet on phones. */
function FacetMenu({ title, opts, sel, onToggle, onClear, fmtVal, open, onOpen }: {
  title: string; opts: Opt[]; sel: Set<string>; onToggle: (v: string) => void; onClear: () => void;
  fmtVal?: (v: string) => string; open: boolean; onOpen: (o: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const label = fmtVal || ((v: string) => v);
  const shown = q ? opts.filter(o => label(o.value).toLowerCase().includes(q.toLowerCase())) : opts;
  return <div className="fm">
    <button className={`fmBtn${sel.size ? " has" : ""}`} onClick={() => onOpen(!open)} aria-expanded={open}>{title}{sel.size > 0 && <em>{sel.size}</em>}<i /></button>
    {open && <div className="fmPop" role="dialog" aria-label={title}>
      <div className="fmHead"><b>{title}</b>{sel.size > 0 && <button className="mini" onClick={onClear}>Clear</button>}<button className="mini sheetClose" onClick={() => onOpen(false)}>Done</button></div>
      {opts.length > 8 && <input className="fmSearch" autoFocus placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={e => setQ(e.target.value)} />}
      <div className="fmList">
        {!opts.length && <p className="none sm">Nothing available</p>}
        {shown.map(o => <button key={o.value} className={sel.has(o.value) ? "on" : ""} onClick={() => onToggle(o.value)} aria-pressed={sel.has(o.value)}>
          <i /><span>{label(o.value)}</span><b>{compact(o.count)}</b></button>)}
        {opts.length > 0 && !shown.length && <p className="none sm">No match</p>}
      </div>
    </div>}
  </div>;
}

export default function AdvanceBookingPage() {
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const df = useDeferredValue(filters);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [menu, setMenu] = useState("");

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
  useEffect(() => { document.title = `${cleanTitle(data?.movie)} · ${PAGE_NAME} | World of Raaka`; }, [data]);

  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(""); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [menu]);

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
  const title = cleanTitle(data?.movie);
  const range = data?.dateRange?.from ? `${dateLabel(data.dateRange.from)}${data.dateRange.to && data.dateRange.to !== data.dateRange.from ? ` – ${dateLabel(data.dateRange.to)}` : ""}` : "";
  const facetCfg: { k: FacetKey; title: string; list?: boolean; fmtVal?: (v: string) => string }[] = [
    { k: "state", title: "State", list: true }, { k: "city", title: "City", list: true },
    { k: "date", title: "Show date", fmtVal: dateLabel }, { k: "language", title: "Language" },
    { k: "format", title: "Format" }, { k: "chain", title: "Cinema chain" },
  ];


  return <><style>{styles}</style>
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <img
            className="brandLogo"
            src="/RAAKA_BoxOffice_Logo_Animated.webp"
            alt="World of Raaka Box Office"
            width="230"
            height="44"
            fetchPriority="high"
            decoding="async"
          />
          <div className="brandSub">{PAGE_NAME}</div>
        </div>
        <div className="topRight">
          {data?.scanning && <span className="pill warn"><i className="dot" />Scanning {Math.round(number(data.progress))}%</span>}
          {lastUpdated && <span className="pill"><i className="dot live" />Updated {lastUpdated}</span>}
          <button className="iconBtn" onClick={load} disabled={busy} aria-label="Refresh data">{busy ? "…" : "↻"}</button>
        </div>
      </header>

      {error && <div className="errorBox">Data load nahi ho paya · {error}<br /><small>Place scan-latest.json in the public folder of this Next.js app.</small></div>}
      {!data && !error && <div className="loader"><div className="spool"><i /><i /><i /></div><span>Loading the reels…</span></div>}

      {data && <>
        <div className="rail">
          <div className="railIn">
            <div className="search"><input placeholder="Search cinema, city or chain…" value={filters.q} onChange={e => { const q = e.target.value; setFilters(p => ({ ...p, q })); }} />
              {filters.q && <button onClick={() => setFilters(p => ({ ...p, q: "" }))} aria-label="Clear search">✕</button>}</div>
            {facetCfg.map(c => <FacetMenu key={c.k} title={c.title} fmtVal={c.fmtVal} opts={opts[c.k]} sel={filters[c.k]} open={menu === c.k}
              onOpen={o => setMenu(o ? c.k : "")} onToggle={v => toggle(c.k, v)} onClear={() => clearK(c.k)} />)}
            {activeCount > 0 && <button className="resetAll" onClick={() => setFilters(emptyFilters())}>Reset all</button>}
          </div>
          {menu && <div className="fmBack" onClick={() => setMenu("")} />}
        </div>

        <div className={`main${stale ? " stale" : ""}`}>
          <section className="ticket">
            <div className="tMain">
              <span className="eyebrow"><i className="dot live" />Advance booking · live</span>
              <Title text={title} />
              <p className="tag">Box-office radar across {fmt(data.totals?.cities || stats.cities)} cities</p>
              <div className="meta">{range && <span>{range}</span>}<span>{fmt(stats.cinemas)} cinemas</span><span>{fmt(stats.cities)} cities</span><span>{fmt(stats.langs)} languages</span></div>
            </div>
            <div className="tStub">
              <span className="conLabel">Total revenue · booked + open seats</span>
              <div className="rev"><Count to={stats.totalValue} format={money} /></div>
              <div className="split" role="img" aria-label={`${stats.bookedShare.toFixed(1)}% of total revenue is booked`}><b style={{ width: `${Math.min(100, stats.bookedShare)}%` }} /></div>
              <div className="legend">
                <div><span>Booked revenue</span><strong><Count to={stats.bookedValue} format={money} /></strong><small>{stats.bookedShare.toFixed(1)}% of total</small></div>
                <div><span>Non-booked revenue</span><strong><Count to={stats.openValue} format={money} /></strong><small>{(100 - stats.bookedShare).toFixed(1)}% still open</small></div>
              </div>
              <div className="hall"><Seats occ={stats.occupancy} />
                <div><b><Count to={stats.occupancy} format={n => `${n.toFixed(1)}%`} /></b><small>hall filled</small><small>{compact(stats.booked)} of {compact(stats.capacity)} seats</small></div></div>
            </div>
          </section>

          {activeCount > 0 && <div className="tags">
            {filters.q && <button onClick={() => setFilters(p => ({ ...p, q: "" }))}>“{filters.q}” ✕</button>}
            {facetCfg.flatMap(c => [...filters[c.k]].map(v => <button key={c.k + v} onClick={() => toggle(c.k, v)}><small>{c.title}</small>{(c.fmtVal || ((x: string) => x))(v)} ✕</button>))}
          </div>}

          {!view.length ? <div className="empty"><h3>No shows match these filters</h3><p>Try removing a filter — each menu only lists what exists for the current selection.</p>
            <button className="more" onClick={() => setFilters(emptyFilters())}>Reset filters</button></div> : <>
            <section className="kpis">
              <Kpi label="Shows" value={<Count to={stats.shows} />} sub={`${fmt(stats.cinemas)} cinemas`} />
              <Kpi label="Total seats" value={<Count to={stats.capacity} />} sub="Capacity in view" />
              <Kpi label="Booked seats" value={<Count to={stats.booked} />} sub={`${stats.occupancy.toFixed(1)}% occupancy`} />
              <Kpi label="Open seats" value={<Count to={stats.available} />} sub="Still available" />
              <Kpi label="Avg ticket" value={<Count to={stats.avgPrice} format={n => `₹${Math.round(n)}`} />} sub="Booked value ÷ booked seats" />
              <Kpi label="Cities" value={<Count to={stats.cities} />} sub={`${fmt(stats.langs)} languages`} />
            </section>

            <div className="secHead"><div><h2>Where the money is</h2><p>Blue = booked · grey = still open. Bars scale to total potential.</p></div>
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

          <footer className="foot"><span>World of Raaka · {PAGE_NAME}</span>{lastUpdated && <span>Last updated {lastUpdated}</span>}</footer>
        </div>
      </>}
    </main></>;
}

/* ───────────────────────── Styles ───────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}
body{background:#eceff4;margin:0}
.page{--bg:#eceff4;--card:#fff;--ink:#0c1020;--mu:#667085;--ln:#dbe0ea;--cb:#2038ff;--cb2:#1527c8;--sun:#ffd23f;--open:#d3d9e8;
min-height:100vh;padding:0 clamp(12px,2.4vw,40px) 48px;color:var(--ink);background:var(--bg);font:14px/1.5 Manrope,ui-sans-serif,system-ui,sans-serif;font-variant-numeric:tabular-nums}
button{font:inherit;color:inherit;cursor:pointer}
.topbar,.railIn,.main{max-width:1560px;margin-left:auto;margin-right:auto}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 0}
.brand{display:flex;align-items:center;gap:11px}
.mark{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--cb)}.mark svg{width:22px;height:22px;fill:#fff}.mark .perf{fill:none;stroke:var(--cb);stroke-width:1.6;stroke-dasharray:2 2.2}
.brandName{font:800 18px/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.01em}.brandSub{font-size:12px;color:var(--mu);margin-top:3px}
.topRight{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:99px;border:1px solid var(--ln);background:var(--card);font-size:12.5px;font-weight:600}
.dot{width:7px;height:7px;border-radius:50%;background:#f59e0b}.dot.live{background:#16a34a;box-shadow:0 0 0 0 #16a34a66;animation:pulse 2s infinite}
@keyframes pulse{70%{box-shadow:0 0 0 7px #16a34a00}100%{box-shadow:0 0 0 0 #16a34a00}}
.iconBtn{width:36px;height:36px;border-radius:50%;border:1px solid var(--ln);background:var(--card);font-size:16px;transition:background .2s,transform .2s}.iconBtn:hover{background:#f6f8fc;transform:rotate(90deg)}
.rail{position:sticky;top:0;z-index:30;margin:0 calc(clamp(12px,2.4vw,40px)*-1);padding:10px clamp(12px,2.4vw,40px);background:#eceff4;border-bottom:1px solid var(--ln)}
.railIn{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.search{position:relative;flex:1 1 240px;max-width:380px}.search input,.fmSearch{width:100%;height:38px;border:1px solid var(--ln);background:var(--card);border-radius:10px;padding:0 34px 0 12px;font:inherit;color:var(--ink);outline:none}
.search input:focus,.fmSearch:focus{border-color:var(--cb);box-shadow:0 0 0 3px #2038ff1f}.search button{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--mu);width:26px;height:26px}
.fm{position:relative}.fmBtn{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 12px;border:1px solid var(--ln);background:var(--card);border-radius:10px;font-weight:600;font-size:13px;transition:border-color .15s,background .15s}.fmBtn:hover{border-color:#b9c2d6}
.fmBtn.has{border-color:var(--cb);color:var(--cb)}.fmBtn em{font-style:normal;background:var(--cb);color:#fff;border-radius:99px;padding:0 7px;font-size:11px;line-height:18px}
.fmBtn i{width:6px;height:6px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-2px);opacity:.6}
.fmPop{position:absolute;top:calc(100% + 6px);left:0;z-index:40;width:300px;max-width:92vw;background:var(--card);border:1px solid var(--ln);border-radius:14px;padding:10px;box-shadow:0 20px 50px #0c102030;animation:pop .16s ease-out}
@keyframes pop{from{opacity:0;transform:translateY(-4px)}}
.fmHead{display:flex;align-items:center;gap:8px;margin-bottom:8px}.fmHead b{flex:1;font:700 15px 'Bricolage Grotesque',sans-serif}.sheetClose{display:none}
.mini{border:1px solid var(--ln);background:var(--card);border-radius:99px;padding:3px 11px;font-size:11.5px;font-weight:700}.mini:hover{background:#f3f5fa}
.fmSearch{margin-bottom:6px;height:34px}
.fmList{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:1px;scrollbar-width:thin}
.fmList button{display:flex;align-items:center;gap:10px;border:0;background:none;text-align:left;padding:7px 8px;border-radius:8px;font-size:13px}.fmList button:hover{background:#f3f5fa}
.fmList button i{flex:none;width:16px;height:16px;border-radius:5px;border:1.5px solid #b4bdd0;position:relative;transition:all .15s}
.fmList button.on i{background:var(--cb);border-color:var(--cb)}.fmList button.on i:after{content:"";position:absolute;left:4.5px;top:1.5px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
.fmList button span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fmList button b{font-size:11px;color:var(--mu);font-weight:600}
.fmBack{position:fixed;inset:0;z-index:35}
.resetAll{height:38px;padding:0 12px;border:0;background:none;color:var(--cb);font-weight:700}
.main{padding-top:18px;transition:opacity .25s}.main.stale{opacity:.7}
.ticket{position:relative;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);background:var(--cb);color:#fff;border-radius:28px;overflow:hidden}
.tMain{padding:clamp(22px,3.2vw,48px);min-width:0}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:99px;background:#ffffff22;font-size:12.5px;font-weight:700}
.ticket h1{margin:16px 0 8px;font:800 var(--fs)/.9 'Bricolage Grotesque',sans-serif;letter-spacing:-.035em}
.w{display:inline-block;white-space:nowrap;margin-right:.2em;overflow:hidden;padding-bottom:.16em;margin-bottom:-.16em;vertical-align:top}
.l{display:inline-block;animation:letter .85s calc(.1s + var(--i)*.055s) both cubic-bezier(.2,.8,.2,1)}
@keyframes letter{from{transform:translateY(105%)}}
.tag{margin:10px 0 0;opacity:.8;font-size:14px}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.meta span{padding:6px 13px;border-radius:99px;border:1px solid #ffffff40;font-size:12.5px;font-weight:600}
.tStub{position:relative;padding:clamp(20px,2.4vw,34px);background:var(--cb2);border-left:2px dashed #ffffff55}
.tStub:before,.tStub:after{content:"";position:absolute;left:-14px;width:26px;height:26px;border-radius:50%;background:var(--bg)}.tStub:before{top:-13px}.tStub:after{bottom:-13px}
.conLabel{font-size:12.5px;font-weight:600;opacity:.75}
.rev{font:800 clamp(40px,4.6vw,68px)/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.035em;margin:6px 0 16px;color:var(--sun)}
.split{height:10px;border-radius:99px;background:#00000040;overflow:hidden}.split b{display:block;height:100%;background:var(--sun);border-radius:99px;transition:width 1s cubic-bezier(.2,.8,.2,1)}
.legend{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.legend>div{display:flex;flex-direction:column;font-size:12px}.legend span{opacity:.75}
.legend strong{font:800 clamp(18px,1.9vw,25px)/1.2 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;margin:2px 0}.legend small{opacity:.65;font-size:11.5px}
.hall{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:end;margin-top:22px;padding-top:18px;border-top:1px solid #ffffff30}
.hall b{display:block;font:800 34px/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.03em}.hall small{display:block;opacity:.7;font-size:12px;white-space:nowrap}
.seats{display:grid;grid-template-columns:repeat(20,1fr);gap:3px}.seats i{aspect-ratio:1;border-radius:3px 3px 1px 1px;background:#ffffff26}
.seats i.on{background:var(--sun);animation:seat .45s calc(var(--i)*6ms) both cubic-bezier(.3,1.5,.5,1)}@keyframes seat{from{transform:scale(.2);opacity:0}}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.tags button{display:inline-flex;gap:7px;align-items:center;border:1px solid var(--ln);background:var(--card);border-radius:99px;padding:5px 12px;font-size:12.5px;font-weight:600}.tags small{color:var(--mu);font-weight:500}
.kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1px;margin-top:14px;background:var(--ln);border:1px solid var(--ln);border-radius:18px;overflow:hidden}
.kpi{background:var(--card);padding:16px 18px}.kpi span{font-size:12.5px;color:var(--mu);font-weight:600}.kpi strong{display:block;font:800 clamp(22px,2.2vw,30px)/1.15 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;margin-top:3px}.kpi small{color:var(--mu);font-size:11.5px}
.secHead{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin:30px 2px 14px}.secHead h2{margin:0;font:800 clamp(22px,2.4vw,30px)/1.1 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em}.secHead p{margin:4px 0 0;color:var(--mu);font-size:13px}
.seg{display:inline-flex;padding:3px;border-radius:99px;background:#dfe4ee}.seg button{border:0;background:none;padding:7px 16px;border-radius:99px;font-weight:700;font-size:13px;color:var(--mu);transition:all .2s}.seg button.on{background:var(--ink);color:#fff}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start}.span{grid-column:1/-1}
.panel{background:var(--card);border:1px solid var(--ln);border-radius:18px;padding:18px}.panelHead{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px}
.panelHead h3{margin:0;font:700 17px 'Bricolage Grotesque',sans-serif}.panelHead small{color:var(--mu);font-size:11.5px;text-align:right}
.none{color:var(--mu);margin:8px 0}.sm{font-size:12px}
.bRow{margin:14px 0}.bTop{display:flex;justify-content:space-between;gap:10px;font-weight:700;font-size:13.5px}.bTop span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bTop em{font-style:normal;color:var(--mu);font-weight:600;display:inline-block;width:22px}
.bTop b small{color:var(--mu);font-weight:500}.bDetail{display:block;color:var(--mu);font-size:11.5px;margin:1px 0 6px 22px}
.bTrack{height:8px;border-radius:99px;background:var(--open);overflow:hidden;max-width:100%}.bTrack b{display:block;height:100%;background:var(--cb);border-radius:99px;transform-origin:left;animation:growX .9s var(--d,0ms) both cubic-bezier(.2,.8,.2,1)}
@keyframes growX{from{transform:scaleX(0)}}@keyframes growY{from{transform:scaleY(0)}}
.more{width:100%;margin-top:6px;border:1px dashed #b9c2d6;background:none;border-radius:10px;padding:9px;font-weight:700;color:var(--cb)}.more:hover{background:#f3f5fa}
.tl{overflow-x:auto;scrollbar-width:thin}.tlIn{display:flex;gap:8px;height:250px;align-items:stretch;min-width:max-content}
.col{display:flex;flex-direction:column;width:48px}.cBar{flex:1;display:flex;align-items:flex-end}.cOut{width:100%;background:var(--open);border-radius:8px 8px 3px 3px;display:flex;align-items:flex-end;overflow:hidden}
.cOut i{display:block;width:100%;background:var(--cb);transform-origin:bottom;animation:growY .9s var(--d,0ms) both cubic-bezier(.2,.8,.2,1)}
.cv,.cl{display:block;text-align:center;font-size:10.5px;color:var(--mu);margin:4px 0;font-weight:600}
.tScroll{overflow:auto}.tbl{min-width:820px}
.cRow{display:grid;grid-template-columns:minmax(230px,2.2fr) .6fr 1.2fr 1.1fr 1fr 1fr;gap:12px;align-items:center;padding:11px 8px;border-bottom:1px solid #edf0f6}.cRow:not(.head):hover{background:#f6f8fc}
.cRow.head{position:sticky;top:0;background:var(--card);color:var(--mu);font-size:12px;font-weight:700}.cRow.head button{border:0;background:none;text-align:left;padding:0;font-weight:700;color:var(--mu)}.cRow.head button.on{color:var(--cb)}
.cName b{display:block;font-size:13.5px}.cName em{font-style:normal;color:var(--mu);font-weight:600;display:inline-block;width:26px}.cName small{color:var(--mu);font-size:11.5px;margin-left:26px}
.num{text-align:left;font-weight:600}.num small{color:var(--mu);font-weight:500}.gold{color:var(--cb);font-weight:800}
.occ span{font-weight:700;font-size:12.5px}.occ .bTrack{height:5px;margin-top:4px}
.sentinel{text-align:center;color:var(--mu);padding:14px;font-size:12.5px}
.how{margin:0;padding-left:18px;color:#3b4256;font-size:13px}.how li{margin:8px 0}
.skel{border-radius:18px;background:linear-gradient(100deg,#e3e7f0 30%,#eff2f8 50%,#e3e7f0 70%);background-size:300% 100%;animation:shim 1.3s linear infinite}@keyframes shim{to{background-position:-300% 0}}
.empty{background:var(--card);border:1px solid var(--ln);border-radius:18px;padding:30px;margin-top:14px;text-align:center}.empty h3{font:800 22px 'Bricolage Grotesque',sans-serif;margin:0 0 6px}.empty p{color:var(--mu)}
.errorBox{max-width:1560px;margin:12px auto;background:#fff1f2;border:1px solid #fecdd3;color:#9f1239;border-radius:14px;padding:14px 16px}
.loader{display:grid;place-items:center;gap:14px;padding:90px 0;color:var(--mu)}.spool{display:flex;gap:8px}.spool i{width:12px;height:12px;border-radius:50%;background:var(--cb);animation:bounce 1s infinite ease-in-out}.spool i:nth-child(2){animation-delay:.15s}.spool i:nth-child(3){animation-delay:.3s}@keyframes bounce{50%{transform:translateY(-10px);opacity:.4}}
.foot{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:34px;padding-top:16px;border-top:1px solid var(--ln);color:var(--mu);font-size:12px}
@media(max-width:1180px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:900px){.ticket{grid-template-columns:1fr}.tStub{border-left:0;border-top:2px dashed #ffffff55}.tStub:before{left:-13px;top:-14px}.tStub:after{left:auto;right:-13px;top:-14px;bottom:auto}}
@media(max-width:760px){.grid{grid-template-columns:1fr}.legend{grid-template-columns:1fr 1fr}
  .fmBack{background:#0c102066}.fmPop{position:fixed;left:8px;right:8px;bottom:8px;top:auto;width:auto;max-width:none;z-index:50;max-height:72vh;padding:14px}.fmList{max-height:48vh}.sheetClose{display:inline-block;background:var(--cb);color:#fff;border-color:var(--cb)}
  .search{max-width:none;flex-basis:100%}.rail{position:static}}
@media(max-width:520px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
`;
