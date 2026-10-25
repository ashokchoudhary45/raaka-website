import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Movie = { slug:string; title:string; language?:string; releaseDate?:string; budgetAmount?:number; budgetCurrency?:string };
type Daily = { movieSlug:string; collectionDate:string; territory?:string; metric:"net"|"gross"|"overseas"|"worldwide"; amount:number; currency?:string; isEstimate?:boolean; sourceName:string; sourceUrl?:string; sourceUpdatedAt?:string };
type Booking = { movieSlug:string; capturedAt?:string; territory?:string; ticketsSold?:number; collectionAmount?:number; currency?:string; showsCount?:number; sourceName:string; sourceUrl?:string };
type Occupancy = { movieSlug:string; capturedAt?:string; territory?:string; city?:string; occupancyPercent:number; showsCount?:number; sourceName:string; sourceUrl?:string };
type Body = { movies?:Movie[]; dailyCollections?:Daily[]; bookingSnapshots?:Booking[]; occupancySnapshots?:Occupancy[] };
const slugOK=(v:unknown):v is string=>typeof v==="string"&&/^[a-z0-9-]{1,100}$/i.test(v);
const nOK=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
const dateOK=(v:unknown)=>typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v);
const sourceOK=(v:unknown)=>typeof v==="string"&&v.trim().length>0&&v.length<=160;

export async function POST(req:NextRequest) {
  const token=process.env.BOX_OFFICE_IMPORT_TOKEN;
  if(!token) return NextResponse.json({success:false,error:"Import token is not configured"},{status:503});
  if(req.headers.get("authorization")!==`Bearer ${token}`) return NextResponse.json({success:false,error:"Unauthorized"},{status:401});
  let body:Body;
  try { body=await req.json(); } catch { return NextResponse.json({success:false,error:"Invalid JSON"},{status:400}); }
  const movies=body.movies??[], daily=body.dailyCollections??[], bookings=body.bookingSnapshots??[], occupancy=body.occupancySnapshots??[];
  if(movies.length+daily.length+bookings.length+occupancy.length>1000) return NextResponse.json({success:false,error:"Maximum 1000 records per batch"},{status:413});
  if(movies.some(m=>!slugOK(m.slug)||!m.title?.trim())) return NextResponse.json({success:false,error:"Invalid movie record"},{status:400});
  if(daily.some(d=>!slugOK(d.movieSlug)||!dateOK(d.collectionDate)||!nOK(d.amount)||!sourceOK(d.sourceName)||!["net","gross","overseas","worldwide"].includes(d.metric))) return NextResponse.json({success:false,error:"Invalid daily collection record"},{status:400});
  if(bookings.some(b=>!slugOK(b.movieSlug)||!sourceOK(b.sourceName)||(b.ticketsSold!=null&&!nOK(b.ticketsSold))||(b.collectionAmount!=null&&!nOK(b.collectionAmount))||(b.showsCount!=null&&!nOK(b.showsCount)))) return NextResponse.json({success:false,error:"Invalid booking snapshot"},{status:400});
  if(occupancy.some(o=>!slugOK(o.movieSlug)||!sourceOK(o.sourceName)||!nOK(o.occupancyPercent)||o.occupancyPercent>100||(o.showsCount!=null&&!nOK(o.showsCount)))) return NextResponse.json({success:false,error:"Invalid occupancy snapshot"},{status:400});

  try {
    const statements:{sql:string;args:(string|number|null)[]}[]=[];
    for(const m of movies) statements.push({sql:`INSERT INTO boxoffice_movies(slug,title,language,release_date,budget_amount,budget_currency)
      VALUES(?,?,?,?,?,?) ON CONFLICT(slug) DO UPDATE SET title=excluded.title,
      language=COALESCE(excluded.language,boxoffice_movies.language),
      release_date=COALESCE(excluded.release_date,boxoffice_movies.release_date),
      budget_amount=COALESCE(excluded.budget_amount,boxoffice_movies.budget_amount),
      budget_currency=excluded.budget_currency
      WHERE boxoffice_movies.title<>excluded.title OR COALESCE(boxoffice_movies.language,'')<>COALESCE(excluded.language,'')
      OR COALESCE(boxoffice_movies.release_date,'')<>COALESCE(excluded.release_date,'')
      OR COALESCE(boxoffice_movies.budget_amount,-1)<>COALESCE(excluded.budget_amount,-1)`,
      args:[m.slug.toLowerCase(),m.title.trim(),m.language??null,m.releaseDate??null,m.budgetAmount??null,m.budgetCurrency??"INR"]});
    if(statements.length) await turso.batch(statements,"write");

    const slugs=[...new Set([...daily.map(x=>x.movieSlug),...bookings.map(x=>x.movieSlug),...occupancy.map(x=>x.movieSlug)].map(s=>s.toLowerCase()))];
    const ids=new Map<string,number>();
    for(let i=0;i<slugs.length;i+=80){
      const chunk=slugs.slice(i,i+80);
      if(!chunk.length) continue;
      const found=await turso.execute({sql:`SELECT id,slug FROM boxoffice_movies WHERE slug IN (${chunk.map(()=>"?").join(",")})`,args:chunk});
      for(const row of found.rows) ids.set(String(row.slug),Number(row.id));
    }
    const missing=slugs.filter(s=>!ids.has(s));
    if(missing.length) return NextResponse.json({success:false,error:`Unknown movie slug(s): ${missing.join(", ")}. Include movies first.`},{status:400});

    const writes:{sql:string;args:(string|number|null)[]}[]=[];
    for(const d of daily) writes.push({sql:`INSERT INTO boxoffice_daily_collections(movie_id,collection_date,territory,metric,amount,currency,is_estimate,source_name,source_url,source_updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(movie_id,collection_date,territory,metric,source_name) DO UPDATE SET
      amount=excluded.amount,currency=excluded.currency,is_estimate=excluded.is_estimate,source_url=excluded.source_url,
      source_updated_at=excluded.source_updated_at,imported_at=CURRENT_TIMESTAMP
      WHERE boxoffice_daily_collections.amount<>excluded.amount OR boxoffice_daily_collections.currency<>excluded.currency
      OR boxoffice_daily_collections.is_estimate<>excluded.is_estimate
      OR COALESCE(boxoffice_daily_collections.source_url,'')<>COALESCE(excluded.source_url,'')
      OR COALESCE(boxoffice_daily_collections.source_updated_at,'')<>COALESCE(excluded.source_updated_at,'')`,
      args:[ids.get(d.movieSlug.toLowerCase())!,d.collectionDate,d.territory??"India",d.metric,d.amount,d.currency??"INR",d.isEstimate===false?0:1,d.sourceName,d.sourceUrl??null,d.sourceUpdatedAt??null]});

    // Snapshot dedup: compare the newest snapshot per movie/source; don't write unchanged values.
    for(const b of bookings){
      const id=ids.get(b.movieSlug.toLowerCase())!;
      const old=(await turso.execute({sql:`SELECT tickets_sold,collection_amount,shows_count,territory,source_name FROM boxoffice_booking_snapshots WHERE movie_id=? ORDER BY captured_at DESC LIMIT 1`,args:[id]})).rows[0];
      const same=old&&Number(old.tickets_sold??-1)===Number(b.ticketsSold??-1)&&Number(old.collection_amount??-1)===Number(b.collectionAmount??-1)&&Number(old.shows_count??-1)===Number(b.showsCount??-1)&&String(old.territory)===String(b.territory??"India")&&String(old.source_name)===b.sourceName;
      if(!same) writes.push({sql:`INSERT INTO boxoffice_booking_snapshots(movie_id,captured_at,territory,tickets_sold,collection_amount,currency,shows_count,source_name,source_url)
        VALUES(?,COALESCE(?,CURRENT_TIMESTAMP),?,?,?,?,?,?,?)`,args:[id,b.capturedAt??null,b.territory??"India",b.ticketsSold??null,b.collectionAmount??null,b.currency??"INR",b.showsCount??null,b.sourceName,b.sourceUrl??null]});
    }
    for(const o of occupancy){
      const id=ids.get(o.movieSlug.toLowerCase())!;
      const old=(await turso.execute({sql:`SELECT occupancy_percent,shows_count,territory,city,source_name FROM boxoffice_occupancy_snapshots WHERE movie_id=? ORDER BY captured_at DESC LIMIT 1`,args:[id]})).rows[0];
      const same=old&&Number(old.occupancy_percent??-1)===Number(o.occupancyPercent)&&Number(old.shows_count??-1)===Number(o.showsCount??-1)&&String(old.territory)===String(o.territory??"India")&&String(old.city??"")===String(o.city??"")&&String(old.source_name)===o.sourceName;
      if(!same) writes.push({sql:`INSERT INTO boxoffice_occupancy_snapshots(movie_id,captured_at,territory,city,occupancy_percent,shows_count,source_name,source_url)
        VALUES(?,COALESCE(?,CURRENT_TIMESTAMP),?,?,?,?,?,?)`,args:[id,o.capturedAt??null,o.territory??"India",o.city??null,o.occupancyPercent,o.showsCount??null,o.sourceName,o.sourceUrl??null]});
    }
    let rowsChanged=0;
    for(let i=0;i<writes.length;i+=100){
      const result=await turso.batch(writes.slice(i,i+100),"write");
      rowsChanged+=result.reduce((n,r)=>n+(Number(r.rowsAffected)||0),0);
    }
    return NextResponse.json({success:true,moviesReceived:movies.length,dataRecordsReceived:daily.length+bookings.length+occupancy.length,writeStatements:writes.length,rowsChanged});
  } catch(error) {
    console.error("boxoffice import:",error);
    return NextResponse.json({success:false,error:"Import failed; check server logs and Turso configuration."},{status:503});
  }
}
