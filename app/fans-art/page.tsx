"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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


const TARGET_IMAGE_BYTES = 20 * 1024;
const MAX_IMAGE_DIMENSION = 1200;

async function compressFanArtImage(file: File): Promise<File> {
  // Always optimize fan art for gallery delivery.
  // Even small source images are recompressed so new uploads stay lightweight.
  if (file.size <= TARGET_IMAGE_BYTES && file.type === "image/jpeg") {
    return file;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the selected image."));
    };

    img.src = url;
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not prepare the image for upload.");
  }

  // Keep gallery images lightweight while preserving a usable resolution.
  let maxDimension = Math.min(
    MAX_IMAGE_DIMENSION,
    Math.max(image.naturalWidth, image.naturalHeight)
  );

  for (let sizeAttempt = 0; sizeAttempt < 8; sizeAttempt++) {
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    );

    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    // Try increasingly aggressive JPEG compression until the file is <= 20 KB.
    for (const quality of [0.72, 0.60, 0.48, 0.38, 0.30, 0.24, 0.18, 0.12, 0.08, 0.05]) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });

      if (!blob) {
        throw new Error("Could not compress the selected image.");
      }

      if (blob.size <= TARGET_IMAGE_BYTES) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");

        return new File([blob], `${baseName}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }

    // Still too large: reduce dimensions and try again.
    maxDimension = Math.floor(maxDimension * 0.70);
  }

  throw new Error(
    "This image is too large to compress below 20 KB. Please choose a smaller image."
  );
}

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
      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("fan_art")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const arts = data as FanArt[];
        setFanArts(arts);

        const { data: likes, error: likesError } = await supabase
          .from("fan_art_likes")
          .select("fan_art_id, visitor_id");

        if (!likesError && likes) {
          const counts: Record<number, number> = {};
          const liked: Record<number, boolean> = {};
          const visitorId = getVisitorId();

          for (const like of likes as { fan_art_id: number; visitor_id: string }[]) {
            counts[like.fan_art_id] = (counts[like.fan_art_id] || 0) + 1;
            if (like.visitor_id === visitorId) {
              liked[like.fan_art_id] = true;
            }
          }

          setLikeCounts(counts);
          setLikedArts(liked);
        }
      }
    } catch (error) {
      console.error("Gallery error:", error);
    }

    setLoadingGallery(false);
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
    const key = "raaka-fan-art-visitor-id";
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
      const supabase = getSupabase();
      const compressedFile = await compressFanArtImage(file);

      const safeName =
        fanName
          .trim()
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase() || "fan";

      const fileName = `${Date.now()}-${safeName}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("fan-art")
        .upload(fileName, compressedFile, {
          cacheControl: "31536000",
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("fan-art")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("fan_art")
        .insert({
          fan_name: fanName.trim(),
          title: title.trim(),
          image_url: imageUrl,
          social_link: socialLink.trim() || null,
          status: "pending",
        });

      if (insertError) {
        await supabase.storage.from("fan-art").remove([fileName]);
        console.error("Database error:", insertError);
        throw insertError;
      }

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

      setMessage(
        "Your fan art has been submitted! It will appear after approval."
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

  return (
    <main className="min-h-screen bg-black text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
            <a
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60 transition hover:text-white"
            >
              ← The World of Raaka
            </a>

            <a
              href="/"
              className="text-sm font-bold tracking-[0.3em]"
            >
              RAAKA
            </a>
          </div>
        </header>

        {/* ADMIN SIGN IN */}
        <a
          href="/admin/fans-art"
          className="absolute right-5 top-5 z-50 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 backdrop-blur-md transition hover:border-white/25 hover:bg-black/80 hover:text-white md:right-8 md:top-7"
        >
          Admin Sign In
        </a>

        {/* HERO */}
        <section className="px-6 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.45em] text-white/40">
              The Fan Community
            </p>

            <h1 className="text-5xl font-black tracking-tight md:text-8xl">
              FANS ART
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              A space for fans to share their creativity, edits and
              artwork inspired by RAAKA and Allu Arjun.
            </p>

            <a
              href="#submit"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Submit Your Fan Art
            </a>
          </div>
        </section>

        {/* TEMPORARY STORAGE NOTICE */}
        <section className="px-5 pb-8 md:px-10 md:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-2xl border border-orange-400/20 bg-orange-500/[0.06] px-5 py-5 backdrop-blur-xl md:px-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

              <div className="relative flex gap-4">
                <div className="mt-0.5 shrink-0 text-orange-400">
                  ⚠
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                    Fan Art — Temporary Notice
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Due to a temporary storage limitation, uploaded artworks may
                    currently be compressed and appear in lower quality than intended.
                    We are working on an upgrade and will restore the image quality soon.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-orange-300/80">
                    Until the issue is resolved, we kindly recommend avoiding new photo
                    uploads if you want to preserve the original quality of your artwork.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RAAKA FAN PASSPORT */}
        <section className="px-5 pb-10 md:px-10 md:pb-16">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-100/15 bg-gradient-to-br from-amber-100/[0.09] via-white/[0.035] to-transparent p-7 shadow-[0_0_80px_rgba(245,158,11,0.08)] md:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

              <div className="relative flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-100/[0.06] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-100/70">
                    <span className="text-base">⭐</span> RAAKA Fan Passport
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                    Enter the RAAKA Universe.
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
                    Create your fan identity, earn XP, unlock exclusive badges
                    and rise from a New Initiate to a RAAKA Legend.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">⚔️ Fan Identity</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">🔥 Earn XP</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">🏆 Unlock Badges</span>
                  </div>
                </div>

                <a
                  href="/fan-passport"
                  className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-amber-100/25 bg-amber-100/[0.08] px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.08)] transition duration-300 hover:border-amber-100/50 hover:bg-amber-100/[0.14] hover:shadow-[0_0_45px_rgba(245,158,11,0.16)]"
                >
                  <span>⭐ Create Your Fan Passport</span>
                  <span className="text-base transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* RAAKA FAN POWER */}
        <section className="px-5 pb-8 md:px-10 md:pb-12">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-orange-100/15 bg-gradient-to-br from-orange-100/[0.08] via-white/[0.035] to-transparent p-7 shadow-[0_0_90px_rgba(249,115,22,0.07)] md:p-10">
              <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100/15 bg-orange-100/[0.05] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-100/70">
                      <span className="text-base">❤️</span> Community Power
                    </div>
                    <h2 className="text-3xl font-black tracking-tight md:text-5xl">
                      RAAKA FAN POWER
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                      Every like, approved fan art and quiz achievement makes the RAAKA community stronger.
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-5xl font-black tracking-tight text-white md:text-6xl">
                      {loadingPower ? "--" : `${fanPower.percent}%`}
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35">
                      Community Strength
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_25px_rgba(251,146,60,0.45)] transition-all duration-1000 ease-out"
                      style={{ width: `${loadingPower ? 0 : fanPower.percent}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                    <span>RAAKA Community</span>
                    <span>{loadingPower ? "Charging..." : fanPower.percent >= 100 ? "MAX POWER" : "Keep pushing"}</span>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2 md:max-w-2xl md:grid-cols-3 md:gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-lg font-black text-white md:text-2xl">{loadingPower ? "—" : fanPower.likes}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">❤️ Likes</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-lg font-black text-white md:text-2xl">{loadingPower ? "—" : fanPower.submissions}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">🎨 Artworks</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-lg font-black text-white md:text-2xl">{loadingPower ? "—" : fanPower.quizXp}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">🧠 Quiz XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                Community Creations
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Fan Gallery
              </h2>
            </div>

            {!loadingGallery && fanArts.length > 0 && (
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search artwork or creator..."
                    className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {([
                    ["newest", "Newest"],
                    ["trending", "🔥 Trending"],
                    ["most-liked", "❤️ Most Liked"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        filter === value
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loadingGallery ? (
              <div className="py-20 text-center text-sm text-white/40">
                Loading fan art...
              </div>
            ) : visibleFanArts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
                <p className="text-lg font-semibold">
                  No fan art yet
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Be the first fan to share your creation.
                </p>
              </div>
            ) : (
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
                {visibleFanArts.map((art) => (
                  <div
                    key={art.id}
                    className="group mb-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedArt(art)}
                      className="block w-full text-left"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={art.image_url}
                          alt={art.title}
                          loading="lazy"
                          decoding="async"
                          className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                        />

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent px-5 pb-5 pt-16">
                          <p className="text-sm font-semibold">{art.title}</p>
                          <p className="mt-1 text-xs text-white/60">by {art.fan_name}</p>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleLike(art.id)}
                        disabled={!!likedArts[art.id]}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                          likedArts[art.id]
                            ? "bg-white text-black"
                            : "bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{likedArts[art.id] ? "♥" : "♡"}</span>
                        {likeCounts[art.id] || 0}
                      </button>

                      {art.social_link && (
                        <a
                          href={art.social_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
                        >
                          Creator ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SUBMIT */}
        <section
          id="submit"
          className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                Share Your Creation
              </p>

              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Submit Fan Art
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500">
                Upload your poster or edit. Every submission is reviewed
                before appearing in the public gallery.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-10"
            >
              <div className="space-y-6">
                {/* NAME */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Fan Name
                  </label>

                  <input
                    type="text"
                    value={fanName}
                    onChange={(e) => setFanName(e.target.value)}
                    placeholder="Your name"
                    maxLength={80}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Artwork Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: RAAKA — The King"
                    maxLength={120}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                {/* SOCIAL */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Instagram / Social Link
                    <span className="ml-2 normal-case tracking-normal text-white/20">
                      Optional
                    </span>
                  </label>

                  <input
                    type="url"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30"
                  />
                </div>

                {/* FILE */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                    Fan Art
                  </label>

                  <label
                    htmlFor="fan-art-file"
                    className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 px-6 text-center transition hover:border-white/30 hover:bg-white/[0.03]"
                  >
                    <span className="text-3xl">＋</span>

                    <span className="mt-3 text-sm font-medium">
                      Choose your artwork
                    </span>

                    <span className="mt-2 text-xs text-white/30">
                     JPG, PNG, WEBP • Maximum 10 MB • Automatically compressed to ≤20 KB
                    </span>

                    <input
                      id="fan-art-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) =>
                        setFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {file && (
                    <p className="mt-3 text-xs text-white/50">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                {/* NOTICE */}
                <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4">
                  <p className="text-xs leading-5 text-zinc-500">
                    By submitting, you confirm that you have the right
                    to share this artwork and that it is your fan-made
                    creation.
                  </p>
                </div>

                {/* MESSAGE */}
                {message && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm text-white/70">
                    {message}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Fan Art"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-6 py-10 text-center">
          <p className="text-[10px] leading-5 tracking-wide text-zinc-600">
            RAAKA Fans Art is a fan-made community feature. All
            submitted artwork remains the property of its respective
            creator.
          </p>
        </footer>
      </div>

      {/* FULLSCREEN VIEWER */}
      {selectedArt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-5"
          onClick={() => setSelectedArt(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedArt(null)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl"
          >
            ×
          </button>

          <div
            className="max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedArt.image_url}
              alt={selectedArt.title}
              loading="lazy"
              decoding="async"
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
            />

            <div className="mt-5 text-center">
              <h3 className="text-xl font-bold">
                {selectedArt.title}
              </h3>

              <p className="mt-1 text-sm text-white/50">
                by {selectedArt.fan_name}
              </p>

              <button
                type="button"
                onClick={() => handleLike(selectedArt.id)}
                disabled={!!likedArts[selectedArt.id]}
                className={`mt-4 rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                  likedArts[selectedArt.id]
                    ? "bg-white text-black"
                    : "border border-white/15 bg-white/[0.05] text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {likedArts[selectedArt.id] ? "♥ Liked" : "♡ Like"} · {likeCounts[selectedArt.id] || 0}
              </button>

              {selectedArt.social_link && (
                <a
                  href={selectedArt.social_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/60 hover:text-white"
                >
                  View Creator Profile →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}