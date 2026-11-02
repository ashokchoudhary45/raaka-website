"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type Theatre = {
  id: string; cinemaId?: string; name: string; address?: string; chain?: string;
  city: string; citySlug?: string; date: string; language: string; format: string;
  status?: string; scannedSessions?: number; capacity?: number; available?: number;
  unavailable?: number; booked?: number; unavailableValue?: number; potentialValue?: number;
  error?: string | null;
};
type ScanData = {
  movie?: string; lastCapture?: string; scanDate?: string; dateRange?: { from?: string; to?: string };
  totals?: { cities?: number; theatres?: number; done?: number; failed?: number; shows?: number; capacity?: number; available?: number; booked?: number; unavailableValue?: number; potentialValue?: number };
  theatres?: Theatre[]; progress?: number; stopped?: boolean; scanning?: boolean; lastError?: string | null;
};
const DATA_URL = "/scan-latest.json";
const MOVIE_NAME = "RAMAYANA MOVIE"; // Add movie name here when ready.
const number = (n: unknown) => Number(n || 0);
const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);
const money = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : `₹${fmt(n)}`;
const pct = (a: number, b: number) => b ? (a / b) * 100 : 0;
const unique = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a,b) => a.localeCompare(b));
const stateFromAddress = (address = "") => {
  const parts = address.split(",").map(s => s.trim()).filter(Boolean);
  const clean = parts.filter(x => !/^india$/i.test(x)).map(x => x.replace(/\\b\\d{6}\\b/g, "").trim()).filter(Boolean);
  return clean[clean.length - 1] || "Unknown";
};
const splitFormats = (s = "") => s.split(",").map(x => x.trim()).filter(Boolean);

function BarList({ rows, valueLabel = (n: number) => fmt(n), maxRows = 12 }: {
  rows: { name: string; value: number; detail?: string }[];
  valueLabel?: (n: number) => string; maxRows?: number;
}) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return <div className="barList">{rows.slice(0,maxRows).map((r) => <div className="barRow" key={r.name}>
    <div className="barTop"><span title={r.name}>{r.name}</span><b>{valueLabel(r.value)}{r.detail ? <small> · {r.detail}</small> : null}</b></div>
    <div className="barTrack"><i style={{ width: `${Math.max(r.value ? 1.5 : 0, r.value/max*100)}%` }} /></div>
  </div>)}</div>;
}

export default function AdvanceBookingPage() {
  // Scoped page styles keep this route self-contained.

  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState("");
  const [city, setCity] = useState("All cities");
  const [date, setDate] = useState("All dates");
  const [language, setLanguage] = useState("All languages");
  const [format, setFormat] = useState("All formats");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error(`Could not load ${DATA_URL} (${r.status})`); return r.json(); })
      .then(json => { if (active) setData(json); })
      .catch(e => { if (active) setError(e.message || "Unable to load scan data"); });
    return () => { active = false; };
  }, []);

  const all = data?.theatres || [];
  const cities = useMemo(() => unique(all.map(x => x.city)), [all]);
  const dates = useMemo(() => unique(all.map(x => x.date)), [all]);
  const languages = useMemo(() => unique(all.map(x => x.language)), [all]);
  const formats = useMemo(() => unique(all.flatMap(x => splitFormats(x.format))), [all]);

  const filtered = useMemo(() => all.filter(t =>
    (city === "All cities" || t.city === city) &&
    (date === "All dates" || t.date === date) &&
    (language === "All languages" || t.language === language) &&
    (format === "All formats" || splitFormats(t.format).includes(format)) &&
    (!query || `${t.name} ${t.address || ""} ${t.city} ${t.chain || ""}`.toLowerCase().includes(query.toLowerCase()))
  ), [all,city,date,language,format,query]);

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

  const languageRows = useMemo(() => languages.map(name => {
    const rows=filtered.filter(t=>t.language===name);
    return {name,value:rows.reduce((s,t)=>s+number(t.booked ?? t.unavailable),0),
      detail:`${fmt(rows.reduce((s,t)=>s+number(t.scannedSessions),0))} shows · ${money(rows.reduce((s,t)=>s+number(t.unavailableValue),0))}`};
  }).filter(x=>x.value || x.detail.includes("shows")).sort((a,b)=>b.value-a.value),[filtered,languages]);

  const formatRows = useMemo(() => formats.map(name => {
    const rows=filtered.filter(t=>splitFormats(t.format).includes(name));
    return {name,value:rows.reduce((s,t)=>s+number(t.booked ?? t.unavailable),0),
      detail:`${fmt(rows.reduce((s,t)=>s+number(t.scannedSessions),0))} theatre-record shows`};
  }).sort((a,b)=>b.value-a.value),[filtered,formats]);

  const groupRows = (key: "city"|"chain"|"state") => {
    const map = new Map<string,{booked:number;shows:number;value:number;capacity:number}>();
    filtered.forEach(t=>{
      const name = key==="state" ? stateFromAddress(t.address) : key==="chain" ? (t.chain || "Other") : t.city;
      const v=map.get(name)||{booked:0,shows:0,value:0,capacity:0};
      v.booked+=number(t.booked ?? t.unavailable); v.shows+=number(t.scannedSessions);
      v.value+=number(t.unavailableValue); v.capacity+=number(t.capacity); map.set(name,v);
    });
    return [...map.entries()].map(([name,v])=>({name,value:v.booked,detail:`${fmt(v.shows)} shows · ${money(v.value)}`})).sort((a,b)=>b.value-a.value);
  };
  const cityRows = useMemo(()=>groupRows("city"),[filtered]);
  const chainRows = useMemo(()=>groupRows("chain"),[filtered]);
  const stateRows = useMemo(()=>groupRows("state"),[filtered]);
  const dateRows = useMemo(()=>dates.filter(d=>date==="All dates"||d===date).map(d=>{
    const rows=filtered.filter(t=>t.date===d);
    return {name:d,value:rows.reduce((s,t)=>s+number(t.booked ?? t.unavailable),0),
      detail:`${fmt(rows.reduce((s,t)=>s+number(t.scannedSessions),0))} shows · ${money(rows.reduce((s,t)=>s+number(t.unavailableValue),0))}`};
  }).sort((a,b)=>b.value-a.value),[filtered,dates,date]);

  const records = [...filtered].sort((a,b)=>number(b.booked ?? b.unavailable)-number(a.booked ?? a.unavailable));
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
        <button onClick={()=>{setCity("All cities");setDate("All dates");setLanguage("All languages");setFormat("All formats");setQuery("");}}>Clear filters</button>
      </section>

      <section className="reportGrid">
        <Panel title="Language-wise" hint="Booked seats · estimated value"><BarList rows={languageRows} valueLabel={fmt}/></Panel>
        <Panel title="Format-wise" hint="Booked seats by format"><BarList rows={formatRows} valueLabel={fmt}/></Panel>
        <Panel title="State-wise" hint="Derived from cinema address"><BarList rows={stateRows} valueLabel={fmt}/></Panel>
        <Panel title="City-wise" hint="Top cities by observed bookings"><BarList rows={cityRows} valueLabel={fmt}/></Panel>
        <Panel title="Cinema chain-wise" hint="Chain classification from scan data"><BarList rows={chainRows} valueLabel={fmt}/></Panel>
        <Panel title="Date-wise" hint="Booked seats by show date"><BarList rows={dateRows} valueLabel={fmt}/></Panel>
      </section>

      <section className="tablePanel">
        <div className="sectionHead"><div><div className="eyebrow">LIVE INVENTORY</div><h2>Cinema booking records</h2><p>Search and inspect the scanned theatre-language-format records.</p></div><span className="countPill">{fmt(records.length)} records</span></div>
        <input className="searchBox" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search cinema, city, address or chain…"/>
        <div className="tableWrap"><table><thead><tr><th>CINEMA</th><th>CITY</th><th>DATE</th><th>LANGUAGE</th><th>FORMAT</th><th>SHOWS</th><th>CAPACITY</th><th>AVAILABLE</th><th>BOOKED</th><th>OCCUPANCY</th><th>EST. VALUE</th><th>STATUS</th></tr></thead>
          <tbody>{records.slice(0,showAll?records.length:100).map((t,i)=>{const cap=number(t.capacity),book=number(t.booked ?? t.unavailable);return <tr key={`${t.id}-${i}`}><td><b>{t.name}</b><small>{t.chain || "Unclassified"} · {t.address || "Address unavailable"}</small></td><td>{t.city}</td><td>{t.date}</td><td>{t.language}</td><td>{t.format}</td><td>{fmt(number(t.scannedSessions))}</td><td>{fmt(cap)}</td><td>{fmt(number(t.available))}</td><td>{fmt(book)}</td><td><span className="occTag">{pct(book,cap).toFixed(1)}%</span></td><td>{money(number(t.unavailableValue))}</td><td><span className={t.status==="done"?"statusDone":"statusFail"}>{t.status || "unknown"}</span></td></tr>;})}</tbody>
        </table></div>
        {records.length>100 && <button className="moreBtn" onClick={()=>setShowAll(v=>!v)}>{showAll?"Show first 100":"Load all records"}</button>}
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
.filters{max-width:1700px;margin:0 auto 15px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) auto;gap:10px}.filters select,.filters button,.searchBox{min-width:0;border:1px solid #3a2e50;background:#1b152a;color:#eee8fa;border-radius:11px;padding:12px 13px;outline:none}.filters button,.moreBtn{background:#302047;border-color:#4b376b;cursor:pointer;font-weight:700}.reportGrid{max-width:1700px;margin:0 auto 15px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.panel,.tablePanel{min-width:0;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,#20172f,#171221);padding:17px}.panelHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.panelHead h3{font-size:13px;margin:0 0 3px}.panelHead small{font-size:10px;color:#a398b7}.barList{display:flex;flex-direction:column;gap:13px}.barTop{display:flex;justify-content:space-between;gap:12px;font-size:10px;margin-bottom:6px}.barTop span{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.barTop b{color:#b9adc9;text-align:right;white-space:nowrap;font-weight:500}.barTop small{color:#857b99;font-size:9px}.barTrack{height:7px;background:#352b45;border-radius:30px;overflow:hidden}.barTrack i{height:100%;display:block;border-radius:30px;background:linear-gradient(90deg,#9b70f0,#ef5f96)}
.tablePanel{max-width:1700px;margin:0 auto;padding:20px}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.sectionHead h2{font-size:18px;margin:3px 0}.sectionHead p{font-size:11px;color:var(--muted);margin:0}.searchBox{width:100%;margin-bottom:12px}.tableWrap{overflow:auto;max-height:650px;border:1px solid #30263f;border-radius:10px}table{width:100%;border-collapse:collapse;min-width:1150px;font-size:10px}th{position:sticky;top:0;background:#241a35;color:#c8b9df;text-align:left;padding:11px 9px;white-space:nowrap;z-index:1}td{padding:10px 9px;border-top:1px solid #30263f;color:#d8d0e4;white-space:nowrap}td:first-child{white-space:normal;min-width:220px;max-width:300px}td small{display:block;color:#8e829f;font-size:9px;margin-top:3px;line-height:1.4}.occTag{color:#f5a2bf}.statusDone,.statusFail{font-size:9px;padding:4px 7px;border-radius:99px;background:#153b32;color:#6ce2b6}.statusFail{background:#4a202b;color:#ff9aaa}.moreBtn{margin-top:12px;padding:9px 14px;border-radius:9px;color:white}.foot{max-width:1700px;margin:15px auto 0;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#887d99;font-size:9px;letter-spacing:.5px}.errorBox,.loadingBox{max-width:1700px;margin:20px auto;padding:20px;border:1px solid #684052;background:#281725;border-radius:12px;color:#ffb6c8}.loadingBox{border-color:var(--line);background:#191326;color:#cfc3e1}
@media(max-width:1050px){.kpiGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.reportGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.abPage{padding:16px 11px 28px}.topbar{align-items:flex-start}.brandTitle{font-size:15px}.livePill{font-size:8px;padding:7px}.movieHero{padding:20px 17px}.kpiGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.occupancyCard{grid-column:span 2;grid-row:auto;min-height:170px}.ring{width:120px;height:120px}.reportGrid{grid-template-columns:1fr}.filters{grid-template-columns:1fr 1fr;gap:7px}.filters button{grid-column:1/-1}.panel{padding:14px}.tablePanel{padding:14px}.foot{font-size:8px}}
`;
