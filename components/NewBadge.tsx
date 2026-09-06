"use client";

import { useEffect, useState } from "react";

type NewBadgeProps = {
  addedAt: string;
  days?: number;
};

export default function NewBadge({
  addedAt,
  days = 3,
}: NewBadgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const addedTime = new Date(addedAt).getTime();
    const expiryTime = addedTime + days * 24 * 60 * 60 * 1000;

    setVisible(Date.now() < expiryTime);
  }, [addedAt, days]);

  if (!visible) {
    return null;
  }

  return (
    <span
      className="
        relative -top-2 ml-2
        inline-flex items-center
        rounded-full
        border border-red-400/30
        bg-red-500/10
        px-2 py-0.5
        font-mono text-[8px]
        font-bold uppercase
        tracking-[0.2em]
        text-red-400
        shadow-[0_0_15px_rgba(248,113,113,0.12)]
      "
    >
      NEW
    </span>
  );
}