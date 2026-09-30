"use client";

import { useEffect, useState } from "react";

function getVisitorId() {
  const key = "raaka-live-visitor-id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id;
}

export default function GlobalLiveCounter() {
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;

    const fetchLive = async () => {
      try {
        const visitorId = getVisitorId();

        const params = new URLSearchParams({
          visitorId,
          page: window.location.pathname || "/",
        });

        const response = await fetch(`/api/live?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as {
  success?: boolean;
  live?: {
    visitors?: number;
  };
};

        if (!stopped && result?.success) {
          setLive(Number(result.live?.visitors || 0));
        }
      } catch {
        // Keep the last live count if a request temporarily fails.
      }
    };

    fetchLive();

    const interval = setInterval(fetchLive, 20_000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  if (live === null) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[9999]">
      <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-black/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-2xl backdrop-blur-xl">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span>{live} Live Now</span>
      </div>
    </div>
  );
}
