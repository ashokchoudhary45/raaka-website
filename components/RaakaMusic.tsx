"use client";

import { useEffect, useRef, useState } from "react";

type MusicTrack = {
  title: string;
  src: string;
};

const RAAKA_PLAYLIST: MusicTrack[] = [
  { title: "RAAKA Theme", src: "/sounds/king.mp3" },
  { title: "welcome onboard dp", src: "/sounds/song2.mp3" },
];

export default function RaakaMusic() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(0.45);

  const [musicIndex, setMusicIndex] = useState(0);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.45);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedIndex = Number(localStorage.getItem("raaka-music-index"));
    const savedVolume = Number(localStorage.getItem("raaka-music-volume"));

    if (
      Number.isInteger(savedIndex) &&
      savedIndex >= 0 &&
      savedIndex < RAAKA_PLAYLIST.length
    ) {
      setMusicIndex(savedIndex);
    }

    if (
      Number.isFinite(savedVolume) &&
      savedVolume >= 0 &&
      savedVolume <= 1
    ) {
      setMusicVolume(savedVolume);
      if (savedVolume > 0) previousVolumeRef.current = savedVolume;
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const track = RAAKA_PLAYLIST[musicIndex];
    const audio = new Audio(track.src);

    audio.preload = "auto";
    audio.loop = true;
    audio.volume = musicVolume;
    musicRef.current = audio;

    const startMusic = () => {
      audio.volume = musicVolume;
      audio
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    };

    audio
      .play()
      .then(() => setMusicPlaying(true))
      .catch(() => {
        window.addEventListener("pointerdown", startMusic, { once: true });
        window.addEventListener("keydown", startMusic, { once: true });
        window.addEventListener("touchstart", startMusic, { once: true });
      });

    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      window.removeEventListener("touchstart", startMusic);
      audio.pause();
      audio.src = "";

      if (musicRef.current === audio) {
        musicRef.current = null;
      }
    };
  }, [ready, musicIndex]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }

    if (musicVolume > 0) {
      previousVolumeRef.current = musicVolume;
    }

    if (ready) {
      localStorage.setItem("raaka-music-volume", String(musicVolume));
    }
  }, [musicVolume, ready]);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("raaka-music-index", String(musicIndex));
    }
  }, [musicIndex, ready]);

  const currentTrack = RAAKA_PLAYLIST[musicIndex];

  return (
    <>
      <style>{`
        @keyframes rmOrbit { to { transform: rotate(360deg); } }
        @keyframes rmPulse {
          0%,100% { transform: scale(.88); opacity: .72; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes rmBar {
          0%,100% { transform: scaleY(.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes rmShine {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(180%); }
        }

        .rm-shell {
          box-shadow:
            0 12px 40px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,255,255,.06);
        }

        .rm-orbit { animation: rmOrbit 9s linear infinite; }
        .rm-core { animation: rmPulse 2.2s ease-in-out infinite; }
        .rm-bar {
          transform-origin: bottom;
          animation: rmBar .75s ease-in-out infinite;
        }
        .rm-shine { animation: rmShine 1.5s cubic-bezier(.2,.7,.2,1); }

        .rm-shell:hover {
          box-shadow:
            0 16px 48px rgba(0,0,0,.58),
            0 0 22px rgba(249,115,22,.07),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .rm-orbit,.rm-core,.rm-bar,.rm-shine { animation: none !important; }
        }
      `}</style>

      <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-5 sm:right-5">
        <div
          className={`rm-shell relative flex items-center gap-1 rounded-full border bg-[#080808]/95 p-1.5 backdrop-blur-xl transition-all duration-300 ${
            musicPlaying
              ? "border-orange-300/25"
              : "border-white/10"
          }`}
        >
          <button
            type="button"
            onClick={() => setMusicOpen((v) => !v)}
            className="group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[.025] transition-all duration-300 hover:scale-[1.04] hover:border-orange-300/35"
            aria-label="Open RAAKA music playlist"
            aria-expanded={musicOpen}
          >
            <span className="rm-orbit pointer-events-none absolute inset-[3px] rounded-full border border-transparent border-t-orange-300/75" />
            <span
              className={`rm-core relative flex h-6 w-6 items-center justify-center rounded-full ${
                musicPlaying
                  ? "bg-orange-400/10 shadow-[0_0_16px_rgba(249,115,22,.22)]"
                  : "bg-white/[.035]"
              }`}
            >
              <span
                className={`text-[10px] leading-none ${
                  musicPlaying ? "text-orange-200" : "text-white/55"
                }`}
              >
                {musicPlaying ? "Ⅱ" : "▶"}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMusicOpen((v) => !v)}
            className="group flex min-w-0 items-center gap-2 px-1.5 text-left"
            aria-label="Open music playlist"
          >
            <span className="max-w-[118px] truncate text-[10px] font-medium tracking-[.02em] text-white/72 transition group-hover:text-white">
              {currentTrack.title}
            </span>

            {musicPlaying && (
              <span className="flex h-3 items-end gap-[2px]">
                {[1, 2, 3, 4].map((n) => (
                  <i
                    key={n}
                    className="rm-bar block w-[2px] rounded-full bg-orange-300/80"
                    style={{
                      height: `${5 + n * 2}px`,
                      animationDelay: `${n * 90}ms`,
                    }}
                  />
                ))}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (musicVolume > 0) {
                previousVolumeRef.current = musicVolume;
                setMusicVolume(0);
              } else {
                setMusicVolume(previousVolumeRef.current || 0.45);
              }
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] text-white/35 transition hover:bg-white/[.06] hover:text-orange-200"
            aria-label={musicVolume === 0 ? "Unmute music" : "Mute music"}
          >
            {musicVolume === 0 ? "×" : "⌁"}
          </button>

          <div
            className={`absolute bottom-full right-0 mb-2 w-[220px] origin-bottom-right overflow-hidden rounded-[18px] border border-white/10 bg-[#080808]/96 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,.68)] backdrop-blur-2xl transition-all duration-300 ${
              musicOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-2 scale-[.97] opacity-0"
            }`}
          >
            <div className="relative overflow-hidden rounded-xl px-3 py-2.5">
              <span className="rm-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-orange-300/10 to-transparent" />
              <div className="relative flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-[.22em] text-white/30">
                  RAAKA Music
                </span>
                <span className="text-[8px] text-orange-300/50">
                  {musicPlaying ? "PLAYING" : "PAUSED"}
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              {RAAKA_PLAYLIST.map((track, index) => {
                const active = index === musicIndex;

                return (
                  <button
                    key={track.src}
                    type="button"
                    onClick={() => {
                      setMusicIndex(index);
                      setMusicOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-orange-400/[.07] text-white"
                        : "text-white/45 hover:bg-white/[.045] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        active
                          ? "border-orange-300/35 text-orange-200"
                          : "border-white/10 text-white/25"
                      }`}
                    >
                      {active && musicPlaying ? "Ⅱ" : "♪"}
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[9px] font-medium tracking-wide">
                      {track.title}
                    </span>

                    <span
                      className={`text-[10px] transition-transform ${
                        active
                          ? "text-orange-300"
                          : "text-white/15 group-hover:translate-x-0.5 group-hover:text-white/45"
                      }`}
                    >
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
