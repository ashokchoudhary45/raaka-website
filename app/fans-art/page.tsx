"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type FanArt = {
  id: number;
  created_at: string;
  fan_name: string;
  title: string;
  image_url: string;
  social_link: string | null;
  status: string;
  likes?: number;
};

// ---------- small helpers ----------
function useInView<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold, rootMargin: "0px 0px -5% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`fa-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function AnimatedNumber({ value, loading, suffix = "" }: { value: number; loading?: boolean; suffix?: string }) {
  const [n, setN] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (loading) return;
    let raf = 0;
    const start = performance.now();
    const base = from.current;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1300, 1);
      const v = Math.round(base + (value - base) * (1 - Math.pow(1 - p, 3)));
      setN(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, loading]);
  return <span className="tabular-nums">{loading ? "—" : `${n.toLocaleString("en-IN")}${suffix}`}</span>;
}

const MILESTONES = [
  { at: 25, label: "Spark" },
  { at: 50, label: "Flame" },
  { at: 75, label: "Blaze" },
  { at: 100, label: "Max power" },
];

const STEPS = [
  { title: "Upload your art", copy: "Poster, edit or painting. JPG, PNG, WEBP or GIF up to 10 MB." },
  { title: "We review it", copy: "Every submission is checked before it appears in public." },
  { title: "It goes live", copy: "Approved art joins the gallery where fans can like it." },
];

export default function FansArtPage() {
  const [fanName, setFanName] = useState("");
  const [title, setTitle] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [fanArts, setFanArts] = useState<FanArt[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedArt, setSelectedArt] = useState<FanArt | null>(null);
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [likedArts, setLikedArts] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"newest" | "trending" | "most-liked">("newest");
  const [fanPower, setFanPower] = useState({
    percent: 0,
    likes: 0,
    submissions: 0,
    quizXp: 0,
  });
  const [loadingPower, setLoadingPower] = useState(true);

  async function loadFanArts() {
    setLoadingGallery(true);

    try {
      const response = await fetch("/api/fan-art/gallery", { cache: "no-store" });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        items?: FanArt[];
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load fan art gallery.");
      }

      const arts = result.items ?? [];
      setFanArts(arts);

      // Load existing likes for the R2-backed artwork IDs.
      try {
        const supabase = getSupabase();
        const ids = arts.map((art) => art.id);
        if (ids.length) {
          const { data } = await supabase
            .from("fan_art_likes")
            .select("fan_art_id")
            .in("fan_art_id", ids);

          const counts: Record<number, number> = {};
          for (const row of data ?? []) {
            const id = Number(row.fan_art_id);
            counts[id] = (counts[id] || 0) + 1;
          }
          setLikeCounts(counts);
        } else {
          setLikeCounts({});
        }
      } catch (likeError) {
        console.error("Fan art likes load error:", likeError);
        setLikeCounts({});
      }
    } catch (error) {
      console.error("Gallery error:", error instanceof Error ? error.message : error);
      setFanArts([]);
    } finally {
      setLoadingGallery(false);
    }
  }

  useEffect(() => {
    loadFanArts();
    loadFanPower();
  }, []);

  async function loadFanPower() {
    setLoadingPower(true);

    try {
      const supabase = getSupabase();

      const [{ count: likesCount }, { data: quizActivity }, galleryResponse] =
        await Promise.all([
          supabase
            .from("fan_art_likes")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("fan_passport_activity")
            .select("xp")
            .ilike("activity_key", "%quiz%"),
          fetch("/api/fan-art/gallery", { cache: "no-store" }),
        ]);

      const galleryResult = galleryResponse.ok
        ? ((await galleryResponse.json()) as { items?: FanArt[] })
        : { items: [] };
      const submissionsCount = galleryResult.items?.length ?? 0;

      const likes = likesCount || 0;
      const submissions = submissionsCount || 0;
      const quizXp =
        quizActivity?.reduce((total, item) => total + (Number(item.xp) || 0), 0) || 0;

      // Community Power formula:
      // 1 power per like + 5 per approved submission + 1 per quiz XP.
      // 100,000 power points = 100% community power.
      const score = likes + submissions * 5 + quizXp;
      const percent = Math.min(100, Math.round((score / 100000) * 100));

      setFanPower({
        percent,
        likes,
        submissions,
        quizXp,
      });
    } catch (error) {
      console.error("Fan Power error:", error);
    } finally {
      setLoadingPower(false);
    }
  }

  function getVisitorId() {
    const key = "raaka-fan-art-new-visitor-id";
    let visitorId = localStorage.getItem(key);

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(key, visitorId);
    }

    return visitorId;
  }

  async function handleLike(artId: number) {
    if (likedArts[artId]) return;
    const persist = (ids: Record<number, boolean>) => {
      try { localStorage.setItem(LIKED_KEY, JSON.stringify(Object.keys(ids).map(Number))); } catch {}
    };
    // optimistic update: instant feedback, rolled back if the request fails
    const next = { ...likedArts, [artId]: true };
    setLikedArts(next);
    persist(next);
    setLikeCounts((current) => ({ ...current, [artId]: (current[artId] || 0) + 1 }));
    const undo = () => {
      setLikedArts((current) => { const rest = { ...current }; delete rest[artId]; persist(rest); return rest; });
      setLikeCounts((current) => ({ ...current, [artId]: Math.max(0, (current[artId] || 1) - 1) }));
    };
    try {
      const supabase = getSupabase();
      const visitorId = getVisitorId();
      const { error } = await supabase.from("fan_art_likes").insert({
        fan_art_id: artId,
        visitor_id: visitorId,
      });
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          // this visitor already liked it earlier: keep the heart filled, drop the extra +1
          setLikeCounts((current) => ({ ...current, [artId]: Math.max(0, (current[artId] || 1) - 1) }));
        } else {
          undo();
        }
      }
    } catch (error) {
      console.error("Like error:", error);
      undo();
    }
  }
  const visibleFanArts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = fanArts.filter((art) => {
      if (!query) return true;
      return (
        art.title.toLowerCase().includes(query) ||
        art.fan_name.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      const aLikes = likeCounts[a.id] || 0;
      const bLikes = likeCounts[b.id] || 0;

      if (filter === "most-liked") return bLikes - aLikes;

      if (filter === "trending") {
        const now = Date.now();
        const aAge = Math.max(1, now - new Date(a.created_at).getTime());
        const bAge = Math.max(1, now - new Date(b.created_at).getTime());
        const aScore = aLikes / Math.sqrt(aAge / 86400000 + 1);
        const bScore = bLikes / Math.sqrt(bAge / 86400000 + 1);
        return bScore - aScore;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [fanArts, filter, likeCounts, search]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (!fanName.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter artwork title.");
      return;
    }

    if (!file) {
      setMessage("Please select your fan art poster.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be smaller than 10 MB.");
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("fanName", fanName.trim());
      uploadData.append("title", title.trim());
      uploadData.append("socialLink", socialLink.trim());

      const uploadResponse = await fetch("/api/fan-art/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult: any = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult.error || "Failed to upload fan art."
        );
      }

      // R2 is now the source of truth for the quick gallery fix.
      // No Supabase metadata insert is required here.
      // The gallery reads the uploaded object directly from R2.

      setFanName("");
      setTitle("");
      setSocialLink("");
      setFile(null);

      const fileInput = document.getElementById(
        "fan-art-file"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadFanArts();
      setMessage(
        "Your fan art has been submitted! It will appear after admin approval."
      );
    } catch (error) {
      console.error("Fan art submission error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // ---------- page UI state ----------
  const [showNotice, setShowNotice] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [fit, setFit] = useState<"fit" | "fill">("fit");
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { root.style.setProperty("--cx", e.clientX + "px"); root.style.setProperty("--cy", e.clientY + "px"); });
    };
    const scroll = () => {
      setScrolled(window.scrollY > 24);
      const m = root.scrollHeight - root.clientHeight;
      root.style.setProperty("--sp", String(m > 0 ? root.scrollTop / m : 0));
    };
    scroll();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); };
  }, []);

  // remember which artworks this visitor already liked
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_KEY);
      if (raw) setLikedArts(Object.fromEntries((JSON.parse(raw) as number[]).map((id) => [id, true])));
    } catch {}
  }, []);

  const selectedIndex = selectedArt ? visibleFanArts.findIndex((a) => a.id === selectedArt.id) : -1;
  const stepArt = useCallback(
    (dir: number) => {
      if (selectedIndex < 0 || visibleFanArts.length === 0) return;
      setSelectedArt(visibleFanArts[(selectedIndex + dir + visibleFanArts.length) % visibleFanArts.length]);
    },
    [selectedIndex, visibleFanArts]
  );
  useEffect(() => {
    if (!selectedArt) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedArt(null);
      if (e.key === "ArrowRight") stepArt(1);
      if (e.key === "ArrowLeft") stepArt(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [selectedArt, stepArt]);

  function clearFile() {
    setFile(null);
    const input = document.getElementById("fan-art-file") as HTMLInputElement | null;
    if (input) input.value = "";
  }
  const isSuccess = message.startsWith("Your fan art");
  const heroArts = fanArts.slice(0, RING_N);
  const isNew = (art: FanArt) => Date.now() - new Date(art.created_at).getTime() < 3 * 86400000;
  const sorts = [["newest", "Newest"], ["trending", "🔥 Trending"], ["most-liked", "❤️ Most liked"]] as const;

  return (
    <main className="fx relative min-h-screen overflow-x-hidden bg-[#060407] text-[#fff1dc]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* LOGO SPLASH */}
      <div className="splash" aria-hidden="true">
        <div className="splash-glow" />
        <div className="splash-logo"><span className="splash-ring" /><img src="/images/raaka-logo.png" alt="" /></div>
      </div>

      {/* ATMOSPHERE */}
      <div className="atmos" aria-hidden="true">
        <i className="rays" /><i className="orb o1" /><i className="orb o2" /><i className="floor" />
        <Embers />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="cglow" aria-hidden="true" />
      <div className="sbar" aria-hidden="true" />

      {/* HEADER */}
      <header className={`hdr fixed inset-x-0 top-0 z-50 ${scrolled ? "is-s" : ""}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <a href="/" className="back flex items-center gap-3" aria-label="RAAKA home">
            <img src="/images/raaka-logo.png" alt="RAAKA" className="h-8 w-auto md:h-9" />
            <span className="hidden text-xs text-white/45 transition lg:inline">← The World of Raaka</span>
          </a>
          <nav className="pill-nav hidden md:flex">
            <a href="#fan-power">Fan power</a><a href="#gallery">Gallery</a><a href="#submit">Submit</a>
          </nav>
          <a href="/admin/fans-art" className="adm">Admin sign in</a>
        </div>
      </header>

      <div className="relative z-10">
        {/* HERO */}
        <section className="px-5 pb-10 pt-28 md:px-10 md:pb-16 md:pt-36">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="rise" style={cv({ "--d": "0s" })}>
                <img src="/images/raaka-logo.png" alt="RAAKA" className="hero-logo" />
              </div>
              <p className="rise kick mt-7" style={cv({ "--d": ".15s" })}><i />The fan community</p>
              <h1 className="fd hero-h mt-4" aria-label="Fans Art">
                <span className="fa-line"><span>FANS</span></span>
                <span className="fa-line"><span className="ember-text">ART</span></span>
              </h1>
              <p className="rise mt-7 max-w-md text-base leading-7 text-white/60" style={cv({ "--d": ".8s" })}>
                A space for fans to share their creativity, edits and artwork inspired by RAAKA and Allu Arjun.
              </p>
              <div className="rise mt-9 flex flex-wrap items-center gap-3" style={cv({ "--d": ".95s" })}>
                <a href="#submit" className="cta">Submit your fan art</a>
                <a href="#gallery" className="ghost">Browse the gallery</a>
              </div>
              <div className="rise mt-10 flex gap-8" style={cv({ "--d": "1.1s" })}>
                {[["Artworks", fanPower.submissions], ["Likes", fanPower.likes]].map(([l, v]) => (
                  <div key={l as string}>
                    <p className="fd text-3xl font-bold"><AnimatedNumber value={v as number} loading={loadingPower} /></p>
                    <p className="mt-1 text-xs text-white/40">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D ART RING */}
            <div className="ring-wrap rise" style={cv({ "--d": ".5s" })}>
              <i className="ring-glow" />
              <div className="ring3d" style={cv({ "--n": RING_N, "--k": RING_K })}>
                <div className="ring-rot">
                  {Array.from({ length: RING_N }).map((_, i) => {
                    const art = heroArts[i];
                    return (
                      <div key={i} className="ring-item" style={cv({ "--i": i })}>
                        {art ? (
                          <button type="button" onClick={() => setSelectedArt(art)} aria-label={`Open ${art.title}`} className="ri">
                            <span className="ri-box"><Plate src={art.image_url} alt={art.title} fit="fit" /></span>
                            <b>{art.title}</b>
                          </button>
                        ) : (
                          <a href="#submit" className="ri" aria-label="Submit your fan art">
                            <span className="ri-box ri-empty"><img src="/images/raaka-logo.png" alt="" /><em>＋</em></span>
                            <b>Your art here</b>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <i className="ring-floor" />
            </div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker-t">
            {Array.from({ length: 12 }).map((_, i) => (<span key={i}>FANS ART <img src="/images/raaka-logo.png" alt="" /> COMMUNITY <em>✦</em></span>))}
          </div>
        </div>

        {/* NOTICE */}
        {showNotice && (
          <section className="px-5 pt-10 md:px-10">
            <div className="notice mx-auto max-w-7xl">
              <span className="notice-dot" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Fan art uploads are back</p>
                <p className="mt-1 text-sm leading-6 text-white/55">The storage issue is fixed and your artwork now uploads in high quality. Thank you for your patience and for being part of the World of RAAKA.</p>
              </div>
              <button type="button" onClick={() => setShowNotice(false)} aria-label="Dismiss notice" className="xbtn">×</button>
            </div>
          </section>
        )}

        {/* FAN POWER */}
        <section id="fan-power" className="px-5 py-14 md:px-10 md:py-20">
          <Reveal>
            <div className="power mx-auto max-w-7xl">
              <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
                <Reactor percent={fanPower.percent} loading={loadingPower} />
                <div>
                  <p className="kick"><i />Community energy</p>
                  <h2 className="fd mt-3 text-4xl font-extrabold leading-tight md:text-5xl">RAAKA fan power</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-base">Every like, approved fan art and quiz achievement makes the RAAKA community stronger. At 100,000 points the bar is full.</p>
                  <div className="mt-7 grid grid-cols-3 gap-2.5 md:max-w-xl md:gap-3">
                    {[{ icon: "❤️", label: "Likes", value: fanPower.likes }, { icon: "🎨", label: "Artworks", value: fanPower.submissions }, { icon: "🧠", label: "Quiz XP", value: fanPower.quizXp }].map((st) => (
                      <div key={st.label} className="stat">
                        <p className="fd text-2xl font-bold md:text-3xl"><AnimatedNumber value={st.value} loading={loadingPower} /></p>
                        <p className="mt-1.5 text-xs text-white/45"><span className="mr-1">{st.icon}</span>{st.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-9">
                    <div className="meter">
                      <div className="meter-fill" style={{ width: `${loadingPower ? 0 : fanPower.percent}%` }} />
                      {MILESTONES.map((m) => (<span key={m.at} className={`node ${fanPower.percent >= m.at && !loadingPower ? "on" : ""}`} style={{ left: `${m.at}%` }} />))}
                    </div>
                    <div className="mt-3 grid grid-cols-4 text-[11px] text-white/35">
                      {MILESTONES.map((m, i) => (<span key={m.at} className={`${i === 3 ? "text-right" : i === 0 ? "" : "text-center"} ${fanPower.percent >= m.at && !loadingPower ? "text-amber-200/90" : ""}`}>{m.label}</span>))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="px-5 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="kick"><i />Community creations</p>
                  <h2 className="fd mt-3 text-5xl font-extrabold md:text-7xl">Fan gallery</h2>
                </div>
                {!loadingGallery && fanArts.length > 0 && (<p className="text-sm text-white/40">{visibleFanArts.length} of {fanArts.length} artworks</p>)}
              </div>
            </Reveal>

            {!loadingGallery && fanArts.length > 0 && (
              <div className="bar">
                <div className="srch">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search artwork or creator" aria-label="Search artwork or creator" />
                </div>
                <div className="seg seg3">
                  <span className="seg-i" style={{ transform: `translateX(${sorts.findIndex(([v]) => v === filter) * 100}%)` }} />
                  {sorts.map(([v, l]) => (<button key={v} type="button" onClick={() => setFilter(v)} aria-pressed={filter === v} className={filter === v ? "on" : ""}>{l}</button>))}
                </div>
                <div className="seg seg2" title="How artwork fills each tile">
                  <span className="seg-i" style={{ transform: `translateX(${fit === "fit" ? 0 : 100}%)` }} />
                  <button type="button" onClick={() => setFit("fit")} aria-pressed={fit === "fit"} className={fit === "fit" ? "on" : ""}>Fit</button>
                  <button type="button" onClick={() => setFit("fill")} aria-pressed={fit === "fill"} className={fit === "fill" ? "on" : ""}>Fill</button>
                </div>
              </div>
            )}

            {loadingGallery ? (
              <div className="wall" aria-label="Loading fan art">
                {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="tile"><div className="tile-art skel" /><div className="plaque"><div className="skel h-8 w-full rounded-lg" /></div></div>))}
              </div>
            ) : fanArts.length === 0 ? (
              <div className="empty">
                <img src="/images/raaka-logo.png" alt="" className="mx-auto h-14 w-auto opacity-60" />
                <p className="fd mt-5 text-2xl font-bold">The wall is empty</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">Be the first fan to hang a creation here.</p>
                <a href="#submit" className="cta mt-7">Submit your fan art</a>
              </div>
            ) : visibleFanArts.length === 0 ? (
              <div className="empty">
                <p className="fd text-2xl font-bold">No matches for &ldquo;{search}&rdquo;</p>
                <p className="mt-2 text-sm text-white/45">Try a different title or creator name.</p>
                <button type="button" onClick={() => setSearch("")} className="ghost mt-6">Clear search</button>
              </div>
            ) : (
              <div className="wall">
                {visibleFanArts.map((art, i) => {
                  const likes = likeCounts[art.id] || 0;
                  const rank = filter === "most-liked" && likes > 0 && i < 3 ? i + 1 : 0;
                  return (
                    <Reveal key={art.id} delay={(i % 4) * 70}>
                      <article className="tile" onPointerMove={spot}>
                        <button type="button" className="tile-art" onClick={() => setSelectedArt(art)} aria-label={`View ${art.title}`}>
                          <Plate src={art.image_url} alt={art.title} fit={fit} />
                          <span className="tile-shade" />
                          <span className="tile-view">View artwork</span>
                          {(rank > 0 || isNew(art)) && (<span className={`badge ${rank > 0 ? "gold" : ""}`}>{rank > 0 ? `#${rank} most liked` : "New"}</span>)}
                        </button>
                        <div className="plaque">
                          <div className="min-w-0 flex-1">
                            <h3 title={art.title}>{art.title}</h3>
                            <p>by {art.fan_name}</p>
                          </div>
                          {art.social_link && (<a href={art.social_link} target="_blank" rel="noopener noreferrer" className="plq-link" aria-label={`Creator profile of ${art.fan_name}`} title="Creator profile">↗</a>)}
                          <LikeButton liked={!!likedArts[art.id]} count={likes} onLike={() => handleLike(art.id)} />
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SUBMIT */}
        <section id="submit" className="border-t border-white/10 px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="kick"><i />Share your creation</p>
                <h2 className="fd mt-3 text-5xl font-extrabold leading-[0.95] md:text-7xl">Submit fan art</h2>
                <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">Upload your poster or edit. Every submission is reviewed before it appears in the public gallery.</p>

                <div className="mt-9 max-w-[260px]">
                  <p className="mb-3 text-xs text-white/35">Live preview</p>
                  <div className="tile pv">
                    <div className="tile-art">
                      {preview ? (<Plate src={preview} alt="Preview of your artwork" fit={fit} />) : (<div className="pv-empty"><img src="/images/raaka-logo.png" alt="" /><span>Your art appears here</span></div>)}
                      <span className="tile-shade" />
                    </div>
                    <div className="plaque">
                      <div className="min-w-0 flex-1">
                        <h3>{title.trim() || "Artwork title"}</h3>
                        <p>by {fanName.trim() || "Your name"}</p>
                      </div>
                      <span className="lk"><Heart filled={false} />0</span>
                    </div>
                  </div>
                </div>

                <ol className="mt-10 space-y-6">
                  {STEPS.map((st, i) => (
                    <li key={st.title} className="relative flex gap-4">
                      {i < STEPS.length - 1 && <span className="step-line" />}
                      <span className="step-n">{i + 1}</span>
                      <div><p className="text-sm font-semibold text-white">{st.title}</p><p className="mt-1 text-sm leading-6 text-white/45">{st.copy}</p></div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <form onSubmit={handleSubmit} className="form">
                <div className="relative space-y-6">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between"><label htmlFor="fan-name" className="text-sm font-medium text-white/75">Fan name</label><span className="text-xs text-white/25">{fanName.length}/80</span></div>
                    <input id="fan-name" type="text" value={fanName} onChange={(e) => setFanName(e.target.value)} placeholder="Your name" maxLength={80} className="inp" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-baseline justify-between"><label htmlFor="fan-title" className="text-sm font-medium text-white/75">Artwork title</label><span className="text-xs text-white/25">{title.length}/120</span></div>
                    <input id="fan-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: RAAKA — The King" maxLength={120} className="inp" />
                  </div>
                  <div>
                    <label htmlFor="fan-social" className="mb-2 block text-sm font-medium text-white/75">Instagram or social link <span className="ml-1 font-normal text-white/25">optional</span></label>
                    <input id="fan-social" type="url" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="https://instagram.com/yourusername" className="inp" />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-white/75">Fan art</p>
                    {preview && file ? (
                      <div className="picked">
                        <img src={preview} alt="Selected artwork preview" className="h-24 w-20 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{file.name}</p>
                          <p className="mt-1 text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <label htmlFor="fan-art-file" className="mt-2 inline-block cursor-pointer text-xs font-medium text-orange-200 hover:text-orange-100">Choose a different image</label>
                        </div>
                        <button type="button" onClick={clearFile} aria-label="Remove selected image" className="xbtn">×</button>
                      </div>
                    ) : (
                      <label
                        htmlFor="fan-art-file"
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); const dropped = e.dataTransfer.files?.[0]; if (dropped) setFile(dropped); }}
                        className={`drop ${dragOver ? "is-over" : ""}`}
                      >
                        <span className="drop-i">＋</span>
                        <span className="mt-4 text-sm font-medium text-white">{dragOver ? "Drop to attach" : "Choose or drop your artwork"}</span>
                        <span className="mt-2 text-xs text-white/35">JPG, PNG, WEBP up to 10 MB. High-quality storage.</span>
                      </label>
                    )}
                    <input id="fan-art-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <p className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-xs leading-5 text-white/40">By submitting, you confirm that you have the right to share this artwork and that it is your fan-made creation.</p>
                  {message && (<div role="status" className={`msg ${isSuccess ? "ok" : "bad"}`}>{message}</div>)}
                  <button type="submit" disabled={loading} className="cta w-full !rounded-2xl !py-4">
                    {loading && <span className="spin" />}
                    {loading ? "Uploading your art" : "Submit fan art"}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="foot">
          <a href="/" aria-label="RAAKA home"><img src="/images/raaka-logo.png" alt="RAAKA" className="mx-auto h-16 w-auto md:h-20" /></a>
          <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-white/35">RAAKA Fans Art is a fan-made community feature. All submitted artwork remains the property of its respective creator.</p>
          <a href="#top-of-page" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="ghost mt-8">↑ Back to top</a>
        </footer>
      </div>

      {/* LIGHTBOX */}
      {selectedArt && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={selectedArt.title} onClick={() => setSelectedArt(null)}>
          <img src={selectedArt.image_url} alt="" aria-hidden className="lb-bd" />
          <div className="lb-veil" />
          <div className="lb-top" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-white/45">{selectedIndex >= 0 ? `${selectedIndex + 1} of ${visibleFanArts.length}` : ""}</span>
            <img src="/images/raaka-logo.png" alt="RAAKA" className="h-7 w-auto opacity-90" />
            <button type="button" onClick={() => setSelectedArt(null)} aria-label="Close" className="xbtn lg">×</button>
          </div>
          <div className="lb-stage">
            {visibleFanArts.length > 1 && (<button type="button" onClick={(e) => { e.stopPropagation(); stepArt(-1); }} aria-label="Previous artwork" className="nb">←</button>)}
            <div className="lb-frame" onClick={(e) => e.stopPropagation()}>
              <img
                key={selectedArt.id}
                src={selectedArt.image_url}
                alt={selectedArt.title}
                decoding="async"
                className="lb-img"
                onDoubleClick={() => { setPopKey((k) => k + 1); handleLike(selectedArt.id); }}
              />
              {popKey > 0 && <Heart key={popKey} filled big />}
            </div>
            {visibleFanArts.length > 1 && (<button type="button" onClick={(e) => { e.stopPropagation(); stepArt(1); }} aria-label="Next artwork" className="nb">→</button>)}
          </div>
          <div className="lb-info" onClick={(e) => e.stopPropagation()}>
            <h3 className="fd text-xl font-extrabold md:text-2xl">{selectedArt.title}</h3>
            <p className="mt-1 text-sm text-white/50">by {selectedArt.fan_name} <span className="text-white/25">· double-click the artwork to like</span></p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <LikeButton large liked={!!likedArts[selectedArt.id]} count={likeCounts[selectedArt.id] || 0} onLike={() => handleLike(selectedArt.id)} />
              {selectedArt.social_link && (<a href={selectedArt.social_link} target="_blank" rel="noopener noreferrer" className="ghost">View creator profile ↗</a>)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ============================================
 * UI PIECES
 * ============================================ */
const LIKED_KEY = "raaka-fan-art-liked-ids";
const RING_N = 7;
const RING_K = (0.5 / Math.tan(Math.PI / RING_N)) * 1.18;
const cv = (o: Record<string, string | number>) => o as unknown as React.CSSProperties;

const spot = (e: React.PointerEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
  el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
};

/* every artwork sits in an identical tile: blurred backdrop + the full image (Fit) or cropped (Fill) */
function Plate({ src, alt, fit }: { src: string; alt: string; fit: "fit" | "fill" }) {
  return (
    <span className={`plate ${fit}`}>
      <img className="plate-bd" src={src} alt="" aria-hidden loading="lazy" decoding="async" />
      <img className="plate-fg" src={src} alt={alt} loading="lazy" decoding="async" />
    </span>
  );
}

function Heart({ filled, big }: { filled: boolean; big?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={big ? "pop-heart" : "hrt"} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
    </svg>
  );
}

/* like button: heart pop, spark burst, expanding ring, floating +1 and a rolling counter */
function LikeButton({ liked, count, onLike, large }: { liked: boolean; count: number; onLike: () => void; large?: boolean }) {
  const [burst, setBurst] = useState(0);
  return (
    <button
      type="button"
      className={`lk ${liked ? "on" : ""} ${large ? "lg" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "Liked" : "Like this artwork"}
      onClick={() => { if (liked) return; setBurst((b) => b + 1); onLike(); }}
    >
      <Heart filled={liked} />
      <span className="roll"><span key={count}>{count.toLocaleString("en-IN")}</span></span>
      {large && <span>{liked ? "Liked" : "Like"}</span>}
      {burst > 0 && (
        <span key={burst} className="lk-fx" aria-hidden="true">
          <b />
          {Array.from({ length: 10 }).map((_, i) => (<i key={i} style={cv({ "--a": i * 36 + "deg", "--dl": (i % 3) * 0.03 + "s" })} />))}
          <em>+1</em>
        </span>
      )}
    </button>
  );
}

function Embers() {
  return (
    <span className="embers" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <i key={i} style={cv({ "--x": ((i * 37 + 11) % 100) + "%", "--s": 2 + (i % 3) + "px", "--d": (4 + (i % 5) * 0.9).toFixed(1) + "s", "--dl": ((i * 0.6) % 6).toFixed(2) + "s", "--dx": (i % 2 ? 1 : -1) * (10 + ((i * 13) % 40)) + "px" })} />
      ))}
    </span>
  );
}

/* community-power reactor: 60 energy ticks light up with the percentage */
const RX_C = 2 * Math.PI * 76;
function Reactor({ percent, loading }: { percent: number; loading: boolean }) {
  const p = loading ? 0 : percent;
  const lit = Math.round((p / 100) * 60);
  return (
    <div className="rx">
      <i className="rx-glow" />
      <svg viewBox="0 0 220 220" aria-hidden>
        <defs>
          <linearGradient id="rxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff5a14" /><stop offset="55%" stopColor="#ffb347" /><stop offset="100%" stopColor="#fff1c9" /></linearGradient>
        </defs>
        <g className="rx-orbit"><circle cx="110" cy="110" r="106" className="rx-dash" /><circle cx="110" cy="4" r="3.2" className="rx-sat" /></g>
        {Array.from({ length: 60 }).map((_, i) => (
          <line key={i} x1="110" y1="14" x2="110" y2={i % 5 === 0 ? 28 : 23} transform={`rotate(${i * 6} 110 110)`} className={`tk ${i < lit ? "on" : ""}`} style={{ transitionDelay: `${i * 22}ms` }} />
        ))}
        <circle cx="110" cy="110" r="76" className="rx-track" />
        <circle cx="110" cy="110" r="76" className="rx-fill" transform="rotate(-90 110 110)" strokeDasharray={RX_C} strokeDashoffset={RX_C * (1 - p / 100)} />
      </svg>
      <div className="rx-core">
        <div className="fd text-6xl font-extrabold tracking-tight text-white sm:text-7xl"><AnimatedNumber value={percent} loading={loading} suffix="%" /></div>
        <p className="mt-1 text-xs text-white/45">community strength</p>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Manrope:wght@300..800&display=swap');
.fx{--e:#ff5a14;--a:#ffb347;--c:#fff1dc;--t0:1.5s;font-family:'Manrope',var(--font-geist-sans),system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.fx .fd{font-family:'Syne',var(--font-geist-sans),system-ui,sans-serif;letter-spacing:-.02em}
.fx ::selection{background:#ff7a2f;color:#000}
.fx :focus-visible{outline:2px solid rgba(255,160,70,.95);outline-offset:3px}
.fx img{max-width:none}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sheen{to{background-position:-250% 0}}
@keyframes ping{75%,100%{transform:scale(2.6);opacity:0}}

/* splash */
.splash{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:#030204;animation:spOut .7s ease 1.3s forwards}
@keyframes spOut{to{opacity:0;visibility:hidden}}
.splash-glow{position:absolute;width:520px;height:520px;max-width:90vw;border-radius:50%;background:rgba(255,90,20,.28);filter:blur(130px);animation:halo 2s ease-in-out infinite}
@keyframes halo{50%{opacity:.5;transform:scale(1.15)}}
.splash-logo{position:relative;display:grid;place-items:center;width:200px;height:200px;animation:logoIn 1.1s cubic-bezier(.2,.7,.2,1) both}
@keyframes logoIn{from{opacity:0;transform:scale(.88);filter:blur(16px)}}
.splash-logo img{width:62%;height:auto;filter:drop-shadow(0 0 30px rgba(255,120,30,.6))}
.splash-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 55%,#ffb347,transparent);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));animation:spin 1.6s linear infinite}

/* atmosphere */
.atmos{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:radial-gradient(ellipse at 50% -10%,#2a0f08 0,transparent 60%),#060407}
.rays{position:absolute;left:50%;top:-30%;width:140vmax;height:140vmax;margin-left:-70vmax;opacity:.5;background:conic-gradient(from 180deg,transparent 0 40%,rgba(255,120,40,.12) 44%,transparent 48% 52%,rgba(255,180,90,.1) 55%,transparent 58% 100%);-webkit-mask:radial-gradient(circle at 50% 30%,#000 0,transparent 55%);mask:radial-gradient(circle at 50% 30%,#000 0,transparent 55%);animation:spin 90s linear infinite}
.orb{position:absolute;border-radius:50%;filter:blur(120px);animation:drift 24s ease-in-out infinite alternate}
.o1{left:-12%;top:20%;width:560px;height:560px;background:rgba(255,90,20,.14)}.o2{right:-14%;bottom:-10%;width:620px;height:520px;background:rgba(140,70,255,.08);animation-delay:-9s}
@keyframes drift{to{transform:translate3d(70px,40px,0)}}
.floor{position:absolute;left:0;right:0;bottom:0;height:45vh;opacity:.5;background-image:linear-gradient(rgba(255,150,70,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,150,70,.12) 1px,transparent 1px);background-size:60px 60px;transform:perspective(500px) rotateX(62deg);transform-origin:50% 100%;-webkit-mask:linear-gradient(transparent,#000);mask:linear-gradient(transparent,#000);animation:grid 8s linear infinite}
@keyframes grid{to{background-position:0 60px}}
.embers{position:absolute;inset:0}
.embers i{position:absolute;bottom:-4px;left:var(--x);width:var(--s);height:var(--s);border-radius:50%;background:#ffb347;box-shadow:0 0 10px 2px rgba(255,120,30,.8);opacity:0;animation:ember var(--d) ease-out var(--dl) infinite}
@keyframes ember{0%{opacity:0;transform:translate(0,0)}12%{opacity:.9}100%{opacity:0;transform:translate(var(--dx),-85vh) scale(.2)}}
.grain{position:fixed;inset:0;z-index:150;pointer-events:none;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.cglow{position:fixed;left:0;top:0;z-index:5;width:460px;height:460px;border-radius:50%;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(circle,rgba(255,110,30,.13),transparent 65%);transform:translate3d(calc(var(--cx,50vw) - 230px),calc(var(--cy,40vh) - 230px),0);transition:transform .25s ease-out}
@media(hover:none){.cglow{display:none}}
.sbar{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(var(--sp,0));background:linear-gradient(90deg,#ff4d00,#ffc44c)}

/* header */
.hdr{transition:background .4s,backdrop-filter .4s,border-color .4s;border-bottom:1px solid transparent;animation:drop 1s cubic-bezier(.2,.7,.2,1) var(--t0) both}
@keyframes drop{from{opacity:0;transform:translateY(-20px)}}
.hdr.is-s{background:rgba(8,4,5,.72);backdrop-filter:blur(16px);border-color:rgba(255,255,255,.1)}
.back img{filter:drop-shadow(0 0 14px rgba(255,100,30,.4));transition:transform .4s,filter .4s}.back:hover img{transform:scale(1.06);filter:drop-shadow(0 0 22px rgba(255,120,30,.8))}
.back:hover span{color:#fff;transform:translateX(-3px)}
.pill-nav{gap:.2rem;padding:.3rem;border-radius:99px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)}
.pill-nav a{padding:.5rem 1.1rem;border-radius:99px;font-size:.78rem;font-weight:600;color:rgba(255,241,220,.6);transition:background .3s,color .3s}
.pill-nav a:hover{background:var(--c);color:#1a0a04}
.adm{padding:.55rem 1rem;border-radius:99px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font-size:.72rem;font-weight:600;color:rgba(255,241,220,.55);transition:all .3s}
.adm:hover{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff}

/* buttons + type */
.cta{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:.7rem;padding:1rem 1.9rem;border-radius:99px;font-size:.88rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 12px 40px rgba(255,90,20,.38),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s}
.cta::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-18deg);animation:shine 4s ease-in-out infinite}
@keyframes shine{0%,55%{left:-60%}100%{left:140%}}
.cta:hover{transform:translateY(-3px);box-shadow:0 18px 55px rgba(255,90,20,.55),inset 0 1px 0 rgba(255,255,255,.4)}
.cta:active{transform:scale(.98)}.cta:disabled{opacity:.6;cursor:not-allowed}
.ghost{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:1rem 1.8rem;border-radius:99px;border:1px solid rgba(255,255,255,.16);font-size:.84rem;font-weight:600;color:rgba(255,241,220,.82);transition:background .3s,border-color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.ghost:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.32);transform:translateY(-3px)}
.kick{display:flex;align-items:center;gap:.8rem;font-size:.82rem;font-weight:600;color:rgba(255,200,140,.8)}.kick i{width:2.4rem;height:1px;background:linear-gradient(90deg,#ff7a2f,#ffb347)}
.ember-text{background:linear-gradient(100deg,#ff5a14 10%,#ffd08a 45%,#ff5a14 70%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 6s linear infinite}
.hero-h{font-size:clamp(4.4rem,16vw,11rem);font-weight:800;line-height:.86;letter-spacing:-.05em}
.fa-line{display:block;overflow:hidden;padding:.02em .06em .1em}
.fa-line>span{display:block;animation:lineUp 1.2s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--t0) + .2s)}
.fa-line:nth-child(2)>span{animation-delay:calc(var(--t0) + .35s)}
@keyframes lineUp{from{transform:translateY(108%)}}
.rise{animation:rise 1s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--t0) + var(--d,0s))}
@keyframes rise{from{opacity:0;transform:translateY(26px);filter:blur(8px)}}
.hero-logo{height:clamp(56px,9vw,84px);width:auto;filter:drop-shadow(0 0 28px rgba(255,100,30,.55));animation:logoBreath 4s ease-in-out infinite}
@keyframes logoBreath{50%{filter:drop-shadow(0 0 46px rgba(255,130,40,.85))}}

/* 3D ring */
.ring-wrap{position:relative;display:grid;place-items:center;height:clamp(340px,50vw,520px);perspective:1500px}
.ring-glow{position:absolute;width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,110,30,.28),transparent 65%);filter:blur(30px);animation:logoBreath 5s ease-in-out infinite}
.ring3d{--w:clamp(120px,16vw,200px);position:relative;width:var(--w);height:calc(var(--w)*1.4);transform-style:preserve-3d;transform:rotateX(-5deg)}
.ring-rot{position:absolute;inset:0;transform-style:preserve-3d;animation:ringSpin 40s linear infinite}
.ring3d:hover .ring-rot{animation-play-state:paused}
@keyframes ringSpin{to{transform:rotateY(-360deg)}}
.ring-item{position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(calc(var(--i)*360deg/var(--n))) translateZ(calc(var(--w)*var(--k)))}
.ri{display:block;width:100%;height:100%;text-align:left}
.ri-box{position:relative;display:block;height:calc(100% - 1.7rem);overflow:hidden;border-radius:14px;padding:0;border:1px solid rgba(255,190,120,.35);background:#0d0709;box-shadow:0 24px 60px rgba(0,0,0,.6),0 0 40px rgba(255,100,20,.15);transition:box-shadow .4s,border-color .4s,transform .5s cubic-bezier(.16,1,.3,1)}
.ri:hover .ri-box{border-color:#ffb347;box-shadow:0 30px 70px rgba(0,0,0,.7),0 0 60px rgba(255,120,30,.45);transform:scale(1.04)}
.ri b{display:block;margin-top:.55rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.72rem;font-weight:600;color:rgba(255,241,220,.75)}
.ri-empty{display:grid;place-items:center;border-style:dashed;background:rgba(255,255,255,.03)}.ri-empty img{width:50%;opacity:.4}.ri-empty em{position:absolute;bottom:.8rem;font-style:normal;font-size:1.6rem;color:rgba(255,200,140,.6)}
.ring-floor{position:absolute;bottom:4%;width:70%;height:34px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,110,30,.4),transparent 70%);filter:blur(8px)}

/* plate: identical tile for every artwork */
.plate{position:absolute;inset:0;display:block;overflow:hidden;background:#0c0709}
.plate-bd{position:absolute;left:-12%;top:-12%;width:124%;height:124%;object-fit:cover;filter:blur(22px) saturate(1.4) brightness(.55)}
.plate-fg{position:relative;display:block;width:100%;height:100%;object-fit:contain;transition:transform 1.1s cubic-bezier(.16,1,.3,1)}
.plate.fill .plate-fg{object-fit:cover}.plate.fill .plate-bd{opacity:0}

/* ticker */
.ticker{overflow:hidden;border-block:1px solid rgba(255,150,70,.2);background:rgba(10,5,6,.8);padding:.9rem 0}
.ticker-t{display:flex;width:max-content;gap:2.5rem;animation:tick 60s linear infinite;font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:transparent;-webkit-text-stroke:1px rgba(255,200,140,.4)}
.ticker:hover .ticker-t{animation-play-state:paused}
.ticker-t span{display:flex;align-items:center;gap:2.5rem;white-space:nowrap}.ticker-t img{height:30px;width:auto;opacity:.9;-webkit-text-stroke:0}.ticker-t em{font-style:normal;font-size:1rem;color:#ff5a14;-webkit-text-stroke:0}
@keyframes tick{to{transform:translateX(-50%)}}

/* notice */
.notice{position:relative;display:flex;align-items:flex-start;gap:1rem;overflow:hidden;padding:1rem 1.3rem;border-radius:1.1rem;border:1px solid rgba(80,230,170,.22);background:rgba(40,200,140,.05);backdrop-filter:blur(14px)}
.notice-dot{position:relative;flex:none;width:10px;height:10px;margin-top:.4rem;border-radius:50%;background:#4ee6a8}.notice-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:inherit;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
.xbtn{display:grid;place-items:center;flex:none;width:2.2rem;height:2.2rem;border-radius:50%;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);transition:all .3s}.xbtn:hover{background:rgba(255,255,255,.12);color:#fff;transform:rotate(90deg)}.xbtn.lg{width:2.8rem;height:2.8rem;font-size:1.3rem;background:rgba(0,0,0,.4)}

/* reveal */
.fa-reveal{opacity:0;transform:translateY(26px) scale(.98);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.fa-reveal.is-in{opacity:1;transform:none}

/* fan power */
.power{position:relative;overflow:hidden;padding:2rem;border-radius:2rem;border:1px solid rgba(255,190,120,.18);background:linear-gradient(135deg,rgba(255,150,70,.08),rgba(255,255,255,.02) 50%,transparent)}
@media(min-width:768px){.power{padding:3.2rem}}
.power::before{content:"";position:absolute;right:-6rem;top:-6rem;width:20rem;height:20rem;border-radius:50%;background:radial-gradient(circle,rgba(255,110,30,.2),transparent 65%);filter:blur(20px)}
.rx{position:relative;margin:0 auto;aspect-ratio:1;width:100%;max-width:320px}
.rx svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.rx-glow{position:absolute;inset:18%;border-radius:50%;background:radial-gradient(circle,rgba(255,110,30,.3),transparent 68%);filter:blur(24px);animation:logoBreath 4.5s ease-in-out infinite}
.rx-orbit{transform-origin:110px 110px;animation:spin 40s linear infinite}.rx-dash{fill:none;stroke:rgba(255,180,90,.35);stroke-dasharray:2 7}.rx-sat{fill:#ffd08a;filter:drop-shadow(0 0 6px #ff7a2f)}
.tk{stroke:rgba(255,255,255,.13);stroke-width:2;stroke-linecap:round;transition:stroke .5s,filter .5s}
.tk.on{stroke:#ffb347;filter:drop-shadow(0 0 4px rgba(255,120,30,.9))}
.rx-track{fill:none;stroke:rgba(255,255,255,.07);stroke-width:9}
.rx-fill{fill:none;stroke:url(#rxg);stroke-width:9;stroke-linecap:round;filter:drop-shadow(0 0 10px rgba(255,140,40,.65));transition:stroke-dashoffset 1.8s cubic-bezier(.16,1,.3,1)}
.rx-core{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.stat{padding:1rem;border-radius:1.1rem;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.32);backdrop-filter:blur(8px);transition:transform .4s,border-color .4s}.stat:hover{transform:translateY(-4px);border-color:rgba(255,150,70,.45)}
.meter{position:relative;height:8px;border-radius:99px;background:rgba(255,255,255,.07)}
.meter-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#ff5a14,#ffb347,#fff1c9);box-shadow:0 0 20px rgba(255,140,40,.5);transition:width 1.8s cubic-bezier(.16,1,.3,1)}
.node{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid rgba(255,255,255,.2);background:#150b0d;transition:all .7s}
.node.on{border-color:#ffe3a8;background:#ffb347;box-shadow:0 0 16px rgba(255,160,60,.9)}

/* gallery toolbar */
.bar{position:sticky;top:4.2rem;z-index:30;display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;margin-bottom:1.8rem;padding:.6rem;border-radius:1.3rem;border:1px solid rgba(255,255,255,.1);background:rgba(10,5,7,.7);backdrop-filter:blur(16px)}
.srch{position:relative;flex:1 1 220px}.srch svg{position:absolute;left:1rem;top:50%;width:1rem;height:1rem;transform:translateY(-50%);color:rgba(255,255,255,.35)}
.srch input{width:100%;padding:.75rem 1rem .75rem 2.6rem;border-radius:99px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font-size:.85rem;color:#fff;outline:none;transition:border-color .3s,box-shadow .3s}
.srch input:focus{border-color:rgba(255,150,70,.7);box-shadow:0 0 0 4px rgba(255,120,40,.13)}.srch input::placeholder{color:rgba(255,255,255,.3)}
.seg{position:relative;display:grid;padding:.25rem;border-radius:99px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)}
.seg3{grid-template-columns:repeat(3,1fr);flex:1 1 330px}.seg2{grid-template-columns:repeat(2,1fr);flex:0 0 130px}
.seg-i{position:absolute;left:.25rem;top:.25rem;bottom:.25rem;border-radius:99px;background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 6px 24px rgba(255,90,20,.4);transition:transform .5s cubic-bezier(.16,1,.3,1)}
.seg3 .seg-i{width:calc((100% - .5rem)/3)}.seg2 .seg-i{width:calc((100% - .5rem)/2)}
.seg button{position:relative;z-index:1;padding:.6rem .5rem;border-radius:99px;font-size:.74rem;font-weight:700;color:rgba(255,241,220,.5);white-space:nowrap;transition:color .3s}.seg button.on,.seg button:hover{color:#fff}

/* uniform wall */
.wall{display:grid;gap:1rem;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:640px){.wall{gap:1.4rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}}
.tile{position:relative;display:flex;flex-direction:column;overflow:hidden;height:100%;border-radius:1.2rem;border:1px solid rgba(255,255,255,.1);background:#0c0709;transition:transform .55s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .55s}
.tile::before{content:"";position:absolute;inset:0;z-index:3;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(255,140,50,.18),transparent 70%)}
.tile:hover{transform:translateY(-7px);border-color:rgba(255,150,70,.5);box-shadow:0 30px 70px rgba(0,0,0,.65),0 0 44px rgba(255,100,20,.18)}.tile:hover::before{opacity:1}
.tile-art{position:relative;display:block;width:100%;aspect-ratio:4/5;overflow:hidden;text-align:left;cursor:zoom-in}
.tile:hover .plate-fg{transform:scale(1.05)}
.tile-shade{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(to top,rgba(0,0,0,.65),transparent 45%);opacity:.7;transition:opacity .4s}.tile:hover .tile-shade{opacity:1}
.tile-view{position:absolute;left:50%;bottom:1rem;z-index:2;padding:.5rem 1.1rem;border-radius:99px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.55);backdrop-filter:blur(8px);font-size:.72rem;font-weight:700;color:#fff;white-space:nowrap;transform:translate(-50%,16px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .4s}
.tile:hover .tile-view{transform:translate(-50%,0);opacity:1}
@media(hover:none){.tile-view{display:none}}
.badge{position:absolute;left:.7rem;top:.7rem;z-index:2;padding:.3rem .7rem;border-radius:99px;border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.55);backdrop-filter:blur(8px);font-size:.62rem;font-weight:800;color:#fff}
.badge.gold{border:0;background:linear-gradient(135deg,#ffd978,#ffa91f);color:#1a0a04;box-shadow:0 0 18px rgba(255,180,50,.55);animation:glowb 2.4s ease-in-out infinite}
@keyframes glowb{50%{box-shadow:0 0 30px rgba(255,180,50,.9)}}
.plaque{display:flex;align-items:center;gap:.5rem;height:3.9rem;padding:0 .75rem;border-top:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
.plaque h3{margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.86rem;font-weight:700}
.plaque p{margin:.15rem 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.7rem;color:rgba(255,241,220,.45)}
.plq-link{display:grid;place-items:center;flex:none;width:1.9rem;height:1.9rem;border-radius:50%;font-size:.8rem;color:rgba(255,241,220,.45);border:1px solid rgba(255,255,255,.1);transition:all .3s}.plq-link:hover{color:#ffb347;border-color:#ffb347;transform:translate(2px,-2px)}
.skel{background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 70%);background-size:250% 100%;animation:sheen 1.6s linear infinite}
.empty{padding:5rem 1.5rem;text-align:center;border-radius:1.8rem;border:1px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.02)}

/* like button */
.lk{position:relative;display:inline-flex;flex:none;align-items:center;gap:.45rem;padding:.45rem .8rem;border-radius:99px;font-size:.74rem;font-weight:700;color:rgba(255,241,220,.75);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);transition:transform .3s cubic-bezier(.2,.8,.2,1),background .3s,color .3s,box-shadow .4s,border-color .3s}
button.lk:hover{background:rgba(255,120,40,.15);border-color:rgba(255,150,70,.55);color:#fff;transform:translateY(-2px)}
button.lk:active{transform:scale(.9)}
.lk .hrt{width:1.05rem;height:1.05rem;transition:transform .3s}.lk:hover .hrt{transform:scale(1.18)}
.lk.on{color:#fff;cursor:default;border-color:transparent;background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 8px 26px rgba(255,90,20,.45),inset 0 1px 0 rgba(255,255,255,.35)}
.lk.on:hover{transform:none}
.lk.on .hrt{animation:heartPop .75s cubic-bezier(.2,.8,.2,1)}
@keyframes heartPop{0%{transform:scale(.3)}40%{transform:scale(1.6) rotate(-10deg)}70%{transform:scale(.9)}100%{transform:scale(1)}}
.lk.lg{padding:.75rem 1.5rem;font-size:.9rem;gap:.6rem}.lk.lg .hrt{width:1.3rem;height:1.3rem}
.roll{display:inline-block;overflow:hidden;height:1.2em;line-height:1.2em;font-variant-numeric:tabular-nums}.roll>span{display:block;animation:rollIn .55s cubic-bezier(.2,.8,.2,1)}
@keyframes rollIn{from{transform:translateY(110%);opacity:0}}
.lk-fx{position:absolute;left:1.35rem;top:50%;pointer-events:none}
.lk-fx i{position:absolute;width:5px;height:5px;margin:-2.5px;border-radius:50%;background:#ffd08a;box-shadow:0 0 8px #ff7a2f;animation:spark .8s cubic-bezier(.1,.7,.2,1) var(--dl) both}
@keyframes spark{from{transform:rotate(var(--a)) translateX(0) scale(1);opacity:1}to{transform:rotate(var(--a)) translateX(38px) scale(.2);opacity:0}}
.lk-fx b{position:absolute;width:16px;height:16px;margin:-8px;border-radius:50%;border:2px solid #ffb347;animation:ringP .75s ease-out both}
@keyframes ringP{from{transform:scale(.4);opacity:1}to{transform:scale(3.2);opacity:0}}
.lk-fx em{position:absolute;left:-.2rem;top:-1.2rem;font-style:normal;font-size:.75rem;font-weight:800;color:#ffb347;animation:plus 1s ease-out both}
@keyframes plus{from{transform:translateY(0);opacity:1}to{transform:translateY(-28px);opacity:0}}
.pop-heart{position:absolute;left:50%;top:50%;z-index:5;width:6.5rem;height:6.5rem;margin:-3.25rem;color:#ff6a2a;filter:drop-shadow(0 0 28px rgba(255,100,20,.9));pointer-events:none;animation:popBig .95s cubic-bezier(.2,.8,.2,1) both}
@keyframes popBig{0%{transform:scale(0);opacity:0}30%{transform:scale(1.25);opacity:1}60%{transform:scale(1)}100%{transform:scale(1.4) translateY(-34px);opacity:0}}

/* submit */
.pv{pointer-events:none}.pv-empty{position:absolute;inset:0;display:grid;place-content:center;gap:.8rem;justify-items:center;border:1px dashed rgba(255,255,255,.2);margin:.6rem;border-radius:.9rem;font-size:.72rem;color:rgba(255,255,255,.35)}.pv-empty img{height:34px;width:auto;opacity:.5}
.step-line{position:absolute;left:15px;top:2.3rem;height:calc(100% - .5rem);width:1px;background:linear-gradient(#ff7a2f80,transparent)}
.step-n{position:relative;display:grid;place-items:center;flex:none;width:2rem;height:2rem;border-radius:50%;border:1px solid rgba(255,180,100,.4);background:rgba(255,120,40,.1);font-size:.85rem;font-weight:700;color:#ffd9a8}
.form{position:relative;overflow:hidden;padding:1.6rem;border-radius:2rem;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);backdrop-filter:blur(16px)}
@media(min-width:768px){.form{padding:2.5rem}}
.form::before{content:"";position:absolute;right:-5rem;top:-5rem;width:14rem;height:14rem;border-radius:50%;background:rgba(255,100,20,.12);filter:blur(40px)}
.inp{width:100%;padding:1rem 1.2rem;border-radius:1rem;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.4);font-size:.9rem;color:#fff;outline:none;transition:border-color .3s,box-shadow .3s,background .3s}
.inp:focus{border-color:rgba(255,150,70,.7);box-shadow:0 0 0 4px rgba(255,120,40,.13),0 0 30px -8px rgba(255,100,20,.5);background:rgba(0,0,0,.6)}.inp::placeholder{color:rgba(255,255,255,.25)}
.drop{display:flex;min-height:11rem;cursor:pointer;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;border-radius:1rem;border:1px dashed rgba(255,255,255,.22);background:rgba(0,0,0,.3);transition:border-color .3s,background .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.drop:hover,.drop.is-over{border-color:rgba(255,150,70,.8);background:rgba(255,120,40,.07)}.drop.is-over{transform:scale(1.02)}
.drop-i{display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.04);font-size:1.5rem;color:#ffd9a8;animation:float 3s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-6px)}}
.picked{display:flex;align-items:center;gap:1rem;padding:.75rem;border-radius:1rem;border:1px solid rgba(255,180,100,.28);background:rgba(255,140,60,.05)}
.msg{padding:1rem 1.3rem;border-radius:1rem;text-align:center;font-size:.88rem;animation:rise .6s cubic-bezier(.16,1,.3,1) both}
.msg.ok{border:1px solid rgba(80,230,170,.3);background:rgba(40,200,140,.07);color:#a8f5d4}.msg.bad{border:1px solid rgba(255,90,90,.3);background:rgba(255,60,60,.07);color:#ffb4b4}
.spin{width:1rem;height:1rem;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:spin .8s linear infinite}
.foot{padding:4rem 1.5rem;text-align:center;border-top:1px solid rgba(255,255,255,.1);background:linear-gradient(transparent,rgba(0,0,0,.6))}
.foot img{filter:drop-shadow(0 0 24px rgba(255,100,30,.45))}

/* lightbox */
.lb{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;animation:fadeIn .35s ease-out}
.lb-bd{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.3;filter:blur(50px);transform:scale(1.3);pointer-events:none}
.lb-veil{position:absolute;inset:0;background:rgba(4,2,3,.86)}
.lb-top{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.2rem}
.lb-stage{position:relative;z-index:2;display:flex;min-height:0;flex:1;align-items:center;justify-content:center;gap:.5rem;padding:0 .75rem}
@media(min-width:768px){.lb-stage{gap:1.5rem;padding:0 2rem}}
.lb-frame{position:relative;display:flex;max-height:100%;max-width:100%;min-height:0}
.lb-img{max-height:100%;max-width:100%;border-radius:1.1rem;object-fit:contain;box-shadow:0 30px 100px rgba(0,0,0,.8),0 0 0 1px rgba(255,190,120,.25);animation:zoomIn .55s cubic-bezier(.16,1,.3,1)}
@keyframes zoomIn{from{opacity:0;transform:scale(.94) translateY(12px)}}
.nb{display:none;flex:none;place-items:center;width:3rem;height:3rem;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.4);color:rgba(255,255,255,.8);transition:all .3s}.nb:hover{background:#ffb347;color:#1a0a04;transform:scale(1.1)}
@media(min-width:640px){.nb{display:grid}}
.lb-info{position:relative;z-index:2;padding:1rem 1.2rem 1.5rem;text-align:center}

@media (prefers-reduced-motion:reduce){
.splash,.grain{display:none}
.rays,.orb,.floor,.embers i,.ring-rot,.ticker-t,.ember-text,.hero-logo,.ring-glow,.rx-glow,.rx-orbit,.cta::after,.drop-i,.badge.gold,.skel{animation:none!important}
.rise,.fa-line>span,.hdr{animation:none!important}
.fa-reveal{opacity:1;transform:none;transition:none}
}
`;
