"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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
const DATA_URL = "/scan-latest.json";
const MOVIE_NAME = "Ramayana";
const number = (n: unknown) => Number(n || 0);
const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
const money = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${fmt(n)}`;
const pct = (a: number, b: number) => b ? (a / b) * 100 : 0;
const unique = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a,b) => a.localeCompare(b));
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Puducherry","Chandigarh","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep"
];
const stateFromAddress = (address = "") => {
  const parts = address.split(",").map(part => part.replace(/\b\d{6}\b/g, "").trim()).filter(Boolean);
  const searchable = parts.join(" ").toLowerCase();
  return INDIAN_STATES.find(state => searchable.includes(state.toLowerCase())) || "Unknown";
};
const splitFormats = (s = "") => s.split(",").map(x => x.trim()).filter(Boolean);
const formatEntries = (t: Theatre) => t.formatBreakdown && Object.keys(t.formatBreakdown).length
  ? Object.entries(t.formatBreakdown)
  : splitFormats(t.format).map(name => [name, { shows: 0, capacity: 0, available: 0, booked: 0, value: 0 }] as const);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Floating embers behind the whole page */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c || reduced()) return;
    const x = c.getContext("2d"); if (!x) return;
    let w = 0, h = 0, raf = 0;
    const ps = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .4, s: Math.random() * .0006 + .00015, d: Math.random() * 6.28, a: Math.random() * .6 + .3 }));
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    size(); addEventListener("resize", size);
    const loop = (t: number) => {
      x.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.s; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
        x.beginPath(); x.shadowBlur = 12; x.shadowColor = "#ff8a30";
        x.fillStyle = `rgba(255,${(150 + p.a * 80) | 0},70,${p.a * (.25 + .75 * p.y)})`;
        x.arc((p.x + Math.sin(t / 1800 + p.d) * .015) * w, p.y * h, p.r, 0, 6.283); x.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="embers" aria-hidden="true" />;
}

/* Number that counts up smoothly */
function Count({ to, format = fmt }: { to: number; format?: (n: number) => string }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (reduced()) { setV(to); return; }
    const from = prev.current, s = performance.now(); let raf = 0;
    const f = (t: number) => {
      const p = Math.min(1, (t - s) / 1200), val = from + (to - from) * (1 - Math.pow(1 - p, 4));
      setV(val); prev.current = val; if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{format(v)}</>;
}

function BarList({ rows, valueLabel = (n: number) => fmt(n), maxRows = 5, expandLabel = "Show more" }: {
  rows: { name: string; value: number; detail?: string }[];
  valueLabel?: (n: number) => string; maxRows?: number; expandLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, maxRows);
  const max = Math.max(1, ...rows.map(r => r.value));
  return <><div className="barList">{visible.map((r, i) => <div className="barRow" key={r.name}>
    <div className="barTop"><span title={r.name}>{r.name}</span><b>{valueLabel(r.value)}</b></div>
    {r.detail ? <small className="barDetail">{r.detail}</small> : null}
    <div className="barTrack"><i style={{ width: `${Math.max(r.value ? 1.5 : 0, r.value / max * 100)}%`, "--d": `${i * 90}ms` } as CSSProperties} /></div>
  </div>)}</div>{rows.length > maxRows && <button className="expandRows" onClick={() => setExpanded(v => !v)}>{expanded ? "Show less" : `${expandLabel} (${rows.length - maxRows} more)`}</button>}</>;
}

export default function AdvanceBookingPage() {
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [city, setCity] = useState("All cities");
  const [date, setDate] = useState("All dates");
  const [language, setLanguage] = useState("All languages");
  const [format, setFormat] = useState("All formats");

  useEffect(() => {
    let active = true;
    fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error(`Could not load ${DATA_URL} (${r.status})`); return r.json(); })
      .then((json: unknown) => { if (active) setData(json as ScanData); })
      .catch(e => { if (active) setError(e.message || "Unable to load data"); });
    return () => { active = false; };
  }, []);

  // Cursor-following golden spotlight on every .glow surface
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".glow") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", move);
    return () => document.removeEventListener("pointermove", move);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll(".rv:not(.in)");
    if (reduced() || !("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [data]);

  const all = data?.theatres || [];
  const cities = useMemo(() => unique(all.map(x => x.city)), [all]);
  const dates = useMemo(() => unique(all.map(x => x.date)), [all]);
  const languages = useMemo(() => unique(all.map(x => x.language)), [all]);
  const formats = useMemo(() => unique(all.flatMap(x => formatEntries(x).map(([name]) => name))), [all]);

  const filtered = useMemo(() => all.filter(t =>
    (city === "All cities" || t.city === city) &&
    (date === "All dates" || t.date === date) &&
    (language === "All languages" || t.language === language) &&
    (format === "All formats" || formatEntries(t).some(([name]) => name === format))
  ), [all,city,date,language,format]);

  const stats = useMemo(() => {
    const capacity = filtered.reduce((s,t)=>s+number(t.capacity),0);
    const available = filtered.reduce((s,t)=>s+number(t.available),0);
    const booked = filtered.reduce((s,t)=>s+number(t.booked ?? t.unavailable),0);
    const value = filtered.reduce((s,t)=>s+number(t.unavailableValue),0);
    const shows = filtered.reduce((s,t)=>s+number(t.scannedSessions),0);
    const cinemas = new Set(filtered.map(t=>`${t.city.toLowerCase()}|${t.cinemaId || t.name.toLowerCase()}`)).size;
    const cityCount = new Set(filtered.map(t=>t.city)).size;
    return {capacity,available,booked,value,shows,cinemas,cityCount,occupancy:pct(booked,capacity)};
  },[filtered]);

  const aggregate = (key: "language"|"city"|"chain"|"state"|"date") => {
    const map = new Map<string,{booked:number;available:number;capacity:number;shows:number;value:number;theatres:Set<string>;cities:Set<string>}>();
    filtered.forEach(t=>{
      const name = key==="state" ? stateFromAddress(t.address) : key==="chain" ? (t.chain || "Other") : String(t[key] || "Unknown");
      const v=map.get(name)||{booked:0,available:0,capacity:0,shows:0,value:0,theatres:new Set<string>(),cities:new Set<string>()};
      v.booked+=number(t.booked ?? t.unavailable);
      v.available+=number(t.available);
      v.capacity+=number(t.capacity);
      v.shows+=number(t.scannedSessions);
      v.value+=number(t.unavailableValue);
      v.theatres.add(`${t.city.toLowerCase()}|${t.cinemaId || t.name.toLowerCase()}`);
      v.cities.add(t.city);
      map.set(name,v);
    });
    return [...map.entries()].map(([name,v])=>({
      name,
      detail:`${fmt(v.shows)} shows · ${fmt(v.theatres.size)} theatres · ${money(v.value)} · ${pct(v.booked,v.capacity).toFixed(1)}%`,
      shows:v.shows, theatres:v.theatres.size, capacity:v.capacity, available:v.available, booked:v.booked, value:v.value
    })).sort((a,b)=>b.value-a.value);
  };

  const languageRows = useMemo(()=>aggregate("language"),[filtered]);
  const cityRows = useMemo(()=>aggregate("city"),[filtered]);
  const chainRows = useMemo(() => {
    const map = new Map<string,{booked:number;available:number;capacity:number;shows:number;value:number;theatres:Set<string>} >();
    filtered.forEach(t => {
      const raw = (t.chain || "Other").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const key = /pvr|inox|cinepolis/.test(raw) ? "PVR + INOX + Cinepolis" : /moviemax/.test(raw) ? "Movie Max" : /rajhans/.test(raw) ? "Rajhans" : (t.chain || "Other");
      const v = map.get(key) || {booked:0,available:0,capacity:0,shows:0,value:0,theatres:new Set<string>()};
      v.booked += number(t.booked ?? t.unavailable); v.available += number(t.available); v.capacity += number(t.capacity);
      v.shows += number(t.scannedSessions); v.value += number(t.unavailableValue);
      v.theatres.add(`${t.city.toLowerCase()}|${t.cinemaId || t.name.toLowerCase()}`); map.set(key,v);
    });
    const preferred = ["PVR + INOX + Cinepolis","Movie Max","Rajhans"];
    return [...map.entries()].map(([name,v])=>({name,value:v.booked,detail:`${fmt(v.shows)} shows · ${fmt(v.theatres.size)} theatres · ${money(v.value)} · ${pct(v.booked,v.capacity).toFixed(1)}%`}))
      .sort((a,b)=>{const ai=preferred.indexOf(a.name),bi=preferred.indexOf(b.name); if(ai>=0||bi>=0) return (ai<0?99:ai)-(bi<0?99:bi); return b.value-a.value;});
  },[filtered]);
  const stateRows = useMemo(()=>aggregate("state").filter(x=>x.name!=="Unknown"),[filtered]);
  const dateRows = useMemo(()=>aggregate("date"),[filtered]);

  const formatRows = useMemo(() => {
    const map = new Map<string,{booked:number;shows:number;value:number;capacity:number;available:number;theatres:Set<string>}>();
    filtered.forEach(t=>formatEntries(t).forEach(([name,raw])=>{
      const v=map.get(name)||{booked:0,shows:0,value:0,capacity:0,available:0,theatres:new Set<string>()};
      v.booked+=number(raw.booked); v.shows+=number(raw.shows); v.value+=number(raw.value);
      v.capacity+=number(raw.capacity); v.available+=number(raw.available);
      v.theatres.add(`${t.city.toLowerCase()}|${t.cinemaId || t.name.toLowerCase()}`); map.set(name,v);
    }));
    return [...map.entries()].map(([name,v])=>({name,value:v.booked,detail:`${fmt(v.shows)} shows · ${fmt(v.theatres.size)} theatres · ${money(v.value)} · ${pct(v.booked,v.capacity).toFixed(1)}%`})).sort((a,b)=>b.value-a.value);
  },[filtered]);

  const lastUpdated = data?.lastCapture ? new Date(data.lastCapture).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}) : "";
  const CIRC = 2 * Math.PI * 62;

  return <><style>{styles}</style><Embers /><main className="abPage">
    <header className="topbar">
      <div className="brand">
        <svg className="sun" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="8" /><g>{Array.from({ length: 12 }, (_, i) => <line key={i} x1="24" y1="4" x2="24" y2="10" transform={`rotate(${i * 30} 24 24)`} />)}</g></svg>
        <div className="brandTitle">WORLD OF RAAKA <span>TRACKER</span></div>
      </div>
    </header>

    <section className="movieHero">
      <div className="halo" aria-hidden="true"><i /><i /><i /></div>
      <h1 aria-label={MOVIE_NAME}>{[...MOVIE_NAME].map((ch, i) => <span key={i} aria-hidden="true" style={{ "--i": i } as CSSProperties}>{ch}</span>)}</h1>
      <p>National advance booking overview</p>
      {data && <div className="heroMeta">{lastUpdated && <span>Updated {lastUpdated}</span>}<span>{fmt(data.totals?.cities || cities.length)} cities</span></div>}
    </section>

    {error && <div className="errorBox">Data load nahi ho paya · {error}<br/><small>Place scan-latest.json in the public folder of this Next.js app.</small></div>}
    {!data && !error && <div className="loader"><i /><i /><i /></div>}

    {data && <>
      <section className="kpiGrid">
        <article className="kpi glow occupancyCard rv"><div className="kpiLabel">Occupancy</div>
          <div className="ring"><svg viewBox="0 0 150 150"><defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe3a3"/><stop offset=".55" stopColor="#f0a53c"/><stop offset="1" stopColor="#ff5a2a"/></linearGradient></defs>
            <circle cx="75" cy="75" r="62" className="rt"/><circle cx="75" cy="75" r="62" className="rf" style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - Math.min(100, stats.occupancy) / 100), "--c": CIRC } as CSSProperties}/></svg>
            <div><b><Count to={stats.occupancy} format={n => `${n.toFixed(1)}%`}/></b><small>Booked / capacity</small></div></div></article>
        <Kpi label="Languages found" value={<Count to={new Set(filtered.map(t=>t.language)).size}/>} sub={`${languages.length} available`} tone="a1"/>
        <Kpi label="Total shows" value={<Count to={stats.shows}/>} sub={`${fmt(stats.cinemas)} cinemas`} tone="a2"/>
        <Kpi label="Total capacity" value={<Count to={stats.capacity}/>} sub="Seats in current view" tone="a3"/>
        <Kpi label="Available" value={<Count to={stats.available}/>} sub="Open seats" tone="a1"/>
        <Kpi label="Booked" value={<Count to={stats.booked}/>} sub="Capacity − available" tone="a4"/>
        <Kpi label="Est. collection" value={<Count to={stats.value} format={money}/>} sub="Estimated booked value" tone="a5"/>
      </section>

      <section className="filters rv">
        <select value={city} onChange={e=>setCity(e.target.value)}><option>All cities</option>{cities.map(x=><option key={x}>{x}</option>)}</select>
        <select value={date} onChange={e=>setDate(e.target.value)}><option>All dates</option>{dates.map(x=><option key={x}>{x}</option>)}</select>
        <select value={language} onChange={e=>setLanguage(e.target.value)}><option>All languages</option>{languages.map(x=><option key={x}>{x}</option>)}</select>
        <select value={format} onChange={e=>setFormat(e.target.value)}><option>All formats</option>{formats.map(x=><option key={x}>{x}</option>)}</select>
        <button onClick={()=>{setCity("All cities");setDate("All dates");setLanguage("All languages");setFormat("All formats");}}>Clear filters</button>
      </section>

      <section className="reportGrid">
        <Panel title="Language-wise" hint="Booked seats"><BarList rows={languageRows} valueLabel={fmt}/></Panel>
        <Panel title="Format-wise" hint="Booked seats by format"><BarList rows={formatRows} valueLabel={fmt}/></Panel>
        <Panel title="State-wise" hint="Top 5 states, rest under More"><BarList rows={stateRows} valueLabel={fmt} maxRows={5}/></Panel>
        <Panel title="City-wise" hint="Top 5 cities, rest under More"><BarList rows={cityRows} valueLabel={fmt} maxRows={5}/></Panel>
        <Panel title="Cinema chain-wise" hint="PVR + INOX + Cinepolis, Movie Max, Rajhans"><BarList rows={chainRows} valueLabel={fmt} maxRows={3} expandLabel="More chains"/></Panel>
        <Panel title="Date-wise" hint="Booked seats by show date"><BarList rows={dateRows} valueLabel={fmt}/></Panel>
      </section>

      <section className="summaryNote glow rv">
        <div className="sectionHead"><div><h2>Booking analysis overview</h2><p>All figures are grouped and consolidated across {fmt(filtered.length)} records.</p></div></div>
        <div className="summaryChips"><span>{fmt(stats.cityCount)} cities</span><span>{fmt(stats.cinemas)} cinemas</span><span>{fmt(stats.shows)} shows</span><span>{fmt(stats.capacity)} seats</span><span>{stats.occupancy.toFixed(1)}% occupancy</span></div>
      </section>
      <footer className="foot"><span>WORLD OF RAAKA TRACKER</span>{lastUpdated && <span>Last updated {lastUpdated}</span>}</footer>
    </>}
  </main></>;
}

function Kpi({label,value,sub,tone}:{label:string;value:ReactNode;sub:string;tone:string}) {
  return <article className={`kpi glow rv ${tone}`}><div className="kpiLabel">{label}</div><strong>{value}</strong><small>{sub}</small></article>;
}
function Panel({title,hint,children}:{title:string;hint:string;children:ReactNode}) {
  return <article className="panel glow rv"><div className="panelHead"><h3>{title}</h3><small>{hint}</small></div>{children}</article>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Manrope:wght@400;500;700&display=swap');
*{box-sizing:border-box}
.abPage{--gold:#e9b866;--gold2:#ffe2a6;--ember:#ff7a2f;--blood:#c1272d;--text:#f7ecd8;--muted:#a8997f;--line:rgba(233,184,102,.17);position:relative;z-index:1;min-height:100vh;padding:26px clamp(14px,3vw,48px) 44px;color:var(--text);font:14px/1.5 Manrope,ui-sans-serif,system-ui,sans-serif}
body{background:#07050a}
.embers{position:fixed;inset:0;z-index:0;pointer-events:none}
.abPage:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 70% 50% at 50% -10%,rgba(255,122,47,.20),transparent 70%),radial-gradient(ellipse 50% 40% at 100% 60%,rgba(193,39,45,.14),transparent 70%),radial-gradient(ellipse 50% 40% at 0% 80%,rgba(233,184,102,.08),transparent 70%),#07050a}
.abPage:after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.07;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.topbar{max-width:1700px;margin:0 auto 18px;display:flex;align-items:center;animation:drop 1s .1s both cubic-bezier(.2,.8,.2,1)}
.brand{display:flex;align-items:center;gap:13px}.sun{width:44px;height:44px;fill:none;stroke:var(--gold);stroke-width:2;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(255,150,50,.7))}.sun circle{fill:var(--ember);stroke:var(--gold2)}.sun g{transform-origin:24px 24px;animation:spin 24s linear infinite}
.brandTitle{font:700 clamp(15px,2.2vw,21px)/1 Cinzel,serif;letter-spacing:.2em;background:linear-gradient(100deg,#f7ecd8 20%,var(--gold2) 45%,var(--ember) 55%,#f7ecd8 80%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shine 6s linear infinite}.brandTitle span{letter-spacing:.2em}
.movieHero{max-width:1700px;margin:0 auto 26px;padding:clamp(46px,8vw,110px) 20px clamp(36px,6vw,80px);text-align:center;position:relative;overflow:hidden;border-radius:26px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,122,47,.07),rgba(12,8,10,.55))}
.halo{position:absolute;left:50%;top:50%;width:min(720px,110vw);aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none}.halo i{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(233,184,102,.22)}.halo i:nth-child(1){animation:spin 60s linear infinite;border-style:dashed}.halo i:nth-child(2){inset:11%;animation:spin 45s linear infinite reverse;border-color:rgba(255,122,47,.28)}.halo i:nth-child(3){inset:24%;background:radial-gradient(circle,rgba(255,122,47,.28),transparent 68%);border:0;animation:breathe 5s ease-in-out infinite}
.movieHero h1{position:relative;margin:0;font:900 clamp(50px,12vw,170px)/1 Cinzel,serif;letter-spacing:.06em;text-indent:.06em;display:flex;justify-content:center;filter:drop-shadow(0 6px 40px rgba(255,122,47,.35))}
.movieHero h1 span{display:inline-block;background:linear-gradient(180deg,#fff1cc 10%,var(--gold) 55%,#b8642a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:0;transform:translateY(60%) scale(.9);filter:blur(10px);animation:letter 1.1s calc(.35s + var(--i)*.09s) forwards cubic-bezier(.2,.8,.2,1)}
.movieHero p{position:relative;margin:14px 0 0;color:var(--muted);letter-spacing:.32em;font-size:12px;animation:drop 1s 1.4s both}
.heroMeta{position:relative;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:22px;animation:drop 1s 1.6s both}.heroMeta span{padding:7px 14px;border-radius:99px;border:1px solid var(--line);background:rgba(233,184,102,.06);color:#e9d9b8;font-size:11px;backdrop-filter:blur(8px)}
.glow{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:linear-gradient(150deg,rgba(32,22,18,.78),rgba(14,10,12,.82));backdrop-filter:blur(10px);transition:transform .5s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .4s}
.glow:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(360px circle at var(--mx,50%) var(--my,50%),rgba(255,170,70,.16),transparent 60%)}
.glow:hover{border-color:rgba(233,184,102,.42);box-shadow:0 18px 50px -20px rgba(255,122,47,.45)}.glow:hover:before{opacity:1}
.rv{opacity:0;transform:translateY(26px)}.rv.in{opacity:1;transform:none;transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .4s}
.kpiGrid{max-width:1700px;margin:0 auto 14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.kpi{--a:var(--gold);min-height:112px;padding:18px 20px}.kpi.a1{--a:#f2c879}.kpi.a2{--a:#ff9b4a}.kpi.a3{--a:#e9b866}.kpi.a4{--a:#ff6a45}.kpi.a5{--a:#ffe2a6}
.kpi:after{content:"";position:absolute;left:20px;top:0;width:34px;height:2px;background:var(--a);box-shadow:0 0 14px var(--a);transition:width .5s}.kpi:hover:after{width:calc(100% - 40px)}
.kpiLabel{color:var(--muted);font-size:12px;letter-spacing:.06em}.kpi strong{display:block;font:700 clamp(24px,2.5vw,34px)/1.15 Cinzel,serif;margin:8px 0 3px;color:var(--a);text-shadow:0 0 24px color-mix(in srgb,var(--a) 40%,transparent);font-variant-numeric:tabular-nums}.kpi small{font-size:11px;color:#8e8068}
.occupancyCard{grid-row:span 2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:240px}
.ring{position:relative;width:170px;height:170px;margin-top:10px;display:grid;place-items:center}.ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible}.rt,.rf{fill:none;stroke-width:9}.rt{stroke:rgba(233,184,102,.12)}.rf{stroke:url(#gold);stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(255,122,47,.7));transition:stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1);animation:ring 2s .3s both cubic-bezier(.2,.8,.2,1)}
.ring>div{position:relative;text-align:center}.ring b{display:block;font:700 30px/1.1 Cinzel,serif;color:var(--gold2)}.ring small{font-size:10px;color:var(--muted)}
.filters{max-width:1700px;margin:0 auto 14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:10px}
.filters select,.filters button{min-width:0;border:1px solid var(--line);background:rgba(20,14,12,.8);color:var(--text);border-radius:12px;padding:13px 14px;outline:none;font:inherit;transition:border-color .3s,box-shadow .3s,background .3s}.filters select:hover,.filters select:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(233,184,102,.12)}.filters option{background:#14100c}
.filters button{cursor:pointer;font-weight:700;color:#1a0f06;border:0;background:linear-gradient(120deg,var(--gold2),var(--gold) 50%,var(--ember));background-size:200% 100%}.filters button:hover{background-position:100% 0;box-shadow:0 8px 28px -8px rgba(255,122,47,.8)}
.reportGrid{max-width:1700px;margin:0 auto 14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.panel{min-width:0;padding:20px}.panelHead{margin-bottom:18px}.panelHead h3{font:700 15px/1.2 Cinzel,serif;letter-spacing:.08em;margin:0 0 4px;color:var(--gold2)}.panelHead small{font-size:11px;color:var(--muted)}
.barList{display:flex;flex-direction:column;gap:15px}.barTop{display:flex;justify-content:space-between;gap:12px;font-size:12px}.barTop span{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.barTop b{color:var(--gold2);white-space:nowrap;font-weight:700;font-variant-numeric:tabular-nums}.barDetail{display:block;color:#857862;font-size:10px;margin:2px 0 7px}
.barTrack{height:6px;background:rgba(233,184,102,.1);border-radius:30px;overflow:hidden}.barTrack i{display:block;height:100%;border-radius:30px;transform-origin:left;background:linear-gradient(90deg,var(--blood),var(--ember) 50%,var(--gold2));box-shadow:0 0 12px rgba(255,122,47,.6);animation:grow 1.3s var(--d,0ms) both cubic-bezier(.2,.8,.2,1)}
.expandRows{margin-top:15px;border:1px solid var(--line);background:rgba(233,184,102,.07);color:var(--gold2);border-radius:99px;padding:7px 14px;font:700 11px Manrope,sans-serif;cursor:pointer;transition:background .3s,transform .3s}.expandRows:hover{background:rgba(233,184,102,.16);transform:translateY(-2px)}
.summaryNote{max-width:1700px;margin:0 auto;padding:24px}.sectionHead h2{font:700 20px/1.2 Cinzel,serif;letter-spacing:.06em;margin:0 0 5px}.sectionHead p{font-size:12px;color:var(--muted);margin:0 0 16px}
.summaryChips{display:flex;flex-wrap:wrap;gap:10px}.summaryChips span{border:1px solid var(--line);background:rgba(233,184,102,.06);color:#ecdcba;border-radius:99px;padding:8px 15px;font-size:12px;transition:transform .3s,background .3s}.summaryChips span:hover{transform:translateY(-3px);background:rgba(233,184,102,.14)}
.foot{max-width:1700px;margin:22px auto 0;padding-top:16px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#7d705a;font:500 10px Cinzel,serif;letter-spacing:.2em}
.errorBox{max-width:1700px;margin:20px auto;padding:20px;border:1px solid rgba(193,39,45,.5);background:rgba(60,12,16,.6);border-radius:14px;color:#ffb6b0}
.loader{display:flex;justify-content:center;gap:10px;padding:50px}.loader i{width:10px;height:10px;border-radius:50%;background:var(--ember);box-shadow:0 0 16px var(--ember);animation:pulse 1s infinite ease-in-out}.loader i:nth-child(2){animation-delay:.15s}.loader i:nth-child(3){animation-delay:.3s}
@keyframes spin{to{transform:rotate(360deg)}}@keyframes shine{to{background-position:-250% 0}}@keyframes breathe{50%{transform:scale(1.15);opacity:.7}}
@keyframes letter{to{opacity:1;transform:none;filter:blur(0)}}@keyframes drop{from{opacity:0;transform:translateY(-14px)}}@keyframes grow{from{transform:scaleX(0)}}@keyframes ring{from{stroke-dashoffset:var(--c)}}@keyframes pulse{50%{transform:translateY(-10px);opacity:.4}}
@media(max-width:1050px){.kpiGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.reportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.filters button{grid-column:1/-1}}
@media(max-width:650px){.abPage{padding:16px 11px 30px}.brandTitle{letter-spacing:.12em}.kpiGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.kpi{padding:14px}.occupancyCard{grid-column:span 2;grid-row:auto;min-height:210px}.reportGrid{grid-template-columns:1fr}.filters{gap:7px}.panel{padding:16px}.movieHero{border-radius:20px}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}.rv{opacity:1;transform:none}.movieHero h1 span{opacity:1;transform:none;filter:none}}
`;
