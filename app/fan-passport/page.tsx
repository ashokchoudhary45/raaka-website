 "use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Passport = {
  id: number;
  visitor_id: string;
  passport_code: string;
  fan_name: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
};

type Achievement = {
  id: number;
  visitor_id: string;
  achievement_key: string;
  unlocked_at: string;
};

const ACHIEVEMENTS = [
  {
    key: "first-entry",
    icon: "⚔️",
    title: "First Entry",
    description: "Created your RAAKA Fan Passport",
    xp: 50,
  },
  {
    key: "raaka-explorer",
    icon: "🌌",
    title: "RAAKA Explorer",
    description: "Started exploring the RAAKA universe",
    xp: 100,
  },
  {
    key: "fan-artist",
    icon: "🎨",
    title: "Fan Artist",
    description: "Submitted your first fan artwork",
    xp: 150,
  },
  {
    key: "heart-of-raaka",
    icon: "❤️",
    title: "Heart of RAAKA",
    description: "Liked your first fan artwork",
    xp: 50,
  },
  {
    key: "warrior",
    icon: "🔥",
    title: "RAAKA Warrior",
    description: "Reached 500 XP",
    xp: 0,
  },
  {
    key: "legend",
    icon: "👑",
    title: "RAAKA Legend",
    description: "Reached 1,000 XP",
    xp: 0,
  },
];

function getVisitorId() {
  const key = "raaka-fan-passport-visitor-id";
  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

function calculateLevel(xp: number) {
  if (xp >= 5000) return 10;
  if (xp >= 3500) return 9;
  if (xp >= 2500) return 8;
  if (xp >= 1800) return 7;
  if (xp >= 1300) return 6;
  if (xp >= 1000) return 5;
  if (xp >= 750) return 4;
  if (xp >= 500) return 3;
  if (xp >= 250) return 2;
  return 1;
}

function levelName(level: number) {
  if (level >= 10) return "RAAKA Immortal";
  if (level >= 8) return "RAAKA Legend";
  if (level >= 6) return "Cosmic Warrior";
  if (level >= 4) return "Divine Warrior";
  if (level >= 2) return "RAAKA Warrior";
  return "New Initiate";
}

function createPassportCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "RAAKA-";

  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export default function FanPassportPage() {
  const [visitorId, setVisitorId] = useState("");
  const [passport, setPassport] = useState<Passport | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [fanName, setFanName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const supabase = getSupabase();

  useEffect(() => {
    const id = getVisitorId();
    setVisitorId(id);
  }, []);

  useEffect(() => {
    if (!visitorId) return;

    const loadPassport = async () => {
      setLoading(true);
      setError("");

      const [{ data: passportData, error: passportError }, { data: achievementData, error: achievementError }] =
        await Promise.all([
          supabase
            .from("fan_passports")
            .select("*")
            .eq("visitor_id", visitorId)
            .maybeSingle(),
          supabase
            .from("fan_passport_achievements")
            .select("*")
            .eq("visitor_id", visitorId)
            .order("unlocked_at", { ascending: true }),
        ]);

      if (passportError) {
        setError(passportError.message);
      } else {
        setPassport(passportData);
        if (passportData) setFanName(passportData.fan_name);
      }

      if (!achievementError) {
        setAchievements(achievementData || []);
      }

      setLoading(false);
    };

    loadPassport();
  }, [visitorId]);

  const currentLevel = passport?.level || 1;
  const currentXP = passport?.xp || 0;
  const nextLevelXP =
    currentLevel >= 10
      ? 5000
      : [0, 250, 500, 750, 1000, 1300, 1800, 2500, 3500, 5000][currentLevel];

  const previousLevelXP =
    currentLevel <= 1
      ? 0
      : [0, 250, 500, 750, 1000, 1300, 1800, 2500, 3500, 5000][currentLevel - 1];

  const progress = useMemo(() => {
    if (currentLevel >= 10) return 100;

    const range = nextLevelXP - previousLevelXP;
    return Math.min(
      100,
      Math.max(0, ((currentXP - previousLevelXP) / range) * 100)
    );
  }, [currentLevel, currentXP, nextLevelXP, previousLevelXP]);

  const unlockedKeys = new Set(
    achievements.map((achievement) => achievement.achievement_key)
  );

  const createPassport = async () => {
    if (!visitorId || !fanName.trim()) {
      setError("Please enter your fan name.");
      return;
    }

    setCreating(true);
    setError("");

    const code = createPassportCode();

    const { data, error: insertError } = await supabase
      .from("fan_passports")
      .insert({
        visitor_id: visitorId,
        passport_code: code,
        fan_name: fanName.trim(),
        xp: 50,
        level: 1,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setCreating(false);
      return;
    }

    const { error: achievementError } = await supabase
      .from("fan_passport_achievements")
      .insert({
        visitor_id: visitorId,
        achievement_key: "first-entry",
      });

    if (achievementError) {
      console.error(achievementError);
    }

    setPassport(data);
    setAchievements([
      {
        id: Date.now(),
        visitor_id: visitorId,
        achievement_key: "first-entry",
        unlocked_at: new Date().toISOString(),
      },
    ]);
    setCreating(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-pulse">⭐</div>
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/40">
            Loading Fan Passport
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: "url('/images/raakabg.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/65" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black" />

      <div className="relative z-10 min-h-screen px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <a
              href="/"
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              ← Home
            </a>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                The World of
              </p>
              <p className="text-sm font-bold tracking-[0.25em]">RAAKA</p>
            </div>
          </div>

          {!passport ? (
            <section className="mx-auto max-w-2xl pt-10 md:pt-20">
              <div className="rounded-[2rem] border border-white/10 bg-black/55 p-7 text-center shadow-2xl backdrop-blur-xl md:p-12">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-200/20 bg-amber-100/[0.06] text-4xl shadow-[0_0_60px_rgba(245,158,11,0.12)]">
                  ⭐
                </div>

                <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-amber-100/60">
                  Enter The World
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                  RAAKA FAN PASSPORT
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50 md:text-base">
                  Create your identity inside the RAAKA universe. Earn XP,
                  unlock achievements and build your own fan legacy.
                </p>

                <div className="mt-10">
                  <input
                    value={fanName}
                    onChange={(event) => setFanName(event.target.value)}
                    placeholder="Enter your fan name"
                    maxLength={30}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-center text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-100/30"
                  />

                  {error && (
                    <p className="mt-3 text-sm text-red-300">{error}</p>
                  )}

                  <button
                    onClick={createPassport}
                    disabled={creating}
                    className="mt-4 w-full rounded-2xl bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    {creating ? "Creating Passport..." : "Create My Passport ⭐"}
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xl">⭐</p>
                    <p className="mt-2 text-[9px] uppercase tracking-wider text-white/40">
                      Earn XP
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xl">🏆</p>
                    <p className="mt-2 text-[9px] uppercase tracking-wider text-white/40">
                      Achievements
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xl">👑</p>
                    <p className="mt-2 text-[9px] uppercase tracking-wider text-white/40">
                      Level Up
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/55 shadow-2xl backdrop-blur-xl">
                <div className="relative p-7 md:p-12">
                  <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px]" />

                  <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.5em] text-amber-100/60">
                        Official Fan Identity
                      </p>

                      <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                        {passport.fan_name}
                      </h1>

                      <p className="mt-3 font-mono text-xs tracking-[0.3em] text-white/40">
                        {passport.passport_code}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100/15 bg-amber-100/[0.04] px-6 py-5 text-center">
                      <p className="text-3xl">⭐</p>
                      <p className="mt-2 text-2xl font-black">
                        LEVEL {currentLevel}
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-amber-100/50">
                        {levelName(currentLevel)}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-10">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                          Fan XP
                        </p>
                        <p className="mt-1 text-3xl font-black tabular-nums">
                          {currentXP.toLocaleString()}
                        </p>
                      </div>

                      <p className="text-xs text-white/35">
                        {currentLevel >= 10
                          ? "MAX LEVEL"
                          : `${Math.max(0, nextLevelXP - currentXP)} XP to next level`}
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                    Passport
                  </p>
                  <p className="mt-2 text-lg font-bold">Active</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                    Achievements
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {achievements.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                    Rank
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    Level {currentLevel}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                    Fan Since
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {new Date(passport.created_at).getFullYear()}
                  </p>
                </div>
              </section>

              <section className="mt-12">
                <div className="mb-7">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                    Your Journey
                  </p>
                  <h2 className="mt-2 text-3xl font-black md:text-4xl">
                    Achievements
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ACHIEVEMENTS.map((achievement) => {
                    const unlocked = unlockedKeys.has(achievement.key);

                    return (
                      <div
                        key={achievement.key}
                        className={
                          unlocked
                            ? "rounded-2xl border border-amber-100/20 bg-amber-100/[0.06] p-6"
                            : "rounded-2xl border border-white/10 bg-white/[0.025] p-6 opacity-45"
                        }
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-3xl">
                            {unlocked ? achievement.icon : "🔒"}
                          </div>

                          {achievement.xp > 0 && (
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white/45">
                              +{achievement.xp} XP
                            </span>
                          )}
                        </div>

                        <h3 className="mt-5 text-lg font-bold">
                          {achievement.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-white/40">
                          {achievement.description}
                        </p>

                        <p className="mt-4 text-[9px] uppercase tracking-[0.25em] text-white/25">
                          {unlocked ? "Unlocked" : "Locked"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 text-center md:p-10">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
                  Your Passport ID
                </p>

                <p className="mt-4 font-mono text-2xl font-bold tracking-[0.2em] md:text-4xl">
                  {passport.passport_code}
                </p>

                <p className="mt-4 text-sm text-white/35">
                  Keep exploring the RAAKA universe to earn more XP and unlock
                  new achievements.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}