"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
} from "react";
import { getSupabase } from "@/lib/supabase";


type InterestRow = { id: number; day_number: number; record_date: string; interest: number | null; increase: number | null };
type TicketRow = { id: number; day_number: number; record_date: string; tickets_sold: number | null; increase: number | null };
type TrackerConfig = { interest_start_date: string; booking_start_date: string | null; release_date: string | null };
type Point = { day: number; date: string; value: number; increase: number | null };
type ArchiveRow = { id: number; day: number; date: string; value: number | null; increase: number | null };

const formatDate = (s: string) =>
  s ? new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const number = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString("en-IN"));
const signed = (v: number | null | undefined) => (v == null ? "—" : (v >= 0 ? "+" : "") + v.toLocaleString("en-IN"));
const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

function daysBetween(start: string, end: string) {
  const a = new Date(start + "T00:00:00").getTime();
  const b = new Date(end + "T00:00:00").getTime();
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}

/* ---------- count-up numbers ---------- */
function useCountUp(target: number | null, delay: number) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (target == null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setN(target);
      return;
    }
    const start = from.current;
    let raf = 0;
    let t0 = 0;
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!t0) t0 = now;
        const p = Math.min(1, (now - t0) / 1500);
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        from.current = Math.round(start + (target - start) * e);
        setN(from.current);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, start === 0 ? delay : 0);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, delay]);
  return n;
}

function Counter({ value, prefix = "", delay = 0 }: { value: number | null; prefix?: string; delay?: number }) {
  const n = useCountUp(value, delay);
  return <>{value == null ? "—" : prefix + n.toLocaleString("en-IN")}</>;
}

/* ---------- film-reel chart with scrubber ---------- */
function ReelChart({ points, emptyTitle, emptyText }: { points: Point[]; emptyTitle: string; emptyText: string }) {
  const gid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const n = points.length;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [n > 0]);

  const geo = useMemo(() => {
    if (!n) return null;
    const vals = points.map((p) => p.value);
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals);
    const range = Math.max(max - min, 1);
    const xy = points.map((p, i) => ({ x: n === 1 ? 50 : (i / (n - 1)) * 100, y: 88 - ((p.value - min) / range) * 68 }));
    let d = n === 1 ? `M0,${xy[0].y} L100,${xy[0].y}` : `M${xy[0].x},${xy[0].y}`;
    for (let i = 1; i < n && n > 1; i++) {
      const a = xy[i - 1], b = xy[i], mx = (a.x + b.x) / 2;
      d += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
    }
    return { xy, d, area: d + " L100,100 L0,100 Z", max, min };
  }, [points, n]);

  if (!geo) {
    return (
      <div className="stub">
        <div>
          <p className="f-display text-3xl font-bold">{emptyTitle}</p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#A89B8B]">{emptyText}</p>
        </div>
      </div>
    );
  }

  const idx = hover ?? n - 1;
  const p = points[idx];
  const c = geo.xy[idx];
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(n === 1 ? 0 : Math.round(ratio * (n - 1)));
  };

  return (
    <div ref={rootRef} className="reel">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 pb-2 pt-10">
        <div>
          <p className="text-sm text-[#A89B8B]">
            {(hover == null ? "Latest: " : "") + "Day " + p.day + ", " + formatDate(p.date)}
          </p>
          <p className="f-display tnum mt-1 text-5xl font-bold md:text-6xl">{number(p.value)}</p>
        </div>
        <p className="text-sm font-medium text-[#E9C98A]">{p.increase == null ? "First record" : signed(p.increase) + " vs previous day"}</p>
      </div>

      <div
        className="plot-grid relative mx-6 mt-4 h-56 cursor-crosshair md:h-72"
        style={{ touchAction: "pan-y" }}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        onPointerCancel={() => setHover(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={"absolute inset-0 h-full w-full " + (seen ? "chart-reveal" : "opacity-0")} style={{ filter: "drop-shadow(0 0 7px rgba(233,201,138,.4))" }}>
          <defs>
            <linearGradient id={"f" + gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E9C98A" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#E9C98A" stopOpacity="0" />
            </linearGradient>
          </defs>
          {n > 1 && <path d={geo.area} fill={`url(#f${gid})`} />}
          <path d={geo.d} fill="none" stroke="#E9C98A" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {seen && <div className="xhair" style={{ left: c.x + "%" }} />}
        {seen && <div className="dot" style={{ left: c.x + "%", top: c.y + "%" }} />}
        <span className="absolute left-0 top-1 text-[11px] text-[#8E8173]">{number(geo.max)}</span>
        <span className="absolute bottom-1 left-0 text-[11px] text-[#8E8173]">{number(geo.min)}</span>
      </div>

      <div className="flex justify-between px-6 pb-9 pt-3 text-xs text-[#8E8173]">
        <span>Day 1</span>
        <span>Day {n}</span>
      </div>
    </div>
  );
}

/* ---------- archive table ---------- */
function ArchiveTable({ title, countText, valueHeader, rows, emptyText }: { title: string; countText: string; valueHeader: string; rows: ArchiveRow[]; emptyText: string }) {
  const maxInc = Math.max(1, ...rows.map((r) => r.increase ?? 0));
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-7">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-[#8E8173]">{countText}</p>
      </div>
      <div className="scroll-thin max-h-[560px] overflow-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead className="sticky top-0 z-10 bg-[#150B0E]/95 backdrop-blur-md">
            <tr className="border-b border-white/10 text-xs font-medium text-[#8E8173]">
              <th className="px-5 py-4 md:px-7">Day</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4 text-right">{valueHeader}</th>
              <th className="px-5 py-4 text-right">Daily increase</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-[#8E8173]">{emptyText}</td></tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id} className="group border-b border-white/[0.06] transition-colors hover:bg-[#E9C98A]/[0.05]">
                <td className="relative px-5 py-4 md:px-7">
                  <span className="absolute inset-y-2 left-0 w-[2px] origin-center scale-y-0 bg-[#E9C98A] transition-transform group-hover:scale-y-100" />
                  <span className="f-display tnum text-xl font-semibold">{String(r.day).padStart(2, "0")}</span>
                  {i === rows.length - 1 && <span className="ml-3 rounded-full bg-[#E9C98A]/15 px-2 py-0.5 text-[11px] font-medium text-[#E9C98A]">Latest</span>}
                </td>
                <td className="px-5 py-4 text-sm text-[#B5A898]">{formatDate(r.date)}</td>
                <td className="tnum px-5 py-4 text-right text-base font-semibold">{number(r.value)}</td>
                <td className="px-5 py-4 text-right">
                  <span className="tnum text-sm text-[#CFC3B3]">{r.increase == null ? "—" : signed(r.increase)}</span>
                  <span className="ml-auto mt-1.5 block h-[3px] w-24 overflow-hidden rounded bg-white/[0.07]">
                    <span className="block h-full rounded bg-[#E9C98A]" style={{ width: r.increase ? Math.max(4, (Math.max(0, r.increase) / maxInc) * 100) + "%" : "0%" }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} style={cssVars({ "--rd": delay + "ms" })}>{children}</div>;
}

function StatTile({ label, sub, accent, pending, children }: { label: string; sub: string; accent?: boolean; pending?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="stat"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", e.clientX - r.left + "px");
        e.currentTarget.style.setProperty("--my", e.clientY - r.top + "px");
      }}
    >
      <p className="text-sm text-[#A89B8B]">{label}</p>
      <p className="f-display tnum mt-2 text-5xl font-bold leading-none md:text-6xl">{pending ? <span className="sk" /> : children}</p>
      <p className={"mt-3 text-sm " + (accent ? "text-[#E9C98A]" : "text-[#8E8173]")}>{sub}</p>
    </div>
  );
}

function Fact({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border-t border-white/[0.12] pt-5">
      <p className="text-sm text-[#A89B8B]">{label}</p>
      <p className="f-display tnum mt-2 text-5xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-[#8E8173]">{sub}</p>
    </div>
  );
}

function SectionHead({ title, text, note }: { title: string; text: string; note?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="f-display text-5xl font-extrabold md:text-7xl">{title}</h2>
        <p className="mt-3 max-w-md text-[#A89B8B]">{text}</p>
      </div>
      {note && (
        <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2 text-sm text-[#A89B8B]">
          <span className="pulse" aria-hidden="true" />
          {note}
        </span>
      )}
    </div>
  );
}

const RULES = [
  { t: "Interest", d: "Starts on the tracker start date and adds one record every day." },
  { t: "Tickets", d: "Stay empty until the first official booking snapshot is recorded." },
  { t: "Increase", d: "Always the difference from the previous day's value." },
  { t: "Release", d: "Once a release date is set, daily records stop after that date." },
];

export default function BookMyShowTrackerPage() {
  const supabase = getSupabase();

  const [config, setConfig] = useState<TrackerConfig | null>(null);
  const [interestRows, setInterestRows] = useState<InterestRow[]>([]);
  const [ticketRows, setTicketRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("--");
  const heroRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function loadTracker() {
    setLoading(true);

    /*
     * IMPORTANT:
     * Do NOT call ensure_bookmyshow_interest_day() here.
     * This function only READS existing records.
     * New interest days are created by the 12:00 AM IST cron job.
     */
    const [{ data: configData }, { data: interestData }, { data: ticketData }] = await Promise.all([
      supabase.from("bookmyshow_tracker_config").select("*").eq("id", 1).maybeSingle(),
      supabase.from("bookmyshow_interest_daily").select("id,day_number,record_date,interest,increase").order("day_number", { ascending: true }),
      supabase.from("bookmyshow_ticket_daily").select("id,day_number,record_date,tickets_sold,increase").order("day_number", { ascending: true }),
    ]);

    setConfig(configData ?? null);
    setInterestRows((interestData ?? []) as InterestRow[]);
    setTicketRows((ticketData ?? []) as TicketRow[]);
    setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  }

  useEffect(() => {
    loadTracker();
    /* Refresh existing data every hour. Only reads; never creates a new day. */
    const timer = window.setInterval(loadTracker, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progressRef.current?.style.setProperty("transform", "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")");
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  const dust = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const r = (k: number) => {
          const x = Math.sin(i * 97.13 + k * 31.7) * 10000;
          return x - Math.floor(x);
        };
        const f = (v: number) => Number(v.toFixed(2));
        return { left: f(38 + r(1) * 60), top: f(r(2) * 90), size: f(1 + r(3) * 2.2), dur: f(7 + r(4) * 9), delay: f(-r(5) * 12), dx: f(-20 - r(6) * 50) };
      }),
    [],
  );

  const end = config?.release_date && config.release_date < today ? config.release_date : today;
  const interestDays = config ? daysBetween(config.interest_start_date, end) : 0;
  const bookingDays = config?.booking_start_date ? daysBetween(config.booking_start_date, end) : 0;

  const currentInterest = interestRows.at(-1)?.interest ?? null;
  const previousInterest = interestRows.length > 1 ? interestRows[interestRows.length - 2].interest : null;
  const interestIncrease = currentInterest != null && previousInterest != null ? currentInterest - previousInterest : null;

  const currentTickets = ticketRows.at(-1)?.tickets_sold ?? null;
  const previousTickets = ticketRows.length > 1 ? ticketRows[ticketRows.length - 2].tickets_sold : null;
  const ticketIncrease = currentTickets != null && previousTickets != null ? currentTickets - previousTickets : null;

  const interestPoints: Point[] = interestRows.filter((r) => r.interest != null).map((r) => ({ day: r.day_number, date: r.record_date, value: r.interest as number, increase: r.increase }));
  const ticketPoints: Point[] = ticketRows.filter((r) => r.tickets_sold != null).map((r) => ({ day: r.day_number, date: r.record_date, value: r.tickets_sold as number, increase: r.increase }));

  return (
    <main className="raaka relative min-h-screen overflow-x-hidden bg-[#0E0709] text-[#F4ECDD]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lb lb-top" aria-hidden="true" />
      <div className="lb lb-bot" aria-hidden="true" />
      <div className="progress" ref={progressRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="ambient" aria-hidden="true" />

      {/* HERO */}
      <header
        ref={heroRef}
        className="relative isolate overflow-hidden"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
          e.currentTarget.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
        }}
      >
        <div className="beam-wrap" aria-hidden="true">
          <div className="beam-origin" />
          <div className="hero-orb" />
          <div className="beam" />
          <div className="hero-horizon" />
          {dust.map((d, i) => (
            <span key={i} className="dust" style={cssVars({ left: d.left + "%", top: d.top + "%", width: d.size, height: d.size, animationDuration: d.dur + "s", animationDelay: d.delay + "s", "--dx": d.dx + "px" })} />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 pb-10 pt-8 md:px-10 md:pt-10">
          <div className="rise flex items-center justify-between gap-4" style={cssVars({ "--d": "-0.9s" })}>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-[#CFC3B3] backdrop-blur transition hover:border-[#E9C98A]/60 hover:text-[#F4ECDD]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              Back to RAAKA
            </Link>
            <span className="ml-auto inline-flex min-w-0 max-w-[58vw] items-center gap-2.5 truncate text-sm text-[#A89B8B]">
              <span className="pulse" aria-hidden="true" />
              {lastRefresh === "--" ? "Connecting" : "Refreshed at " + lastRefresh}
            </span>
          </div>

          <div className="mt-auto pt-28">
            <p className="rise text-lg font-medium text-[#E9C98A] md:text-xl" style={cssVars({ "--d": "0s" })}>BookMyShow tracker</p>
            <h1 className="title f-display mt-2 select-none font-black uppercase" aria-label="RAAKA">
              {"RAAKA".split("").map((ch, i) => (
                <span key={i} aria-hidden="true" className="letter" style={cssVars({ "--i": i })}>{ch}</span>
              ))}
            </h1>
            <div className="title-line mt-6 w-full max-w-xl" />
            <p className="rise mt-6 max-w-xl text-base leading-7 text-[#B5A898] md:text-lg" style={cssVars({ "--d": "0.9s" })}>
              A daily record of interest in RAAKA on BookMyShow. When booking opens, ticket sales are tracked day by day too.
            </p>
          </div>

          <div className="stats rise mt-12" style={cssVars({ "--d": "1.2s" })}>
            <StatTile label="Interest day" sub="Counts up automatically" pending={loading && !config}>
              <Counter value={config ? interestDays : null} prefix="Day " delay={1700} />
            </StatTile>
            <StatTile label="Current interest" sub={interestIncrease == null ? "Waiting for data" : signed(interestIncrease) + " today"} accent={interestIncrease != null} pending={loading && !interestRows.length}>
              <Counter value={currentInterest} delay={1820} />
            </StatTile>
            <StatTile label="Booking day" sub={config?.booking_start_date ? "Booking is open" : "Booking has not started"} pending={loading && !config}>
              <Counter value={config?.booking_start_date ? bookingDays : null} prefix="Day " delay={1940} />
            </StatTile>
            <StatTile label="Tickets sold" sub={ticketIncrease == null ? "Waiting for booking data" : signed(ticketIncrease) + " today"} accent={ticketIncrease != null} pending={loading && !ticketRows.length}>
              <Counter value={currentTickets} delay={2060} />
            </StatTile>
          </div>
        </div>
      </header>

      {/* INTEREST */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-8 pt-24 md:px-10">
        <Reveal className="section-shell">
        <SectionHead title="BookMyShow interest" text="How many people marked interest in RAAKA, recorded once a day." note="Updates every 24 hours" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <ReelChart points={interestPoints} emptyTitle="Waiting for the first record" emptyText="The chart fills in automatically as daily records arrive." />
          <div className="flex flex-col justify-between gap-8">
            <Fact label="Daily increase" value={signed(interestIncrease)} sub="Compared with the previous day" />
            <Fact label="Tracking started" value={config ? formatDate(config.interest_start_date) : "—"} sub="Day 1 is created from this date" />
          </div>
        </div>
        <ArchiveTable
          title="Daily interest archive"
          countText={interestRows.length + " records"}
          valueHeader="Interest count"
          emptyText="No interest records yet."
          rows={interestRows.map((r) => ({ id: r.id, day: r.day_number, date: r.record_date, value: r.interest, increase: r.increase }))}
        />
        </Reveal>
      </section>

      {/* TICKETS */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-24 md:px-10">
        <Reveal className="section-shell" delay={80}>
        <SectionHead title="Ticket bookings" text="Tickets sold per day, from the first day booking opens." note={config?.booking_start_date ? "Booking is open" : undefined} />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <ReelChart points={ticketPoints} emptyTitle="Booking hasn't opened yet" emptyText="Ticket Day 1 appears here automatically after the first official sales snapshot." />
          <div className="flex flex-col justify-between gap-8">
            <Fact label="Daily increase" value={signed(ticketIncrease)} sub="Compared with the previous day" />
            <Fact label="Booking started" value={config?.booking_start_date ? formatDate(config.booking_start_date) : "—"} sub={config?.booking_start_date ? "Day 1 to Day " + bookingDays : "Waiting for booking"} />
          </div>
        </div>
        <ArchiveTable
          title="Ticket booking archive"
          countText={ticketRows.length + " days"}
          valueHeader="Tickets sold"
          emptyText="Booking has not started. Ticket Day 1 will appear automatically."
          rows={ticketRows.map((r) => ({ id: r.id, day: r.day_number, date: r.record_date, value: r.tickets_sold, increase: r.increase }))}
        />
        </Reveal>
      </section>

      {/* HOW IT COUNTS */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-10">
        <Reveal className="section-shell" delay={120}>
        <h3 className="f-display max-w-3xl text-4xl font-extrabold md:text-6xl">Built for the full RAAKA run.</h3>
        <div className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {RULES.map((r) => (
            <div key={r.t} className="border-t border-dashed border-white/25 pt-5">
              <p className="f-display text-2xl font-bold text-[#E9C98A]">{r.t}</p>
              <p className="mt-2 text-sm leading-6 text-[#A89B8B]">{r.d}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-16 max-w-2xl text-center text-xs leading-5 text-[#8E8173]">
          Figures appear only when an authorized or public data source is connected. This page does not invent BookMyShow numbers.
        </p>
        </Reveal>
      </section>
    </main>
  );
}

const CSS = `
.raaka{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.f-display{font-family:"Arial Narrow",Impact,Haettenschweiler,ui-sans-serif,sans-serif;font-stretch:condensed}
.tnum{font-variant-numeric:tabular-nums}
.raaka a:focus-visible{outline:2px solid #E9C98A;outline-offset:3px}
.scroll-thin{scrollbar-width:thin;scrollbar-color:rgba(233,201,138,.3) transparent}

.lb{position:fixed;left:0;right:0;height:50vh;background:#000;z-index:70;pointer-events:none;animation:lbOpen 1.5s cubic-bezier(.77,0,.18,1) .35s forwards}
.lb-top{top:0;transform-origin:top}.lb-bot{bottom:0;transform-origin:bottom}
.lb::after{content:"";position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#E9C98A,transparent)}
.lb-top::after{bottom:0}.lb-bot::after{top:0}
@keyframes lbOpen{to{transform:scaleY(0)}}

.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:65;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#A3203A,#E9C98A)}
.grain{position:fixed;top:-50%;left:-50%;width:200%;height:200%;z-index:60;pointer-events:none;opacity:.08;mix-blend-mode:overlay;animation:grain .9s steps(6) infinite;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
@keyframes grain{0%,100%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-5%)}60%{transform:translate(-5%,-2%)}80%{transform:translate(4%,4%)}}
.ambient{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 0% 100%,rgba(163,32,58,.28),transparent 55%),radial-gradient(ellipse at 100% 0%,rgba(163,32,58,.12),transparent 50%),radial-gradient(ellipse at 50% 45%,transparent 50%,rgba(0,0,0,.5) 100%)}

.beam-wrap{position:absolute;inset:0;overflow:hidden;pointer-events:none;animation:fadeIn 2.2s ease 1.2s both}
.beam{position:absolute;top:-6%;right:-4%;width:78%;height:112%;clip-path:polygon(86% 0,100% 0,34% 100%,0 100%);background:linear-gradient(to bottom left,rgba(255,226,170,.42),rgba(255,226,170,.1) 55%,transparent 85%);filter:blur(10px);mix-blend-mode:screen;animation:flicker 5s linear infinite;transform:translate3d(calc(var(--px,0)*-16px),calc(var(--py,0)*-10px),0);transition:transform .6s ease-out}
.beam-origin{position:absolute;top:-10%;right:-5%;width:360px;height:360px;background:radial-gradient(circle,rgba(255,236,200,.55),transparent 65%);filter:blur(18px)}
@keyframes flicker{0%,100%{opacity:1}7%{opacity:.88}9%{opacity:1}43%{opacity:.94}46%{opacity:.82}48%{opacity:1}78%{opacity:.92}}
.dust{position:absolute;border-radius:9999px;background:#FFE9BE;opacity:0;animation:drift 10s linear infinite}
@keyframes drift{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.75}100%{transform:translate3d(var(--dx),-90px,0);opacity:0}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

.rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(1.3s + var(--d,0s))}
@keyframes rise{from{opacity:0;transform:translate3d(0,26px,0);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.title{position:relative;display:flex;width:100%;justify-content:flex-start;white-space:nowrap;overflow:visible;font-size:clamp(4.75rem,18vw,18rem);line-height:.78;letter-spacing:-.025em;filter:drop-shadow(0 18px 42px rgba(0,0,0,.32))}
.letter{position:relative;display:inline-block;padding:0 .018em;background:linear-gradient(180deg,#FFF7E2 8%,#EBCB8E 52%,#A9743A 100%);-webkit-background-clip:text;background-clip:text;color:transparent;animation:letterIn 1.2s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(1.15s + var(--i)*.1s)}
@keyframes letterIn{from{opacity:0;filter:blur(20px);transform:translate3d(0,44px,0) scale(1.12)}to{opacity:1;filter:blur(0);transform:none}}
.letter::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.8) 49%,transparent 63%);-webkit-mask:linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0);transform:translateX(-150%);opacity:.45;animation:letterShine 7s cubic-bezier(.2,.65,.2,1) 3.2s infinite}
@keyframes letterShine{0%,62%{transform:translateX(-150%)}78%,100%{transform:translateX(150%)}}
.title-line{height:1px;transform-origin:left;background:linear-gradient(90deg,#E9C98A,transparent);animation:lineIn 1.4s ease 2s both}
@keyframes lineIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}

.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid rgba(244,236,221,.12)}
.stat{position:relative;padding:1.4rem 1.25rem 1.5rem;border-bottom:1px solid rgba(244,236,221,.12);overflow:hidden}
.stat:nth-child(even){border-left:1px solid rgba(244,236,221,.12)}
.stat::before{content:"";position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .4s;background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(233,201,138,.15),transparent 70%)}
.stat:hover::before{opacity:1}
@media(min-width:1024px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}.stat{border-bottom:0}.stat:not(:first-child){border-left:1px solid rgba(244,236,221,.12)}}

.pulse{position:relative;display:inline-block;width:8px;height:8px;border-radius:9999px;background:#E9C98A}
.pulse::after{content:"";position:absolute;inset:0;border-radius:inherit;background:inherit;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{75%,100%{transform:scale(2.8);opacity:0}}
.sk{display:inline-block;height:.8em;width:4ch;border-radius:6px;background:linear-gradient(90deg,rgba(244,236,221,.06),rgba(244,236,221,.18),rgba(244,236,221,.06));background-size:200% 100%;animation:sk 1.4s linear infinite}
@keyframes sk{to{background-position:-200% 0}}

.reel{position:relative;overflow:hidden;border:1px solid rgba(244,236,221,.12);border-radius:20px;background:linear-gradient(180deg,rgba(244,236,221,.045),rgba(244,236,221,.012))}
.reel::before,.reel::after{content:"";position:absolute;left:0;right:0;height:16px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='16'%3E%3Crect x='9' y='4' width='12' height='8' rx='2' fill='%23F4ECDD' fill-opacity='.11'/%3E%3C/svg%3E") repeat-x}
.reel::before{top:2px}.reel::after{bottom:2px}
.plot-grid{background-image:linear-gradient(to bottom,rgba(244,236,221,.07) 1px,transparent 1px);background-size:100% 25%;border-bottom:1px solid rgba(244,236,221,.12)}
.chart-reveal{animation:reveal 1.8s cubic-bezier(.65,0,.2,1) both}
@keyframes reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.xhair{position:absolute;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,transparent,rgba(233,201,138,.5),rgba(233,201,138,.1));transition:left .08s linear;animation:fadeIn .6s ease 1.6s both}
.dot{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:9999px;background:#FFF3D6;box-shadow:0 0 0 3px rgba(233,201,138,.35),0 0 18px 4px rgba(233,201,138,.6);transition:left .08s linear,top .08s linear;animation:fadeIn .6s ease 1.6s both}
.dot::after{content:"";position:absolute;inset:-4px;border-radius:inherit;border:1px solid #E9C98A;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}

.stub{position:relative;display:flex;min-height:20rem;align-items:center;justify-content:center;padding:2.5rem 1.5rem;text-align:center;border:1px dashed rgba(244,236,221,.22);border-radius:20px}
.stub::before,.stub::after{content:"";position:absolute;top:50%;width:26px;height:26px;margin-top:-13px;border-radius:9999px;background:#0E0709;border:1px dashed rgba(244,236,221,.22)}
.stub::before{left:-14px}.stub::after{right:-14px}


/* ---------- cinematic motion system ---------- */
.reveal{opacity:0;transform:translate3d(0,42px,0) scale(.985);filter:blur(8px);transition:opacity .95s cubic-bezier(.2,.7,.2,1),transform 1.05s cubic-bezier(.2,.7,.2,1),filter 1.05s ease;transition-delay:var(--rd,0ms)}
.reveal.is-visible{opacity:1;transform:none;filter:none}
.section-shell{width:100%}
.hero-orb{position:absolute;top:8%;right:10%;width:clamp(140px,18vw,300px);height:clamp(140px,18vw,300px);border-radius:50%;background:radial-gradient(circle,rgba(255,239,199,.42) 0,rgba(233,201,138,.13) 22%,transparent 67%);filter:blur(3px);opacity:.72;animation:orbBreath 5s ease-in-out infinite;transform:translate3d(calc(var(--px,0)*-22px),calc(var(--py,0)*-18px),0)}
.hero-orb::before{content:"";position:absolute;inset:15%;border:1px solid rgba(233,201,138,.18);border-radius:50%;animation:orbRing 8s linear infinite}
.hero-orb::after{content:"";position:absolute;inset:30%;border-radius:50%;box-shadow:0 0 80px rgba(233,201,138,.16);animation:orbCore 2.8s ease-in-out infinite}
@keyframes orbBreath{0%,100%{transform:translate3d(calc(var(--px,0)*-22px),calc(var(--py,0)*-18px),0) scale(.92);opacity:.55}50%{transform:translate3d(calc(var(--px,0)*-22px),calc(var(--py,0)*-18px),0) scale(1.08);opacity:.82}}
@keyframes orbRing{to{transform:rotate(360deg)}}
@keyframes orbCore{50%{transform:scale(1.25);opacity:.5}}
.hero-horizon{position:absolute;left:-10%;right:-10%;bottom:21%;height:1px;background:linear-gradient(90deg,transparent,rgba(233,201,138,.18),transparent);filter:blur(.2px);animation:horizonPulse 5s ease-in-out infinite}
@keyframes horizonPulse{0%,100%{opacity:.15;transform:scaleX(.6)}50%{opacity:.65;transform:scaleX(1)}}
/* ---------- premium cinematic layer ---------- */
.raaka{isolation:isolate}
.raaka::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 50% 18%,rgba(233,201,138,.055),transparent 32%),linear-gradient(180deg,rgba(255,255,255,.012),transparent 20%);mix-blend-mode:screen}
.raaka>header,.raaka>section{position:relative}
header::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 55%,#0E0709 100%);opacity:.72}
.beam-wrap{transform:translateZ(0)}
.beam::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,247,220,.2) 48%,transparent 61%);transform:translateX(-120%);animation:cinematicSweep 8s cubic-bezier(.2,.6,.2,1) 2.5s infinite}
@keyframes cinematicSweep{0%,58%{transform:translateX(-120%)}78%,100%{transform:translateX(120%)}}
.stats{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(255,255,255,.018),transparent)}
.stats::after{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#E9C98A,transparent);transform:scaleX(.18);transform-origin:center;animation:statsLine 5s ease-in-out infinite}
@keyframes statsLine{0%,100%{opacity:.35;transform:scaleX(.18)}50%{opacity:.8;transform:scaleX(.7)}}
.stat{transition:background .45s ease,transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s ease}
.stat:hover{transform:translateY(-5px);background:rgba(233,201,138,.025);box-shadow:inset 0 -1px 0 rgba(233,201,138,.25),0 16px 45px rgba(0,0,0,.18)}
.stat::after{content:"";position:absolute;top:0;bottom:0;left:-55%;width:35%;background:linear-gradient(90deg,transparent,rgba(255,247,220,.08),transparent);transform:skewX(-18deg);animation:statSweep 8s ease-in-out infinite}
@keyframes statSweep{0%,65%{left:-55%}82%,100%{left:125%}}
.reel{box-shadow:0 20px 80px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.035);transition:transform .5s cubic-bezier(.2,.7,.2,1),border-color .4s ease,box-shadow .5s ease}
.reel:hover{transform:translateY(-4px);border-color:rgba(233,201,138,.24);box-shadow:0 28px 90px rgba(0,0,0,.34),0 0 40px rgba(233,201,138,.035),inset 0 1px 0 rgba(255,255,255,.055)}
.reel::after{opacity:.7}
.plot-grid::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 70% 30%,rgba(233,201,138,.08),transparent 34%);opacity:0;transition:opacity .5s ease}
.reel:hover .plot-grid::after{opacity:1}
.scroll-thin{overscroll-behavior:contain}
.scroll-thin table tbody tr{transition:background .3s ease,transform .3s ease}
.scroll-thin table tbody tr:hover{transform:translateX(3px);box-shadow:inset 0 1px 0 rgba(233,201,138,.08),inset 0 -1px 0 rgba(233,201,138,.05)}
.scroll-thin table tbody tr td:last-child span:last-child{transition:width .8s cubic-bezier(.2,.7,.2,1)}
section .border-dashed{transition:transform .45s ease,border-color .45s ease}
section .border-dashed:hover{transform:translateY(-4px);border-color:rgba(233,201,138,.34)}
.stub{background:radial-gradient(circle at center,rgba(233,201,138,.035),transparent 52%);box-shadow:inset 0 0 70px rgba(0,0,0,.18)}
section{scroll-margin-top:20px}

@media(max-width:767px){
  .lb{height:38vh}
  .grain{opacity:.045}
  .ambient{background:radial-gradient(ellipse at 0% 80%,rgba(163,32,58,.2),transparent 60%),radial-gradient(ellipse at 100% 10%,rgba(163,32,58,.08),transparent 52%),radial-gradient(ellipse at 50% 45%,transparent 48%,rgba(0,0,0,.62) 100%)}
  header .min-h-\[100svh\]{min-height:100svh}
  .title{font-size:clamp(4rem,16.2vw,8rem);letter-spacing:-.025em;line-height:.82}
  .hero-orb{top:10%;right:-10%;opacity:.38}
  .hero-horizon{bottom:26%}
  .letter{animation-duration:.9s}
  .stats{margin-top:2.5rem}
  .stat{padding:1.05rem .9rem 1.15rem}
  .stat p:first-child{font-size:.72rem;letter-spacing:.02em}
  .stat .f-display{font-size:2.45rem}
  .stat p:last-child{font-size:.72rem;line-height:1.35}
  .reel{border-radius:16px}
  .reel .px-6{padding-left:1rem;padding-right:1rem}
  .reel .h-56{height:13.5rem}
  .reel .text-5xl{font-size:2.65rem}
  .plot-grid{margin-left:1rem;margin-right:1rem}
  .section-head{}
  .stub{min-height:15rem}
  section{padding-top:4.5rem;padding-bottom:4.5rem}
  section > .grid{gap:1.25rem}
  .scroll-thin{margin-left:-.25rem;margin-right:-.25rem}
  .scroll-thin table{min-width:610px}
}
@media(min-width:768px) and (max-width:1023px){
  .title{font-size:clamp(7rem,17vw,13rem)}
  .stats{grid-template-columns:repeat(4,minmax(0,1fr))}
  .stat:not(:first-child){border-left:1px solid rgba(244,236,221,.12)}
  .stat{border-bottom:0}
}
@media(min-width:1280px){
  .title{letter-spacing:.02em}
  .beam{filter:blur(12px)}
}

@media (prefers-reduced-motion:reduce){
.lb,.grain{display:none}
.rise,.letter,.title-line,.chart-reveal,.dot,.xhair,.beam-wrap,.beam,.dust,.pulse::after,.dot::after,.hero-orb,.hero-horizon,.letter::after,.stat::after,.stats::after{animation:none!important}
.dust{opacity:.5}
}
`;
