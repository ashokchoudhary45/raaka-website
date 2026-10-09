"use client";

// Force Cloudflare/OpenNext to serve this route dynamically instead of treating
// the client-only Social page as a static route.

import { useEffect, useMemo, useState, type CSSProperties } from "react";

function timeAgo(value: string) {
  const seconds = Math.max(
    1,
    Math.floor(
      (Date.now() -
        new Date(value.replace(" ", "T") + "Z").getTime()) /
        1000
    )
  );

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}

type Post = {
  id: number;
  body: string;
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  liked: boolean;
  bookmarked: boolean;
  following: boolean;
  reposted: boolean;
  author: {
    visitorId: string;
    handle: string;
    displayName: string;
    verified?: boolean;
    verificationType?: "blue" | "gold" | "grey" | "none";
    verificationLabel?: string | null;
  };
  replyToId: number | null;
  repostOfId: number | null;
};

type Profile = {
  visitorId: string;
  handle: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing?: boolean;
  verified?: boolean;
  verificationType?: "blue" | "gold" | "grey" | "none";
  verificationLabel?: string | null;
};

type ApiResponse = {
  success?: boolean;
  error?: string;

  posts?: Post[];
  post?: Post;
  profile?: Profile | null;

  liked?: boolean;
  following?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  reposts?: number;

  users?: Profile[];
  nextCursor?: number;
  notifications?: NotificationItem[];
};

type NotificationItem = {
  id: number;
  type: string;
  postId: number | null;
  createdAt: string;
  actor: {
    handle: string;
    displayName: string;
    verified?: boolean;
    verificationType?: "blue" | "gold" | "grey" | "none";
    verificationLabel?: string | null;
  };
};

function MenuIcon({ type }: { type: "profile" | "premium" | "communities" | "bookmarks" | "notes" | "lists" | "spaces" | "creator" | "settings" | "theme" }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "profile") return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" /></svg>;
  if (type === "premium") return <svg {...common}><path d="m12 3 2 2.2 3-.2.7 2.9 2.6 1.5-1.5 2.6.2 3-2.9.7L12 21l-4.1-5.3-2.9-.7.2-3-1.5-2.6L6.3 8 7 5l3 .2L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  if (type === "communities" || type === "notes") return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3.5 20c.7-3.5 2.7-5.5 5.5-5.5s4.8 2 5.5 5.5" /><path d="M15 15c2.5.2 4.3 1.8 5 4" /></svg>;
  if (type === "bookmarks") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></svg>;
  if (type === "lists") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  if (type === "spaces") return <svg {...common}><path d="M7 10v4a5 5 0 0 0 10 0v-4" /><path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" /><path d="M4 13a8 8 0 0 0 16 0M12 21v-2" /></svg>;
  if (type === "creator") return <svg {...common}><path d="m4 15 2-6 10-5 4 4-5 10-6 2-5-5Z" /><path d="m13 7 4 4M8 16l-2 4" /></svg>;
  if (type === "theme") return <svg {...common}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /><path d="M17 3v3M15.5 4.5h3" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.4V14h-.4a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
}

function ActionIcon({ type }: { type: "reply" | "repost" | "like" | "bookmark" | "share" | "more" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "reply") return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4.2-1L3 20l1.2-3.8A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /><path d="M8 11h8M8 15h5" /></svg>;
  if (type === "repost") return <svg {...common}><path d="m17 3 4 4-4 4" /><path d="M3 7h18" /><path d="m7 21-4-4 4-4" /><path d="M21 17H3" /></svg>;
  if (type === "like") return <svg {...common}><path d="M20.8 8.7c0 5.1-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" /></svg>;
  if (type === "bookmark") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></svg>;
  if (type === "share") return <svg {...common}><path d="M12 16V3" /><path d="m7 8 5-5 5 5" /><path d="M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
}

function VerificationBadge({
  type,
  label,
}: {
  type?: "blue" | "gold" | "grey" | "none";
  label?: string | null;
}) {
  if (!type || type === "none") return null;

  const config =
    type === "gold"
      ? {
          bg: "bg-yellow-400",
          text: "text-black",
          title: label || "Official Organization",
        }
      : type === "grey"
        ? {
            bg: "bg-gray-300",
            text: "text-black",
            title: label || "Official Account",
          }
        : {
            bg: "bg-[#1d9bf0]",
            text: "text-white",
            title: label || "Verified",
          };

  return (
    <span
      title={config.title}
      aria-label={config.title}
      className={`inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

const RAAKA_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
@property --rk-a{syntax:'<angle>';inherits:false;initial-value:0deg}

.rk-root{
  --rk-bg:#0b0708;--rk-line:rgba(255,255,255,.075);
  --rk-e1:#ff3b55;--rk-e2:#ff7a3d;--rk-e3:#ffb454;
  --rk-ember:linear-gradient(120deg,#ff3b55,#ff7a3d 60%,#ffb454);
  --rk-spring:cubic-bezier(.34,1.56,.64,1);--rk-out:cubic-bezier(.16,1,.3,1);
  position:relative;isolation:isolate;min-height:100vh;
  background:var(--rk-bg);color:#f6eee9;
  font-family:'Plus Jakarta Sans','Noto Sans Devanagari',system-ui,-apple-system,'Segoe UI',sans-serif;
  -webkit-font-smoothing:antialiased;
}
.rk-root::before{content:"";position:fixed;inset:-25%;z-index:0;pointer-events:none;
  background:
    radial-gradient(42% 38% at 18% 12%,rgba(255,59,85,.20),transparent 70%),
    radial-gradient(38% 34% at 86% 30%,rgba(255,122,61,.14),transparent 70%),
    radial-gradient(46% 40% at 55% 100%,rgba(190,30,80,.16),transparent 70%);
  animation:rk-drift 26s ease-in-out infinite alternate;will-change:transform}
.rk-root::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.rk-root ::selection{background:rgba(255,90,70,.45);color:#fff}
.rk-root *{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}
.rk-root :is(button,a):focus-visible{outline:2px solid #ff9441;outline-offset:2px}

.rk-display{font-family:'Unbounded','Plus Jakarta Sans',system-ui,sans-serif;font-weight:700;letter-spacing:-.02em}
.rk-wordmark{background:linear-gradient(100deg,#fff 0%,#ffd7c2 25%,#ff7a3d 50%,#ff3b55 75%,#fff 100%);background-size:200% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:rk-sheen 7s linear infinite}
.rk-logo-mark{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;font-family:'Unbounded',sans-serif;font-weight:900;font-size:26px;color:#fff;
  background:var(--rk-ember);box-shadow:0 14px 40px -10px rgba(255,70,70,.8),inset 0 1px 0 rgba(255,255,255,.4);animation:rk-float 4s ease-in-out infinite}
.rk-logo-sm{width:38px;height:38px;border-radius:12px;font-size:17px;animation:none;flex-shrink:0}

/* glass surfaces */
.rk-header{position:sticky;background:linear-gradient(180deg,rgba(11,7,8,.9),rgba(11,7,8,.74));
  backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border-bottom:1px solid var(--rk-line)}
.rk-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(255,90,70,.55),transparent);opacity:.55}
.rk-feed{background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.006))}
.rk-card{background:linear-gradient(160deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid var(--rk-line);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 18px 40px -24px rgba(0,0,0,.8);transition:border-color .3s}
.rk-card:focus-within{border-color:rgba(255,122,61,.4)}
.rk-row{background:rgba(255,255,255,.02);transition:border-color .3s,background .3s,transform .3s var(--rk-out)}
.rk-row:hover{border-color:rgba(255,122,61,.3);background:rgba(255,255,255,.045)}

.rk-glowborder{position:relative}
.rk-glowborder::before,.rk-auth::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:conic-gradient(from var(--rk-a),transparent 0 55%,#ff3b55,#ffb454,transparent);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:rk-angle 6s linear infinite}
.rk-fancard{background:linear-gradient(150deg,rgba(255,59,85,.16),rgba(255,122,61,.04) 60%,transparent);transition:transform .4s var(--rk-out),box-shadow .4s}
.rk-fancard:hover{transform:translateY(-3px);box-shadow:0 22px 44px -22px rgba(255,70,70,.55)}

/* posts */
.rk-post{position:relative;transition:background .3s;animation:rk-rise .7s var(--rk-out) backwards;animation-delay:var(--rk-d,0ms)}
.rk-post::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:2px;border-radius:2px;background:var(--rk-ember);
  transform:scaleY(0);transition:transform .4s var(--rk-out)}
.rk-post:hover{background:linear-gradient(90deg,rgba(255,80,70,.05),transparent 70%)}
.rk-post:hover::before{transform:scaleY(1)}

.rk-avatar-grad{background:linear-gradient(135deg,#ff3b55,#ff9441);color:#fff;
  box-shadow:0 0 0 2px #0b0708,0 0 0 3.5px rgba(255,122,61,.55),0 8px 22px -6px rgba(255,59,85,.6);transition:transform .4s var(--rk-spring),box-shadow .4s}
.rk-avatar-grad:hover{transform:scale(1.06) rotate(-3deg)}
.rk-avatar-soft{background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.1);
  transition:transform .35s var(--rk-spring),border-color .3s,box-shadow .3s}
.rk-avatar-soft:hover{transform:scale(1.07);border-color:rgba(255,122,61,.6);box-shadow:0 0 18px -4px rgba(255,90,60,.55)}

/* buttons */
.rk-btn-primary{position:relative;overflow:hidden;background:var(--rk-ember);color:#fff;
  box-shadow:0 8px 24px -8px rgba(255,70,70,.65),inset 0 1px 0 rgba(255,255,255,.35);
  transition:transform .25s var(--rk-spring),box-shadow .3s,filter .3s}
.rk-btn-primary::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transform:translateX(-120%);transition:transform .7s var(--rk-out)}
.rk-btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 30px -8px rgba(255,70,70,.8),inset 0 1px 0 rgba(255,255,255,.4)}
.rk-btn-primary:hover:not(:disabled)::after{transform:translateX(120%)}
.rk-btn-primary:active:not(:disabled){transform:scale(.96)}
.rk-ghost{border:1px solid var(--rk-line);background:rgba(255,255,255,.025);color:rgba(255,255,255,.75);
  transition:border-color .3s,background .3s,color .3s,transform .25s var(--rk-spring)}
.rk-ghost:hover:not(:disabled){border-color:rgba(255,122,61,.45);background:rgba(255,90,60,.08);color:#fff}
.rk-ghost:active:not(:disabled){transform:scale(.97)}
.rk-iconbtn{border:1px solid var(--rk-line);color:rgba(255,255,255,.65);transition:transform .25s var(--rk-spring),background .25s,color .25s}
.rk-iconbtn:hover{background:rgba(255,255,255,.08);color:#fff;transform:translateX(-2px)}

.rk-input{background:rgba(255,255,255,.04);border:1px solid var(--rk-line);color:#fff;transition:border-color .25s,box-shadow .25s,background .25s}
.rk-input:focus{border-color:rgba(255,122,61,.6);background:rgba(255,255,255,.06);box-shadow:0 0 0 4px rgba(255,90,60,.12)}
.rk-input::placeholder{color:rgba(255,255,255,.28)}

/* nav */
.rk-nav{position:relative;color:rgba(255,255,255,.62);transition:color .25s,background .25s,transform .3s var(--rk-out);animation:rk-slide .7s var(--rk-out) backwards}
.rk-nav:hover{color:#fff;background:rgba(255,255,255,.05);transform:translateX(3px)}
.rk-nav .rk-ni{display:inline-flex;transition:transform .35s var(--rk-spring)}
.rk-nav:hover .rk-ni{transform:scale(1.15) rotate(-6deg)}
.rk-nav-active{color:#fff;background:linear-gradient(90deg,rgba(255,70,70,.17),rgba(255,70,70,.02))}
.rk-nav-active::before{content:"";position:absolute;left:0;top:22%;bottom:22%;width:3px;border-radius:3px;background:var(--rk-ember);box-shadow:0 0 12px rgba(255,90,70,.9)}
.rk-nav-active .rk-ni{color:var(--rk-e2)}
.rk-navlist>:nth-child(1){animation-delay:.05s}.rk-navlist>:nth-child(2){animation-delay:.1s}.rk-navlist>:nth-child(3){animation-delay:.15s}
.rk-navlist>:nth-child(4){animation-delay:.2s}.rk-navlist>:nth-child(5){animation-delay:.25s}.rk-navlist>:nth-child(6){animation-delay:.3s}

/* tabs */
.rk-tabs{background:rgba(255,255,255,.04);border:1px solid var(--rk-line)}
.rk-tab-pill{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:10px;
  background:linear-gradient(135deg,rgba(255,90,70,.26),rgba(255,150,70,.12));border:1px solid rgba(255,122,61,.35);
  box-shadow:0 6px 20px -8px rgba(255,70,70,.7);transition:transform .45s var(--rk-spring)}
.rk-tab{position:relative;z-index:1;transition:color .3s}

/* composer */
.rk-composer{position:relative;background:linear-gradient(180deg,rgba(255,90,70,.05),transparent 70%)}
.rk-composer::after{content:"";position:absolute;left:20px;right:20px;bottom:-1px;height:2px;border-radius:2px;background:var(--rk-ember);
  transform:scaleX(0);transform-origin:left;transition:transform .6s var(--rk-out);pointer-events:none}
.rk-composer:focus-within::after{transform:scaleX(1)}
.rk-composer:focus-within .rk-avatar-grad{box-shadow:0 0 0 2px #0b0708,0 0 0 3.5px rgba(255,122,61,.9),0 8px 28px -4px rgba(255,59,85,.8)}
.rk-ring{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;transition:background .2s}
.rk-ring::before{content:"";width:16px;height:16px;border-radius:50%;background:#140b0d}

/* actions */
.rk-act{position:relative;transition:color .25s,background .25s,transform .25s var(--rk-spring)}
.rk-act:active{transform:scale(.88)}
.rk-act svg{transition:transform .3s var(--rk-spring)}
.rk-act:hover svg{transform:scale(1.15)}
.rk-like-on svg{fill:currentColor}
.rk-like-on.rk-pulse svg{animation:rk-heart .6s var(--rk-spring)}
.rk-like-on.rk-pulse::after{content:"";position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;
  border:2px solid #ff4d6d;pointer-events:none;animation:rk-ring .6s var(--rk-out) forwards}
.rk-rp-on.rk-pulse svg{animation:rk-spin .6s var(--rk-out)}
.rk-bm-on svg{fill:currentColor}
.rk-bm-on.rk-pulse svg{animation:rk-bounce .5s var(--rk-spring)}

/* switches */
.rk-switch-off{background:rgba(255,255,255,.14);transition:background .35s,box-shadow .35s}
.rk-switch-on{background:var(--rk-ember);box-shadow:0 0 18px -2px rgba(255,90,70,.7);transition:background .35s,box-shadow .35s}
.rk-knob{background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4);transition:all .4s var(--rk-spring)}

/* overlays */
.rk-overlay{animation:rk-fade .25s ease both}
.rk-modal{background:linear-gradient(160deg,#1a0f12,#0e0809 60%);border:1px solid rgba(255,255,255,.09);
  box-shadow:0 40px 80px -20px rgba(0,0,0,.9),0 0 60px -20px rgba(255,70,70,.35);animation:rk-modal .45s var(--rk-spring) both}
.rk-pop{background:rgba(24,14,16,.96);border:1px solid rgba(255,255,255,.09);box-shadow:0 24px 50px -16px rgba(0,0,0,.85);
  backdrop-filter:blur(14px);transform-origin:top right;animation:rk-pop .28s var(--rk-out) both}
.rk-drawer{background:linear-gradient(180deg,#140b0d,#0b0708);animation:rk-drawer .45s var(--rk-out) both}
.rk-toast{position:fixed;left:50%;bottom:calc(28px + env(safe-area-inset-bottom,0px));z-index:200;display:flex;align-items:center;gap:10px;
  padding:12px 18px;border-radius:999px;font-size:13px;font-weight:600;max-width:calc(100vw - 32px);
  background:rgba(28,16,18,.94);border:1px solid rgba(255,122,61,.38);box-shadow:0 20px 50px -14px rgba(0,0,0,.9),0 0 30px -10px rgba(255,70,70,.5);
  backdrop-filter:blur(14px);animation:rk-toast 3.2s var(--rk-out) both}
.rk-toast i{width:8px;height:8px;border-radius:50%;background:var(--rk-ember);box-shadow:0 0 10px #ff5a3c;flex-shrink:0}

/* loading + empty */
.rk-skel{background:linear-gradient(100deg,rgba(255,255,255,.04) 30%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 70%);
  background-size:200% 100%;animation:rk-shimmer 1.4s linear infinite;border-radius:8px}
.rk-orbit{width:64px;height:64px;border-radius:50%;filter:drop-shadow(0 0 14px rgba(255,90,70,.6));
  background:conic-gradient(from 0deg,transparent 0 25%,#ff3b55,#ffb454);
  -webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));
  mask:radial-gradient(farthest-side,transparent calc(100% - 4px),#000 calc(100% - 3px));animation:rk-spinlin 1.1s linear infinite}
.rk-float{display:inline-block;animation:rk-float 3.6s ease-in-out infinite}

/* auth */
.rk-auth{position:relative;border-radius:28px;animation:rk-modal .9s var(--rk-out) both}
.rk-auth-glow{position:absolute;inset:-40px;z-index:-1;pointer-events:none;background:radial-gradient(closest-side,rgba(255,70,70,.28),transparent);
  filter:blur(30px);animation:rk-breathe 5s ease-in-out infinite alternate}
.rk-auth-card{position:relative;border-radius:28px;background:linear-gradient(160deg,rgba(28,16,18,.92),rgba(14,8,9,.92));
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.06)}

/* profile cover */
.rk-profile-head{overflow:hidden}
.rk-profile-head::before{content:"";position:absolute;left:0;right:0;top:0;height:96px;pointer-events:none;
  background:radial-gradient(60% 120% at 15% 0%,rgba(255,59,85,.55),transparent 70%),radial-gradient(50% 120% at 85% 20%,rgba(255,148,65,.45),transparent 70%),linear-gradient(135deg,#2a0e14,#14090b);
  background-size:140% 140%;animation:rk-mesh 12s ease-in-out infinite alternate}
.rk-profile-head>*{position:relative}

@keyframes rk-drift{to{transform:translate3d(3%,-2%,0) scale(1.1)}}
@keyframes rk-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes rk-slide{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@keyframes rk-fade{from{opacity:0}to{opacity:1}}
@keyframes rk-modal{from{opacity:0;transform:translateY(24px) scale(.94)}to{opacity:1;transform:none}}
@keyframes rk-pop{from{opacity:0;transform:scale(.9) translateY(-6px)}to{opacity:1;transform:none}}
@keyframes rk-drawer{from{transform:translateX(-100%)}to{transform:none}}
@keyframes rk-toast{0%{opacity:0;transform:translate(-50%,20px) scale(.96)}8%,88%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,10px)}}
@keyframes rk-shimmer{to{background-position:-200% 0}}
@keyframes rk-sheen{to{background-position:-200% 0}}
@keyframes rk-heart{0%{transform:scale(.4)}45%{transform:scale(1.35)}70%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes rk-ring{from{opacity:.9;transform:scale(.3)}to{opacity:0;transform:scale(1.5)}}
@keyframes rk-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes rk-spinlin{to{transform:rotate(360deg)}}
@keyframes rk-bounce{0%{transform:translateY(0)}35%{transform:translateY(-6px) scale(1.15)}70%{transform:translateY(1px)}100%{transform:none}}
@keyframes rk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes rk-breathe{from{opacity:.55;transform:scale(.96)}to{opacity:1;transform:scale(1.05)}}
@keyframes rk-mesh{to{background-position:100% 50%}}
@keyframes rk-angle{to{--rk-a:360deg}}

@media (prefers-reduced-motion:reduce){
  .rk-root *:not(.rk-toast),.rk-root::before{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
}
html[data-raaka-reduced-motion="1"] .rk-root *:not(.rk-toast),html[data-raaka-reduced-motion="1"] .rk-root::before{
  animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important}

/* Accessible light theme. All rules are scoped to RAAKA Social. */
html[data-raaka-theme="light"] .rk-root{--rk-bg:#f7f8fa;--rk-line:rgba(15,23,42,.13);background:#f7f8fa!important;color:#172033!important}
html[data-raaka-theme="light"] .rk-root::before{opacity:.18}
html[data-raaka-theme="light"] .rk-root::after{opacity:.015}
html[data-raaka-theme="light"] .rk-root [class*="text-white"]{color:#273449!important}
html[data-raaka-theme="light"] .rk-root [class*="text-white/"],html[data-raaka-theme="light"] .rk-root [class*="text-white/"] *{color:#526176!important}
html[data-raaka-theme="light"] .rk-root .rk-header{background:rgba(255,255,255,.92)!important;border-color:#dce2ea!important}
html[data-raaka-theme="light"] .rk-root .rk-feed,html[data-raaka-theme="light"] .rk-root .rk-card,html[data-raaka-theme="light"] .rk-root .rk-row{background:#fff!important;border-color:#dce2ea!important;color:#172033!important;box-shadow:0 8px 24px rgba(15,23,42,.04)}
html[data-raaka-theme="light"] .rk-root .rk-input{background:#fff!important;color:#172033!important;border-color:#cbd5e1!important}
html[data-raaka-theme="light"] .rk-root .rk-input::placeholder{color:#64748b!important}
html[data-raaka-theme="light"] .rk-root .rk-ghost,html[data-raaka-theme="light"] .rk-root .rk-iconbtn{background:#fff!important;color:#334155!important;border-color:#cbd5e1!important}
html[data-raaka-theme="light"] .rk-root .rk-nav{color:#475569!important}
html[data-raaka-theme="light"] .rk-root .rk-nav:hover,html[data-raaka-theme="light"] .rk-root .rk-nav-active{color:#172033!important;background:#fff1ec!important}
html[data-raaka-theme="light"] .rk-root .rk-tabs{background:#eef2f7!important}
html[data-raaka-theme="light"] .rk-root .rk-auth-card,html[data-raaka-theme="light"] .rk-root .rk-modal{background:#fff!important;color:#172033!important;border:1px solid #dce2ea}
html[data-raaka-theme="light"] .rk-root .rk-avatar-soft{background:#eef2f7!important;color:#334155!important;border-color:#dce2ea!important}
html[data-raaka-theme="light"] .rk-root .border-white\/\[.07\],html[data-raaka-theme="light"] .rk-root [class*="border-white/"]{border-color:#dce2ea!important}
html[data-raaka-theme="light"] .rk-root .bg-black\/75{background:rgba(15,23,42,.38)!important}
html[data-raaka-theme="light"] .rk-root .rk-wordmark{-webkit-text-fill-color:transparent!important}

`;

function RaakaStyles() {
  return <style dangerouslySetInnerHTML={{ __html: RAAKA_CSS }} />;
}

function NavIcon({ type }: { type: "home" | "explore" | "bell" | "bookmark" | "profile" | "settings" }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "home") return <svg {...common}><path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.8Z" /></svg>;
  if (type === "explore") return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>;
  if (type === "bell") return <svg {...common}><path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15L6 17Z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>;
  if (type === "bookmark") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></svg>;
  if (type === "profile") return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" /></svg>;
  return <svg {...common}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
}

export default function RaakaSocialPage() {
  const [visitorId, setVisitorId] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"for-you" | "following">("for-you");

  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nextCursor, setNextCursor] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [postsBeforeNotification, setPostsBeforeNotification] = useState<Post[] | null>(null);
  const [cursorBeforeNotification, setCursorBeforeNotification] = useState(0);
  const [selectedProfilePosts, setSelectedProfilePosts] = useState<Post[]>([]);

  const [text, setText] = useState("");
  const [replying, setReplying] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [moreMenu, setMoreMenu] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pulse, setPulse] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState<{
    users: Profile[];
    posts: Post[];
  } | null>(null);
  const [searchTab, setSearchTab] = useState<"people" | "posts" | "top" | "latest">("people");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedProfileLoading, setSelectedProfileLoading] = useState(false);
  const [profileListMode, setProfileListMode] = useState<"followers" | "following" | null>(null);
  const [profileListUsers, setProfileListUsers] = useState<Profile[]>([]);
  const [profileListLoading, setProfileListLoading] = useState(false);
  const [profileListError, setProfileListError] = useState("");
  const [bookmarkPosts, setBookmarkPosts] = useState<Post[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const [view, setView] = useState<"home" | "profile" | "settings" | "bookmarks" | "notifications">("home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    | "home"
    | "account"
    | "security"
    | "privacy"
    | "notifications"
    | "accessibility"
    | "resources"
  >("home");
  const [privateAccount, setPrivateAccount] = useState(false);
  const [replyPermission, setReplyPermission] = useState<"everyone" | "following">("everyone");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "default" | "large">("default");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [language, setLanguage] = useState("en");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [accountAction, setAccountAction] = useState<"deactivate" | "delete" | null>(null);
  const [accountActionPending, setAccountActionPending] = useState(false);

  useEffect(() => {
    try {
      setPrivateAccount(localStorage.getItem("raaka-social-private") === "1");
      setReplyPermission((localStorage.getItem("raaka-social-replies") as "everyone" | "following") || "everyone");
      setNotificationsEnabled(localStorage.getItem("raaka-social-notifications") !== "0");
      setEmailNotifications(localStorage.getItem("raaka-social-email-notifications") === "1");
      setReduceAnimations(localStorage.getItem("raaka-social-reduce-animations") === "1");
      setDataSaver(localStorage.getItem("raaka-social-data-saver") === "1");
      setFontSize((localStorage.getItem("raaka-social-font-size") as "small" | "default" | "large") || "default");
      setTheme((localStorage.getItem("raaka-social-theme") as "dark" | "light" | "system") || "dark");
      setLanguage(localStorage.getItem("raaka-social-language") || "en");
    } catch {}
  }, []);

  const updateLocalSetting = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
  };

  const saveAccessibilityPreference = async (nextTheme: "dark" | "light" | "system", nextLanguage: string) => {
    try {
      const response = await fetch("/api/social/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "save-settings", settings: { accessibility: { theme: nextTheme, language: nextLanguage } } }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          settings?: Record<string, unknown>;
          error?: string;
        };
        setMessage(result.error || "Preference saved on this device, but account sync failed.");
      }
    } catch {
      setMessage("Preference saved on this device. Account sync is temporarily unavailable.");
    }
  };

  const resolvedTheme = theme === "system"
    ? (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : theme;

  useEffect(() => {
    document.documentElement.dataset.raakaTheme = resolvedTheme;
    document.documentElement.lang = language || "en";
    document.documentElement.dataset.raakaReducedMotion = reduceAnimations ? "1" : "0";
    document.documentElement.dataset.raakaDataSaver = dataSaver ? "1" : "0";
    document.documentElement.dataset.raakaFontSize = fontSize;
    return () => {
      delete document.documentElement.dataset.raakaTheme;
      delete document.documentElement.dataset.raakaReducedMotion;
      delete document.documentElement.dataset.raakaDataSaver;
      delete document.documentElement.dataset.raakaFontSize;
    };
  }, [reduceAnimations, dataSaver, fontSize, resolvedTheme, language]);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/social/settings", { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) return;
        const result = (await response.json()) as {
          success?: boolean;
          settings?: {
            accessibility?: {
              theme?: "dark" | "light" | "system";
              language?: string;
              fontSize?: "small" | "default" | "large";
              reduceAnimations?: boolean;
              dataSaver?: boolean;
            };
          };
          error?: string;
        };
        if (cancelled || !result.success) return;
        const accessibility = result.settings?.accessibility;
        if (accessibility) {
          if (
            accessibility.theme === "dark" ||
            accessibility.theme === "light" ||
            accessibility.theme === "system"
          ) {
            setTheme(accessibility.theme);
            updateLocalSetting("raaka-social-theme", accessibility.theme);
          }
          if (typeof accessibility.language === "string" && accessibility.language) {
            setLanguage(accessibility.language);
            updateLocalSetting("raaka-social-language", accessibility.language);
          }
          if (
            accessibility.fontSize === "small" ||
            accessibility.fontSize === "default" ||
            accessibility.fontSize === "large"
          ) {
            setFontSize(accessibility.fontSize);
            updateLocalSetting("raaka-social-font-size", accessibility.fontSize);
          }
          if (typeof accessibility.reduceAnimations === "boolean") {
            setReduceAnimations(accessibility.reduceAnimations);
            updateLocalSetting("raaka-social-reduce-animations", accessibility.reduceAnimations ? "1" : "0");
          }
          if (typeof accessibility.dataSaver === "boolean") {
            setDataSaver(accessibility.dataSaver);
            updateLocalSetting("raaka-social-data-saver", accessibility.dataSaver ? "1" : "0");
          }
        }
      } catch { /* Local preferences remain available if settings sync is offline. */ }
    })();
    return () => { cancelled = true; };
  }, [authenticated]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const setPending = (key: string, value: boolean) => {
    setActionPending((current) => ({ ...current, [key]: value }));
  };

  const resetSettingsHome = () => setSettingsSection("home");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/social-auth/me", {
          cache: "no-store",
        });

        const result = (await response.json()) as {
          success?: boolean;
          authenticated?: boolean;
          verified?: boolean;
          profile?: Profile | null;
        };

        if (cancelled) return;

        if (
          response.ok &&
          result.success &&
          result.authenticated &&
          result.verified &&
          result.profile?.visitorId
        ) {
          setVisitorId(result.profile.visitorId);
          setProfile(result.profile);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profileListMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileListMode(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileListMode]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const api = async (
    method: "GET" | "POST",
    payload: Record<string, unknown> = {}
  ): Promise<ApiResponse> => {
    if (method === "GET") {
      const params = new URLSearchParams(
        Object.entries(payload).map(([key, value]) => [
          key,
          String(value),
        ])
      );

      const response = await fetch(`/api/social?${params}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? ((await response.json()) as ApiResponse)
        : { success: false, error: `Request failed (${response.status})` };

      if (!response.ok && !result.error) {
        result.error = `Request failed (${response.status})`;
      }
      return result;
    }

    const response = await fetch("/api/social", {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? ((await response.json()) as ApiResponse)
      : { success: false, error: `Request failed (${response.status})` };

    if (!response.ok && !result.error) {
      result.error = `Request failed (${response.status})`;
    }
    return result;
  };

  const load = async (append = false, cursor = 0) => {
    if (!visitorId || !authenticated || (append && !nextCursor)) return;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const [feed, me] = await Promise.all([
        api("GET", {
          action: tab,
          ...(cursor > 0 ? { cursor } : {}),
        }),
        append ? Promise.resolve<ApiResponse>({ success: true }) : api("GET", { action: "profile" }),
      ]);

      if (feed.success) {
        const incoming = feed.posts ?? [];
        setPosts((current) => {
          if (!append) return incoming;
          const seen = new Set(current.map((post) => post.id));
          return [...current, ...incoming.filter((post) => !seen.has(post.id))];
        });
        setNextCursor(feed.nextCursor ?? 0);
      } else if (!append) {
        setMessage(feed.error || "Could not load RAAKA Social");
      }

      if (!append && me.success) {
        setProfile(me.profile ?? null);
        const deepProfile =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("profile")
            : null;
        if (!deepProfile) {
          setSelectedProfile((current) =>
            current && current.visitorId !== me.profile?.visitorId
              ? current
              : (me.profile ?? null)
          );
        }
      }
    } catch {
      setMessage("Could not load RAAKA Social");
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    setNextCursor(0);
    setPosts([]);
    void load(false, 0);
  }, [visitorId, authenticated, tab]);

  const createPost = async () => {
    if (!text.trim() || posting || !visitorId || !authenticated) return;

    setPosting(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "post",
        text,
      });

      if (result.success) {
        setText("");
        setMessage("Posted");

        await load();
      } else {
        setMessage(result.error || "Could not post");
      }
    } catch {
      setMessage("Could not post");
    } finally {
      setPosting(false);
    }
  };

  const like = async (postId: number) => {
    const key = `like:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);
    const result = await api("POST", {
      action: "like",
      postId,
    });

    if (result.success) {
      const nextLiked = result.liked ?? false;
      const updatePost = (p: Post) =>
        p.id === postId
          ? {
              ...p,
              liked: nextLiked,
              likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)),
            }
          : p;

      setPosts((items) => items.map(updatePost));
      setSelectedProfilePosts((items) => items.map(updatePost));
      setBookmarkPosts((items) => items.map(updatePost));
      setSearchResults((current) =>
        current ? { ...current, posts: current.posts.map(updatePost) } : current
      );
    }
    setPending(key, false);
  };

  const follow = async (targetId: string) => {
    const key = `follow:${targetId}`;
    if (actionPending[key]) return;
    setPending(key, true);
    const result = await api("POST", {
      action: "follow",
      targetId,
    });

    if (result.success) {
      const nextFollowing = result.following ?? false;

      setPosts((items) =>
        items.map((p) =>
          p.author.visitorId === targetId
            ? {
                ...p,
                following: nextFollowing,
              }
            : p
        )
      );

      setSearchResults((current) =>
        current
          ? {
              ...current,
              users: current.users.map((user) =>
                user.visitorId === targetId
                  ? { ...user, isFollowing: nextFollowing }
                  : user
              ),
            }
          : current
      );

      const delta = nextFollowing ? 1 : -1;

      setProfile((current) =>
        current
          ? {
              ...current,
              following:
                current.visitorId === visitorId
                  ? Math.max(0, current.following + delta)
                  : current.following,
              followers:
                current.visitorId === targetId
                  ? Math.max(0, current.followers + delta)
                  : current.followers,
            }
          : current
      );

      setSelectedProfile((current) =>
        current
          ? {
              ...current,
              isFollowing:
                current.visitorId === targetId
                  ? nextFollowing
                  : current.isFollowing,
              following:
                current.visitorId === visitorId
                  ? Math.max(0, current.following + delta)
                  : current.following,
              followers:
                current.visitorId === targetId
                  ? Math.max(0, current.followers + delta)
                  : current.followers,
            }
          : current
      );

      setProfileListUsers((users) =>
        users.map((user) =>
          user.visitorId === targetId
            ? { ...user, isFollowing: nextFollowing }
            : user
        )
      );
    }
    setPending(key, false);
  };

  const repost = async (postId: number) => {
    const key = `repost:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);

    try {
      const result = await api("POST", { action: "repost", postId });

      if (result.success) {
        const nextReposted = result.reposted ?? false;
        const nextReposts = Math.max(0, Number(result.reposts ?? 0));
        const updatePost = (post: Post) =>
          post.id === postId
            ? { ...post, reposted: nextReposted, reposts: nextReposts }
            : post;

        setPosts((items) => items.map(updatePost));
        setSelectedProfilePosts((items) => items.map(updatePost));
        setBookmarkPosts((items) => items.map(updatePost));
        setSearchResults((current) =>
          current ? { ...current, posts: current.posts.map(updatePost) } : current
        );
        setMessage(nextReposted ? "Reposted" : "Repost removed");
      } else {
        setMessage(result.error || "Could not update repost");
      }
    } catch {
      setMessage("Could not update repost");
    } finally {
      setPending(key, false);
    }
  };

  const bookmark = async (postId: number) => {
    const key = `bookmark:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);

    try {
      const result = await api("POST", { action: "bookmark", postId });

      if (result.success) {
        const nextBookmarked = result.bookmarked ?? false;
        const updatePost = (post: Post) =>
          post.id === postId ? { ...post, bookmarked: nextBookmarked } : post;

        setPosts((items) => items.map(updatePost));
        setSelectedProfilePosts((items) => items.map(updatePost));
        setSearchResults((current) =>
          current ? { ...current, posts: current.posts.map(updatePost) } : current
        );
        setBookmarkPosts((items) => {
          if (!nextBookmarked) return items.filter((post) => post.id !== postId);
          if (items.some((post) => post.id === postId)) return items.map(updatePost);

          const source =
            posts.find((post) => post.id === postId) ??
            selectedProfilePosts.find((post) => post.id === postId) ??
            searchResults?.posts.find((post) => post.id === postId);
          return source ? [{ ...source, bookmarked: true }, ...items] : items;
        });

        setMessage(nextBookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
      } else {
        setMessage(result.error || "Could not update bookmark");
      }
    } catch {
      setMessage("Could not update bookmark");
    } finally {
      setPending(key, false);
    }
  };

  const loadBookmarks = async () => {
    setBookmarksLoading(true);
    try {
      const result = await api("GET", { action: "bookmarks" });
      if (result.success) {
        setBookmarkPosts(result.posts ?? []);
      } else {
        setMessage(result.error || "Could not load Bookmarks");
      }
    } catch {
      setMessage("Could not load Bookmarks");
    } finally {
      setBookmarksLoading(false);
    }
  };

  const openBookmarks = async () => {
    setMobileMenuOpen(false);
    setView("bookmarks");
    setEditingProfile(false);
    await loadBookmarks();
  };

  const sharePost = async (postId: number) => {
    const url = `${location.origin}/social?post=${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "RAAKA Social",
          text: "Check this post on RAAKA Social",
          url,
        });
      } else {
        await navigator.clipboard?.writeText(url);
        setMessage("Post link copied");
      }
    } catch {
      // User cancelled native sharing.
    }
  };

  const deletePost = async (postId: number) => {
    if (!window.confirm("Delete this post?")) return;

    const result = await api("POST", {
      action: "delete",
      postId,
    });

    if (result.success) {
      setPosts((items) => items.filter((post) => post.id !== postId));
      setMoreMenu(null);
      setMessage("Post deleted");
    } else {
      setMessage(result.error || "Could not delete post");
    }
  };

  const reply = async (postId: number) => {
    if (!replyText.trim()) return;

    const result = await api("POST", {
      action: "reply",
      postId,
      text: replyText,
    });

    if (result.success) {
      setReplyText("");
      setReplying(null);

      setPosts((items) =>
        items.map((p) =>
          p.id === postId
            ? {
                ...p,
                replies: p.replies + 1,
              }
            : p
        )
      );
    } else {
      setMessage(result.error || "Could not reply");
    }
  };

  const openProfile = async (handle?: string) => {
    const requestedHandle = (handle || profile?.handle || "").trim();
    if (!requestedHandle) return;

    setView("profile");
    setEditingProfile(false);
    setProfileListMode(null);
    setProfileListUsers([]);
    setProfileListError("");
    setSelectedProfileLoading(true);
    setSelectedProfile(null);

    window.history.replaceState(
      null,
      "",
      `/social?profile=${encodeURIComponent(requestedHandle)}`
    );

    try {
      const result = await api("GET", { action: "profile", handle: requestedHandle });
      if (!result.success || !result.profile) {
        setMessage(result.error || "Could not load profile");
        return;
      }

      const target = result.profile;
      setSelectedProfile(target);
      const postsResult = await api("GET", { action: "user-posts", handle: target.handle });
      setSelectedProfilePosts(postsResult.success ? postsResult.posts ?? [] : []);
    } catch {
      setSelectedProfile(null);
      setSelectedProfilePosts([]);
      setMessage("Could not load profile");
    } finally {
      setSelectedProfileLoading(false);
    }
  };

  const openProfileList = async (mode: "followers" | "following") => {
    const target = selectedProfile;
    if (!target) return;

    setProfileListMode(mode);
    setProfileListUsers([]);
    setProfileListError("");
    setProfileListLoading(true);

    try {
      const result = await api("GET", { action: mode, handle: target.handle });
      if (result.success) {
        setProfileListUsers(result.users ?? []);
      } else {
        setProfileListError(result.error || `Could not load ${mode}`);
      }
    } catch {
      setProfileListError(`Could not load ${mode}`);
    } finally {
      setProfileListLoading(false);
    }
  };

  const openSettings = () => {
    setView("settings");
    setEditingProfile(false);
  };

  const startEditingProfile = () => {
    const owner = selectedProfile?.visitorId === visitorId ? selectedProfile : profile;
    if (!owner || owner.visitorId !== visitorId) return;

    setSelectedProfile(profile ?? owner);
    setEditName(owner.displayName || "");
    setEditHandle(owner.handle || "");
    setEditBio(owner.bio || "");
    setEditingProfile(true);
    setView("profile");
    setProfileListMode(null);
    window.history.replaceState(
      null,
      "",
      `/social?profile=${encodeURIComponent(owner.handle)}`
    );
  };

  const saveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "profile",
        displayName: editName,
        handle: editHandle,
        bio: editBio,
      });

      if (result.success && result.profile) {
        setProfile(result.profile);
        setSelectedProfile((current) =>
          current?.visitorId === result.profile?.visitorId
            ? (result.profile ?? null)
            : current
        );
        window.history.replaceState(
          null,
          "",
          `/social?profile=${encodeURIComponent(result.profile.handle)}`
        );
        setEditingProfile(false);
        setMessage("Profile updated");
      } else {
        setMessage(result.error || "Could not update profile");
      }
    } catch {
      setMessage("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (passwordSaving) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "change-password",
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("Password changed. Please log in again.");
        setAuthenticated(false);
        setVisitorId("");
        setProfile(null);
        setPosts([]);
        setSelectedProfile(null);
      } else {
        setMessage(result.error || "Could not change password.");
      }
    } catch {
      setMessage("Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const runAccountAction = async () => {
    if (!accountAction || accountActionPending) return;

    setAccountActionPending(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action:
          accountAction === "delete"
            ? "delete-account"
            : "deactivate-account",
      });

      if (result.success) {
        const wasDeleted = accountAction === "delete";
        setAccountAction(null);
        setMessage(
          wasDeleted
            ? "Account permanently deleted."
            : "Account deactivated. You have been signed out."
        );
        setAuthenticated(false);
        setVisitorId("");
        setProfile(null);
        setPosts([]);
        setSelectedProfile(null);
        setBookmarkPosts([]);
        setSearchResults(null);
        setView("home");
        setSettingsSection("home");
      } else {
        setMessage(result.error || "Could not update account.");
      }
    } catch {
      setMessage("Could not update account.");
    } finally {
      setAccountActionPending(false);
    }
  };

  const goHome = () => {
    if (postsBeforeNotification) {
      setPosts(postsBeforeNotification);
      setNextCursor(cursorBeforeNotification);
      setPostsBeforeNotification(null);
      setCursorBeforeNotification(0);
    }
    setView("home");
    setEditingProfile(false);
    setProfileListMode(null);
    if (window.location.search.includes("profile=") || window.location.search.includes("post=")) {
      window.history.replaceState(null, "", "/social");
    }
  };

  const doSearch = async (mode: "people" | "posts" | "top" | "latest" = searchTab) => {
    const query = search.trim();
    if (!query) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    try {
      const result = await api("GET", {
        action: "search",
        q: query,
        mode,
      });

      if (result.success) {
        setSearchResults({
          users: result.users ?? [],
          posts: result.posts ?? [],
        });
      } else {
        setSearchError(result.error || "Search failed");
        setSearchResults(null);
      }
    } catch {
      setSearchError("Could not search right now.");
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!searchResults || !search.trim()) return;
    const timer = window.setTimeout(() => void doSearch(searchTab), 250);
    return () => window.clearTimeout(timer);
  }, [searchTab]); 

  useEffect(() => {
    if (!authenticated || !visitorId) return;
    const handle = new URLSearchParams(window.location.search).get("profile");
    if (!handle) return;
    void openProfile(handle);
  }, [authenticated, visitorId]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const result = await api("GET", { action: "notifications" });
      if (result.success) {
        setNotifications(result.notifications ?? []);
      } else {
        setMessage(result.error || "Could not load notifications");
      }
    } catch {
      setMessage("Could not load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const openNotifications = async () => {
    setMobileMenuOpen(false);
    setView("notifications");
    setEditingProfile(false);
    await loadNotifications();
  };

  const clearNotifications = async () => {
    if (!notifications.length) return;
    const result = await api("POST", { action: "clear-notifications" });
    if (result.success) {
      setNotifications([]);
      setMessage("Notifications cleared.");
    } else {
      setMessage(result.error || "Could not clear notifications.");
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    setMobileMenuOpen(false);
    if (!notification.postId) {
      await openProfile(notification.actor.handle);
      return;
    }

    setNotificationsLoading(true);
    try {
      const result = await api("GET", {
        action: "post",
        postId: notification.postId,
      });
      if (!result.success || !result.post) {
        setMessage(result.error || "This post is no longer available.");
        return;
      }

      if (!postsBeforeNotification) {
        setPostsBeforeNotification(posts);
        setCursorBeforeNotification(nextCursor);
      }
      setPosts([result.post]);
      setNextCursor(0);
      setView("home");
      setEditingProfile(false);
      window.history.pushState({}, "", `/social?post=${notification.postId}`);
    } catch {
      setMessage("Could not open this post right now.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/social-auth/logout", {
        method: "POST",
      });
    } finally {
      setAuthenticated(false);
      setVisitorId("");
      setProfile(null);
      setPosts([]);
    }
  };

  const profileInitial = useMemo(
    () =>
      (profile?.displayName || "R")
        .slice(0, 1)
        .toUpperCase(),
    [profile]
  );

  if (!authChecked) {
    return (
      <main className="rk-root" data-theme={resolvedTheme}>
        <RaakaStyles />
        <div className="relative z-[1] flex min-h-screen flex-col items-center justify-center gap-6">
          <div className="rk-orbit" aria-hidden="true" />
          <div className="rk-display rk-wordmark text-2xl">RAAKA</div>
          <div className="text-sm text-white/40" role="status">
            Checking RAAKA Social account…
          </div>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="rk-root px-5" data-theme={resolvedTheme}>
        <RaakaStyles />
        <div className="relative z-[1] flex min-h-screen items-center justify-center py-10">
          <div className="rk-auth w-full max-w-md">
            <div className="rk-auth-glow" aria-hidden="true" />
            <div className="rk-auth-card p-8 text-center sm:p-10">
              <div className="rk-logo-mark mx-auto" aria-hidden="true">R</div>

              <h1 className="rk-display rk-wordmark mt-6 text-3xl sm:text-4xl">
                RAAKA Social
              </h1>

              <div className="mt-2 text-xs tracking-[.3em] text-white/35">
                WORLD OF RAAKA
              </div>

              <p className="mt-5 text-sm font-semibold text-white/60">Talk. Follow. React.</p>

              <p className="mx-auto mt-3 max-w-[34ch] text-sm leading-6 text-white/40">
                Login with your verified RAAKA Social account to join the community.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href="/social/login"
                  className="rk-btn-primary block rounded-xl px-4 py-3.5 text-sm font-black"
                >
                  Log in
                </a>

                <a
                  href="/social/signup"
                  className="rk-ghost block rounded-xl px-4 py-3.5 text-sm font-bold text-white"
                >
                  Create account
                </a>

                <a
                  href="/social/forgot-password"
                  className="block rounded-xl px-4 py-2.5 text-xs font-semibold text-white/60 transition hover:text-white"
                >
                  Forgot password?
                </a>

                <a
                  href="/social/resend"
                  className="block rounded-xl px-4 py-2.5 text-xs text-white/45 transition hover:text-white"
                >
                  Resend verification email
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="rk-root" data-theme={resolvedTheme}>
      <RaakaStyles />
      <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1180px]">

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="rk-overlay absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            />

            <aside className="rk-drawer relative h-full w-[min(86vw,330px)] overflow-y-auto border-r border-white/[.07] px-5 pb-8 pt-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/[.07] pb-5">
                <button
                  onClick={() => { setMobileMenuOpen(false); openProfile(); }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full rk-avatar-grad text-xl font-black">
                      {profileInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="truncate text-lg font-black">{profile?.displayName || "RAAKA Fan"}</div>
                        <VerificationBadge
                          type={profile?.verificationType}
                          label={profile?.verificationLabel}
                        />
                      </div>
                      <div className="truncate text-sm text-white/40">@{profile?.handle || "loading"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span><b>{profile?.following ?? 0}</b> <span className="text-white/40">Following</span></span>
                    <span><b>{profile?.followers ?? 0}</b> <span className="text-white/40">Followers</span></span>
                  </div>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[.07] text-xl text-white/70 hover:bg-white/10"
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              <nav className="rk-navlist mt-4 space-y-1">
                <button onClick={() => { setMobileMenuOpen(false); openProfile(); }} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="profile" /><span>Profile</span>
                </button>
                <button onClick={() => void openNotifications()} className={`rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold ${view === "notifications" ? "rk-nav-active" : ""}`}>
                  <NavIcon type="bell" /><span>Notifications</span>
                </button>
                <button onClick={() => void openBookmarks()} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="bookmarks" /><span>Bookmarks</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("Community Notes are coming soon."); }} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="notes" /><span>Community Notes</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("Lists are coming soon."); }} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="lists" /><span>Lists</span>
                </button>
              </nav>

              <div className="my-4 border-t border-white/[.07]" />

              <nav className="rk-navlist space-y-1">
                <button onClick={() => { setMobileMenuOpen(false); openSettings(); }} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="settings" /><span>Settings &amp; Privacy</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("RAAKA Social is already using dark mode."); }} className="rk-nav flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold">
                  <MenuIcon type="theme" /><span>Display</span>
                </button>
              </nav>

              <div className="my-4 border-t border-white/[.07]" />

              <button
                onClick={() => { setMobileMenuOpen(false); void logout(); }}
                className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold text-red-300 hover:bg-red-500/10"
              >
                <span className="flex h-[25px] w-[25px] items-center justify-center text-xl">↪</span>
                <span>Log out</span>
              </button>
            </aside>
          </div>
        )}

        <aside className="sticky top-0 hidden h-screen w-[245px] shrink-0 self-start overflow-y-auto border-r border-white/[.07] px-5 py-8 lg:block">
          <div className="flex items-center gap-3">
            <span className="rk-logo-mark rk-logo-sm" aria-hidden="true">R</span>
            <div className="rk-display rk-wordmark text-[17px] leading-tight">
              RAAKA<br />Social
            </div>
          </div>

          <div className="rk-navlist mt-10 space-y-2 text-sm">
            <button onClick={goHome} className={`rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${view === "home" ? "rk-nav-active" : ""}`}>
              <span className="rk-ni"><NavIcon type="home" /></span><span className="font-semibold">Home</span>
            </button>
            <button onClick={() => { setView("home"); setTimeout(() => document.getElementById("social-search")?.focus(), 0); }} className="rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left">
              <span className="rk-ni"><NavIcon type="explore" /></span><span className="font-semibold">Explore</span>
            </button>
            <button onClick={() => void openNotifications()} className={`rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${view === "notifications" ? "rk-nav-active" : ""}`}>
              <span className="rk-ni"><NavIcon type="bell" /></span><span className="font-semibold">Notifications</span>
            </button>
            <button onClick={() => void openBookmarks()} className={`rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${view === "bookmarks" ? "rk-nav-active" : ""}`}>
              <span className="rk-ni"><NavIcon type="bookmark" /></span><span className="font-semibold">Bookmarks</span>
            </button>
            <button onClick={() => void openProfile()} className={`rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${view === "profile" ? "rk-nav-active" : ""}`}>
              <span className="rk-ni"><NavIcon type="profile" /></span><span className="font-semibold">Profile</span>
            </button>
            <button onClick={openSettings} className={`rk-nav flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left ${view === "settings" ? "rk-nav-active" : ""}`}>
              <span className="rk-ni"><NavIcon type="settings" /></span><span className="font-semibold">Settings</span>
            </button>
          </div>

          <button onClick={() => void openProfile()} className="rk-fancard rk-glowborder mt-8 w-full rounded-3xl p-5 text-left">
            <div className="text-xs font-semibold tracking-wide text-red-300">
              RAAKA FAN
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-lg font-bold">
              <span>{profile?.displayName || "RAAKA Fan"}</span>
              <VerificationBadge
                type={profile?.verificationType}
                label={profile?.verificationLabel}
              />
            </div>

            <div className="text-xs text-white/40">
              @{profile?.handle || "loading"}
            </div>
          </button>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-2xl border border-white/[.07] px-4 py-3 text-left text-xs font-bold text-white/50 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-300"
          >
            Log out
          </button>
        </aside>

        <section className="rk-feed w-full max-w-[680px] border-r border-white/[.07]">

          {view === "profile" ? (
            <div className="min-h-screen">
              <header className="rk-header sticky top-0 z-20 px-5 py-5">
                <div className="flex items-center gap-3">
                  <button onClick={goHome} className="rk-iconbtn rounded-xl px-3 py-2 text-xs">←</button>
                  <div className="min-w-0">
                    <div className="rk-display text-[17px]">Profile</div>
                    <div className="truncate text-xs text-white/35">@{selectedProfile?.handle || ""}</div>
                  </div>
                </div>
              </header>

              {selectedProfileLoading && !selectedProfile ? (
                <div className="p-10 text-center text-sm text-white/30">Loading profile…</div>
              ) : selectedProfile ? (
                <>
                  <div className="rk-profile-head relative border-b border-white/[.07] p-6 pt-16">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full rk-avatar-grad text-3xl font-black">
                        {(selectedProfile.displayName || "R").slice(0, 1).toUpperCase()}
                      </div>

                      {selectedProfile.visitorId === visitorId ? (
                        !editingProfile && (
                          <button onClick={startEditingProfile} className="rk-ghost rounded-full px-5 py-2 text-xs font-bold">Edit profile</button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => follow(selectedProfile.visitorId)}
                          disabled={Boolean(actionPending[`follow:${selectedProfile.visitorId}`])}
                          className={`rounded-full px-5 py-2 text-xs font-black disabled:opacity-50 ${selectedProfile.isFollowing ? "rk-ghost" : "rk-btn-primary"}`}
                        >
                          {selectedProfile.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>

                    {editingProfile && selectedProfile.visitorId === visitorId ? (
                      <div className="mt-6 space-y-3">
                        <input value={editName} onChange={(e) => setEditName(e.target.value.slice(0, 40))} placeholder="Display name" className="w-full rk-input rounded-2xl px-4 py-3 text-sm " />
                        <input value={editHandle} onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))} placeholder="Handle" className="w-full rk-input rounded-2xl px-4 py-3 text-sm " />
                        <textarea value={editBio} onChange={(e) => setEditBio(e.target.value.slice(0, 160))} placeholder="Bio" rows={3} className="w-full resize-none rk-input rounded-2xl px-4 py-3 text-sm " />
                        <div className="flex gap-2">
                          <button onClick={saveProfile} disabled={savingProfile} className="rk-btn-primary rounded-full px-5 py-2 text-xs font-black disabled:opacity-40">{savingProfile ? "Saving…" : "Save changes"}</button>
                          <button onClick={() => setEditingProfile(false)} className="rk-ghost rounded-full px-5 py-2 text-xs font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 flex items-center gap-2 text-2xl font-black">
                          <span>{selectedProfile.displayName}</span>
                          <VerificationBadge type={selectedProfile.verificationType} label={selectedProfile.verificationLabel} />
                        </div>
                        <div className="mt-1 text-sm text-white/35">@{selectedProfile.handle}</div>
                        {selectedProfile.bio && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/70">{selectedProfile.bio}</p>}
                      </>
                    )}

                    <div className="mt-6 flex gap-6 text-sm">
                      <div><span className="font-black">{selectedProfile.posts}</span> <span className="text-white/35">Posts</span></div>
                      <button type="button" onClick={() => void openProfileList("followers")} className="text-left hover:text-white">
                        <span className="font-black">{selectedProfile.followers}</span> <span className="text-white/35">Followers</span>
                      </button>
                      <button type="button" onClick={() => void openProfileList("following")} className="text-left hover:text-white">
                        <span className="font-black">{selectedProfile.following}</span> <span className="text-white/35">Following</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-b border-white/[.07]">
                    {selectedProfileLoading ? (
                      <div className="p-10 text-center text-sm text-white/30">Loading posts…</div>
                    ) : selectedProfilePosts.length ? (
                      selectedProfilePosts.map((post) => (
                        <article key={post.id} className="rk-post border-b border-white/[.07] px-5 py-5 last:border-b-0">
                          <button type="button" onClick={() => void openProfile(post.author.handle)} className="text-left text-sm font-bold hover:underline">
                            {post.author.displayName}
                            <span className="ml-2 font-normal text-white/35">@{post.author.handle} · {timeAgo(post.createdAt)}</span>
                          </button>
                          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">{post.body}</p>
                          <div className="mt-3 text-xs text-white/35">{post.likes} likes · {post.replies} replies · {post.reposts} reposts</div>
                        </article>
                      ))
                    ) : (
                      <div className="p-10 text-center text-sm text-white/30">No posts from this profile yet.</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-10 text-center text-sm text-white/30">Profile not found.</div>
              )}
            </div>

          ) : view === "notifications" ? (
            <div className="min-h-screen">
              <header className="rk-header sticky top-0 z-20 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button onClick={goHome} className="rk-iconbtn rounded-xl px-3 py-2 text-xs" aria-label="Back to home">←</button>
                    <div className="min-w-0">
                      <div className="rk-display text-[17px]">Notifications</div>
                      <div className="text-xs text-white/35">Likes, replies, reposts and new followers</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadNotifications()}
                    disabled={notificationsLoading}
                    className="rk-ghost rounded-full px-4 py-2 text-xs font-bold disabled:opacity-40"
                  >
                    {notificationsLoading ? "Loading…" : "Refresh"}
                  </button>
                </div>
                {notifications.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-white/35">{notifications.length} recent notification{notifications.length === 1 ? "" : "s"}</span>
                    <button
                      type="button"
                      onClick={() => void clearNotifications()}
                      disabled={notificationsLoading}
                      className="text-xs font-bold text-red-300 hover:text-red-200 disabled:opacity-40"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </header>

              {notificationsLoading && notifications.length === 0 ? (
                <div className="p-10 text-center text-sm text-white/40" role="status">Loading notifications…</div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-white/[.07]">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => void openNotification(notification)}
                      className="flex w-full items-start gap-3 px-5 py-5 text-left transition hover:bg-white/[.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"
                    >
                      <span className="rk-avatar-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black">
                        {notification.type === "like" ? "♥" : notification.type === "reply" ? "↩" : notification.type === "repost" ? "⟳" : "＋"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
                          <span className="font-bold text-white">{notification.actor.displayName}</span>
                          <VerificationBadge type={notification.actor.verificationType} label={notification.actor.verificationLabel} />
                          <span className="text-white/60">
                            {notification.type === "follow"
                              ? "followed you"
                              : notification.type === "like"
                                ? "liked your post"
                                : notification.type === "reply"
                                  ? "replied to your post"
                                  : notification.type === "repost"
                                    ? "reposted your post"
                                    : "interacted with you"}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-white/30">@{notification.actor.handle} · {timeAgo(notification.createdAt)}</span>
                        {notification.postId && <span className="mt-2 block text-xs font-semibold text-orange-300">Open post →</span>}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="rk-float text-4xl">🔔</div>
                  <div className="mt-3 font-bold">You’re all caught up</div>
                  <div className="mt-1 text-sm leading-6 text-white/35">When someone follows you or interacts with your posts, notifications will appear here.</div>
                  <button type="button" onClick={() => void loadNotifications()} className="rk-btn-primary mt-5 rounded-full px-5 py-2.5 text-xs font-black">Check again</button>
                </div>
              )}
            </div>

          ) : view === "bookmarks" ? (
            <div className="min-h-screen">
              <header className="rk-header sticky top-0 z-20 px-5 py-5">
                <div className="flex items-center gap-3">
                  <button onClick={goHome} className="rk-iconbtn rounded-xl px-3 py-2 text-xs">←</button>
                  <div>
                    <div className="rk-display text-[17px]">Bookmarks</div>
                    <div className="text-xs text-white/35">Posts you saved</div>
                  </div>
                </div>
              </header>

              {bookmarksLoading ? (
                <div className="p-10 text-center text-sm text-white/30">Loading Bookmarks…</div>
              ) : bookmarkPosts.length ? (
                <div>
                  {bookmarkPosts.map((post) => (
                    <article key={post.id} className="rk-post border-b border-white/[.07] px-5 py-5">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => void openProfile(post.author.handle)}
                          className="rk-avatar-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold"
                          aria-label={`Open @${post.author.handle} profile`}
                        >
                          {post.author.displayName.slice(0, 1).toUpperCase()}
                        </button>
                        <div className="min-w-0 flex-1">
                          <button type="button" onClick={() => void openProfile(post.author.handle)} className="text-left text-sm font-bold hover:underline">
                            {post.author.displayName}
                            <span className="ml-2 font-normal text-white/35">@{post.author.handle} · {timeAgo(post.createdAt)}</span>
                          </button>
                          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">{post.body}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-white/35">
                            <span>{post.likes} likes</span>
                            <span>{post.replies} replies</span>
                            <span>{post.reposts} reposts</span>
                            <button type="button" onClick={() => void bookmark(post.id)} disabled={Boolean(actionPending[`bookmark:${post.id}`])} className="ml-auto text-amber-400 disabled:opacity-40">Remove bookmark</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="rk-float text-4xl">🔖</div>
                  <div className="mt-3 font-bold">No bookmarks yet</div>
                  <div className="mt-1 text-sm text-white/35">Save a post and it will appear here.</div>
                </div>
              )}
            </div>

          ) : view === "settings" ? (
            <div className="min-h-screen">
              <header className="rk-header sticky top-0 z-20 px-5 py-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => settingsSection === "home" ? goHome() : resetSettingsHome()}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-3xl text-white/80 hover:bg-white/10"
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <div className="min-w-0">
                    <div className="text-2xl font-black">Settings</div>
                    <div className="truncate text-sm text-white/35">@{profile?.handle}</div>
                  </div>
                </div>
              </header>

              {settingsSection === "home" ? (
                <div className="p-5">
                  <div className="mb-6 rounded-full bg-white/[.05] px-5 py-4 text-white/40">
                    🔍 <span className="ml-2">Search settings</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      ["account", "👤", "Your account", "Manage your account information, profile and account options."],
                      ["security", "🔒", "Security and account access", "Manage your password, sessions and account security."],
                      ["privacy", "🛡️", "Privacy and safety", "Control who can follow, reply, mention and interact with you."],
                      ["notifications", "🔔", "Notifications", "Choose the notifications you receive from RAAKA Social."],
                      ["accessibility", "♿", "Accessibility, display and languages", "Customize text size, animations, theme and data usage."],
                      ["resources", "🔗", "Additional resources", "Your data, policies, guidelines and RAAKA Social help."],
                    ].map(([key, icon, title, description]) => (
                      <button
                        key={key}
                        onClick={() => setSettingsSection(key as typeof settingsSection)}
                        className="flex w-full items-start gap-4 rounded-2xl px-2 py-5 text-left transition hover:bg-white/[.04]"
                      >
                        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-2xl grayscale">{icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-bold">{title}</span>
                          <span className="mt-1 block text-sm leading-6 text-white/40">{description}</span>
                        </span>
                        <span className="pt-2 text-xl text-white/25">›</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : settingsSection === "account" ? (
                <div className="p-5">
                  <div className="rk-card rounded-3xl p-5">
                    <div className="text-xs font-bold tracking-wide text-red-400">Account information</div>
                    <div className="mt-5 space-y-4 text-sm">
                      <div><div className="text-white/35">Display name</div><div className="mt-1 font-bold">{profile?.displayName}</div></div>
                      <div><div className="text-white/35">Username</div><div className="mt-1 font-bold">@{profile?.handle}</div></div>
                      <div><div className="text-white/35">Account status</div><div className="mt-1 font-bold text-emerald-300">Verified</div></div>
                    </div>
                  </div>
                  <button onClick={startEditingProfile} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/[.07] px-4 py-4 text-left font-bold hover:bg-white/5"><span>Edit profile</span><span className="text-white/30">→</span></button>
                  <button onClick={() => { setMessage(""); setPasswordModalOpen(true); }} className="mt-2 flex w-full items-center justify-between rounded-2xl border border-white/[.07] px-4 py-4 text-left font-bold hover:bg-white/5"><span>Change password</span><span className="text-white/30">→</span></button>
                  <div className="mt-6 rounded-3xl border border-red-500/15 bg-red-500/[.03] p-5">
                    <div className="font-bold text-red-300">Account deactivation</div>
                    <p className="mt-2 text-sm leading-6 text-white/40">Temporarily deactivate your RAAKA Social account. Your profile and posts are kept, but all active sessions are signed out.</p>
                    <button onClick={() => setAccountAction("deactivate")} className="mt-4 rounded-full border border-red-500/20 px-5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Deactivate account</button>
                    <button onClick={() => setAccountAction("delete")} className="ml-2 mt-4 rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white">Delete account</button>
                  </div>
                </div>
              ) : settingsSection === "security" ? (
                <div className="p-5 space-y-3">
                  {[
                    ["Change password", "Update the password used to sign in."],
                    ["Login sessions", "Review active sessions and devices."],
                    ["Email verification", "Your RAAKA Social email is verified."],
                    ["Log out of all devices", "End every active session except the current one."],
                  ].map(([title, desc], i) => (
                    <button
                      key={title}
                      onClick={() => {
                        if (i === 0) {
                          setMessage("");
                          setPasswordModalOpen(true);
                        } else if (i === 2) {
                          setMessage("Your account email is verified.");
                        } else {
                          setMessage(`${title} is not available yet.`);
                        }
                      }}
                      className="w-full rk-row rounded-2xl border border-white/[.07] px-5 py-4 text-left hover:bg-white/[.04]"
                    >
                      <div className="font-bold">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-white/40">{desc}</div>
                    </button>
                  ))}
                </div>
              ) : settingsSection === "privacy" ? (
                <div className="p-5 space-y-4">
                  <div className="rk-card rounded-3xl p-5">
                    <div className="font-bold">Private account</div><div className="mt-1 text-sm text-white/40">Only approved followers can see your posts.</div>
                    <button onClick={() => { const v=!privateAccount; setPrivateAccount(v); updateLocalSetting("raaka-social-private", v?"1":"0"); }} className={`mt-4 h-8 w-14 rounded-full p-1 ${privateAccount ? "rk-switch-on" : "rk-switch-off"}`}><span className={`rk-knob block h-6 w-6 rounded-full ${privateAccount ? "translate-x-6" : "translate-x-0"}`} /></button>
                  </div>
                  <div className="rk-card rounded-3xl p-5"><div className="font-bold">Who can reply</div><div className="mt-1 text-sm text-white/40">Choose who can reply to your posts.</div><div className="mt-4 flex gap-2"><button onClick={() => {setReplyPermission("everyone");updateLocalSetting("raaka-social-replies","everyone")}} className={`rounded-full px-4 py-2 text-xs font-bold ${replyPermission === "everyone" ? "rk-btn-primary" : "border border-white/[.07] text-white/60"}`}>Everyone</button><button onClick={() => {setReplyPermission("following");updateLocalSetting("raaka-social-replies","following")}} className={`rounded-full px-4 py-2 text-xs font-bold ${replyPermission === "following" ? "rk-btn-primary" : "border border-white/[.07] text-white/60"}`}>People you follow</button></div></div>
                  {[
                    ["Blocked accounts", "Manage accounts you have blocked."],
                    ["Muted accounts", "Manage accounts you have muted."],
                    ["Hidden words", "Filter words and phrases from your experience."],
                    ["Report history", "Review reports submitted from your account."],
                  ].map(([title, desc]) => <button key={title} onClick={() => setMessage(`${title} management will open here.`)} className="w-full rk-row rounded-2xl border border-white/[.07] px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">{desc}</div></button>)}
                </div>
              ) : settingsSection === "notifications" ? (
                <div className="p-5 space-y-3">
                  {[["Likes", true],["Replies", true],["Reposts", true],["New followers", true],["Mentions", true]].map(([title]) => <div key={String(title)} className="flex items-center justify-between rk-row rounded-2xl border border-white/[.07] px-5 py-4"><div><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">Notify me about {String(title).toLowerCase()}.</div></div><div className="h-2 w-2 rounded-full bg-emerald-400" /></div>)}
                  <div className="flex items-center justify-between rk-row rounded-2xl border border-white/[.07] px-5 py-4"><div><div className="font-bold">Push notifications</div><div className="mt-1 text-sm text-white/40">Allow activity notifications.</div></div><button onClick={() => {const v=!notificationsEnabled;setNotificationsEnabled(v);updateLocalSetting("raaka-social-notifications",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${notificationsEnabled?"rk-switch-on" : "rk-switch-off"}`}><span className={`rk-knob block h-6 w-6 rounded-full ${notificationsEnabled?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="flex items-center justify-between rk-row rounded-2xl border border-white/[.07] px-5 py-4"><div><div className="font-bold">Email notifications</div><div className="mt-1 text-sm text-white/40">Receive important account emails.</div></div><button onClick={() => {const v=!emailNotifications;setEmailNotifications(v);updateLocalSetting("raaka-social-email-notifications",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${emailNotifications?"rk-switch-on" : "rk-switch-off"}`}><span className={`rk-knob block h-6 w-6 rounded-full ${emailNotifications?"translate-x-6":"translate-x-0"}`} /></button></div>
                </div>
              ) : settingsSection === "accessibility" ? (
                <div className="p-5 space-y-4">
                  <div className="rk-card rounded-3xl p-5">
                    <div className="font-bold">Display theme</div>
                    <p className="mt-1 text-sm text-white/40">Choose a comfortable display. Your choice is saved on this device.</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {([["dark", "🌙 Dark"], ["light", "☀️ Light"], ["system", "🖥 System"]] as const).map(([value, label]) => (
                        <button key={value} type="button" aria-pressed={theme === value} onClick={() => { setTheme(value); updateLocalSetting("raaka-social-theme", value); void saveAccessibilityPreference(value, language); }} className={`rounded-xl border px-3 py-3 text-sm font-bold ${theme === value ? "rk-btn-primary border-transparent" : "rk-ghost"}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="rk-card rounded-3xl p-5"><div className="font-bold">Font size</div><div className="mt-3 flex flex-wrap gap-2">{[["small","Small"],["default","Default"],["large","Large"]].map(([v,label])=><button key={v} onClick={()=>{setFontSize(v as typeof fontSize);updateLocalSetting("raaka-social-font-size",v)}} className={`rounded-full px-4 py-2 text-xs font-bold ${fontSize===v?"rk-btn-primary":"border border-white/[.07] text-white/60"}`}>{label}</button>)}</div></div>
                  <div className="flex items-center justify-between rk-row rounded-2xl border border-white/[.07] px-5 py-4"><div><div className="font-bold">Reduce animations</div><div className="mt-1 text-sm text-white/40">Use fewer motion effects.</div></div><button type="button" aria-pressed={reduceAnimations} onClick={()=>{const v=!reduceAnimations;setReduceAnimations(v);updateLocalSetting("raaka-social-reduce-animations",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${reduceAnimations?"rk-switch-on" : "rk-switch-off"}`}><span className={`rk-knob block h-6 w-6 rounded-full ${reduceAnimations?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="flex items-center justify-between rk-row rounded-2xl border border-white/[.07] px-5 py-4"><div><div className="font-bold">Data saver</div><div className="mt-1 text-sm text-white/40">Reduce background network activity.</div></div><button type="button" aria-pressed={dataSaver} onClick={()=>{const v=!dataSaver;setDataSaver(v);updateLocalSetting("raaka-social-data-saver",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${dataSaver?"rk-switch-on" : "rk-switch-off"}`}><span className={`rk-knob block h-6 w-6 rounded-full ${dataSaver?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="rk-card rounded-3xl p-5">
                    <label htmlFor="raaka-language" className="font-bold">Language preference</label>
                    <p className="mt-1 text-sm text-white/40">Select your preferred language. Full app-wide translations need translated interface strings to be added separately.</p>
                    <select id="raaka-language" value={language} onChange={(event) => { const value = event.target.value; setLanguage(value); updateLocalSetting("raaka-social-language", value); void saveAccessibilityPreference(theme, value); }} className="rk-input mt-3 w-full rounded-xl px-4 py-3 text-sm" aria-label="Preferred language">
                      {[
                        ["en","English"],["hi","हिन्दी"],["bn","বাংলা"],["te","తెలుగు"],["mr","मराठी"],["ta","தமிழ்"],["ur","اردو"],["gu","ગુજરાતી"],["kn","ಕನ್ನಡ"],["or","ଓଡ଼ିଆ"],["ml","മലയാളം"],["pa","ਪੰਜਾਬੀ"],["as","অসমীয়া"],["ne","नेपाली"],["es","Español"],["fr","Français"],["de","Deutsch"],["pt","Português"],["it","Italiano"],["ru","Русский"],["ar","العربية"],["zh","中文"],["ja","日本語"],["ko","한국어"],["id","Bahasa Indonesia"],["tr","Türkçe"],["th","ไทย"],["vi","Tiếng Việt"],["fa","فارسی"],["sw","Kiswahili"]
                      ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <button onClick={() => {const blob=new Blob([JSON.stringify({profile,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="raaka-social-data.json";a.click();URL.revokeObjectURL(a.href)}} className="w-full rk-row rounded-2xl border border-white/[.07] px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">Download your data</div><div className="mt-1 text-sm text-white/40">Download the account data currently available to this session.</div></button>
                  {["Privacy Policy","Terms of Service","Community Guidelines","Help Center","About RAAKA Social"].map((title)=><button key={title} onClick={()=>setMessage(`${title} page will open here.`)} className="w-full rk-row rounded-2xl border border-white/[.07] px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">RAAKA Social information and resources.</div></button>)}
                </div>
              )}
            </div>
          ) : (
            <>
          <header className="rk-header sticky top-0 z-20 px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="rk-display rk-wordmark text-[17px]">RAAKA Social</div>

                <div className="text-xs text-white/35">
                  Text-only fan community
                </div>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[.07] text-white/80 transition hover:bg-white/10 active:scale-95"
                  aria-label="Open menu"
                >
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="rk-tabs relative mt-5 grid grid-cols-2 rounded-xl p-1" role="tablist">
              <span aria-hidden="true" className="rk-tab-pill" style={{ transform: tab === "following" ? "translateX(100%)" : "translateX(0)" }} />

              <button
                onClick={() => setTab("for-you")}
                className={`rk-tab rounded-lg py-2 text-xs font-bold ${tab === "for-you" ? "text-white" : "text-white/45 hover:text-white/80"}`}
              >
                For You
              </button>

              <button
                onClick={() => setTab("following")}
                className={`rk-tab rounded-lg py-2 text-xs font-bold ${tab === "following" ? "text-white" : "text-white/45 hover:text-white/80"}`}
              >
                Following
              </button>

            </div>
          </header>

          <div className="border-b border-white/[.07] p-4 lg:hidden">
            <div className="flex gap-2 rk-card rounded-2xl p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void doSearch();
                }}
                placeholder="Search RAAKA Social"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => void doSearch()}
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults && (
            <div className="border-b border-white/[.07] px-4 pb-4 xl:hidden">
              <div className="mt-4 overflow-hidden rk-card rounded-3xl">
                <div className="border-b border-white/[.07] px-4 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-bold tracking-wide text-white/40">
                      Search results
                    </div>
                    {searchLoading && <span className="text-[10px] text-white/30">Searching…</span>}
                  </div>
                  {searchError && <div className="mt-2 text-xs text-red-300">{searchError}</div>}

                  <div className="mt-3 grid grid-cols-4">
                    {[
                      ["people", "People"],
                      ["posts", "Posts"],
                      ["top", "Top"],
                      ["latest", "Latest"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSearchTab(key as typeof searchTab)}
                        className={`border-b-2 px-1 py-3 text-[11px] font-bold transition ${
                          searchTab === key
                            ? "border-red-500 text-white"
                            : "border-transparent text-white/35"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2">
                  {searchTab === "people" ? (
                    searchResults.users.length ? (
                      <div className="space-y-1">
                        {searchResults.users.map((user) => (
                          <div
                            key={user.visitorId}
                            className="flex items-center gap-3 rounded-2xl p-3"
                          >
                            <button
                              type="button"
                              onClick={() => void openProfile(user.handle)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full rk-avatar-grad font-black">
                                {user.displayName.slice(0, 1).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-1.5 font-bold">
                                  <span className="truncate">{user.displayName}</span>
                                  <VerificationBadge
                                    type={user.verificationType}
                                    label={user.verificationLabel}
                                  />
                                </div>

                                <div className="truncate text-xs text-white/35">
                                  @{user.handle} · {user.followers} followers
                                </div>
                              </div>
                            </button>

                            {user.visitorId !== visitorId && (
                              <button
                                type="button"
                                onClick={() => void follow(user.visitorId)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                                  user.isFollowing
                                    ? "rk-ghost"
                                    : "rk-btn-primary"
                                }`}
                              >
                                {user.isFollowing ? "Following" : "Follow"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-white/30">
                        No people found.
                      </div>
                    )
                  ) : searchResults.posts.length ? (
                    <div className="space-y-1">
                      {searchResults.posts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => void openProfile(post.author.handle)}
                            className="block w-full rounded-2xl p-3 text-left"
                          >
                            <div className="flex items-center gap-1.5 text-sm font-bold">
                              <span>{post.author.displayName}</span>
                              <VerificationBadge
                                type={post.author.verificationType}
                                label={post.author.verificationLabel}
                              />
                              <span className="font-normal text-white/30">
                                @{post.author.handle}
                              </span>
                            </div>

                            <div className="mt-1 line-clamp-3 text-sm leading-5 text-white/70">
                              {post.body}
                            </div>

                            <div className="mt-2 text-[11px] text-white/25">
                              {post.likes} likes · {post.replies} replies · {post.reposts} reposts · {timeAgo(post.createdAt)}
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-white/30">
                      No posts found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rk-composer border-b border-white/[.07] p-5">
            <div className="flex gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full rk-avatar-grad font-black">
                {profileInitial}
              </div>

              <div className="min-w-0 flex-1">

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(
                      e.target.value.slice(0, 280)
                    )
                  }
                  placeholder="What's happening in the RAAKA universe?"
                  rows={3}
                  className="w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-white/30"
                />

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">

                  <span className="flex items-center gap-2">
                    <span
                      className="rk-ring"
                      aria-hidden="true"
                      style={{ background: `conic-gradient(${text.length > 250 ? "#ff3b55" : "#ff7a3d"} ${(text.length / 280) * 360}deg, rgba(255,255,255,.1) 0deg)` }}
                    />
                    <span className={`text-xs tabular-nums ${text.length > 250 ? "text-red-400" : "text-white/30"}`}>
                      {text.length}/280
                    </span>
                  </span>

                  <button
                    disabled={!text.trim() || posting}
                    onClick={createPost}
                    className="rk-btn-primary rounded-full px-5 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>

                </div>
              </div>
            </div>

                      </div>

          {loading ? (
            <div aria-busy="true">
              <span className="sr-only">Loading RAAKA Social…</span>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 border-b border-white/[.07] px-5 py-5">
                  <div className="rk-skel h-10 w-10 shrink-0" style={{ borderRadius: 9999 }} />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="rk-skel h-3 w-40" />
                    <div className="rk-skel h-3 w-full" />
                    <div className="rk-skel h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="rk-float text-4xl text-[#ff7a3d]">✦</div>

              <div className="mt-3 font-bold">
                No posts yet
              </div>

              <div className="mt-1 text-sm text-white/35">
                Be the first RAAKA fan to post something.
              </div>
            </div>
          ) : (
            posts.map((post, postIndex) => (
              <article
                key={post.id}
                style={{ "--rk-d": `${Math.min(postIndex, 8) * 60}ms` } as CSSProperties}
                className="rk-post border-b border-white/[.07] px-5 py-5"
              >
                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={() => void openProfile(post.author.handle)}
                    aria-label={`Open @${post.author.handle} profile`}
                    className="rk-avatar-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold"
                  >
                    {post.author.displayName.slice(0, 1).toUpperCase()}
                  </button>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 text-sm">

                      <button
                        type="button"
                        onClick={() => void openProfile(post.author.handle)}
                        className="flex min-w-0 items-center gap-1.5 text-left font-bold hover:underline"
                      >
                        <span className="truncate">{post.author.displayName}</span>
                        <VerificationBadge
                          type={post.author.verificationType}
                          label={post.author.verificationLabel}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => void openProfile(post.author.handle)}
                        className="truncate text-white/35 hover:text-white/60"
                      >
                        @{post.author.handle}
                      </button>

                      <span className="text-white/20">
                        · {timeAgo(post.createdAt)}
                      </span>

                      {post.author.visitorId !== visitorId && (
                        <button
                          onClick={() =>
                            follow(post.author.visitorId)
                          }
                          className="ml-auto text-xs font-bold text-red-400"
                        >
                          {post.following
                            ? "Following"
                            : "Follow"}
                        </button>
                      )}

                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">
                      {post.body}
                    </p>

                    <div className="relative mt-4 max-w-[520px]">
                      <div className="grid grid-cols-6 items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setReplying(
                              replying === post.id ? null : post.id
                            )
                          }
                          aria-label="Reply"
                          className="rk-act flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-white/40 hover:bg-sky-500/10 hover:text-sky-400"
                        >
                          <ActionIcon type="reply" />
                          <span className="text-[13px] tabular-nums">{post.replies}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setPulse(`repost:${post.id}`); void repost(post.id); }}
                          disabled={Boolean(actionPending[`repost:${post.id}`])}
                          aria-label={post.reposted ? "Remove repost" : "Repost"}
                          aria-pressed={post.reposted}
                          className={`rk-act flex h-10 w-full items-center justify-center gap-1.5 rounded-full disabled:opacity-40 ${post.reposted ? "rk-rp-on text-emerald-400" : "text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400"} ${post.reposted && pulse === `repost:${post.id}` ? "rk-pulse" : ""}`}
                        >
                          <ActionIcon type="repost" />
                          <span className="text-[13px] tabular-nums">{post.reposts}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setPulse(`like:${post.id}`); void like(post.id); }}
                          aria-label={post.liked ? "Unlike" : "Like"}
                          className={`rk-act flex h-10 w-full items-center justify-center gap-1.5 rounded-full ${post.liked ? "rk-like-on text-[#ff4d6d]" : "text-white/40 hover:bg-[#ff4d6d]/10 hover:text-[#ff4d6d]"} ${post.liked && pulse === `like:${post.id}` ? "rk-pulse" : ""}`}
                        >
                          <ActionIcon type="like" />
                          <span className="text-[13px] tabular-nums">{post.likes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setPulse(`bookmark:${post.id}`); void bookmark(post.id); }}
                          disabled={Boolean(actionPending[`bookmark:${post.id}`])}
                          aria-label={post.bookmarked ? "Remove bookmark" : "Bookmark"}
                          className={`rk-act flex h-10 w-full items-center justify-center rounded-full ${post.bookmarked ? "rk-bm-on text-amber-400" : "text-white/40 hover:bg-amber-500/10 hover:text-amber-400"} ${post.bookmarked && pulse === `bookmark:${post.id}` ? "rk-pulse" : ""}`}
                        >
                          <ActionIcon type="bookmark" />
                        </button>

                        <button
                          type="button"
                          onClick={() => sharePost(post.id)}
                          aria-label="Share"
                          className="rk-act flex h-10 w-full items-center justify-center rounded-full text-white/40 hover:bg-sky-500/10 hover:text-sky-400"
                        >
                          <ActionIcon type="share" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMoreMenu(
                              moreMenu === post.id ? null : post.id
                            )
                          }
                          aria-label="More"
                          className="rk-act flex h-10 w-full items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white"
                        >
                          <ActionIcon type="more" />
                        </button>
                      </div>

                      {moreMenu === post.id && (
                        <div className="rk-pop absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-2xl p-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              sharePost(post.id);
                              setMoreMenu(null);
                            }}
                            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                          >
                            Copy/share post
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              bookmark(post.id);
                              setMoreMenu(null);
                            }}
                            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                          >
                            {post.bookmarked ? "Remove bookmark" : "Bookmark"}
                          </button>

                          {post.author.visitorId !== visitorId && (
                            <button
                              type="button"
                              onClick={() => {
                                follow(post.author.visitorId);
                                setMoreMenu(null);
                              }}
                              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                            >
                              {post.following ? "Unfollow" : "Follow"} @{post.author.handle}
                            </button>
                          )}

                          {post.author.visitorId === visitorId && (
                            <button
                              type="button"
                              onClick={() => deletePost(post.id)}
                              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
                            >
                              Delete post
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {replying === post.id && (
                      <div className="mt-4 flex gap-2">

                        <input
                          value={replyText}
                          onChange={(e) =>
                            setReplyText(
                              e.target.value.slice(0, 280)
                            )
                          }
                          placeholder="Reply to this post…"
                          className="min-w-0 flex-1 rk-input rounded-xl px-3 py-2 text-sm "
                        />

                        <button
                          onClick={() =>
                            reply(post.id)
                          }
                          className="rk-btn-primary rounded-xl px-4 text-xs font-bold"
                        >
                          Reply
                        </button>

                      </div>
                    )}

                  </div>
                </div>
              </article>
              ))
          )}

          {nextCursor > 0 && (
            <div className="border-b border-white/[.07] p-4">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void load(true, nextCursor)}
                className="rk-ghost w-full rounded-2xl px-4 py-3 text-xs font-bold disabled:opacity-40"
              >
                {loadingMore ? "Loading more…" : "Load more posts"}
              </button>
            </div>
          )}

            </>
          )}
        

        </section>

        <aside className="hidden w-[300px] px-5 py-8 xl:block">

          <div className="rk-card rounded-2xl p-3">

            <div className="flex gap-2">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    doSearch();
                  }
                }}
                id="social-search"
                placeholder="Search RAAKA Social"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />

              <button
                onClick={() => void doSearch()}
                className="rounded-xl bg-white/10 px-3 text-xs"
              >
                Search
              </button>

            </div>
          </div>

          {searchResults ? (
            <div className="mt-5 overflow-hidden rk-card rounded-3xl">
              <div className="border-b border-white/[.07] px-5 pt-5">
                <div className="text-xs font-bold tracking-wide text-white/40">
                  Search results
                </div>

                <div className="mt-4 grid grid-cols-4">
                  {[
                    ["people", "People"],
                    ["posts", "Posts"],
                    ["top", "Top"],
                    ["latest", "Latest"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSearchTab(key as typeof searchTab)}
                      className={`border-b-2 px-1 py-3 text-xs font-bold transition ${
                        searchTab === key
                          ? "border-red-500 text-white"
                          : "border-transparent text-white/35 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3">
                {searchTab === "people" ? (
                  searchResults.users.length ? (
                    <div className="space-y-1">
                      {searchResults.users.map((user) => (
                        <div
                          key={user.visitorId}
                          className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-white/[.05]"
                        >
                          <button
                            type="button"
                            onClick={() => void openProfile(user.handle)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full rk-avatar-grad font-black">
                              {user.displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-1.5 font-bold">
                                <span className="truncate">{user.displayName}</span>
                                <VerificationBadge
                                  type={user.verificationType}
                                  label={user.verificationLabel}
                                />
                              </div>
                              <div className="truncate text-xs text-white/35">
                                @{user.handle} · {user.followers} followers
                              </div>
                            </div>
                          </button>

                          {user.visitorId !== visitorId && (
                            <button
                              type="button"
                              onClick={() => follow(user.visitorId)}
                              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                                user.isFollowing
                                  ? "rk-ghost"
                                  : "rk-btn-primary"
                              }`}
                            >
                              {user.isFollowing ? "Following" : "Follow"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-sm text-white/30">No people found.</div>
                  )
                ) : searchResults.posts.length ? (
                  <div className="space-y-1">
                    {searchResults.posts.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => void openProfile(post.author.handle)}
                          className="block w-full rounded-2xl p-3 text-left transition hover:bg-white/[.05]"
                        >
                          <div className="flex items-center gap-1.5 text-sm font-bold">
                            <span>{post.author.displayName}</span>
                            <VerificationBadge
                              type={post.author.verificationType}
                              label={post.author.verificationLabel}
                            />
                            <span className="font-normal text-white/30">@{post.author.handle}</span>
                          </div>
                          <div className="mt-1 line-clamp-3 text-sm leading-5 text-white/70">
                            {post.body}
                          </div>
                          <div className="mt-2 text-[11px] text-white/25">
                            {post.likes} likes · {post.replies} replies · {post.reposts} reposts · {timeAgo(post.createdAt)}
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="p-5 text-sm text-white/30">No posts found.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 rk-card rounded-3xl p-5">

              <div className="text-xs font-bold tracking-wide text-red-400">
                RAAKA Social
              </div>

              <div className="mt-3 text-lg font-bold">
                Talk. Follow. React.
              </div>

              <p className="mt-2 text-sm leading-6 text-white/40">
                A lightweight text-only community for
                RAAKA fans. No photo or video uploads.
              </p>

            </div>
          )}

        </aside>

      </div>

      {profileListMode && selectedProfile && (
        <div
          className="rk-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${profileListMode === "followers" ? "Followers" : "Following"} of @${selectedProfile.handle}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfileListMode(null);
          }}
        >
          <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rk-modal rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
              <div>
                <div className="font-black">{profileListMode === "followers" ? "Followers" : "Following"}</div>
                <div className="text-xs text-white/35">@{selectedProfile.handle}</div>
              </div>
              <button type="button" onClick={() => setProfileListMode(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close">×</button>
            </div>

            <div className="overflow-y-auto p-2">
              {profileListLoading ? (
                <div className="p-8 text-center text-sm text-white/35">Loading…</div>
              ) : profileListError ? (
                <div className="p-8 text-center text-sm text-red-300">{profileListError}</div>
              ) : profileListUsers.length ? (
                profileListUsers.map((user) => (
                  <div key={user.visitorId} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-white/[.04]">
                    <button type="button" onClick={() => { setProfileListMode(null); void openProfile(user.handle); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full rk-avatar-grad font-black">{user.displayName.slice(0, 1).toUpperCase()}</div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5 font-bold">
                          <span className="truncate">{user.displayName}</span>
                          <VerificationBadge type={user.verificationType} label={user.verificationLabel} />
                        </div>
                        <div className="truncate text-xs text-white/35">@{user.handle}</div>
                      </div>
                    </button>
                    {user.visitorId !== visitorId && (
                      <button
                        type="button"
                        onClick={() => void follow(user.visitorId)}
                        disabled={Boolean(actionPending[`follow:${user.visitorId}`])}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black disabled:opacity-40 ${user.isFollowing ? "rk-ghost" : "rk-btn-primary"}`}
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-white/35">
                  No {profileListMode} yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="rk-overlay fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="rk-modal w-full max-w-md rounded-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="rk-display text-[17px]">Change password</div>
                <p className="mt-1 text-sm leading-6 text-white/40">Use your current password to set a new one.</p>
              </div>
              <button onClick={() => !passwordSaving && setPasswordModalOpen(false)} className="text-xl text-white/40 hover:text-white" aria-label="Close">×</button>
            </div>

            <div className="mt-6 space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full rk-input rounded-2xl px-4 py-3 text-sm "
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full rk-input rounded-2xl px-4 py-3 text-sm "
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rk-input rounded-2xl px-4 py-3 text-sm "
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => setPasswordModalOpen(false)} disabled={passwordSaving} className="rk-ghost rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40">Cancel</button>
              <button onClick={() => void changePassword()} disabled={passwordSaving} className="rk-btn-primary rounded-full px-5 py-2.5 text-xs font-black disabled:opacity-40">
                {passwordSaving ? "Changing…" : "Change password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {accountAction && (
        <div className="rk-overlay fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="rk-modal w-full max-w-md rounded-3xl p-6">
            <div className="rk-display text-[17px]">
              {accountAction === "delete" ? "Delete account?" : "Deactivate account?"}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">
              {accountAction === "delete"
                ? "This permanently removes your RAAKA Social account, profile, posts, follows, likes, bookmarks and sessions. This action cannot be undone."
                : "This signs you out of all active sessions while keeping your profile and posts. You can use a future reactivation flow to restore access."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => !accountActionPending && setAccountAction(null)} disabled={accountActionPending} className="rk-ghost rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40">Cancel</button>
              <button onClick={() => void runAccountAction()} disabled={accountActionPending} className={`rounded-full px-5 py-2.5 text-xs font-black text-white disabled:opacity-40 ${accountAction === "delete" ? "bg-red-500" : "border border-red-500/30 bg-red-500/10 text-red-300"}`}>
                {accountActionPending ? "Please wait…" : accountAction === "delete" ? "Delete permanently" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <div key={message} className="rk-toast" role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}
    </main>
  );
}