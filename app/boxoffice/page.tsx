import { turso } from "@/lib/turso";

export const dynamic = "force-dynamic";
const money=(value:unknown)=>value==null?"—":new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value));

export default async function BoxOfficePage() {
  let movies:Record<string,unknown>[]=[];
  let unavailable=false;
  try {
    const result=await turso.execute(`
      SELECT m.id,m.slug,m.title,m.language,m.release_date,
        (SELECT d.amount FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_collection,
        (SELECT d.metric FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_metric,
        (SELECT d.collection_date FROM boxoffice_daily_collections d WHERE d.movie_id=m.id ORDER BY d.collection_date DESC,d.imported_at DESC LIMIT 1) AS latest_date,
        (SELECT b.tickets_sold FROM boxoffice_booking_snapshots b WHERE b.movie_id=m.id ORDER BY b.captured_at DESC LIMIT 1) AS tickets_sold,
        (SELECT b.collection_amount FROM boxoffice_booking_snapshots b WHERE b.movie_id=m.id ORDER BY b.captured_at DESC LIMIT 1) AS booking_collection,
        (SELECT o.occupancy_percent FROM boxoffice_occupancy_snapshots o WHERE o.movie_id=m.id ORDER BY o.captured_at DESC LIMIT 1) AS occupancy
      FROM boxoffice_movies m ORDER BY m.title COLLATE NOCASE
    `);
    movies=result.rows as Record<string,unknown>[];
  } catch { unavailable=true; }
  return <main style={{maxWidth:1120,margin:"0 auto",padding:"32px 20px",fontFamily:"Arial,sans-serif",color:"#f6f6f6"}}>
    <header style={{borderBottom:"1px solid #333",paddingBottom:22,marginBottom:34}}>
      <div style={{fontSize:12,letterSpacing:3,color:"#dfb86c"}}>WORLD OF RAAKA</div>
      <h1 style={{fontSize:"clamp(34px,6vw,60px)",margin:"12px 0"}}>Box Office <span style={{color:"#dfb86c"}}>Tracker</span></h1>
      <p style={{color:"#aab0bb",lineHeight:1.7}}>Daily collections · Advance booking · Tickets sold · Theatre occupancy</p>
    </header>
    {unavailable?<p>Turso database is not connected yet. Configure environment variables and run the migration.</p>:movies.length===0?<section style={{padding:28,border:"1px dashed #555",borderRadius:12}}><h2>Ready for movie data</h2><p style={{color:"#aab0bb"}}>No records imported yet. Import verified, source-attributed records through the protected API.</p></section>:
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
      {movies.map(m=><article key={String(m.id)} style={{background:"#11151c",border:"1px solid #303540",borderRadius:12,padding:22}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#dfb86c"}}>{String(m.language??"MOVIE").toUpperCase()}</div>
        <h2 style={{margin:"12px 0"}}>{String(m.title)}</h2>
        <div style={{fontSize:12,color:"#aab0bb"}}>{m.release_date?`Release: ${String(m.release_date)}`:"Release date not set"}</div>
        <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid #303540"}}>
          <div style={{fontSize:10,color:"#aab0bb"}}>LATEST COLLECTION</div>
          <strong style={{display:"block",fontSize:27,color:"#dfb86c",margin:"8px 0"}}>{money(m.latest_collection)}</strong>
          <small style={{color:"#aab0bb"}}>{String(m.latest_metric??"Awaiting data")}{m.latest_date?` · ${String(m.latest_date)}`:""}</small>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginTop:22}}>
          <div><small style={{color:"#aab0bb"}}>ADVANCE TICKETS</small><div style={{marginTop:6}}>{m.tickets_sold==null?"—":Number(m.tickets_sold).toLocaleString("en-IN")}</div></div>
          <div><small style={{color:"#aab0bb"}}>BOOKING VALUE</small><div style={{marginTop:6}}>{money(m.booking_collection)}</div></div>
          <div><small style={{color:"#aab0bb"}}>OCCUPANCY</small><div style={{marginTop:6}}>{m.occupancy==null?"—":`${m.occupancy}%`}</div></div>
        </div>
        <a style={{display:"inline-block",marginTop:22,fontSize:11,color:"#dfb86c"}} href={`/api/box-office/movies/${String(m.slug)}`}>VIEW HISTORY JSON ↗</a>
      </article>)}
    </section>}
    <footer style={{marginTop:44,paddingTop:18,borderTop:"1px solid #333",fontSize:12,color:"#aab0bb"}}>Figures may be estimates. Source attribution and update timestamps should be retained for every imported record.</footer>
  </main>
}
