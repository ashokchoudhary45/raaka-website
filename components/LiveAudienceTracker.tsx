"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getVisitorId() {
  const key = "raaka-live-visitor-id";

  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id;
}

export default function LiveAudienceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let stopped = false;

    const sendRequest = async (recordView: boolean) => {
      try {
        const visitorId = getVisitorId();

        const params = new URLSearchParams({
          visitorId,
          page: pathname || "/",
        });

        if (recordView) {
          params.set("view", "1");
        }

        await fetch(`/api/live?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
      } catch (error) {
        console.warn("Live audience request failed:", error);
      }
    };

    // Record this page visit once.
    sendRequest(true);

    // Keep visitor marked as online.
    const interval = setInterval(() => {
      if (!stopped) {
        sendRequest(false);
      }
    }, 20_000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}