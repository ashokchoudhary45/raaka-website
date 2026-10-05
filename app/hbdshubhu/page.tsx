'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent as RPE } from 'react';

const BIRTHDAY = new Date('2027-02-12T00:00:00+05:30').getTime();

const scenes = [
  ['01', 'THE GOLDEN SMILE'],
  ['02', 'THE CANDID FRAME'],
  ['03', 'UNSTOPPABLE VIBES'],
  ['04', 'THE LITTLE MOMENTS'],
  ['05', 'A BEAUTIFUL DAY'],
  ['06', 'THE MEMORY WE KEEP'],
];

const memories = [
  ['SCENE 07', 'A MOMENT WORTH PAUSING FOR'],
  ['SCENE 08', 'THE FRAME THAT STAYS'],
  ['SCENE 09', 'A DAY WORTH REMEMBERING'],
];

const ALL = [
  ...scenes.map(([n, t]) => ({ label: `SCENE ${n}`, title: t })),
  ...memories.map(([n, t]) => ({ label: n, title: t })),
];

const PAL = [
  ['#ff7a59', '#3b0f2e'], ['#0f766e', '#0b1330'], ['#6d4cff', '#ff4fa3'],
  ['#ffc9a8', '#0d4d46'], ['#ffb347', '#1b2a6b'], ['#ff5d8f', '#2a0a24'],
  ['#5cf2c8', '#1a1450'], ['#2de2a6', '#06201d'], ['#ff9a6b', '#35185e'],
];

const NAV = [['hero', 'INTRO'], ['story', 'STORY'], ['scenes', 'SCENES'], ['memories', 'MEMORIES'], ['letter', 'LETTER'], ['celebration', 'FINALE']];

function pad(v: number) { return String(v).padStart(2, '0'); }
function getTimeLeft() {
  const diff = Math.max(0, BIRTHDAY - Date.now());
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60), unlocked: diff === 0 };
}
const cv = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const tilt = (e: RPE<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + 'deg');
  el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + 'deg');
};
const untilt = (e: RPE<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

export default function Page() {
  const [intro, setIntro] = useState(true);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(getTimeLeft());
  const [audioOn, setAudioOn] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [finale, setFinale] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [active, setActive] = useState('hero');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { const t = window.setInterval(() => setTime(getTimeLeft()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = window.setTimeout(() => setIntro(false), 2200); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const move = (e: MouseEvent) => { document.documentElement.style.setProperty('--mx', `${e.clientX}px`); document.documentElement.style.setProperty('--my', `${e.clientY}px`); };
    addEventListener('mousemove', move); return () => removeEventListener('mousemove', move);
  }, []);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')), { threshold: .15 });
    document.querySelectorAll('.reveal').forEach(e => io.observe(e));
    const so = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(e => so.observe(e));
    return () => { io.disconnect(); so.disconnect(); };
  }, [intro, started]);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement, m = h.scrollHeight - h.clientHeight;
      progRef.current?.style.setProperty('transform', `scaleX(${m > 0 ? h.scrollTop / m : 0})`);
      const tl = document.querySelector<HTMLElement>('.timeline');
      if (tl) { const r = tl.getBoundingClientRect(); tl.style.setProperty('--tl', String(Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height)))); }
    };
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on);
  }, [intro, started]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setViewer(null); setLetterOpen(false); }
      else if (viewer !== null && e.key === 'ArrowRight') setViewer((viewer + 1) % ALL.length);
      else if (viewer !== null && e.key === 'ArrowLeft') setViewer((viewer + ALL.length - 1) % ALL.length);
    };
    addEventListener('keydown', key); return () => removeEventListener('keydown', key);
  }, [viewer]);

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    if (audioOn) { audioRef.current.pause(); setAudioOn(false); }
    else { try { await audioRef.current.play(); setAudioOn(true); } catch {} }
  };
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const launchFinale = () => {
    setFinale(true);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const colors = ['#ff7a59', '#5cf2c8', '#fff4e6', '#ffc9a8', '#8b7bff'];
    const ps = Array.from({ length: 280 }, () => ({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - .5) * 13, vy: (Math.random() - .5) * 13 - 2, life: 90 + Math.random() * 100, size: 2 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)] }));
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .075; p.vx *= .995; p.life -= 1; ctx.globalAlpha = Math.max(0, p.life / 140); ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(frame * .04 + p.x * .01); ctx.fillRect(-p.size / 2, -p.size / 2, p.size * 2.2, p.size); ctx.restore(); });
      frame++; if (ps.some(p => p.life > 0)) requestAnimationFrame(draw);
    }; draw();
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); setAudioOn(true); }
  };

  const styleTag = <style dangerouslySetInnerHTML={{ __html: styles }} />;

  if (intro) return (
    <main className="intro-screen">
      <div className="grain" /><div className="intro-light" />
      <div className="leader"><i className="sweep" />{[3, 2, 1].map((n, k) => (<b key={n} style={cv({ '--k': k })}>{n}</b>))}</div>
      <div className="intro-copy"><span>A STAR PRODUCTIONS</span><small>PRESENTS</small><h1>CHAPTER SHUBRA</h1><p>SHUBRA KUMARI</p><em>A Story Written in Smiles</em></div>
      {styleTag}
    </main>
  );

  if (!time.unlocked) return (
    <main className="birthday-lock">
      <div className="lock-orb" />
      <div className="lock-grid" />
      <div className="lock-content">
        <span className="lock-eyebrow">CHAPTER SHUBRA</span>
        <div className="lock-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64"><rect x="17" y="28" width="30" height="25" rx="4" /><path d="M23 28v-7a9 9 0 0 1 18 0v7" /><circle cx="32" cy="40" r="2.5" /><path d="M32 42.5v5" /></svg>
        </div>
        <h1>THE PAGE IS LOCKED</h1>
        <p className="lock-subtitle">This birthday story will open on</p>
        <strong>12 FEBRUARY 2027</strong>
        <div className="lock-countdown">
          {([['DAYS', time.days], ['HOURS', time.hours], ['MINUTES', time.minutes], ['SECONDS', time.seconds]] as [string, number][]).map(([label, value]) => (
            <div className="lock-unit" key={label}><b>{pad(value)}</b><small>{label}</small></div>
          ))}
        </div>
        <p className="lock-note">Come back on the birthday to enter the complete story.</p>
      </div>
      {styleTag}
    </main>
  );

  return (
    <main className="site">
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="spotlight" /><div className="grain" />
      <div className="prog" ref={progRef} aria-hidden="true" />
      <audio ref={audioRef} src="/audio/cinematic-birthday.mp3" loop preload="none" />

      <header className="nav">
        <button className="brand" onClick={() => scrollTo('hero')}>CHAPTER <b>SHUBRA</b></button>
        <nav>{NAV.map(([id, label]) => (<button key={id} className={active === id ? 'on' : ''} onClick={() => scrollTo(id)}>{label}</button>))}</nav>
        <button className={'audio' + (audioOn ? ' on' : '')} onClick={toggleAudio}>♫ {audioOn ? 'ON' : 'OFF'}{audioOn && <em className="eq"><i /><i /><i /></em>}</button>
      </header>

      {!started ? (
        <section className="premiere">
          <div className="cinema-grid" />
          <div className="beams" aria-hidden="true"><i /><i /><i /></div>
          <div className="ticket" onPointerMove={tilt} onPointerLeave={untilt}>
            <div className="t-main">
              <span className="eyebrow">THE PREMIERE BEGINS IN</span>
              <div className="units">
                {([['DAYS', time.days], ['HOURS', time.hours], ['MINUTES', time.minutes], ['SECONDS', time.seconds]] as [string, number][]).map(([l, v]) => (
                  <div key={l} className={'u' + (l === 'SECONDS' ? ' hot' : '')}><b key={v} className="flip">{pad(v)}</b><small>{l}</small></div>
                ))}
              </div>
              <p>Some stories are worth waiting for.</p>
              <button className="btn" onClick={() => setStarted(true)}>ENTER THE STORY</button>
              <small className="note">{time.unlocked ? 'The celebration is unlocked.' : 'The birthday celebration will unlock on february 12.'}</small>
            </div>
            <div className="t-stub">
              <span>ADMIT ONE</span>
              <div className="barcode" />
              <b>12.02.2027</b>
              <small>CHAPTER SHUBRA</small>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* HERO */}
          <section id="hero" className="hero">
            <div className="blobs" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /></div>
            <div className="hero-copy reveal is-visible">
              <span className="eyebrow">THE MAIN CHARACTER</span>
              <h1 aria-label="Shubra Kumari">
                <span className="hl"><Letters text="SHUBRA" /></span>
                <span className="hl it"><Letters text="KUMARI" o={6} /></span>
              </h1>
              <p>Some people become memories.<br />Some people become chapters.</p>
              <button className="scroll-btn" onClick={() => scrollTo('story')}>↓ SCROLL TO ENTER THE STORY</button>
            </div>
            <div className="badge" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <defs><path id="cp" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
                <text><textPath href="#cp">SOME PEOPLE BECOME MEMORIES ✦ SOME PEOPLE BECOME CHAPTERS ✦ </textPath></text>
              </svg>
              <b>S</b>
            </div>
            <div className="scene-tag">SCENE 01 / THE BEGINNING</div>
          </section>

          {/* STORY */}
          <section id="story" className="section story">
            <Head ch="CHAPTER I" title="HER STORY" text="Every beautiful story begins with someone worth remembering." />
            <div className="story-grid">
              <div className="portrait reveal">
                <i className="m1" /><i className="m2" /><i className="m3" />
                <svg className="p-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" /><circle cx="50" cy="4" r="2.2" /></svg>
                <b>S</b>
                <span>FRAME 01</span>
              </div>
              <div className="story-text reveal">
                <span className="script">FADE IN.</span>
                <h3>There are people who make ordinary moments feel extraordinary.</h3>
                <p>Their smile changes the atmosphere. Their little moments become memories. And somehow, without even realizing it, they make ordinary days more memorable.</p>
                <p>This website is a collection of frames and memories created especially for Shubra — a little cinematic birthday experience where every scene captures a memorable moment.</p>
              </div>
            </div>
          </section>

          {/* SCENES */}
          <section id="scenes" className="section scenes">
            <Head ch="CHAPTER II" title="THE SCENES" text="A collection of moments that deserve their own frames." />
            <div className="reel">
              <div className="film-reel reel-track">
                {[0, 1].map((rep) => scenes.map(([n, title], i) => (
                  <button
                    className={`film-frame ${activeScene === i ? 'active' : ''}`}
                    key={`${n}-${rep}`}
                    aria-hidden={rep === 1}
                    tabIndex={rep === 1 ? -1 : 0}
                    onClick={() => { setActiveScene(i); setViewer(i); }}
                  >
                    <ArtBox k={i} />
                    <div className="frame-meta"><span>SCENE {n}</span><b>{title}</b></div>
                  </button>
                )))}
              </div>
            </div>
          </section>

          <section className="quote-scene reveal">
            <div className="q-bg" aria-hidden="true">CHAPTER SHUBRA ✦ CHAPTER SHUBRA ✦ CHAPTER SHUBRA ✦ CHAPTER SHUBRA ✦</div>
            <div>
              <span>THE STORY BETWEEN THE FRAMES</span>
              <h2>Some memories fade.<br />Some become stories.<br /><i>Some become chapters.</i></h2>
              <small>— CHAPTER SHUBRA</small>
            </div>
          </section>

          {/* MEMORIES */}
          <section id="memories" className="section memories">
            <Head ch="CHAPTER III" title="MEMORY LANE" text="Keep the moments. Keep the feeling." />
            <div className="timeline">
              {memories.map(([num, title], i) => (
                <article className="memory reveal" key={num}>
                  <div className="timeline-dot">{String(i + 1).padStart(2, '0')}</div>
                  <div className="memory-image" onClick={() => setViewer(6 + i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setViewer(6 + i)}>
                    <ArtBox k={6 + i} />
                  </div>
                  <div className="memory-copy">
                    <span>{num}</span>
                    <h3>{title}</h3>
                    <p>A little frame from a bigger story — the kind of moment that deserves to be remembered long after the day is gone.</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* LETTER */}
          <section id="letter" className="section letter-section">
            <Head ch="CHAPTER IV" title="THE DIRECTOR'S NOTE" text="A simple note for Shubra." />
            <div className={'mail reveal' + (letterOpen ? ' open' : '')}>
              <button className="envelope" onClick={() => setLetterOpen(true)} disabled={letterOpen} aria-label="Open the letter">
                <span className="env-flap" />
                <span className="env-front" />
                <span className="seal">S</span>
                <span className="env-label">A LETTER FOR SHUBRA</span>
                <small>CLICK TO OPEN</small>
              </button>
              {letterOpen && (
                <article className="letter">
                  <span className="script">DEAR SHUBRA,</span>
                  <p style={cv({ '--i': 0 })}>If life were a movie, there would always be certain scenes we would never want to end — the laughter, the conversations, the tiny surprises and the memories that become special simply because they happened.</p>
                  <p style={cv({ '--i': 1 })}>This little website is for all those moments. For the smile, the energy, the memories and the person behind them.</p>
                  <p style={cv({ '--i': 2 })}>On your birthday, I hope the next chapter brings you more reasons to smile, more dreams coming true, more peaceful days, and countless moments that deserve to be replayed.</p>
                  <h3 style={cv({ '--i': 3 })}>Happy Birthday, Shubra.</h3>
                  <p className="signature" style={cv({ '--i': 4 })}>Best wishes,<br />Your Name</p>
                  <button className="close-letter" onClick={() => setLetterOpen(false)}>CLOSE</button>
                </article>
              )}
            </div>
          </section>

          {/* CELEBRATION */}
          <section id="celebration" className="celebration">
            <div className="celebration-light" />
            {[['#5cf2c8', 8, 11, 0], ['#ff7a59', 24, 14, 3], ['#8b7bff', 42, 12, 6], ['#ffc9a8', 60, 15, 1.5], ['#ff5d8f', 76, 13, 4.5], ['#5cf2c8', 90, 16, 8]].map(([c, x, d, dl], i) => (
              <span key={i} className="balloon" aria-hidden="true" style={cv({ '--b': c as string, left: `${x}%`, '--d': `${d}s`, '--dl': `${dl}s` })} />
            ))}
            <span className="eyebrow">THE FINAL SCENE</span>
            <h2>HAPPY BIRTHDAY</h2>
            <h1>SHUBRA KUMARI</h1>
            <p>Make a wish.</p>
            <Cake cut={finale} />
            <button className="btn cut" onClick={launchFinale}>CUT THE CAKE</button>
          </section>

          <footer className="credits">
            <span>CHAPTER SHUBRA</span>
            <h2>A BIRTHDAY STORY</h2>
            <div className="roll">
              <div className="credit-block">
                <p>STARRING</p><b>SHUBRA KUMARI</b>
                <p>WRITTEN FOR</p><b>A DAY WORTH REMEMBERING</b>
                <p>SCENES</p><b>MEMORIES • SMILES • MOMENTS</b>
                <p>CINEMATOGRAPHY</p><b>LIFE</b>
              </div>
            </div>
            <h3>THE END</h3>
            <p className="beginning">...or perhaps, just the beginning.</p>
            <button className="replay" onClick={() => { setStarted(false); setFinale(false); scrollTo('hero'); }}>↻ REWATCH THE STORY</button>
          </footer>
        </>
      )}

      {finale && (
        <div className="finale-overlay">
          <canvas ref={canvasRef} />
          <i className="f-ring" /><i className="f-ring r2" />
          <div className="finale-content">
            <span>THE FINAL FRAME</span>
            <h1>HAPPY BIRTHDAY,<br /><i>SHUBRA</i></h1>
            <p>May your next chapter bring more happiness, more reasons to smile, more dreams coming true, and countless moments worth remembering.</p>
            <b>KEEP SMILING. KEEP SHINING. KEEP BEING YOU.</b>
            <button onClick={() => setFinale(false)}>CONTINUE THE STORY</button>
          </div>
        </div>
      )}

      {viewer !== null && (
        <div className="viewer" onClick={() => setViewer(null)}>
          <button className="viewer-x" aria-label="Close">×</button>
          <div className="viewer-card" key={viewer} onClick={(e) => e.stopPropagation()}>
            <div className="viewer-art"><ArtBox k={viewer} /></div>
            <div className="viewer-meta">
              <span>{ALL[viewer].label}</span>
              <b>{ALL[viewer].title}</b>
              <div>
                <button onClick={() => setViewer((viewer + ALL.length - 1) % ALL.length)} aria-label="Previous">←</button>
                <button onClick={() => setViewer((viewer + 1) % ALL.length)} aria-label="Next">→</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {styleTag}
    </main>
  );
}

const Head = ({ ch, title, text }: { ch: string; title: string; text: string }) => (
  <div className="section-head reveal"><span>{ch}</span><h2>{title}</h2><p>{text}</p></div>
);

const Letters = ({ text, o = 0 }: { text: string; o?: number }) => (
  <span aria-hidden="true">
    {text.split('').map((c, i) => (<span key={i} className="lt" style={cv({ '--i': i + o })}>{c}</span>))}
  </span>
);

/* ---------- image-free generative art ---------- */
const C = '#fff4e6';
const ArtBox = ({ k }: { k: number }) => (
  <div className="art" style={{ background: `linear-gradient(160deg,${PAL[k][0]},${PAL[k][1]})` }}><Art k={k} /></div>
);

function Art({ k }: { k: number }) {
  let g: ReactNode = null;
  if (k === 0) g = (<>
    <g className="spin">{Array.from({ length: 16 }, (_, i) => (<path key={i} d="M50 60L47 6h6z" fill={C} opacity=".16" transform={`rotate(${i * 22.5} 50 60)`} />))}</g>
    <circle className="pls" cx="50" cy="60" r="22" fill={C} />
    <circle cx="43" cy="55" r="2.4" fill="#2a1020" /><circle cx="57" cy="55" r="2.4" fill="#2a1020" />
    <path className="pls" d="M38 64Q50 77 62 64" fill="none" stroke="#2a1020" strokeWidth="2.6" strokeLinecap="round" />
  </>);
  if (k === 1) g = (<>
    <path d="M14 22V12h10M76 12h10v10M86 108v10H76M24 118H14v-10" fill="none" stroke={C} strokeWidth="2.2" strokeLinecap="round" />
    <g className="spin">{[0, 120, 240].map((a) => (<path key={a} d="M50 65V42l17 14z" fill={C} opacity=".2" transform={`rotate(${a} 50 65)`} />))}</g>
    <circle className="pls" cx="50" cy="65" r="17" fill="none" stroke={C} strokeWidth="1.6" /><circle cx="50" cy="65" r="4" fill={C} />
    <circle className="blink" cx="20" cy="30" r="3" fill="#ff4d4d" /><text x="27" y="33" fontSize="7" fill={C}>REC</text>
  </>);
  if (k === 2) g = (<>
    {Array.from({ length: 11 }, (_, i) => { const h = 30 + ((i * 37) % 50); return <rect key={i} className="bar" x={12 + i * 7.2} y={105 - h} width="4.6" height={h} rx="2.3" fill={C} opacity={0.5 + (i % 3) * 0.2} style={{ animationDelay: `${i * 0.12}s` }} />; })}
    <path className="wave" d="M0 40Q12 20 25 40T50 40T75 40T100 40" fill="none" stroke={C} strokeWidth="1.6" opacity=".6" />
  </>);
  if (k === 3) g = (<>{Array.from({ length: 12 }, (_, i) => (
    <circle key={i} className="drift" cx={(i * 37) % 90 + 5} cy={(i * 53) % 110 + 12} r={5 + (i % 4) * 4} fill={C} opacity={0.14 + (i % 3) * 0.1} style={{ animationDelay: `${i * 0.5}s` }} />
  ))}</>);
  if (k === 4) g = (<>
    <circle className="rise" cx="50" cy="82" r="22" fill="#ffd27a" />
    <ellipse className="drift" cx="30" cy="40" rx="16" ry="5" fill={C} opacity=".5" /><ellipse className="drift d2" cx="72" cy="56" rx="20" ry="6" fill={C} opacity=".4" />
    <path d="M0 88Q25 80 50 88T100 88V133H0z" fill="#0b1330" opacity=".88" />
  </>);
  if (k === 5) g = (<>
    {[0, 1, 2].map((i) => (<circle key={i} className="rg" cx="50" cy="62" r="14" fill="none" stroke={C} strokeWidth="1" style={{ animationDelay: `${i}s` }} />))}
    <path className="pls" d="M50 78C26 62 33 44 44 46c4 1 6 4 6 6 0-2 2-5 6-6 11-2 18 16-6 32z" fill={C} />
  </>);
  if (k === 6) g = (<>
    {[0, 1, 2].map((i) => (<circle key={i} className="rg" cx="50" cy="62" r="16" fill="none" stroke={C} strokeWidth="1.2" style={{ animationDelay: `${i * 0.9}s` }} />))}
    <rect x="38" y="48" width="8" height="30" rx="3" fill={C} /><rect x="54" y="48" width="8" height="30" rx="3" fill={C} />
  </>);
  if (k === 7) g = (<>
    {[0, 1, 2, 3].map((i) => (<rect key={i} className="pls" x={14 + i * 8} y={22 + i * 10} width={72 - i * 16} height={92 - i * 20} rx="2" fill="none" stroke={C} strokeOpacity={0.9 - i * 0.18} strokeWidth="1.4" style={{ animationDelay: `${i * 0.25}s` }} />))}
    <circle className="blink" cx="50" cy="68" r="3" fill={C} />
  </>);
  if (k === 8) g = (<>
    <rect x="22" y="34" width="56" height="64" rx="6" fill={C} />
    <path d="M22 40a6 6 0 0 1 6-6h44a6 6 0 0 1 6 6v10H22z" fill="#ff7a59" />
    <text x="50" y="46" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">FEB</text>
    <text x="50" y="84" textAnchor="middle" fontSize="30" fontWeight="800" fill="#35185e" fontFamily="Fraunces,Georgia,serif">12</text>
    {[[14, 24], [88, 30], [12, 108], [90, 100], [50, 18]].map(([x, y], i) => (<path key={i} className="tw" d={`M${x} ${y - 5}l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z`} fill={C} style={{ animationDelay: `${i * 0.5}s` }} />))}
  </>);
  return <svg viewBox="0 0 100 133" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{g}</svg>;
}

function Cake({ cut }: { cut: boolean }) {
  return (
    <div className={'cake' + (cut ? ' cut' : '')} aria-label="Birthday cake">
      <svg viewBox="0 0 320 300">
        <defs>
          <linearGradient id="k1" x1="0" x2="1"><stop offset="0" stopColor="#ff6a4a" /><stop offset=".5" stopColor="#ff9a7a" /><stop offset="1" stopColor="#e5503a" /></linearGradient>
          <linearGradient id="k2" x1="0" x2="1"><stop offset="0" stopColor="#f1d9c2" /><stop offset=".5" stopColor="#fff4e6" /><stop offset="1" stopColor="#e8c9ab" /></linearGradient>
          <radialGradient id="k3" cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="#ffe08a" /><stop offset="1" stopColor="#ff7a39" /></radialGradient>
        </defs>
        <ellipse cx="160" cy="268" rx="150" ry="22" fill="#fff4e6" opacity=".18" />
        <ellipse cx="160" cy="262" rx="150" ry="22" fill="#cfe9e4" opacity=".4" />
        <path d="M50 190v62a110 18 0 0 0 220 0v-62z" fill="url(#k1)" />
        <ellipse cx="160" cy="190" rx="110" ry="18" fill="#ffb59c" />
        <text x="160" y="244" textAnchor="middle" fontFamily="Fraunces,Georgia,serif" fontStyle="italic" fontWeight="700" fontSize="28" letterSpacing="6" fill="#fff4e6">SHUBRA</text>
        <path d="M92 130v56a68 12 0 0 0 136 0v-56z" fill="url(#k2)" />
        <ellipse cx="160" cy="130" rx="68" ry="12" fill="#fff9f1" />
        {[[108, 14], [134, 24], [160, 14], [188, 26], [212, 14]].map(([x, h]) => (<path key={x} d={`M${x - 7} 132v${h}a7 7 0 0 0 14 0v-${h}z`} fill="#ffb59c" />))}
        {[130, 160, 190].map((x, i) => (
          <g key={x}>
            <rect x={x - 4} y="92" width="8" height="38" rx="2" fill={i === 1 ? '#5cf2c8' : '#ff7a59'} />
            <path d={`M${x - 4} 102l8 5M${x - 4} 114l8 5`} stroke="#fff" strokeOpacity=".55" />
            <path className="fl" d={`M${x} 68c6 7 7 14 0 21-7-7-6-14 0-21z`} fill="url(#k3)" style={{ animationDelay: `${i * 0.12}s` }} />
          </g>
        ))}
        <g className="slice"><path d="M196 196l56 6-6 48a96 14 0 0 1-50 6z" fill="url(#k1)" /><path d="M196 196l56 6" stroke="#fff4e6" strokeWidth="5" /></g>
      </svg>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Manrope:wght@300..800&display=swap');
:root{--ink:#04100F;--mint:#5CF2C8;--coral:#FF7A59;--peach:#FFC9A8;--cream:#FFF4E6;--mx:50vw;--my:50vh;--disp:'Fraunces',Georgia,serif}
*{box-sizing:border-box}
html{scroll-behavior:smooth;background:#04100F}
body{margin:0;background:#04100F;color:var(--cream);font-family:'Manrope',system-ui,sans-serif;font-weight:300;overflow-x:hidden}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
button:disabled{cursor:default}
h1,h2,h3,i,em{font-family:var(--disp)}
::selection{background:rgba(92,242,200,.35)}
:focus-visible{outline:2px solid var(--mint);outline-offset:3px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0;transform:translate3d(0,28px,0);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
@keyframes sheen{to{background-position:-250% 0}}
@keyframes ping{75%,100%{transform:scale(2.6);opacity:0}}

/* ---------- intro ---------- */
.intro-screen{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem;background:#030b0a;overflow:hidden;animation:introOut .3s ease 1.9s forwards}
@keyframes introOut{to{opacity:0}}
.intro-light{position:absolute;width:60vmax;height:60vmax;border-radius:50%;background:radial-gradient(circle,rgba(92,242,200,.16),transparent 60%)}
.leader{position:relative;width:min(56vw,250px);aspect-ratio:1;border-radius:50%;border:2px solid rgba(255,244,230,.55);box-shadow:0 0 60px rgba(92,242,200,.15)}
.leader::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(255,244,230,.4),rgba(255,244,230,.4)) center/1px 100% no-repeat,linear-gradient(rgba(255,244,230,.4),rgba(255,244,230,.4)) center/100% 1px no-repeat}
.leader::after{content:"";position:absolute;inset:14%;border-radius:50%;border:1px solid rgba(255,244,230,.4)}
.sweep{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(92,242,200,.6),transparent 70%);animation:spin .73s linear 3}
.leader b{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--disp);font-size:clamp(4.5rem,22vw,7.5rem);font-weight:700;opacity:0;animation:num .73s ease both;animation-delay:calc(var(--k)*.73s)}
@keyframes num{0%{opacity:0;transform:scale(1.5)}18%{opacity:1;transform:none}82%{opacity:1}100%{opacity:0}}
.intro-copy{position:relative;text-align:center;display:grid;gap:.5rem;justify-items:center}
.intro-copy>*{margin:0;opacity:0;animation:rise .8s cubic-bezier(.2,.7,.2,1) both}
.intro-copy span{font-size:.62rem;letter-spacing:.4em;color:var(--mint);animation-delay:.2s}
.intro-copy small{font-size:.55rem;letter-spacing:.4em;color:rgba(255,244,230,.5);animation-delay:.35s}
.intro-copy h1{font-size:clamp(2rem,9vw,3.6rem);font-weight:800;letter-spacing:-.01em;animation-delay:.5s}
.intro-copy p{font-size:.7rem;letter-spacing:.38em;animation-delay:.8s}
.intro-copy em{font-size:1.1rem;color:var(--peach);animation-delay:1s}

/* ---------- global layers ---------- */
.site{position:relative;min-height:100svh;overflow:hidden}
.site>section,.site>footer{position:relative;z-index:2}
.aurora{position:fixed;inset:0;z-index:0;overflow:hidden;background:radial-gradient(ellipse at 20% 0,#0b3a35 0,transparent 55%),radial-gradient(ellipse at 90% 100%,#2a1030 0,transparent 55%),#04100F}
.aurora i{position:absolute;border-radius:50%;filter:blur(90px);opacity:.45;animation:aur 20s ease-in-out infinite alternate}
.aurora i:nth-child(1){width:55vmax;height:40vmax;left:-12vmax;top:-8vmax;background:linear-gradient(135deg,rgba(92,242,200,.5),rgba(40,120,200,.3))}
.aurora i:nth-child(2){width:50vmax;height:38vmax;right:-14vmax;top:30vh;background:linear-gradient(135deg,rgba(255,122,89,.4),rgba(139,123,255,.3));animation-delay:-7s}
.aurora i:nth-child(3){width:45vmax;height:35vmax;left:20vw;bottom:-14vmax;background:linear-gradient(135deg,rgba(139,123,255,.35),rgba(92,242,200,.25));animation-delay:-13s}
@keyframes aur{to{transform:translate3d(8vmax,6vmax,0) scale(1.15)}}
.spotlight{position:fixed;inset:0;z-index:3;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(92,242,200,.1),transparent 70%)}
@media(hover:none){.spotlight{display:none}}
.grain{position:fixed;inset:0;z-index:150;pointer-events:none;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.prog{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--mint),var(--coral))}

/* ---------- nav ---------- */
.nav{position:fixed;top:.9rem;left:50%;z-index:80;transform:translateX(-50%);display:flex;align-items:center;gap:.3rem;max-width:calc(100vw - 1.2rem);padding:.35rem .4rem;border-radius:99px;border:1px solid rgba(255,244,230,.14);background:rgba(4,16,15,.62);backdrop-filter:blur(16px);animation:drop 1s cubic-bezier(.2,.7,.2,1) both}
@keyframes drop{from{opacity:0;transform:translate(-50%,-30px)}}
.brand{padding:.55rem .9rem;font-size:.6rem;letter-spacing:.28em;white-space:nowrap}.brand b{color:var(--mint);font-weight:700}
.nav nav{display:flex;gap:.1rem;overflow-x:auto;scrollbar-width:none}.nav nav::-webkit-scrollbar{display:none}
.nav nav button{padding:.55rem .8rem;border-radius:99px;font-size:.56rem;letter-spacing:.2em;color:rgba(255,244,230,.6);white-space:nowrap;transition:background .3s,color .3s}
.nav nav button:hover{color:var(--cream)}.nav nav button.on{background:var(--cream);color:#04100F;font-weight:600}
.audio{display:inline-flex;align-items:center;gap:.3rem;padding:.55rem .9rem;border-radius:99px;border:1px solid rgba(92,242,200,.35);font-size:.58rem;letter-spacing:.2em;color:var(--mint);white-space:nowrap}
.audio.on{background:rgba(92,242,200,.12)}
.eq{display:inline-flex;align-items:flex-end;gap:2px;height:11px}.eq i{width:2px;height:100%;background:var(--mint);transform-origin:bottom;animation:eqa .9s ease-in-out infinite}
.eq i:nth-child(2){animation-delay:.2s}.eq i:nth-child(3){animation-delay:.4s}
@keyframes eqa{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@media(max-width:760px){.brand{display:none}}

/* ---------- birthday lock ---------- */
.birthday-lock{position:fixed;inset:0;z-index:300;display:grid;place-items:center;overflow:hidden;background:#030b0a;color:var(--cream)}
.lock-grid{position:absolute;inset:-20%;opacity:.28;background-image:linear-gradient(rgba(92,242,200,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(92,242,200,.09) 1px,transparent 1px);background-size:54px 54px;transform:perspective(700px) rotateX(62deg) translateY(18%);mask-image:linear-gradient(transparent,#000 35%,transparent 100%);animation:grid 8s linear infinite}
.lock-orb{position:absolute;width:60vmax;height:60vmax;border-radius:50%;background:radial-gradient(circle,rgba(92,242,200,.16),rgba(139,123,255,.08) 35%,transparent 68%);filter:blur(10px);animation:breathe 5s ease-in-out infinite}
.lock-content{position:relative;z-index:2;width:min(92vw,720px);padding:2.5rem 1.25rem;text-align:center;animation:rise 1s cubic-bezier(.2,.7,.2,1) both}
.lock-eyebrow{display:inline-block;color:var(--mint);font-size:.6rem;font-weight:700;letter-spacing:.42em;margin-bottom:1.5rem}
.lock-icon{width:76px;height:76px;margin:0 auto 1.4rem;display:grid;place-items:center;border:1px solid rgba(92,242,200,.3);border-radius:50%;background:rgba(92,242,200,.06);box-shadow:0 0 50px rgba(92,242,200,.12)}
.lock-icon svg{width:40px;height:40px;fill:none;stroke:var(--mint);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.lock-content h1{margin:0;font-size:clamp(2.2rem,8vw,5.5rem);line-height:.95;letter-spacing:-.04em;font-weight:800}
.lock-subtitle{margin:1.4rem 0 .45rem;color:rgba(255,244,230,.6);font-size:1rem}
.lock-content>strong{display:block;color:var(--coral);font-family:var(--disp);font-size:clamp(1.4rem,4vw,2.1rem);letter-spacing:.08em}
.lock-countdown{display:grid;grid-template-columns:repeat(4,1fr);gap:.55rem;max-width:560px;margin:2rem auto 0}
.lock-unit{padding:1rem .35rem;border:1px solid rgba(255,244,230,.12);border-radius:1rem;background:rgba(255,244,230,.045);backdrop-filter:blur(12px)}
.lock-unit b{display:block;font-family:var(--disp);font-size:clamp(1.7rem,5vw,2.8rem);line-height:1;font-variant-numeric:tabular-nums}
.lock-unit small{display:block;margin-top:.45rem;color:rgba(255,244,230,.45);font-size:.45rem;letter-spacing:.2em}
.lock-note{margin:1.5rem auto 0;color:rgba(255,244,230,.42);font-size:.7rem;letter-spacing:.05em}
@media(max-width:560px){.lock-countdown{gap:.3rem}.lock-unit{padding:.8rem .15rem}.lock-unit small{font-size:.38rem;letter-spacing:.12em}}

/* ---------- premiere ---------- */
.premiere{min-height:100svh;display:grid;place-items:center;padding:6.5rem 1rem 3rem;overflow:hidden}
.cinema-grid{position:absolute;inset:0;opacity:.35;background-image:linear-gradient(rgba(92,242,200,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(92,242,200,.12) 1px,transparent 1px);background-size:56px 56px;transform:perspective(500px) rotateX(58deg) translateY(-12%);transform-origin:50% 100%;mask:linear-gradient(transparent,#000 60%);-webkit-mask:linear-gradient(transparent,#000 60%);animation:grid 6s linear infinite}
@keyframes grid{to{background-position:0 56px}}
.beams i{position:absolute;bottom:-12%;width:20vmax;height:130vh;transform-origin:50% 100%;background:linear-gradient(to top,rgba(255,244,230,.34),transparent 78%);clip-path:polygon(44% 100%,56% 100%,100% 0,0 0);filter:blur(6px);mix-blend-mode:screen;animation:beam 9s ease-in-out infinite alternate}
.beams i:nth-child(1){left:6%;--a:-34deg;--b:14deg}.beams i:nth-child(2){left:calc(50% - 10vmax);--a:24deg;--b:-24deg;animation-duration:11s}.beams i:nth-child(3){right:6%;--a:-14deg;--b:34deg;animation-duration:8s}
@keyframes beam{from{transform:rotate(var(--a))}to{transform:rotate(var(--b))}}
.ticket{position:relative;z-index:2;display:grid;width:min(94vw,780px);border-radius:1.5rem;background:linear-gradient(135deg,#fff4e6,#ffd9bf 60%,#ffb596);color:#1b0d09;box-shadow:0 50px 110px -30px rgba(255,122,89,.55);animation:ticketIn 1.3s cubic-bezier(.2,.7,.2,1) both;transform:perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out;--sy:170px;--sx:190px;-webkit-mask:radial-gradient(circle 14px at 0 calc(100% - var(--sy)),#0000 98%,#000),radial-gradient(circle 14px at 100% calc(100% - var(--sy)),#0000 98%,#000);-webkit-mask-composite:source-in;mask:radial-gradient(circle 14px at 0 calc(100% - var(--sy)),#0000 98%,#000),radial-gradient(circle 14px at 100% calc(100% - var(--sy)),#0000 98%,#000);mask-composite:intersect}
@keyframes ticketIn{from{opacity:0;transform:perspective(1200px) rotateX(40deg) translateY(80px) scale(.9)}}
@media(min-width:760px){.ticket{grid-template-columns:1fr var(--sx);-webkit-mask:radial-gradient(circle 14px at calc(100% - var(--sx)) 0,#0000 98%,#000),radial-gradient(circle 14px at calc(100% - var(--sx)) 100%,#0000 98%,#000);mask:radial-gradient(circle 14px at calc(100% - var(--sx)) 0,#0000 98%,#000),radial-gradient(circle 14px at calc(100% - var(--sx)) 100%,#0000 98%,#000);-webkit-mask-composite:source-in;mask-composite:intersect}}
.t-main{padding:2rem 1.5rem 1.7rem;text-align:center}
.eyebrow{display:inline-block;font-size:.6rem;font-weight:700;letter-spacing:.38em;color:var(--coral)}
.premiere .eyebrow{color:#c2432a}
.units{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin:1.2rem 0}
.u{padding:.9rem .2rem .7rem;border-radius:1rem;background:rgba(27,13,9,.92);color:var(--cream);box-shadow:inset 0 0 0 1px rgba(255,244,230,.1)}
.u b{display:block;font-family:var(--disp);font-size:clamp(1.9rem,8vw,3.2rem);font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.u small{display:block;margin-top:.45rem;font-size:.46rem;letter-spacing:.24em;color:rgba(255,244,230,.55)}
.u.hot b{color:var(--coral)}.u.hot{animation:hotp 2s ease-in-out infinite}
@keyframes hotp{50%{box-shadow:inset 0 0 0 1px rgba(255,122,89,.6),0 0 24px rgba(255,122,89,.4)}}
.flip{animation:flip .6s cubic-bezier(.2,.7,.2,1)}
@keyframes flip{from{opacity:0;transform:perspective(300px) rotateX(-80deg) translateY(-20%)}}
.t-main p{margin:.3rem 0 1.2rem;font-family:var(--disp);font-style:italic;font-size:1.2rem}
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;padding:1rem 2.1rem;border-radius:99px;font-size:.66rem;font-weight:700;letter-spacing:.3em;color:#04100F;background:linear-gradient(135deg,var(--mint),#9ff7e0);box-shadow:0 14px 40px -12px rgba(92,242,200,.6);transition:transform .3s,box-shadow .3s}
.btn:hover{transform:translateY(-3px);box-shadow:0 20px 50px -10px rgba(92,242,200,.8)}
.btn::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);transform:skewX(-20deg);animation:shine 3.6s ease-in-out infinite}
@keyframes shine{0%,50%{left:-60%}100%{left:140%}}
.btn.cut{background:linear-gradient(135deg,var(--coral),#ffa88f);box-shadow:0 14px 40px -12px rgba(255,122,89,.7);margin-top:1.5rem}
.note{display:block;margin-top:1rem;font-size:.7rem;color:rgba(27,13,9,.6)}
.t-stub{display:grid;place-items:center;gap:.4rem;padding:1.2rem 1rem;border-top:2px dashed rgba(27,13,9,.3);text-align:center}
@media(min-width:760px){.t-stub{border-top:0;border-left:2px dashed rgba(27,13,9,.3)}}
.t-stub span{font-size:.55rem;font-weight:700;letter-spacing:.4em}.t-stub b{font-family:var(--disp);font-size:1.1rem}.t-stub small{font-size:.5rem;letter-spacing:.3em;color:rgba(27,13,9,.6)}
.barcode{width:80%;height:46px;background:repeating-linear-gradient(90deg,#1b0d09 0 2px,transparent 2px 4px,#1b0d09 4px 5px,transparent 5px 8px,#1b0d09 8px 11px,transparent 11px 12px,#1b0d09 12px 13px,transparent 13px 17px)}

/* ---------- hero ---------- */
.hero{min-height:100svh;display:flex;align-items:center;padding:7rem 1.5rem 5rem;overflow:hidden}
.blobs{position:absolute;inset:0;pointer-events:none;transform:translate3d(calc((var(--mx) - 50vw)*-.02),calc((var(--my) - 50vh)*-.02),0)}
.blobs i{position:absolute;border-radius:50%;filter:blur(70px);mix-blend-mode:screen;animation:blob 14s ease-in-out infinite alternate}
.b1{width:44vmax;height:44vmax;left:-8vmax;top:6vh;background:rgba(92,242,200,.28)}
.b2{width:36vmax;height:36vmax;right:-6vmax;top:-6vh;background:rgba(255,122,89,.32);animation-delay:-5s!important}
.b3{width:30vmax;height:30vmax;left:30vw;bottom:-10vmax;background:rgba(139,123,255,.3);animation-delay:-9s!important}
@keyframes blob{to{transform:translate3d(6vmax,-4vmax,0) scale(1.2)}}
.hero-copy{position:relative;max-width:1200px;width:100%;margin:0 auto}
.hero h1{margin:1rem 0 1.4rem;font-size:clamp(4rem,19vw,15rem);font-weight:800;line-height:.84;letter-spacing:-.045em}
.hl{display:block}.hl.it{font-style:italic;font-weight:300}
.lt{display:inline-block;background:linear-gradient(180deg,#fff 10%,#d8fff4 55%,#5cf2c8);-webkit-background-clip:text;background-clip:text;color:transparent;animation:letterIn 1.2s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.2s + var(--i)*.07s)}
.hl.it .lt{background-image:linear-gradient(100deg,#ff7a59 20%,#ffd9c9 45%,#ff7a59 60%,#ffa88f 85%);background-size:250% 100%;animation:letterIn 1.2s cubic-bezier(.2,.7,.2,1) both,sheen 6s linear infinite;animation-delay:calc(.2s + var(--i)*.07s),0s}
@keyframes letterIn{from{opacity:0;filter:blur(20px);transform:translate3d(0,50px,0) scale(1.1)}to{opacity:1;filter:blur(0);transform:none}}
.hero-copy>p{margin:0 0 2rem;max-width:30rem;font-family:var(--disp);font-style:italic;font-size:clamp(1.2rem,3vw,1.7rem);line-height:1.4;color:rgba(255,244,230,.8);animation:rise 1s ease 1s both}
.hero .eyebrow{color:var(--mint);animation:fade 1s ease .1s both}
.scroll-btn{font-size:.58rem;letter-spacing:.3em;color:var(--mint);border-bottom:1px solid rgba(92,242,200,.4);padding-bottom:.4rem;animation:rise 1s ease 1.3s both}
.scroll-btn:hover{border-color:var(--mint)}
.badge{position:absolute;right:max(1.5rem,6vw);bottom:18%;width:clamp(120px,22vw,220px);aspect-ratio:1;display:grid;place-items:center}
.badge svg{position:absolute;inset:0;animation:spin 24s linear infinite}
.badge text{font-size:11.5px;letter-spacing:.2em;fill:var(--cream);font-weight:500}
.badge b{display:grid;place-items:center;width:46%;aspect-ratio:1;border-radius:50%;font-family:var(--disp);font-size:clamp(1.6rem,5vw,2.8rem);font-weight:700;color:#04100F;background:linear-gradient(135deg,var(--mint),var(--coral));box-shadow:0 0 50px rgba(92,242,200,.4);animation:breathe 4s ease-in-out infinite}
@keyframes breathe{50%{transform:scale(1.08);box-shadow:0 0 80px rgba(255,122,89,.5)}}
.scene-tag{position:absolute;left:1.5rem;bottom:1.6rem;display:flex;align-items:center;gap:.8rem;font-size:.56rem;letter-spacing:.3em;color:rgba(255,244,230,.55)}
.scene-tag::before{content:"";width:2.6rem;height:1px;background:var(--mint)}

/* ---------- sections ---------- */
.section{max-width:1200px;margin:0 auto;padding:7rem 1.25rem}
.section-head{margin-bottom:3.5rem}
.section-head span{display:inline-flex;align-items:center;gap:.6rem;padding:.45rem 1rem;border-radius:99px;border:1px solid rgba(92,242,200,.35);font-size:.56rem;letter-spacing:.34em;color:var(--mint)}
.section-head h2{margin:1.2rem 0 .8rem;font-size:clamp(2.6rem,8vw,6rem);font-weight:800;line-height:.95;letter-spacing:-.03em}
.section-head p{margin:0;max-width:30rem;font-size:1.05rem;color:rgba(255,244,230,.6)}
.reveal{opacity:0;transform:translateY(46px);filter:blur(6px);transition:opacity 1s ease,transform 1s cubic-bezier(.2,.7,.2,1),filter 1s ease}
.reveal.is-visible{opacity:1;transform:none;filter:none}

.story-grid{display:grid;gap:3.5rem;align-items:center}
@media(min-width:860px){.story-grid{grid-template-columns:.8fr 1.2fr;gap:5rem}}
.portrait{position:relative;max-width:380px;width:100%;margin:0 auto;aspect-ratio:3/4;overflow:hidden;border-radius:50% 50% 1.5rem 1.5rem/36% 36% 1.5rem 1.5rem;border:1px solid rgba(255,244,230,.2);background:linear-gradient(160deg,#0e3b36,#1b1030 70%,#4a1f2a);display:grid;place-items:center}
.portrait i{position:absolute;border-radius:50%;filter:blur(34px);animation:blob 9s ease-in-out infinite alternate}
.portrait .m1{width:70%;height:50%;left:-10%;top:10%;background:rgba(92,242,200,.55)}.portrait .m2{width:60%;height:50%;right:-10%;top:30%;background:rgba(255,122,89,.55);animation-delay:-3s}.portrait .m3{width:60%;height:40%;left:20%;bottom:-6%;background:rgba(139,123,255,.55);animation-delay:-6s}
.portrait b{position:relative;font-family:var(--disp);font-style:italic;font-size:clamp(9rem,30vw,15rem);font-weight:800;line-height:1;color:transparent;background:linear-gradient(180deg,#fff,rgba(255,244,230,.4));-webkit-background-clip:text;background-clip:text}
.p-ring{position:absolute;inset:8%;width:84%;height:84%;animation:spin 20s linear infinite}.p-ring circle:first-child{fill:none;stroke:rgba(255,244,230,.25);stroke-dasharray:2 3}.p-ring circle:last-child{fill:var(--mint);filter:drop-shadow(0 0 4px var(--mint))}
.portrait span{position:absolute;left:0;right:0;bottom:1.2rem;text-align:center;font-size:.55rem;letter-spacing:.34em;color:rgba(255,244,230,.7)}
.script{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.3em;color:var(--coral)}
.script::after{content:"▮";margin-left:.4rem;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.story-text h3{margin:1rem 0 1.5rem;font-size:clamp(1.9rem,5vw,3.2rem);font-weight:600;line-height:1.12;background:linear-gradient(100deg,#fff 40%,var(--mint));-webkit-background-clip:text;background-clip:text;color:transparent}
.story-text p{margin:0 0 1.1rem;font-size:1.05rem;line-height:1.85;color:rgba(255,244,230,.7)}

/* art */
.art{position:absolute;inset:0;overflow:hidden}
.art::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.2) 50%,transparent 65%);background-size:250% 100%;animation:sheen 7s linear infinite;pointer-events:none}
.art svg{position:absolute;inset:0;width:100%;height:100%}
.spin,.pls,.rg,.blink,.tw,.drift,.rise,.bar{transform-box:fill-box;transform-origin:center}
.spin{animation:spin 18s linear infinite}
.pls{animation:pls 3s ease-in-out infinite}@keyframes pls{50%{transform:scale(1.08)}}
.rg{animation:rg 3s ease-out infinite}@keyframes rg{from{transform:scale(1);opacity:.9}to{transform:scale(3.4);opacity:0}}
.blink{animation:blink 1.2s steps(1) infinite}
.tw{animation:tw 2.4s ease-in-out infinite}@keyframes tw{50%{opacity:.2;transform:scale(.6)}}
.drift{animation:drift 9s ease-in-out infinite alternate}@keyframes drift{to{transform:translate(12px,-10px)}}.drift.d2{animation-duration:12s}
.rise{animation:sun 6s ease-in-out infinite alternate}@keyframes sun{to{transform:translateY(-8px) scale(1.06)}}
.bar{transform-origin:50% 100%;animation:bar 1.1s ease-in-out infinite alternate}@keyframes bar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
.wave{animation:drift 3s ease-in-out infinite alternate}

/* ---------- scenes reel ---------- */
.reel{position:relative;overflow:hidden;padding:2.4rem 0;border-block:1px solid rgba(255,244,230,.14);background:rgba(2,8,7,.75);-webkit-mask:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
.reel::before,.reel::after{content:"";position:absolute;left:0;right:0;height:14px;z-index:2;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='14'%3E%3Crect x='8' y='3' width='12' height='8' rx='2' fill='%23fff4e6' fill-opacity='.22'/%3E%3C/svg%3E") repeat-x}
.reel::before{top:4px}.reel::after{bottom:4px}
.reel-track{display:flex;gap:1rem;width:max-content;padding-left:1rem;animation:reel 55s linear infinite}
@keyframes reel{to{transform:translateX(-50%)}}
.reel:hover .reel-track{animation-play-state:paused}
.film-frame{position:relative;flex:none;width:min(64vw,250px);aspect-ratio:3/4;overflow:hidden;border-radius:.7rem;border:1px solid rgba(255,244,230,.2);text-align:left;transition:transform .5s cubic-bezier(.2,.7,.2,1),border-color .4s,box-shadow .4s}
.film-frame:hover{transform:translateY(-10px) scale(1.04);border-color:var(--mint);box-shadow:0 30px 60px -20px rgba(92,242,200,.45)}
.film-frame.active{border-color:var(--coral);box-shadow:0 0 0 2px rgba(255,122,89,.35),0 24px 50px -16px rgba(255,122,89,.5)}
.frame-meta{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:2rem 1rem 1rem;background:linear-gradient(transparent,rgba(0,0,0,.82))}
.frame-meta span{display:block;font-size:.5rem;letter-spacing:.3em;color:var(--mint)}
.frame-meta b{display:block;margin-top:.35rem;font-family:var(--disp);font-size:1.1rem;font-weight:700;line-height:1.1}

.quote-scene{position:relative;display:grid;place-items:center;min-height:90vh;padding:6rem 1.25rem;text-align:center;overflow:hidden}
.q-bg{position:absolute;left:0;top:50%;white-space:nowrap;font-family:var(--disp);font-size:clamp(6rem,22vw,16rem);font-weight:900;color:transparent;-webkit-text-stroke:1px rgba(255,244,230,.08);transform:translateY(-50%);animation:qm 40s linear infinite}
@keyframes qm{to{transform:translate(-50%,-50%)}}
.quote-scene>div:not(.q-bg){position:relative}
.quote-scene span{font-size:.58rem;letter-spacing:.36em;color:var(--mint)}
.quote-scene h2{margin:1.5rem 0;font-size:clamp(2.4rem,8vw,6rem);font-weight:700;line-height:1.02;letter-spacing:-.03em}
.quote-scene h2 i{font-weight:300;background:linear-gradient(100deg,#ff7a59,#ffd9c9,#ff7a59);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 6s linear infinite}
.quote-scene small{font-size:.6rem;letter-spacing:.3em;color:rgba(255,244,230,.5)}

/* ---------- timeline ---------- */
.timeline{position:relative;display:grid;gap:5rem}
.timeline::before,.timeline::after{content:"";position:absolute;left:1.3rem;top:0;bottom:0;width:2px}
.timeline::before{background:rgba(255,244,230,.12)}
.timeline::after{background:linear-gradient(var(--mint),var(--coral));transform-origin:top;transform:scaleY(var(--tl,0));box-shadow:0 0 14px rgba(92,242,200,.6)}
.memory{position:relative;display:grid;gap:1.4rem;align-items:center;padding-left:4rem}
.timeline-dot{position:absolute;left:0;top:0;display:grid;place-items:center;width:2.7rem;height:2.7rem;border-radius:50%;background:#04100F;border:1px solid var(--mint);font-family:var(--disp);font-weight:700;color:var(--mint);box-shadow:0 0 24px rgba(92,242,200,.35);z-index:2}
.memory-image{position:relative;aspect-ratio:4/3;overflow:hidden;border-radius:1.2rem;border:1px solid rgba(255,244,230,.2);cursor:zoom-in;transition:transform .6s cubic-bezier(.2,.7,.2,1),border-color .4s,box-shadow .4s}
.memory-image:hover{transform:scale(1.03) rotate(-.6deg);border-color:var(--mint);box-shadow:0 30px 60px -20px rgba(92,242,200,.4)}
.memory-copy span{font-size:.58rem;letter-spacing:.34em;color:var(--coral)}
.memory-copy h3{margin:.7rem 0;font-size:clamp(1.7rem,4vw,2.6rem);font-weight:700;line-height:1.08}
.memory-copy p{margin:0;line-height:1.8;color:rgba(255,244,230,.65)}
@media(min-width:900px){
.timeline::before,.timeline::after{left:calc(50% - 1px)}
.memory{grid-template-columns:1fr 1fr;gap:5rem;padding-left:0}
.timeline-dot{left:calc(50% - 1.35rem)}
.memory:nth-child(even) .memory-image{order:2}
}

/* ---------- letter ---------- */
.mail{display:grid;justify-items:center;gap:1.5rem}
.envelope{position:relative;width:min(88vw,420px);height:250px;border-radius:.9rem;background:linear-gradient(160deg,#ffe9d6,#ffc4a3);color:#2a120c;box-shadow:0 40px 80px -30px rgba(255,122,89,.5);perspective:900px;transition:transform .8s,opacity .8s,height .9s .9s,margin .9s .9s}
.envelope:not(:disabled):hover{transform:translateY(-6px) rotate(-1deg)}
.env-flap{position:absolute;left:0;right:0;top:0;height:56%;background:linear-gradient(#ffd7bc,#ffb996);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:top;transition:transform .9s cubic-bezier(.5,0,.2,1);z-index:2}
.env-front{position:absolute;inset:0;background:linear-gradient(160deg,#ffe0c8,#ffbb99);clip-path:polygon(0 0,50% 52%,100% 0,100% 100%,0 100%);border-radius:.9rem}
.seal{position:absolute;left:50%;top:44%;z-index:3;display:grid;place-items:center;width:3.6rem;height:3.6rem;margin:-1.8rem 0 0 -1.8rem;border-radius:50%;font-family:var(--disp);font-size:1.7rem;font-weight:700;color:#fff;background:radial-gradient(circle at 35% 30%,#ff9a7a,#c2432a 70%);box-shadow:0 8px 20px rgba(194,67,42,.5);animation:breathe 3s ease-in-out infinite;transition:opacity .4s}
.env-label{position:absolute;left:0;right:0;bottom:2.6rem;z-index:3;font-size:.62rem;font-weight:700;letter-spacing:.3em}
.envelope small{position:absolute;left:0;right:0;bottom:1.2rem;z-index:3;font-size:.5rem;letter-spacing:.3em;opacity:.6}
.mail.open .env-flap{transform:rotateX(180deg);z-index:0}
.mail.open .seal{opacity:0}
.mail.open .envelope{height:0;opacity:0;transform:scale(.8);margin-bottom:-1.5rem;overflow:hidden}
.letter{position:relative;width:min(92vw,720px);padding:2.4rem 1.6rem;border-radius:1.2rem;background:repeating-linear-gradient(transparent 0 31px,rgba(194,67,42,.12) 31px 32px),linear-gradient(160deg,#fffaf2,#ffeedd);color:#2a120c;box-shadow:0 50px 100px -30px rgba(0,0,0,.7);animation:paper 1.1s cubic-bezier(.2,.7,.2,1) .5s both}
@keyframes paper{from{opacity:0;transform:translateY(120px) scale(.9) rotate(-2deg)}}
@media(min-width:700px){.letter{padding:3.2rem}}
.letter .script{color:#c2432a}
.letter p,.letter h3{margin:1.2rem 0 0;line-height:2;font-family:var(--disp);font-size:1.18rem;font-weight:400;animation:rise .9s ease both;animation-delay:calc(1s + var(--i)*.35s)}
.letter h3{font-size:1.9rem;font-weight:700;font-style:italic;color:#c2432a}
.letter .signature{font-style:italic}
.close-letter{margin-top:2rem;padding:.7rem 1.5rem;border-radius:99px;border:1px solid rgba(42,18,12,.35);font-size:.58rem;font-weight:700;letter-spacing:.3em;transition:background .3s,color .3s}
.close-letter:hover{background:#2a120c;color:var(--cream)}

/* ---------- celebration ---------- */
.celebration{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7rem 1.25rem;text-align:center;overflow:hidden}
.celebration-light{position:absolute;left:50%;top:10%;width:90vmax;height:90vmax;margin-left:-45vmax;border-radius:50%;opacity:.5;background:conic-gradient(from 0deg,transparent 0 6%,rgba(92,242,200,.18) 8%,transparent 10% 30%,rgba(255,122,89,.2) 32%,transparent 34% 55%,rgba(139,123,255,.18) 57%,transparent 59% 80%,rgba(255,201,168,.18) 82%,transparent 84%);-webkit-mask:radial-gradient(circle,#000 10%,transparent 62%);mask:radial-gradient(circle,#000 10%,transparent 62%);animation:spin 40s linear infinite}
.balloon{position:absolute;bottom:-22%;width:64px;height:80px;border-radius:50% 50% 48% 48%;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.65),transparent 28%),var(--b);box-shadow:inset -8px -10px 18px rgba(0,0,0,.25);animation:balloon var(--d) linear infinite var(--dl)}
.balloon::after{content:"";position:absolute;left:50%;top:100%;width:1px;height:70px;background:rgba(255,244,230,.4)}
@keyframes balloon{0%{transform:translate3d(0,0,0) rotate(-4deg)}50%{transform:translate3d(24px,-70vh,0) rotate(5deg)}100%{transform:translate3d(-12px,-135vh,0) rotate(-4deg)}}
.celebration>*:not(.celebration-light):not(.balloon){position:relative}
.celebration h2{margin:1rem 0 0;font-size:clamp(1.2rem,4vw,2rem);font-weight:400;letter-spacing:.3em;color:var(--peach)}
.celebration h1{margin:.2rem 0 .6rem;font-size:clamp(3rem,13vw,9rem);font-weight:800;line-height:.92;letter-spacing:-.04em;background:linear-gradient(100deg,#5cf2c8,#fff 40%,#ff7a59 80%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 8s linear infinite}
.celebration p{margin:0;font-family:var(--disp);font-style:italic;font-size:1.4rem;color:rgba(255,244,230,.8)}
.cake{width:min(80vw,320px);margin-top:1.5rem;animation:float 6s ease-in-out infinite;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))}
@keyframes float{50%{transform:translateY(-10px)}}
.cake svg{display:block;width:100%;overflow:visible}
.fl{transform-box:fill-box;transform-origin:50% 100%;animation:flick .22s ease-in-out infinite alternate;transition:opacity .6s}
@keyframes flick{from{transform:scale(1,.92) rotate(-3deg)}to{transform:scale(.92,1.08) rotate(3deg)}}
.cut .fl{opacity:0}
.slice{opacity:0;transition:opacity .4s .3s,transform 1s cubic-bezier(.2,.7,.2,1) .3s}
.cut .slice{opacity:1;transform:translate(34px,14px) rotate(6deg)}

/* ---------- credits ---------- */
.credits{display:flex;flex-direction:column;align-items:center;padding:6rem 1.25rem 5rem;text-align:center;border-top:1px solid rgba(255,244,230,.1);background:linear-gradient(transparent,rgba(2,8,7,.9))}
.credits>span{font-size:.58rem;letter-spacing:.4em;color:var(--mint)}
.credits h2{margin:1rem 0 2rem;font-size:clamp(2rem,7vw,4.5rem);font-weight:800;letter-spacing:-.03em}
.roll{position:relative;width:min(92vw,520px);height:20rem;overflow:hidden;-webkit-mask:linear-gradient(transparent,#000 22%,#000 78%,transparent);mask:linear-gradient(transparent,#000 22%,#000 78%,transparent)}
.credit-block{animation:rollup 20s linear infinite}
.roll:hover .credit-block{animation-play-state:paused}
@keyframes rollup{from{transform:translateY(20rem)}to{transform:translateY(-100%)}}
.credit-block p{margin:2rem 0 .4rem;font-size:.55rem;letter-spacing:.38em;color:var(--coral)}
.credit-block b{display:block;font-family:var(--disp);font-size:1.6rem;font-weight:600}
.credits h3{margin:2.5rem 0 .5rem;font-size:clamp(2.5rem,9vw,5rem);font-weight:300;font-style:italic;letter-spacing:.1em}
.beginning{margin:0 0 2rem;color:rgba(255,244,230,.55)}
.replay{padding:.9rem 1.8rem;border-radius:99px;border:1px solid rgba(92,242,200,.45);font-size:.6rem;letter-spacing:.3em;color:var(--mint);transition:background .3s,color .3s}
.replay:hover{background:var(--mint);color:#04100F}

/* ---------- overlays ---------- */
.finale-overlay{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:1.5rem;text-align:center;background:radial-gradient(circle at 50% 40%,rgba(255,122,89,.35),rgba(2,8,7,.96) 70%);animation:fade .6s ease}
.finale-overlay canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.f-ring{position:absolute;left:50%;top:45%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;border:1px solid rgba(92,242,200,.5);animation:ringo 3s ease-out infinite}
.f-ring.r2{animation-delay:1.5s;border-color:rgba(255,122,89,.5)}
@keyframes ringo{from{transform:scale(.4);opacity:1}to{transform:scale(3.2);opacity:0}}
.finale-content{position:relative;max-width:42rem;animation:rise 1.2s cubic-bezier(.2,.7,.2,1) .3s both}
.finale-content span{font-size:.6rem;letter-spacing:.4em;color:var(--mint)}
.finale-content h1{margin:1rem 0;font-size:clamp(2.6rem,10vw,6rem);font-weight:800;line-height:1;letter-spacing:-.03em}
.finale-content h1 i{font-weight:300;color:var(--coral)}
.finale-content p{margin:0 0 1.5rem;line-height:1.8;color:rgba(255,244,230,.75)}
.finale-content b{display:block;font-size:.6rem;letter-spacing:.3em;color:var(--peach)}
.finale-content button{margin-top:2rem;padding:1rem 2rem;border-radius:99px;font-size:.62rem;font-weight:700;letter-spacing:.3em;color:#04100F;background:var(--cream);transition:transform .3s,background .3s}
.finale-content button:hover{transform:translateY(-3px);background:var(--mint)}
.viewer{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:1.2rem;background:rgba(2,8,7,.92);backdrop-filter:blur(12px);animation:fade .3s ease}
.viewer-x{position:absolute;top:1rem;right:1.2rem;width:2.8rem;height:2.8rem;border-radius:50%;border:1px solid rgba(255,244,230,.25);font-size:1.5rem;line-height:1}
.viewer-card{display:grid;gap:1rem;width:min(86vw,420px);animation:vin .6s cubic-bezier(.2,.7,.2,1)}
@keyframes vin{from{opacity:0;transform:scale(.92) translateY(30px)}}
.viewer-art{position:relative;aspect-ratio:3/4;max-height:68vh;margin:0 auto;width:100%;overflow:hidden;border-radius:1.2rem;border:1px solid rgba(255,244,230,.25);box-shadow:0 40px 100px -20px rgba(92,242,200,.3)}
.viewer-meta{display:grid;gap:.3rem;text-align:center}
.viewer-meta span{font-size:.56rem;letter-spacing:.32em;color:var(--mint)}
.viewer-meta b{font-family:var(--disp);font-size:1.5rem}
.viewer-meta div{display:flex;justify-content:center;gap:.8rem;margin-top:.6rem}
.viewer-meta div button{width:3rem;height:3rem;border-radius:50%;border:1px solid rgba(255,244,230,.25);transition:background .3s,color .3s}
.viewer-meta div button:hover{background:var(--mint);color:#04100F}

@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}
.intro-screen{animation-duration:.01s}
.grain,.beams,.cinema-grid{display:none}
.aurora i,.blobs i,.lt,.badge svg,.badge b,.reel-track,.q-bg,.credit-block,.balloon,.cake,.fl,.spin,.pls,.rg,.blink,.tw,.drift,.rise,.bar,.wave,.celebration-light,.celebration h1,.btn::after,.u.hot,.seal,.portrait i,.p-ring{animation:none!important}
.reveal{opacity:1;transform:none;filter:none;transition:none}
.credit-block{transform:none}
}
`;
