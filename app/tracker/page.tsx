"use client";

import { useEffect, useMemo, useState } from "react";
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

function BarList({ rows, valueLabel = (n: number) => fmt(n), maxRows = 5, expandLabel = "Show more" }: {
  rows: { name: string; value: number; detail?: string }[];
  valueLabel?: (n: number) => string; maxRows?: number; expandLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, maxRows);
  const max = Math.max(1, ...rows.map(r => r.value));
  return <><div className="barList">{visible.map((r) => <div className="barRow" key={r.name}>
    <div className="barTop"><span title={r.name}>{r.name}</span><b>{valueLabel(r.value)}{r.detail ? <small> · {r.detail}</small> : null}</b></div>
    <div className="barTrack"><i style={{ width: `${Math.max(r.value ? 1.5 : 0, r.value/max*100)}%` }} /></div>
  </div>)}</div>{rows.length > maxRows && <button className="expandRows" onClick={() => setExpanded(v => !v)}>{expanded ? "Show less" : `${expandLabel} (${rows.length - maxRows} more)`}</button>}</>;
}

export default function AdvanceBookingPage() {
  // Scoped page styles keep this route self-contained.

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
      .catch(e => { if (active) setError(e.message || "Unable to load scan data"); });
    return () => { active = false; };
  }, []);

  const all = data?.theatres || [];
  const cities = useMemo(() => unique(all.map(x => x.city)), [all]);
  const dates = useMemo(() => unique(all.map(x => x.date)), [all]);
  const languages = useMemo(() => unique(all.map(x => x.language)), [all]);
  const formats = useMemo(() => unique(all.flatMap(x => formatEntries(x).map(([name]) => name))), [all]);
  const states = useMemo(() => unique(all.map(x => stateFromAddress(x.address))), [all]);

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

  const failed = all.filter(t=>t.status==="failed").length;
  const done = all.filter(t=>t.status==="done").length;
  const lastUpdated = data?.lastCapture ? new Date(data.lastCapture).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}) : "Not available";

  return <><style>{styles}</style><main className="abPage">
    <header className="topbar">
      <div className="brand"><div className="brandMark">✦</div><div><div className="eyebrow">WORLD OF RAAKA · DATA INTELLIGENCE</div><div className="brandTitle">ADVANCE BOOKING <span>TRACKER</span></div><div className="brandSub">India theatrical booking overview</div></div></div>
      <div className="livePill"><i /> SCAN DATA <b>{data ? "LOADED" : "CONNECTING"}</b></div>
    </header>

    <section className="movieHero">
      <div className="eyebrow">NATIONAL ADVANCE BOOKING OVERVIEW</div>
      <h1>{MOVIE_NAME || "MOVIE NAME"}</h1>
      <p>City, cinema, language, format and date-wise booking intelligence</p>
      <div className="heroMeta"><span>● {data?.scanning ? "Scan in progress" : data?.stopped ? "Scan stopped" : "Latest scan snapshot"}</span><span>{data?.lastCapture ? `Updated ${lastUpdated}` : "Waiting for scan data"}</span><span>{fmt(data?.totals?.cities || cities.length)} cities reported</span></div>
    </section>

    {error && <div className="errorBox">DATA LOAD ERROR · {error}<br/><small>Place scan-latest.json in the public folder of this Next.js app.</small></div>}
    {!data && !error && <div className="loadingBox">Loading scan-latest.json…</div>}

    {data && <>
      <section className="kpiGrid">
        <article className="kpi occupancyCard"><div className="eyebrow">OCCUPANCY</div><div className="ring" style={{"--value":`${Math.min(100,stats.occupancy)}%`} as CSSProperties}><div><b>{stats.occupancy.toFixed(1)}%</b><small>Booked / capacity</small></div></div></article>
        <Kpi label="LANGUAGES FOUND" value={fmt(new Set(filtered.map(t=>t.language)).size)} sub={`${languages.length} in current scan`} tone="teal"/>
        <Kpi label="TOTAL SHOWS" value={fmt(stats.shows)} sub={`${fmt(stats.cinemas)} cinema records`} tone="blue"/>
        <Kpi label="TOTAL CAPACITY" value={fmt(stats.capacity)} sub="Seats across filtered records" tone="violet"/>
        <Kpi label="AVAILABLE" value={fmt(stats.available)} sub="Open seats observed" tone="teal"/>
        <Kpi label="BOOKED" value={fmt(stats.booked)} sub="Capacity − available" tone="pink"/>
        <Kpi label="EST. COLLECTION" value={money(stats.value)} sub="Scanner estimated unavailable value" tone="gold"/>
      </section>

      <section className="filters">
        <select value={city} onChange={e=>setCity(e.target.value)}><option>All cities</option>{cities.map(x=><option key={x}>{x}</option>)}</select>
        <select value={date} onChange={e=>setDate(e.target.value)}><option>All dates</option>{dates.map(x=><option key={x}>{x}</option>)}</select>
        <select value={language} onChange={e=>setLanguage(e.target.value)}><option>All languages</option>{languages.map(x=><option key={x}>{x}</option>)}</select>
        <select value={format} onChange={e=>setFormat(e.target.value)}><option>All formats</option>{formats.map(x=><option key={x}>{x}</option>)}</select>
        <button onClick={()=>{setCity("All cities");setDate("All dates");setLanguage("All languages");setFormat("All formats");}}>Clear filters</button>
      </section>

      <section className="reportGrid">
        <Panel title="Language-wise" hint="Booked seats · estimated value"><BarList rows={languageRows} valueLabel={fmt}/></Panel>
        <Panel title="Format-wise" hint="Booked seats by format"><BarList rows={formatRows} valueLabel={fmt}/></Panel>
        <Panel title="State-wise" hint="Top 5 states · remaining states under More"><BarList rows={stateRows} valueLabel={fmt} maxRows={5}/></Panel>
        <Panel title="City-wise" hint="Top 5 cities · remaining cities under More"><BarList rows={cityRows} valueLabel={fmt} maxRows={5}/></Panel>
        <Panel title="Cinema chain-wise" hint="PVR + INOX + Cinepolis · Movie Max · Rajhans · More"><BarList rows={chainRows} valueLabel={fmt} maxRows={3} expandLabel="More chains"/></Panel>
        <Panel title="Date-wise" hint="Booked seats by show date"><BarList rows={dateRows} valueLabel={fmt}/></Panel>
      </section>

      <section className="tablePanel summaryNote">
        <div className="sectionHead"><div><div className="eyebrow">AGGREGATED REPORTS</div><h2>Booking analysis overview</h2><p>All figures are grouped and consolidated. Individual theatre-by-theatre records are intentionally hidden.</p></div><span className="countPill">{fmt(filtered.length)} source records aggregated</span></div>
        <div className="summaryChips"><span>{fmt(stats.cityCount)} cities</span><span>{fmt(stats.cinemas)} unique cinemas</span><span>{fmt(stats.shows)} shows</span><span>{fmt(stats.capacity)} seats</span><span>{stats.occupancy.toFixed(1)}% occupancy</span></div>
      </section>
      <footer className="foot"><span>WORLD OF RAAKA · ADVANCE BOOKING INTELLIGENCE</span><span>Completed {fmt(done)} · Failed {fmt(failed)} · Scan coverage {fmt(data.progress || 0)}%</span><span>Last capture: {lastUpdated}</span></footer>
    </>}
  </main></>;
}

function Kpi({label,value,sub,tone}:{label:string;value:string;sub:string;tone:string}) {
  return <article className={`kpi ${tone}`}><div className="kpiLabel">{label}</div><strong>{value}</strong><small>{sub}</small></article>;
}
function Panel({title,hint,children}:{title:string;hint:string;children:ReactNode}) {
  return <article className="panel"><div className="panelHead"><div><h3>{title}</h3><small>{hint}</small></div></div>{children}</article>;
}

const styles = `
*{box-sizing:border-box} .abPage{--bg:#0c0818;--panel:#191326;--line:#302541;--muted:#a39ab8;--text:#f5f1ff;min-height:100vh;padding:28px clamp(14px,3vw,48px) 40px;background:radial-gradient(ellipse at 10% 0%,#33205d 0,transparent 42%),radial-gradient(ellipse at 90% 45%,#29162e 0,transparent 35%),var(--bg);color:var(--text);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Arial}
.topbar{max-width:1700px;margin:0 auto 22px;display:flex;justify-content:space-between;align-items:center;gap:16px}.brand{display:flex;align-items:center;gap:14px}.brandMark{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:linear-gradient(145deg,#3a2865,#19142b);border:1px solid #57417c;color:#d6a8ff;font-size:25px}.eyebrow{font-size:10px;font-weight:800;letter-spacing:1.7px;color:#b7a4d6}.brandTitle{font-size:19px;font-weight:900;letter-spacing:.5px}.brandTitle span{color:#bd91ff}.brandSub{color:var(--muted);font-size:11px}.livePill,.countPill{border:1px solid var(--line);background:#191326;padding:9px 13px;border-radius:99px;color:#c9bfdc;font-size:10px;letter-spacing:.6px}.livePill i{display:inline-block;width:7px;height:7px;background:#43d6a7;border-radius:50%;margin-right:7px;box-shadow:0 0 10px #43d6a7}.livePill b{color:#fff;margin-left:5px}
.movieHero{max-width:1700px;margin:0 auto 17px;padding:24px 28px;border:1px solid #49366c;border-radius:19px;background:linear-gradient(110deg,#24183d,#171326 65%,#302039);position:relative;overflow:hidden}.movieHero:after{content:"";position:absolute;width:270px;height:270px;right:5%;top:-150px;border-radius:50%;border:1px solid #ffffff12;box-shadow:0 0 0 28px #ffffff06,0 0 0 58px #ffffff04}.movieHero h1{font-size:clamp(26px,4vw,40px);margin:5px 0 3px;font-weight:850;letter-spacing:-1px}.movieHero p{color:#b9afca;margin:0}.heroMeta{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}.heroMeta span{padding:6px 10px;border-radius:8px;border:1px solid #493760;background:#201731;color:#d4c6e8;font-size:10px}
.kpiGrid{max-width:1700px;margin:0 auto 15px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.kpi{min-height:105px;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,#211832,#171222);position:relative;overflow:hidden}.kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:#9b72e8}.kpi.teal:before{background:#43d6c0}.kpi.blue:before{background:#6b8fff}.kpi.violet:before{background:#9e73ff}.kpi.pink:before{background:#ed648d}.kpi.gold:before{background:#eab85b}.kpiLabel{color:#b5a9c9;font-size:10px;letter-spacing:.6px}.kpi strong{display:block;font-size:clamp(21px,2vw,29px);line-height:1.2;margin:7px 0 3px;font-weight:850;letter-spacing:-.8px}.kpi small{font-size:10px;color:#9186a6}.occupancyCard{grid-row:span 2;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:220px}.ring{width:142px;height:142px;margin-top:8px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#f36d92 var(--value),#4b3c68 0);position:relative}.ring:before{content:"";position:absolute;inset:10px;border-radius:50%;background:#1b1429}.ring>div{position:relative;text-align:center}.ring b{display:block;font-size:28px}.ring small{font-size:10px;color:#a99fbc}
.filters{max-width:1700px;margin:0 auto 15px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:10px}.filters select,.filters button,.searchBox{min-width:0;border:1px solid #3a2e50;background:#1b152a;color:#eee8fa;border-radius:11px;padding:12px 13px;outline:none}.filters button,.moreBtn{background:#302047;border-color:#4b376b;cursor:pointer;font-weight:700}.reportGrid{max-width:1700px;margin:0 auto 15px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.panel,.tablePanel{min-width:0;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,#20172f,#171221);padding:17px}.panelHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.panelHead h3{font-size:13px;margin:0 0 3px}.panelHead small{font-size:10px;color:#a398b7}.barList{display:flex;flex-direction:column;gap:13px}.expandRows{margin-top:13px;border:1px solid #493760;background:#211832;color:#d8c6f4;border-radius:8px;padding:7px 11px;font-size:10px;font-weight:750;cursor:pointer}.expandRows:hover{background:#302047}.barTop{display:flex;justify-content:space-between;gap:12px;font-size:10px;margin-bottom:6px}.barTop span{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.barTop b{color:#b9adc9;text-align:right;white-space:nowrap;font-weight:500}.barTop small{color:#857b99;font-size:9px}.barTrack{height:7px;background:#352b45;border-radius:30px;overflow:hidden}.barTrack i{height:100%;display:block;border-radius:30px;background:linear-gradient(90deg,#9b70f0,#ef5f96)}
.tablePanel{max-width:1700px;margin:0 auto;padding:20px}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.sectionHead h2{font-size:18px;margin:3px 0}.sectionHead p{font-size:11px;color:var(--muted);margin:0}.summaryNote{max-width:1700px;margin:0 auto;padding:20px}.summaryChips{display:flex;flex-wrap:wrap;gap:9px}.summaryChips span{border:1px solid #493760;background:#201731;color:#d4c6e8;border-radius:9px;padding:9px 12px;font-size:11px}.foot{max-width:1700px;margin:15px auto 0;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#887d99;font-size:9px;letter-spacing:.5px}.errorBox,.loadingBox{max-width:1700px;margin:20px auto;padding:20px;border:1px solid #684052;background:#281725;border-radius:12px;color:#ffb6c8}.loadingBox{border-color:var(--line);background:#191326;color:#cfc3e1}
@media(max-width:1050px){.kpiGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.reportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.abPage{padding:16px 11px 28px}.topbar{align-items:flex-start}.brandTitle{font-size:15px}.livePill{font-size:8px;padding:7px}.movieHero{padding:20px 17px}.kpiGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.occupancyCard{grid-column:span 2;grid-row:auto;min-height:170px}.ring{width:120px;height:120px}.reportGrid{grid-template-columns:1fr}.filters{grid-template-columns:1fr 1fr;gap:7px}.filters button{grid-column:1/-1}.panel{padding:14px}.tablePanel{padding:14px}.foot{font-size:8px}}
`;
