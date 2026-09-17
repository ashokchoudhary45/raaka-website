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

  // Restore saved track + volume.
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

  // Global music engine.
  // This component must live in app/layout.tsx so it survives page navigation.
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

    // Try autoplay first.
    audio
      .play()
      .then(() => setMusicPlaying(true))
      .catch(() => {
        // Browser blocks autoplay until the visitor interacts.
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

  // Keep volume in sync.
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
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-5 sm:right-5 md:bottom-7 md:right-7">
      <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-black/70 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">

        <button
          type="button"
          onClick={() => setMusicOpen((value) => !value)}
          className={`flex h-10 max-w-[150px] items-center gap-2 rounded-full px-3 text-left transition-all duration-300 sm:max-w-[170px] ${
            musicPlaying
              ? "bg-white/[0.08] text-white"
              : "bg-white/[0.04] text-white/55"
          }`}
          aria-label="Open music playlist"
          aria-expanded={musicOpen}
          title="Music playlist"
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[12px] ${
              musicPlaying ? "text-orange-300" : "text-white/45"
            }`}
          >
            ♪
          </span>

          <span className="min-w-0 truncate text-[9px] font-medium uppercase tracking-[0.18em]">
            {currentTrack.title}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (musicVolume > 0) {
              previousVolumeRef.current = musicVolume;
              setMusicVolume(0);
            } else {
              setMusicVolume(
                previousVolumeRef.current > 0
                  ? previousVolumeRef.current
                  : 0.45
              );
            }
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
          aria-label={musicVolume === 0 ? "Unmute music" : "Mute music"}
          title={musicVolume === 0 ? "Unmute" : "Mute"}
        >
          {musicVolume === 0 ? "🔇" : "🔊"}
        </button>

        <div
          className={`absolute bottom-[52px] right-0 w-[230px] origin-bottom-right overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 ${
            musicOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0"
          }`}
        >
          <div className="px-3 pb-2 pt-2 text-[8px] uppercase tracking-[0.28em] text-white/30">
            RAAKA Playlist
          </div>

          <div className="space-y-1">
            {RAAKA_PLAYLIST.map((track, index) => (
              <button
                key={track.src}
                type="button"
                onClick={() => {
                  setMusicIndex(index);
                  setMusicOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  index === musicIndex
                    ? "bg-white/[0.09] text-white"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="text-orange-300/80">♪</span>
                <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em]">
                  {track.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}