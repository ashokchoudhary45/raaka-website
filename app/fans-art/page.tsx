"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FanArt = {
  id: number;
  created_at: string;
  fan_name: string;
  title: string;
  image_url: string;
  social_link: string | null;
  status: string;
};

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

  async function loadFanArts() {
    setLoadingGallery(true);

    const { data, error } = await supabase
      .from("fan_art")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFanArts(data as FanArt[]);
    }

    setLoadingGallery(false);
  }

  useEffect(() => {
    loadFanArts();
  }, []);

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
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeName = fanName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();

      const fileName = `${Date.now()}-${safeName}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("fan-art")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
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
      console.error(error);
      setMessage("Something went wrong. Please try again.");
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

            {loadingGallery ? (
              <div className="py-20 text-center text-sm text-white/40">
                Loading fan art...
              </div>
            ) : fanArts.length === 0 ? (
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
                {fanArts.map((art) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArt(art)}
                    className="group mb-5 block w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent px-5 pb-5 pt-16 opacity-0 transition group-hover:opacity-100">
                        <p className="text-sm font-semibold">
                          {art.title}
                        </p>

                        <p className="mt-1 text-xs text-white/60">
                          by {art.fan_name}
                        </p>
                      </div>
                    </div>
                  </button>
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
                      JPG, PNG, WEBP • Maximum 10 MB
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
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain"
            />

            <div className="mt-5 text-center">
              <h3 className="text-xl font-bold">
                {selectedArt.title}
              </h3>

              <p className="mt-1 text-sm text-white/50">
                by {selectedArt.fan_name}
              </p>

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