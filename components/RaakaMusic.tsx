"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";

type MusicTrack = {
  title: string;
  src: string;
};

const RAAKA_PLAYLIST: MusicTrack[] = [
  { title: "RAAKA Theme", src: "/sounds/king.mp3" },
  { title: "welcome onboard dp", src: "/sounds/song2.mp3" },
];

const KEY_INDEX = "raaka-music-index";
const KEY_VOLUME = "raaka-music-volume";
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};
const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* ---------- icons ---------- */
const PlayIcon = () => (<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M8 5.2v13.6L19 12z" fill="currentColor" /></svg>);
const PauseIcon = () => (<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1" fill="currentColor" /><rect x="13.8" y="5" width="4.2" height="14" rx="1" fill="currentColor" /></svg>);
const Speaker = ({ level }: { level: 0 | 1 | 2 }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 9.6h3.6L12 5.4v13.2l-4.9-4.2H3.5z" fill="currentColor" stroke="none" />
    {level === 0 ? (
      <g className="rm-x"><path d="M16 9.6l5 4.8" /><path d="M21 9.6l-5 4.8" /></g>
    ) : (
      <>
        <path d="M15.4 9.3a3.9 3.9 0 0 1 0 5.4" />
        {level === 2 && <path d="M18.2 6.7a7.6 7.6 0 0 1 0 10.6" />}
      </>
    )}
  </svg>
);
const Claws = () => (
  <span className="rm-claws" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((n) => (<i key={n} style={cssVars({ "--i": n })} />))}
  </span>
);

export default function RaakaMusic() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progRef = useRef<HTMLSpanElement | null>(null);
  const previousVolumeRef = useRef(0.45);
  const volumeRef = useRef(0.45);
  const userPausedRef = useRef(false);

  const [musicIndex, setMusicIndex] = useState(0);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.45);
  const [ready, setReady] = useState(false);

  /* restore saved choices (null check: a missing key must not read as volume 0) */
  useEffect(() => {
    const rawIndex = store.get(KEY_INDEX);
    const rawVolume = store.get(KEY_VOLUME);
    const savedIndex = rawIndex === null ? NaN : Number(rawIndex);
    const savedVolume = rawVolume === null ? NaN : Number(rawVolume);

    if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < RAAKA_PLAYLIST.length) setMusicIndex(savedIndex);
    if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
      setMusicVolume(savedVolume);
      volumeRef.current = savedVolume;
      if (savedVolume > 0) previousVolumeRef.current = savedVolume;
    }
    setReady(true);
  }, []);

  /* audio engine: one Audio per track; play/pause state follows the element's own events */
  useEffect(() => {
    if (!ready) return;
    const audio = new Audio(RAAKA_PLAYLIST[musicIndex].src);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = volumeRef.current;
    audioRef.current = audio;
    progRef.current?.style.setProperty("transform", "scaleX(0)");

    const detach = () => UNLOCK_EVENTS.forEach((t) => window.removeEventListener(t, unlock));
    const unlock = (e: Event) => {
      if (rootRef.current?.contains(e.target as Node)) return; // the player's own buttons handle themselves
      detach();
      if (!userPausedRef.current) audio.play().catch(() => {});
    };
    const onPlay = () => { setMusicPlaying(true); detach(); };
    const onPause = () => setMusicPlaying(false);
    const onTime = () => {
      if (audio.duration) progRef.current?.style.setProperty("transform", `scaleX(${audio.currentTime / audio.duration})`);
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);

    if (!userPausedRef.current) {
      audio.play().catch(() => UNLOCK_EVENTS.forEach((t) => window.addEventListener(t, unlock))); // autoplay blocked: start on first interaction
    }

    return () => {
      detach();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.pause();
      audio.src = "";
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [ready, musicIndex]);

  useEffect(() => {
    volumeRef.current = musicVolume;
    if (audioRef.current) audioRef.current.volume = musicVolume;
    if (musicVolume > 0) previousVolumeRef.current = musicVolume;
    if (ready) store.set(KEY_VOLUME, String(musicVolume));
  }, [musicVolume, ready]);

  useEffect(() => { if (ready) store.set(KEY_INDEX, String(musicIndex)); }, [musicIndex, ready]);

  /* close playlist on outside press / Escape */
  useEffect(() => {
    if (!musicOpen) return;
    const down = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setMusicOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMusicOpen(false); };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("pointerdown", down); window.removeEventListener("keydown", key); };
  }, [musicOpen]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { userPausedRef.current = false; a.play().catch(() => {}); }
    else { userPausedRef.current = true; a.pause(); }
  };

  const toggleMute = () => {
    if (musicVolume > 0) { previousVolumeRef.current = musicVolume; setMusicVolume(0); }
    else setMusicVolume(previousVolumeRef.current || 0.45);
  };

  const pickTrack = (index: number) => {
    userPausedRef.current = false;
    if (index === musicIndex) audioRef.current?.play().catch(() => {});
    else setMusicIndex(index);
    setMusicOpen(false);
  };

  const track = RAAKA_PLAYLIST[musicIndex];
  const muted = musicVolume === 0;
  const level: 0 | 1 | 2 = muted ? 0 : musicVolume < 0.5 ? 1 : 2;

  return (
    <>
      <style>{CSS}</style>
      <div ref={rootRef} className={"rm" + (musicPlaying ? " on" : "") + (muted ? " muted" : "") + (musicOpen ? " open" : "")}>
        {/* playlist */}
        <div id="rm-panel" className="rm-panel" role="region" aria-label="RAAKA music playlist" aria-hidden={!musicOpen}>
          <div className="rm-head"><span>RAAKA Music</span><b>{musicPlaying ? "Playing" : "Paused"}</b></div>
          <ul>
            {RAAKA_PLAYLIST.map((t, i) => {
              const active = i === musicIndex;
              return (
                <li key={t.src} style={cssVars({ "--i": i })}>
                  <button type="button" className={"rm-row" + (active ? " act" : "")} onClick={() => pickTrack(i)} tabIndex={musicOpen ? 0 : -1} aria-current={active ? "true" : undefined}>
                    <span className="rm-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rm-rt">{t.title}</span>
                    {active && musicPlaying ? <Claws /> : <span className="rm-go" aria-hidden="true">→</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <label className="rm-vol">
            <span className="rm-vi"><Speaker level={level} /></span>
            <input
              type="range" min={0} max={1} step={0.01} value={musicVolume} tabIndex={musicOpen ? 0 : -1}
              aria-label="Volume" style={cssVars({ "--v": musicVolume * 100 + "%" })}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMusicVolume(Number(e.target.value))}
            />
            <span className="rm-pc tnum">{Math.round(musicVolume * 100)}</span>
          </label>
        </div>

        {/* pill */}
        <div className="rm-pill">
          <button type="button" className="rm-moon" onClick={togglePlay} aria-label={musicPlaying ? "Pause music" : "Play music"} aria-pressed={musicPlaying}>
            <span className="rm-corona" aria-hidden="true" />
            <span className="rm-core" aria-hidden="true">{musicPlaying ? <PauseIcon /> : <PlayIcon />}</span>
          </button>

          <button type="button" className="rm-info" onClick={() => setMusicOpen((v) => !v)} aria-expanded={musicOpen} aria-controls="rm-panel" aria-label="Open music playlist">
            <small>{musicPlaying ? "Now playing" : "Paused"}</small>
            <span key={track.title} className="rm-t">{track.title}</span>
          </button>

          {musicPlaying && !muted && <Claws />}
          <i className="rm-div" aria-hidden="true" />

          <button type="button" className="rm-mute" onClick={toggleMute} aria-label={muted ? "Unmute music" : "Mute music"} aria-pressed={muted} title={muted ? "Unmute" : "Mute"}>
            <Speaker level={level} />
          </button>

          <span className="rm-prog" aria-hidden="true"><span ref={progRef} /></span>
          <span className="rm-sweep" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

const CSS = `
.rm{--moon:#E8ECF3;--steel:#8A93A3;--ember:#E5303A;--ink:#050506;--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:fixed;z-index:9999;right:max(.9rem,env(safe-area-inset-right));bottom:max(.9rem,env(safe-area-inset-bottom));font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--moon);-webkit-font-smoothing:antialiased}
.rm button{cursor:pointer;color:inherit;font:inherit}
.rm button:focus-visible,.rm input:focus-visible{outline:2px solid var(--moon);outline-offset:2px}
.tnum{font-variant-numeric:tabular-nums}

/* pill: unfolds from a dot, a light travels the rim while playing */
.rm-pill{position:relative;isolation:isolate;display:flex;align-items:center;gap:6px;height:46px;padding:0 5px;border-radius:9999px;overflow:hidden;background:#09090c;box-shadow:inset 0 0 0 1px rgba(232,236,243,.13),0 14px 38px rgba(0,0,0,.6);animation:rmUnfold 1.1s var(--cine) 1.2s both}
@keyframes rmUnfold{from{clip-path:inset(0 0 0 calc(100% - 46px) round 23px);opacity:0}to{clip-path:inset(0 round 23px);opacity:1}}
.rm-pill::before{content:"";position:absolute;z-index:-2;left:50%;top:50%;width:320px;height:320px;margin:-160px 0 0 -160px;background:conic-gradient(from 0deg,transparent 0 62%,rgba(232,236,243,.85) 80%,var(--ember) 90%,transparent 96%);opacity:0;transition:opacity .6s;animation:rmSpin 4.2s linear infinite}
.rm.on .rm-pill::before{opacity:1}
.rm-pill::after{content:"";position:absolute;z-index:-1;inset:1px;border-radius:inherit;background:linear-gradient(180deg,#101015,#060608)}
@keyframes rmSpin{to{transform:rotate(360deg)}}
.rm-sweep{position:absolute;top:0;bottom:0;left:0;width:40%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(232,236,243,.09),transparent);transform:translateX(-130%) skewX(-18deg)}
.rm-pill:hover .rm-sweep{transform:translateX(330%) skewX(-18deg);transition:transform 1.1s var(--ease)}

/* play / pause: a small eclipse */
.rm-moon{position:relative;flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;transition:transform .4s var(--ease)}
.rm-moon:hover{transform:scale(1.07)}.rm-moon:active{transform:scale(.94)}
.rm-corona{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,rgba(232,236,243,.12),rgba(232,236,243,.9) 16%,var(--ember) 30%,rgba(232,236,243,.1) 46%,rgba(232,236,243,.12));opacity:.55;transition:opacity .5s}
.rm.on .rm-corona{opacity:1;animation:rmSpin 3.2s linear infinite}
.rm.on .rm-moon{animation:rmHalo 2.6s ease-in-out infinite}
@keyframes rmHalo{0%,100%{box-shadow:0 0 0 0 rgba(229,48,58,.32)}60%{box-shadow:0 0 0 7px rgba(229,48,58,0)}}
.rm-core{position:relative;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#17171d,#050506);color:var(--moon);box-shadow:inset 0 0 8px rgba(0,0,0,.9)}
.rm-core svg{transition:transform .35s var(--ease)}.rm-core svg:first-child{margin-left:1px}.rm.on .rm-core svg{margin-left:0}

/* title */
.rm-info{display:grid;gap:2px;min-width:0;max-width:104px;padding:0 4px;text-align:left}
@media(min-width:640px){.rm-info{max-width:128px}}
.rm-info small{font-size:7.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--steel);transition:color .4s}.rm.on .rm-info small{color:var(--ember)}
.rm-t{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11.5px;font-weight:600;letter-spacing:.01em;animation:rmIn .8s var(--ease) both}
@keyframes rmIn{from{clip-path:inset(0 100% 0 0);transform:translateX(-8px)}to{clip-path:inset(0);transform:none}}
.rm-info:hover .rm-t{color:#fff}

/* claw slashes (equalizer) */
.rm-claws{display:flex;align-items:flex-end;gap:3px;height:15px;flex:none}
.rm-claws i{display:block;width:2px;height:100%;border-radius:2px;background:linear-gradient(var(--moon),var(--ember));transform:skewX(-20deg) scaleY(.25);transform-origin:bottom;animation:rmClaw .95s ease-in-out infinite;animation-delay:calc(var(--i)*-.19s)}
.rm-claws i:nth-child(2n){animation-duration:.72s}.rm-claws i:nth-child(3){animation-duration:1.15s}
@keyframes rmClaw{0%,100%{transform:skewX(-20deg) scaleY(.2)}50%{transform:skewX(-20deg) scaleY(1)}}
.rm-div{width:1px;height:20px;background:rgba(232,236,243,.14);flex:none}

/* mute: always obvious, turns solid red when muted */
.rm-mute{position:relative;flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(232,236,243,.3);background:rgba(232,236,243,.07);color:var(--moon);transition:background .35s,border-color .35s,color .35s,transform .4s var(--ease)}
.rm-mute:hover{background:rgba(232,236,243,.16);border-color:var(--moon);transform:scale(1.07)}.rm-mute:active{transform:scale(.92)}
.rm.muted .rm-mute{background:var(--ember);border-color:var(--ember);color:#fff;animation:rmAlert 2.4s ease-in-out infinite}
@keyframes rmAlert{0%,100%{box-shadow:0 0 0 0 rgba(229,48,58,.5)}60%{box-shadow:0 0 0 7px rgba(229,48,58,0)}}
.rm-x path{stroke-dasharray:8;stroke-dashoffset:8;animation:rmDraw .5s var(--ease) forwards}.rm-x path+path{animation-delay:.12s}
@keyframes rmDraw{to{stroke-dashoffset:0}}

.rm-prog{position:absolute;left:18px;right:18px;bottom:2px;height:1px;background:rgba(232,236,243,.09);overflow:hidden}
.rm-prog>span{display:block;height:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,var(--ember),var(--moon))}

/* playlist: reveals upward from the pill */
.rm-panel{position:absolute;right:0;bottom:calc(100% + 10px);width:236px;padding:8px;border-radius:18px;border:1px solid rgba(232,236,243,.13);background:rgba(8,8,11,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 22px 60px rgba(0,0,0,.7);visibility:hidden;clip-path:inset(100% 0 0 0 round 18px);transition:clip-path .6s var(--cine),visibility 0s .6s}
.rm.open .rm-panel{visibility:visible;clip-path:inset(0 round 18px);transition:clip-path .6s var(--cine),visibility 0s}
.rm-head{display:flex;align-items:center;justify-content:space-between;padding:6px 8px 8px;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.rm-head b{font-weight:600;color:var(--ember);letter-spacing:.2em}
.rm-panel ul{margin:0;padding:0;list-style:none;display:grid;gap:2px}
.rm-panel li{opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s}
.rm.open .rm-panel li{opacity:1;transform:none;transition:opacity .6s var(--ease) calc(.25s + var(--i)*.07s),transform .6s var(--ease) calc(.25s + var(--i)*.07s)}
.rm-row{display:flex;width:100%;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;text-align:left;color:rgba(232,236,243,.55);transition:background .3s,color .3s}
.rm-row:hover{background:rgba(232,236,243,.06);color:#fff}.rm-row.act{background:rgba(229,48,58,.1);color:#fff}
.rm-n{font-size:9px;color:var(--steel);font-variant-numeric:tabular-nums}.rm-row.act .rm-n{color:var(--ember)}
.rm-rt{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11px;font-weight:500}
.rm-go{font-size:11px;color:rgba(232,236,243,.25);transition:transform .35s var(--ease),color .3s}.rm-row:hover .rm-go{transform:translateX(3px);color:var(--moon)}
.rm-vol{display:flex;align-items:center;gap:10px;margin-top:6px;padding:9px 10px 5px;border-top:1px solid rgba(232,236,243,.09)}
.rm-vi{display:grid;place-items:center;color:var(--steel)}.rm-vi svg{width:15px;height:15px}
.rm-pc{width:22px;text-align:right;font-size:9px;color:var(--steel)}
.rm-vol input{flex:1;min-width:0;height:16px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;cursor:pointer}
.rm-vol input::-webkit-slider-runnable-track{height:3px;border-radius:3px;background:linear-gradient(90deg,var(--ember),var(--moon) var(--v),rgba(232,236,243,.14) var(--v))}
.rm-vol input::-moz-range-track{height:3px;border-radius:3px;background:linear-gradient(90deg,var(--ember),var(--moon) var(--v),rgba(232,236,243,.14) var(--v))}
.rm-vol input::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;margin-top:-4.5px;border-radius:50%;background:var(--moon);border:0;box-shadow:0 0 0 3px rgba(5,5,6,.9)}
.rm-vol input::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:var(--moon);border:0}

@media (prefers-reduced-motion:reduce){
.rm-pill,.rm-pill::before,.rm-corona,.rm-moon,.rm-claws i,.rm-t,.rm-mute,.rm-x path{animation:none!important}
.rm-claws i{transform:skewX(-20deg) scaleY(.6)}.rm-x path{stroke-dashoffset:0}
.rm-panel,.rm-panel li,.rm-sweep{transition-duration:.01s!important}
}
`;
