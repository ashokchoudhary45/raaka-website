'use client';

import { useEffect, useMemo, useState } from 'react';

const TARGET = new Date('2027-07-19T00:00:00+05:30').getTime();

type TimeLeft = { total: number; days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(): TimeLeft {
  const total = Math.max(0, TARGET - Date.now());
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total / 3600000) % 24);
  const minutes = Math.floor((total / 60000) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { total, days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, '0');

function TimerBox({ value, label, big = false }: { value: number; label: string; big?: boolean }) {
  return (
    <div className={`timer-box ${big ? 'timer-box-big' : ''}`}>
      <div className="timer-value">{pad(value)}</div>
      <div className="timer-label">{label}</div>
    </div>
  );
}

export default function NidhiLivePage() {
  const [time, setTime] = useState<TimeLeft>({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [sound, setSound] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const next = getTimeLeft();
      setTime(next);
      if (next.total <= 0) setLaunched(true);
      if (next.total > 0 && next.total <= 10000) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 160);
      }
    };
    update();
    const id = window.setInterval(update, 250);
    return () => window.clearInterval(id);
  }, []);

  const critical = mounted && time.total <= 60000 && time.total > 0;
  const finalTen = mounted && time.total <= 10000 && time.total > 0;
  const displayDays = Math.max(0, time.days);

  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    left: `${(i * 37.17) % 100}%`,
    top: `${(i * 61.73) % 100}%`,
    delay: `${(i % 11) * 0.37}s`,
    duration: `${2.2 + (i % 7) * 0.45}s`,
    size: `${1 + (i % 3)}px`,
  })), []);

  return (
    <main className={`live-page ${critical ? 'critical' : ''} ${finalTen ? 'final-ten' : ''} ${flash ? 'flash' : ''} ${launched ? 'launched' : ''}`}>
      <style>{styles}</style>

      <div className="scanlines" />
      <div className="noise" />
      <div className="vignette" />
      <div className="grid-floor" />

      <div className="stars" aria-hidden="true">
        {stars.map((s, i) => <span key={i} style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }} />)}
      </div>

      <header className="topbar">
        <div className="brand"><span className="brand-mark">N</span><span>NIDHI JI</span></div>
        <div className="live-pill"><i /> LIVE TRANSMISSION</div>
        <div className="date-code">19 · JUL · 2027 <b>IST</b></div>
      </header>

      {!launched ? (
        <section className="launch-screen">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit orbit-c" />

          <div className="eyebrow"><span /> SPECIAL BIRTHDAY COUNTDOWN <span /></div>
          <h1>THE COUNTDOWN<br /><em>HAS BEGUN.</em></h1>
          <p className="subline">A cinematic transmission for the one and only <strong>NIDHI JI</strong></p>

          <div className="tminus">T− <span>{displayDays > 99 ? displayDays : pad(displayDays)}</span> DAYS</div>

          <div className="timer-grid">
            <TimerBox value={displayDays} label="DAYS" big />
            <div className="colon">:</div>
            <TimerBox value={time.hours} label="HOURS" />
            <div className="colon">:</div>
            <TimerBox value={time.minutes} label="MINUTES" />
            <div className="colon">:</div>
            <TimerBox value={time.seconds} label="SECONDS" />
          </div>

          <div className="progress-shell">
            <div className="progress-label"><span>TRANSMISSION STATUS</span><span>{critical ? 'CRITICAL' : 'COUNTING DOWN'}</span></div>
            <div className="progress"><span /></div>
          </div>

          <div className="status-row">
            <span><i className="green-dot" /> SYSTEM ONLINE</span>
            <span>EVENT ID: NIDHI-0719</span>
            <span>JULY 19 · 00:00 IST</span>
          </div>

          <button className={`sound-btn ${sound ? 'on' : ''}`} onClick={() => setSound(!sound)}>
            <span>{sound ? '◉' : '○'}</span> {sound ? 'AMBIENCE ON' : 'ENABLE AMBIENCE'}
          </button>
        </section>
      ) : (
        <section className="reveal-screen">
          <div className="burst" />
          <div className="cake-wrap">
            <div className="cake-glow" />
            <div className="cake-board" />
            <div className="cake">
              <div className="cake-top" />
              <div className="cake-layer layer-1" />
              <div className="cake-layer layer-2" />
              <div className="cake-layer layer-3" />
              <div className="frosting frosting-1" /><div className="frosting frosting-2" />
              <div className="candle c1"><i /></div><div className="candle c2"><i /></div><div className="candle c3"><i /></div>
            </div>
          </div>
          <div className="reveal-kicker">THE MOMENT HAS ARRIVED</div>
          <h2>HAPPY BIRTHDAY<br /><span>NIDHI JI</span></h2>
          <p>May this year be brighter, louder and more beautiful than ever.</p>
          <div className="confetti">{Array.from({ length: 48 }, (_, i) => <i key={i} style={{ '--x': `${(i * 31) % 100}%`, '--d': `${(i % 9) * .13}s`, '--r': `${i * 37}deg` } as React.CSSProperties} />)}</div>
        </section>
      )}

      <footer className="footer"><span>WORLD OF RAAKA · CINEMATIC LIVE SYSTEM</span><span>NO SCROLL · 1920×1080 READY</span></footer>
    </main>
  );
}

const styles = `
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#030407}body{overflow:hidden;font-family:Arial,Helvetica,sans-serif}.live-page{position:relative;width:100vw;height:100vh;min-height:560px;overflow:hidden;color:#fff;background:radial-gradient(circle at 50% 45%,#171b27 0,#080a10 38%,#020307 78%);isolation:isolate}.live-page:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,transparent 0,rgba(255,35,35,.04) 30%,transparent 62%);z-index:-2}.scanlines{position:absolute;inset:0;pointer-events:none;opacity:.09;background:repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(255,255,255,.08) 4px);z-index:20}.noise{position:absolute;inset:-50%;opacity:.035;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");animation:noise .18s steps(2) infinite;z-index:19}.vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 38%,rgba(0,0,0,.65) 100%);z-index:18;pointer-events:none}.grid-floor{position:absolute;left:-20%;right:-20%;bottom:-38%;height:70%;background:linear-gradient(rgba(255,40,40,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,40,40,.12) 1px,transparent 1px);background-size:65px 65px;transform:perspective(420px) rotateX(64deg);transform-origin:50% 100%;opacity:.3;mask-image:linear-gradient(to top,black,transparent);z-index:-1}.stars{position:absolute;inset:0;z-index:-1}.stars span{position:absolute;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(255,255,255,.8);animation:twinkle ease-in-out infinite alternate}.topbar{position:absolute;left:0;right:0;top:0;height:84px;padding:0 4vw;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(0,0,0,.45),transparent);z-index:30;font-size:12px;letter-spacing:.22em}.brand{display:flex;align-items:center;gap:12px;font-weight:800}.brand-mark{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(255,60,60,.8);color:#ff4a4a;box-shadow:0 0 18px rgba(255,40,40,.25);font-size:13px}.live-pill{display:flex;align-items:center;gap:9px;color:#ff6868;font-weight:800}.live-pill i{width:8px;height:8px;border-radius:50%;background:#ff3434;box-shadow:0 0 15px #ff3434;animation:blink 1s infinite}.date-code{color:#8f96a8}.date-code b{color:#fff;font-weight:700}.launch-screen{position:absolute;inset:84px 0 48px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2vh 4vw}.eyebrow{font-size:11px;letter-spacing:.42em;color:#ff6262;font-weight:800;margin-bottom:24px;display:flex;gap:15px;align-items:center}.eyebrow span{width:42px;height:1px;background:#ff4b4b;box-shadow:0 0 10px #ff4b4b}.launch-screen h1{font-size:clamp(42px,6.2vw,104px);line-height:.9;letter-spacing:-.055em;margin:0;font-weight:900;text-transform:uppercase;text-shadow:0 0 45px rgba(255,255,255,.09)}.launch-screen h1 em{font-style:normal;color:#ff4545;text-shadow:0 0 35px rgba(255,30,30,.45)}.subline{margin:22px 0 28px;color:#9299aa;font-size:clamp(12px,1.25vw,18px);letter-spacing:.08em}.subline strong{color:#fff}.tminus{font-family:monospace;color:#70788c;font-size:12px;letter-spacing:.28em;margin-bottom:10px}.tminus span{color:#d9dde6}.timer-grid{display:grid;grid-template-columns:minmax(110px,1.25fr) 25px minmax(90px,1fr) 25px minmax(90px,1fr) 25px minmax(90px,1fr);align-items:center;gap:10px;width:min(960px,88vw)}.timer-box{position:relative;padding:20px 12px 15px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018));box-shadow:inset 0 0 30px rgba(255,255,255,.015),0 15px 50px rgba(0,0,0,.3)}.timer-box:before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#ff4545,transparent);opacity:.8}.timer-box-big{border-color:rgba(255,65,65,.22);background:linear-gradient(180deg,rgba(255,40,40,.08),rgba(255,255,255,.018))}.timer-value{font-family:Impact,Haettenschweiler,'Arial Narrow Bold',sans-serif;font-size:clamp(48px,7vw,104px);line-height:.9;letter-spacing:.04em;color:#f3f5f9;text-shadow:0 0 24px rgba(255,255,255,.1)}.timer-box-big .timer-value{color:#ff5555;text-shadow:0 0 28px rgba(255,40,40,.35)}.timer-label{font-size:9px;letter-spacing:.32em;color:#697184;margin-top:13px}.colon{font-family:monospace;color:#ff5555;font-size:38px;transform:translateY(-9px);text-shadow:0 0 15px rgba(255,40,40,.5)}.progress-shell{width:min(960px,88vw);margin-top:30px}.progress-label{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.2em;color:#596173;margin-bottom:8px}.critical .progress-label span:last-child{color:#ff4545}.progress{height:2px;background:rgba(255,255,255,.08);overflow:hidden}.progress span{display:block;height:100%;width:73%;background:linear-gradient(90deg,transparent,#ff4545,#fff,#ff4545);box-shadow:0 0 14px #ff4545;animation:scan 2.2s linear infinite}.status-row{width:min(960px,88vw);display:flex;justify-content:space-between;margin-top:20px;color:#545c6e;font-size:9px;letter-spacing:.18em}.status-row i{display:inline-block;width:5px;height:5px;border-radius:50%;margin-right:6px}.green-dot{background:#5dff9b;box-shadow:0 0 8px #5dff9b}.sound-btn{margin-top:22px;background:transparent;border:1px solid rgba(255,255,255,.11);color:#70788a;padding:9px 14px;font-size:9px;letter-spacing:.18em;cursor:pointer}.sound-btn:hover,.sound-btn.on{color:#fff;border-color:rgba(255,70,70,.45)}.sound-btn span{color:#ff5050}.orbit{position:absolute;border:1px solid rgba(255,55,55,.08);border-radius:50%;pointer-events:none}.orbit-a{width:60vw;height:60vw;max-width:850px;max-height:850px;animation:spin 28s linear infinite}.orbit-b{width:44vw;height:44vw;max-width:650px;max-height:650px;border-style:dashed;animation:spin 18s linear infinite reverse}.orbit-c{width:72vw;height:22vw;transform:rotate(-25deg);border-color:rgba(255,255,255,.035)}.footer{position:absolute;bottom:0;left:0;right:0;height:48px;padding:0 4vw;display:flex;align-items:center;justify-content:space-between;color:#454d5d;font-size:8px;letter-spacing:.2em;border-top:1px solid rgba(255,255,255,.05);z-index:30}.critical .timer-box{animation:criticalBox 1s infinite alternate}.critical .launch-screen h1{animation:criticalText .9s infinite alternate}.final-ten .timer-value{color:#ff3030!important;text-shadow:0 0 35px rgba(255,0,0,.75)}.final-ten .launch-screen{animation:shake .08s infinite}.flash:after{content:"";position:absolute;inset:0;background:#fff;opacity:.14;z-index:50;pointer-events:none}.reveal-screen{position:absolute;inset:84px 0 48px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;background:radial-gradient(circle at 50% 58%,rgba(255,45,45,.17),transparent 36%)}.burst{position:absolute;width:20vmin;height:20vmin;border-radius:50%;background:#fff;box-shadow:0 0 100px 50px rgba(255,80,80,.4);animation:burst 1.8s ease-out forwards}.cake-wrap{position:relative;width:310px;height:210px;margin-bottom:-3px;transform:translateY(15px)}.cake-glow{position:absolute;left:50%;top:65%;width:270px;height:80px;transform:translate(-50%,-50%);background:rgba(255,55,55,.3);filter:blur(35px)}.cake-board{position:absolute;left:50%;bottom:12px;width:290px;height:26px;transform:translateX(-50%);border-radius:50%;background:linear-gradient(#d8dde5,#777e8b);box-shadow:0 10px 20px rgba(0,0,0,.6)}.cake{position:absolute;left:50%;bottom:28px;width:220px;height:145px;transform:translateX(-50%)}.cake-top{position:absolute;left:50%;top:0;width:190px;height:52px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle at 45% 35%,#ffd7dd,#d86a7b 52%,#6b2334 100%);box-shadow:inset 0 -10px 16px rgba(0,0,0,.25),0 10px 20px rgba(0,0,0,.3)}.cake-layer{position:absolute;left:50%;transform:translateX(-50%);width:190px;height:72px;border-radius:0 0 22px 22px;background:linear-gradient(90deg,#5e1d2b,#b84861 30%,#8d2f45 70%,#4e1725);top:28px;box-shadow:inset 0 -12px 15px rgba(0,0,0,.35)}.layer-2{top:53px;width:205px;height:67px;background:linear-gradient(90deg,#55202b,#d06a78 35%,#8e3245 72%,#461520)}.layer-3{top:78px;width:218px;height:58px;background:linear-gradient(90deg,#4a1724,#9f354b 35%,#6e2538 75%,#39101a)}.frosting{position:absolute;z-index:4;width:206px;height:17px;left:50%;transform:translateX(-50%);top:43px;border-radius:50%;background:#fff1f2;box-shadow:0 3px 5px rgba(0,0,0,.25)}.frosting-2{top:68px;width:216px}.candle{position:absolute;top:-38px;width:9px;height:42px;border-radius:3px;background:repeating-linear-gradient(0deg,#fff 0 7px,#ff5c68 7px 14px);z-index:10}.candle:after{content:"";position:absolute;top:-15px;left:50%;width:9px;height:16px;transform:translateX(-50%);border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 70%,#fff 0 18%,#ffd34d 20% 48%,#ff6b2f 55% 100%);box-shadow:0 0 15px #ff813d}.c1{left:86px}.c2{left:106px;top:-48px}.c3{left:126px}.reveal-kicker{font-size:10px;letter-spacing:.42em;color:#ff7777;font-weight:800}.reveal-screen h2{font-size:clamp(48px,7vw,108px);line-height:.84;letter-spacing:-.06em;margin:18px 0 15px;font-weight:900}.reveal-screen h2 span{color:#ff4e5b;text-shadow:0 0 30px rgba(255,45,55,.4)}.reveal-screen p{color:#aeb4c0;font-size:14px;letter-spacing:.08em}.confetti{position:absolute;inset:0;overflow:hidden;pointer-events:none}.confetti i{position:absolute;left:var(--x);top:-20px;width:7px;height:15px;background:#ff5a67;transform:rotate(var(--r));animation:confetti 3.8s var(--d) linear infinite}.confetti i:nth-child(3n){background:#fff}.confetti i:nth-child(4n){background:#f5c15a}.confetti i:nth-child(5n){background:#8d83ff}@keyframes blink{50%{opacity:.2}}@keyframes twinkle{from{opacity:.15;transform:scale(.7)}to{opacity:1;transform:scale(1.25)}}@keyframes noise{0%{transform:translate(0,0)}25%{transform:translate(2%,1%)}50%{transform:translate(-1%,2%)}75%{transform:translate(1%,-2%)}100%{transform:translate(-2%,0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes scan{from{transform:translateX(-110%)}to{transform:translateX(160%)}}@keyframes criticalBox{from{border-color:rgba(255,255,255,.1)}to{border-color:rgba(255,50,50,.5);box-shadow:0 0 35px rgba(255,30,30,.1)}}@keyframes criticalText{to{letter-spacing:-.04em;text-shadow:0 0 45px rgba(255,20,20,.25)}}@keyframes shake{0%,100%{transform:translate(0)}50%{transform:translate(1px,-1px)}}@keyframes burst{0%{transform:scale(.1);opacity:1}70%{transform:scale(10);opacity:.35}100%{transform:scale(14);opacity:0}}@keyframes confetti{to{transform:translateY(110vh) rotate(700deg)}}
@media(max-width:800px){.topbar{height:64px;padding:0 18px}.date-code{display:none}.launch-screen{inset:64px 0 40px}.timer-grid{grid-template-columns:repeat(2,1fr);gap:8px}.timer-grid .colon{display:none}.timer-box-big{grid-column:span 2}.timer-value{font-size:48px}.timer-box{padding:15px 8px}.status-row{font-size:7px}.status-row span:nth-child(2){display:none}.footer{height:40px;padding:0 15px}.footer span:last-child{display:none}.eyebrow{font-size:8px;letter-spacing:.25em}.eyebrow span{width:18px}.launch-screen h1{font-size:43px}.subline{font-size:11px}.cake-wrap{transform:scale(.78) translateY(12px);margin-bottom:-35px}.reveal-screen h2{font-size:52px}}
`;
