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

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`fa-heart h-4 w-4 ${filled ? "is-on" : ""}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
    </svg>
  );
}

const GAUGE_C = 2 * Math.PI * 84;

function Gauge({ percent, loading }: { percent: number; loading: boolean }) {
  const p = loading ? 0 : percent;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <div className="fa-gauge-glow pointer-events-none absolute inset-6 rounded-full" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="fa-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5a14" />
            <stop offset="55%" stopColor="#ffb347" />
            <stop offset="100%" stopColor="#fff1c9" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="96" className="fa-gauge-orbit" />
        <circle cx="100" cy="100" r="84" className="fa-gauge-track" />
        <circle cx="100" cy="100" r="84" className="fa-gauge-fill" strokeDasharray={GAUGE_C} strokeDashoffset={GAUGE_C * (1 - p / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-serif text-6xl font-black tracking-tight text-white sm:text-7xl">
          <AnimatedNumber value={percent} loading={loading} suffix="%" />
        </div>
        <p className="mt-1 text-xs text-white/45">community strength</p>
      </div>
    </div>
  );
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
      // Fast fallback: load existing artwork directly from Cloudflare R2.
      // This keeps the public gallery working even when Supabase is paused.
      const response = await fetch("/api/fan-art/upload", { cache: "no-store" });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        items?: Array<{
          key: string;
          publicUrl: string;
          lastModified?: string;
          size?: number;
        }>;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load fan art gallery.");
      }

      const arts: FanArt[] = (result.items ?? []).map((item, index: number) => ({
        id: item.key.split("").reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0) || index + 1,
        created_at: item.lastModified || new Date().toISOString(),
        fan_name: "RAAKA Fan",
        title: "RAAKA Fan Art",
        image_url: item.publicUrl,
        social_link: null,
        status: "approved",
        likes: 0,
      }));

      setFanArts(arts);
      setLikeCounts({});
      setLikedArts({});
    } catch (error) {
      console.error("Gallery error:", error);
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

      const [{ count: likesCount }, { count: submissionsCount }, { data: quizActivity }] =
        await Promise.all([
          supabase
            .from("fan_art_likes")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("fan_art")
            .select("id", { count: "exact", head: true })
            .eq("status", "approved"),
          supabase
            .from("fan_passport_activity")
            .select("xp")
            .ilike("activity_key", "%quiz%"),
        ]);

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

    try {
      const supabase = getSupabase();
      const visitorId = getVisitorId();

      const { error } = await supabase.from("fan_art_likes").insert({
        fan_art_id: artId,
        visitor_id: visitorId,
      });

      if (!error) {
        setLikedArts((current) => ({ ...current, [artId]: true }));
        setLikeCounts((current) => ({
          ...current,
          [artId]: (current[artId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Like error:", error);
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
        "Your fan art has been uploaded and is now available in the gallery."
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

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
  const heroArts = fanArts.slice(0, 3);
  const isNew = (art: FanArt) => Date.now() - new Date(art.created_at).getTime() < 3 * 86400000;
  const FRAME_POS = [
    { left: "0%", top: "14%" },
    { left: "34.5%", top: "0%" },
    { left: "69%", top: "22%" },
  ];

  return (
    <main className="fa-root relative min-h-screen overflow-x-hidden bg-[#07070a] text-[#f3ece2]">
      <style>{`
.fa-root{font-family:var(--font-geist-sans),Arial,Helvetica,sans-serif}
.fa-root ::selection{background:#ff7a2f;color:#000}
.fa-root :focus-visible{outline:2px solid rgba(255,160,70,.95);outline-offset:3px}

/* ---------- atmosphere ---------- */
.fa-blob{position:absolute;border-radius:50%;filter:blur(130px);will-change:transform}
.fa-blob-a{left:-12%;top:-10%;width:640px;height:640px;background:rgba(255,100,20,.13);animation:faDrift 22s ease-in-out infinite alternate}
.fa-blob-b{right:-14%;top:30%;width:560px;height:560px;background:rgba(255,190,90,.07);animation:faDrift 28s ease-in-out infinite alternate-reverse}
.fa-blob-c{left:25%;bottom:-18%;width:700px;height:500px;background:rgba(150,80,255,.06);animation:faDrift 32s ease-in-out infinite alternate}
@keyframes faDrift{to{transform:translate3d(60px,40px,0)}}
.fa-grid{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse at 50% 20%,#000 0%,transparent 70%);mask-image:radial-gradient(ellipse at 50% 20%,#000 0%,transparent 70%)}

/* ---------- hero load sequence (the one orchestrated moment) ---------- */
.fa-line{display:block;overflow:hidden;padding-bottom:.08em}
.fa-line>span{display:block;animation:faLineUp 1.1s cubic-bezier(.16,1,.3,1) backwards}
.fa-line:nth-child(2)>span{animation-delay:.14s}
@keyframes faLineUp{from{transform:translateY(105%)}}
.fa-title{background:linear-gradient(180deg,#fff7ea 20%,#f3ece2 55%,#ff9a4d 120%);-webkit-background-clip:text;background-clip:text;color:transparent}
.fa-in{animation:faIn .9s cubic-bezier(.16,1,.3,1) backwards}
@keyframes faIn{from{opacity:0;transform:translateY(16px)}}

/* ---------- buttons ---------- */
.fa-cta{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(135deg,#ff8a3d,#e2480b);box-shadow:0 12px 40px rgba(255,90,20,.38),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s}
.fa-cta::after{content:"";position:absolute;top:0;bottom:0;left:0;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.45),transparent);transform:translateX(-130%) skewX(-18deg);animation:faShine 4.2s ease-in-out infinite 1.5s;pointer-events:none}
@keyframes faShine{0%,55%{transform:translateX(-130%) skewX(-18deg)}100%{transform:translateX(380%) skewX(-18deg)}}
.fa-cta:hover{transform:translateY(-3px);box-shadow:0 18px 55px rgba(255,90,20,.55),inset 0 1px 0 rgba(255,255,255,.4)}
.fa-cta:active{transform:scale(.98)}
.fa-ghost{transition:background-color .3s,border-color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.fa-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.3);transform:translateY(-3px)}
.fa-back-arrow{display:inline-block;transition:transform .4s cubic-bezier(.16,1,.3,1)}
.fa-back:hover .fa-back-arrow{transform:translateX(-5px)}

/* ---------- hero frames ---------- */
.fa-spot{background:radial-gradient(ellipse at 50% 0%,rgba(255,200,130,.22),transparent 62%);-webkit-mask-image:linear-gradient(#000,transparent 85%);mask-image:linear-gradient(#000,transparent 85%)}
.fa-frame{position:absolute;width:31%;animation:faFrameIn 1.2s cubic-bezier(.16,1,.3,1) backwards}
.fa-frame-inner{animation:faFloat 7s ease-in-out infinite;animation-delay:var(--fd,0s)}
@keyframes faFrameIn{from{opacity:0;transform:translateY(40px)}}
@keyframes faFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.fa-frame-box{position:relative;aspect-ratio:3/4.2;padding:6px;border-radius:14px;background:linear-gradient(145deg,#f5d9a8,#8a6128 45%,#e9c487);box-shadow:0 30px 70px rgba(0,0,0,.65),0 0 60px rgba(255,140,50,.12);transition:box-shadow .5s,transform .5s cubic-bezier(.16,1,.3,1)}
.fa-frame:hover .fa-frame-box{transform:translateY(-6px);box-shadow:0 40px 90px rgba(0,0,0,.7),0 0 80px rgba(255,140,50,.28)}
.fa-frame-box>div{height:100%;width:100%;overflow:hidden;border-radius:9px;background:#0d0d10}
.fa-frame-box img{height:100%;width:100%;object-fit:cover;transition:transform 1s cubic-bezier(.16,1,.3,1)}
.fa-frame:hover .fa-frame-box img{transform:scale(1.07)}
.fa-frame-empty{border:1px dashed rgba(255,255,255,.22);background:rgba(255,255,255,.02);box-shadow:none}
.fa-frame-empty>div{display:flex;align-items:center;justify-content:center;background:transparent;color:rgba(255,255,255,.35);font-size:2rem}

/* ---------- reveal ---------- */
.fa-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.fa-reveal.is-in{opacity:1;transform:none}

/* ---------- gauge ---------- */
.fa-gauge-track{fill:none;stroke:rgba(255,255,255,.07);stroke-width:10}
.fa-gauge-fill{fill:none;stroke:url(#fa-grad);stroke-width:10;stroke-linecap:round;filter:drop-shadow(0 0 10px rgba(255,140,40,.65));transition:stroke-dashoffset 1.8s cubic-bezier(.16,1,.3,1)}
.fa-gauge-orbit{fill:none;stroke:rgba(255,180,90,.35);stroke-width:1;stroke-dasharray:2 7;transform-origin:100px 100px;animation:faSpin 40s linear infinite}
@keyframes faSpin{to{transform:rotate(360deg)}}
.fa-gauge-glow{background:radial-gradient(circle,rgba(255,110,30,.25),transparent 68%);filter:blur(24px);animation:faBreath 4.5s ease-in-out infinite}
@keyframes faBreath{0%,100%{opacity:.5;transform:scale(.95)}50%{opacity:1;transform:scale(1.06)}}
.fa-track-fill{background:linear-gradient(90deg,#ff5a14,#ffb347,#fff1c9);box-shadow:0 0 20px rgba(255,140,40,.5);transition:width 1.8s cubic-bezier(.16,1,.3,1)}

/* ---------- gallery ---------- */
.fa-card{transition:transform .55s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .55s}
.fa-card:hover{transform:translateY(-6px);border-color:rgba(255,150,70,.4);box-shadow:0 28px 70px rgba(0,0,0,.6),0 0 40px rgba(255,100,20,.1)}
.fa-card img{transition:transform 1.1s cubic-bezier(.16,1,.3,1),filter .6s}
.fa-card:hover img{transform:scale(1.06);filter:saturate(1.1) brightness(1.05)}
.fa-card-cap{transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .5s}
@media (hover:hover){.fa-card-cap{transform:translateY(8px);opacity:.92}.fa-card:hover .fa-card-cap{transform:none;opacity:1}}
.fa-heart{transition:transform .3s}
.fa-heart.is-on{animation:faPop .6s cubic-bezier(.16,1,.3,1)}
@keyframes faPop{0%{transform:scale(.4)}45%{transform:scale(1.5)}100%{transform:scale(1)}}
.fa-skel{background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 70%);background-size:250% 100%;animation:faSkel 1.6s linear infinite}
@keyframes faSkel{to{background-position:-250% 0}}

/* ---------- lightbox ---------- */
.fa-lb{animation:faFade .35s ease-out}
@keyframes faFade{from{opacity:0}}
.fa-lb-img{animation:faZoom .55s cubic-bezier(.16,1,.3,1)}
@keyframes faZoom{from{opacity:0;transform:scale(.94) translateY(12px)}}

/* ---------- form ---------- */
.fa-input{transition:border-color .3s,box-shadow .3s,background-color .3s}
.fa-input:focus{border-color:rgba(255,150,70,.7);box-shadow:0 0 0 4px rgba(255,120,40,.13);background:rgba(0,0,0,.55)}
.fa-drop{transition:border-color .3s,background-color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.fa-drop:hover,.fa-drop.is-over{border-color:rgba(255,150,70,.7);background:rgba(255,120,40,.06)}
.fa-drop.is-over{transform:scale(1.015)}
.fa-spin{animation:faSpin .8s linear infinite}

@media (prefers-reduced-motion:reduce){
  .fa-blob,.fa-line>span,.fa-in,.fa-frame,.fa-frame-inner,.fa-cta::after,.fa-gauge-orbit,.fa-gauge-glow,.fa-skel,.fa-heart.is-on,.fa-lb,.fa-lb-img{animation:none!important}
  .fa-reveal{opacity:1;transform:none;transition:none}
  .fa-gauge-fill,.fa-track-fill{transition:none}
}
      `}</style>

      {/* ATMOSPHERE */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="fa-blob fa-blob-a" />
        <div className="fa-blob fa-blob-b" />
        <div className="fa-blob fa-blob-c" />
        <div className="fa-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,.75)_100%)]" />
      </div>

      {/* HEADER */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/10 bg-black/60 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-10">
          <a href="/" className="fa-back group flex items-center gap-2.5 text-sm text-white/60 transition hover:text-white">
            <span className="fa-back-arrow">←</span>
            <span className="hidden sm:inline">The World of Raaka</span>
            <span className="sm:hidden">Home</span>
          </a>
          <a href="/" className="font-serif text-lg font-bold tracking-[0.32em] text-white">RAAKA</a>
          <a
            href="/admin/fans-art"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/55 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            Admin sign in
          </a>
        </div>
      </header>

      <div className="relative z-10">
        {/* HERO */}
        <section className="px-5 pb-12 pt-32 md:px-10 md:pb-20 md:pt-44">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="fa-in flex items-center gap-3 text-sm text-orange-200/75" style={{ animationDelay: ".1s" }}>
                <span className="h-px w-10 bg-orange-400/70" />
                The fan community
              </p>

              <h1 className="fa-title mt-6 font-serif text-[clamp(4rem,15vw,10rem)] font-black leading-[0.86] tracking-[-0.045em]">
                <span className="fa-line"><span>Fans</span></span>
                <span className="fa-line"><span>Art</span></span>
              </h1>

              <p className="fa-in mt-8 max-w-md text-base leading-7 text-white/55" style={{ animationDelay: ".55s" }}>
                A space for fans to share their creativity, edits and artwork inspired by RAAKA and Allu Arjun.
              </p>

              <div className="fa-in mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: ".7s" }}>
                <a href="#submit" className="fa-cta inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white">
                  Submit your fan art
                </a>
                <a href="#gallery" className="fa-ghost inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-medium text-white/80">
                  Browse the gallery
                </a>
              </div>
            </div>

            {/* hanging frames — latest approved art */}
            <div className="fa-in relative mx-auto w-full max-w-[540px]" style={{ animationDelay: ".4s" }}>
              <div className="fa-spot pointer-events-none absolute -inset-x-6 -top-10 h-[75%]" />
              <div className="relative h-[330px] sm:h-[460px]">
                {FRAME_POS.map((pos, i) => {
                  const art = heroArts[i];
                  const style = { left: pos.left, top: pos.top, animationDelay: `${0.5 + i * 0.18}s`, ["--fd" as string]: `${i * 1.3}s` } as React.CSSProperties;
                  return (
                    <div key={i} className="fa-frame" style={style}>
                      <div className="fa-frame-inner">
                        {art ? (
                          <button type="button" onClick={() => setSelectedArt(art)} className="block w-full text-left" aria-label={`Open ${art.title}`}>
                            <div className="fa-frame-box"><div><img src={art.image_url} alt={art.title} loading="lazy" decoding="async" /></div></div>
                            <p className="mt-3 truncate text-xs font-medium text-white/70">{art.title}</p>
                            <p className="truncate text-[11px] text-white/35">by {art.fan_name}</p>
                          </button>
                        ) : (
                          <a href="#submit" className="block" aria-label="Submit your fan art">
                            <div className="fa-frame-box fa-frame-empty"><div>＋</div></div>
                            <p className="mt-3 text-xs text-white/35">Your art here</p>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* UPLOADS NOTICE */}
        {showNotice && (
          <section className="px-5 pb-10 md:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] px-5 py-4 backdrop-blur-xl md:items-center md:px-7">
                <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
                <span className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-sm text-emerald-300 md:mt-0">✓</span>
                <div className="relative min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Fan art uploads are back</p>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    The storage issue is fixed and your artwork now uploads in high quality. Thank you for your patience and for being part of the World of RAAKA.
                  </p>
                </div>
                <button type="button" onClick={() => setShowNotice(false)} aria-label="Dismiss notice" className="relative -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white">×</button>
              </div>
            </div>
          </section>
        )}

        {/* FAN POWER */}
        <section id="fan-power" className="px-5 py-10 md:px-10 md:py-14">
          <Reveal>
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-200/15 bg-gradient-to-br from-orange-200/[0.07] via-white/[0.025] to-transparent p-7 md:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
                <Gauge percent={fanPower.percent} loading={loadingPower} />

                <div>
                  <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">RAAKA fan power</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-base">
                    Every like, approved fan art and quiz achievement makes the RAAKA community stronger. At 100,000 points the bar is full.
                  </p>

                  <div className="mt-7 grid grid-cols-3 gap-2.5 md:max-w-xl md:gap-3">
                    {[
                      { icon: "❤️", label: "Likes", value: fanPower.likes },
                      { icon: "🎨", label: "Artworks", value: fanPower.submissions },
                      { icon: "🧠", label: "Quiz XP", value: fanPower.quizXp },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
                        <p className="font-serif text-2xl font-bold text-white md:text-3xl"><AnimatedNumber value={s.value} loading={loadingPower} /></p>
                        <p className="mt-1.5 text-xs text-white/45"><span className="mr-1">{s.icon}</span>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <div className="relative h-2 rounded-full bg-white/[0.07]">
                      <div className="fa-track-fill h-full rounded-full" style={{ width: `${loadingPower ? 0 : fanPower.percent}%` }} />
                      {MILESTONES.map((m) => (
                        <span key={m.at} className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-700 ${fanPower.percent >= m.at && !loadingPower ? "border-amber-200 bg-amber-300 shadow-[0_0_12px_rgba(255,190,90,.8)]" : "border-white/20 bg-[#07070a]"}`} style={{ left: `${m.at === 100 ? 99 : m.at}%` }} />
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-4 text-[11px] text-white/35">
                      {MILESTONES.map((m, i) => (
                        <span key={m.at} className={`${i === 3 ? "text-right" : i === 0 ? "" : "text-center"} ${fanPower.percent >= m.at && !loadingPower ? "text-amber-200/80" : ""}`}>{m.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-orange-200/70">Community creations</p>
                  <h2 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-6xl">Fan gallery</h2>
                </div>
                {!loadingGallery && fanArts.length > 0 && (
                  <p className="text-sm text-white/40">{visibleFanArts.length} of {fanArts.length} artworks</p>
                )}
              </div>
            </Reveal>

            {!loadingGallery && fanArts.length > 0 && (
              <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search artwork or creator"
                    aria-label="Search artwork or creator"
                    className="fa-input w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-5 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>

                <div className="relative grid w-full grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1 md:w-auto md:min-w-[380px]">
                  <span
                    className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-gradient-to-br from-[#ff8a3d] to-[#e2480b] shadow-[0_6px_24px_rgba(255,90,20,.4)] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{ transform: `translateX(${(["newest", "trending", "most-liked"] as const).indexOf(filter) * 100}%)` }}
                  />
                  {([
                    ["newest", "Newest"],
                    ["trending", "🔥 Trending"],
                    ["most-liked", "❤️ Most liked"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      aria-pressed={filter === value}
                      className={`relative z-10 rounded-full px-3 py-2.5 text-xs font-semibold transition-colors duration-300 ${filter === value ? "text-white" : "text-white/50 hover:text-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingGallery ? (
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4" aria-label="Loading fan art">
                {[260, 340, 300, 380, 280, 330, 360, 270].map((h, i) => (
                  <div key={i} className="fa-skel mb-5 break-inside-avoid rounded-2xl border border-white/5" style={{ height: h }} />
                ))}
              </div>
            ) : fanArts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-20 text-center">
                <p className="font-serif text-2xl font-semibold">The wall is empty</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">Be the first fan to hang a creation here.</p>
                <a href="#submit" className="fa-cta mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white">Submit your fan art</a>
              </div>
            ) : visibleFanArts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
                <p className="font-serif text-2xl font-semibold">No matches for &ldquo;{search}&rdquo;</p>
                <p className="mt-2 text-sm text-white/45">Try a different title or creator name.</p>
                <button type="button" onClick={() => setSearch("")} className="fa-ghost mt-6 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80">Clear search</button>
              </div>
            ) : (
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
                {visibleFanArts.map((art, i) => {
                  const likes = likeCounts[art.id] || 0;
                  const rank = filter === "most-liked" && likes > 0 && i < 3 ? i + 1 : 0;
                  return (
                    <Reveal key={art.id} delay={(i % 4) * 70} className="mb-5 break-inside-avoid">
                      <article className="fa-card group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                        <button type="button" onClick={() => setSelectedArt(art)} aria-label={`View ${art.title}`} className="block w-full text-left">
                          <div className="relative overflow-hidden">
                            <img src={art.image_url} alt={art.title} loading="lazy" decoding="async" className="block h-auto w-full" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 pb-4 pt-20">
                              <div className="fa-card-cap">
                                <p className="text-sm font-semibold text-white">{art.title}</p>
                                <p className="mt-0.5 text-xs text-white/60">by {art.fan_name}</p>
                              </div>
                            </div>
                            {(rank > 0 || isNew(art)) && (
                              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-md ${rank > 0 ? "bg-amber-300 text-black" : "border border-white/20 bg-black/55 text-white"}`}>
                                {rank > 0 ? `#${rank} most liked` : "New"}
                              </span>
                            )}
                          </div>
                        </button>

                        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleLike(art.id)}
                            disabled={!!likedArts[art.id]}
                            aria-label={likedArts[art.id] ? "Liked" : "Like this artwork"}
                            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                              likedArts[art.id] ? "bg-gradient-to-br from-[#ff8a3d] to-[#e2480b] text-white shadow-[0_6px_20px_rgba(255,90,20,.35)]" : "bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Heart filled={!!likedArts[art.id]} />
                            {likes}
                          </button>

                          {art.social_link && (
                            <a href={art.social_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-white/40 transition hover:text-orange-200">
                              Creator ↗
                            </a>
                          )}
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
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="text-sm text-orange-200/70">Share your creation</p>
                <h2 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">Submit fan art</h2>
                <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">
                  Upload your poster or edit. Every submission is reviewed before it appears in the public gallery.
                </p>

                <ol className="mt-10 space-y-6">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className="relative flex gap-4">
                      {i < STEPS.length - 1 && <span className="absolute left-[15px] top-9 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-orange-400/50 to-transparent" />}
                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-300/40 bg-orange-400/10 text-sm font-semibold text-orange-200">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{s.title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/45">{s.copy}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="relative space-y-6">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between">
                      <label htmlFor="fan-name" className="text-sm font-medium text-white/75">Fan name</label>
                      <span className="text-xs text-white/25">{fanName.length}/80</span>
                    </div>
                    <input id="fan-name" type="text" value={fanName} onChange={(e) => setFanName(e.target.value)} placeholder="Your name" maxLength={80} className="fa-input w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none placeholder:text-white/25" />
                  </div>

                  <div>
                    <div className="mb-2 flex items-baseline justify-between">
                      <label htmlFor="fan-title" className="text-sm font-medium text-white/75">Artwork title</label>
                      <span className="text-xs text-white/25">{title.length}/120</span>
                    </div>
                    <input id="fan-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: RAAKA — The King" maxLength={120} className="fa-input w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none placeholder:text-white/25" />
                  </div>

                  <div>
                    <label htmlFor="fan-social" className="mb-2 block text-sm font-medium text-white/75">
                      Instagram or social link <span className="ml-1 font-normal text-white/25">optional</span>
                    </label>
                    <input id="fan-social" type="url" value={socialLink} onChange={(e) => setSocialLink(e.target.value)} placeholder="https://instagram.com/yourusername" className="fa-input w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none placeholder:text-white/25" />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-white/75">Fan art</p>
                    {preview && file ? (
                      <div className="flex items-center gap-4 rounded-2xl border border-orange-300/25 bg-orange-400/[0.05] p-3">
                        <img src={preview} alt="Selected artwork preview" className="h-24 w-20 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{file.name}</p>
                          <p className="mt-1 text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <label htmlFor="fan-art-file" className="mt-2 inline-block cursor-pointer text-xs font-medium text-orange-200 hover:text-orange-100">Choose a different image</label>
                        </div>
                        <button type="button" onClick={clearFile} aria-label="Remove selected image" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white/10 hover:text-white">×</button>
                      </div>
                    ) : (
                      <label
                        htmlFor="fan-art-file"
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          const dropped = e.dataTransfer.files?.[0];
                          if (dropped) setFile(dropped);
                        }}
                        className={`fa-drop flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/30 px-6 text-center ${dragOver ? "is-over" : ""}`}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-2xl text-orange-200">＋</span>
                        <span className="mt-4 text-sm font-medium text-white">{dragOver ? "Drop to attach" : "Choose or drop your artwork"}</span>
                        <span className="mt-2 text-xs text-white/35">JPG, PNG, WEBP up to 10 MB. High-quality storage.</span>
                      </label>
                    )}
                    <input id="fan-art-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>

                  <p className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-xs leading-5 text-white/40">
                    By submitting, you confirm that you have the right to share this artwork and that it is your fan-made creation.
                  </p>

                  {message && (
                    <div role="status" className={`rounded-2xl border px-5 py-4 text-center text-sm ${isSuccess ? "border-emerald-400/30 bg-emerald-500/[0.07] text-emerald-200" : "border-red-400/30 bg-red-500/[0.07] text-red-200"}`}>
                      {message}
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="fa-cta flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                    {loading && <span className="fa-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />}
                    {loading ? "Uploading your art" : "Submit fan art"}
                  </button>
                </div>
              </form>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-6 py-14 text-center">
          <a href="/" className="font-serif text-2xl font-bold tracking-[0.4em] text-white/80 transition hover:text-white">RAAKA</a>
          <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-white/30">
            RAAKA Fans Art is a fan-made community feature. All submitted artwork remains the property of its respective creator.
          </p>
        </footer>
      </div>

      {/* LIGHTBOX */}
      {selectedArt && (
        <div className="fa-lb fixed inset-0 z-[100] flex flex-col" role="dialog" aria-modal="true" aria-label={selectedArt.title} onClick={() => setSelectedArt(null)}>
          <img src={selectedArt.image_url} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl" />
          <div className="absolute inset-0 bg-black/85" />

          <div className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-white/45">{selectedIndex >= 0 ? `${selectedIndex + 1} of ${visibleFanArts.length}` : ""}</p>
            <button type="button" onClick={() => setSelectedArt(null)} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xl text-white transition hover:bg-white/15">×</button>
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center gap-2 px-3 md:gap-6 md:px-8">
            {visibleFanArts.length > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); stepArt(-1); }} aria-label="Previous artwork" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 transition hover:bg-white/15 sm:flex">←</button>
            )}
            <img key={selectedArt.id} src={selectedArt.image_url} alt={selectedArt.title} decoding="async" onClick={(e) => e.stopPropagation()} className="fa-lb-img max-h-full max-w-full rounded-2xl object-contain shadow-[0_30px_100px_rgba(0,0,0,.8)]" />
            {visibleFanArts.length > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); stepArt(1); }} aria-label="Next artwork" className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 transition hover:bg-white/15 sm:flex">→</button>
            )}
          </div>

          <div className="relative z-10 px-5 pb-6 pt-4 text-center md:pb-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-xl font-bold text-white md:text-2xl">{selectedArt.title}</h3>
            <p className="mt-1 text-sm text-white/50">by {selectedArt.fan_name}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleLike(selectedArt.id)}
                disabled={!!likedArts[selectedArt.id]}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  likedArts[selectedArt.id] ? "bg-gradient-to-br from-[#ff8a3d] to-[#e2480b] text-white" : "border border-white/15 bg-white/[0.06] text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart filled={!!likedArts[selectedArt.id]} />
                {likedArts[selectedArt.id] ? "Liked" : "Like"} · {likeCounts[selectedArt.id] || 0}
              </button>
              {selectedArt.social_link && (
                <a href={selectedArt.social_link} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
                  View creator profile ↗
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
