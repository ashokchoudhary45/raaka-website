"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  userId: string;
  handle: string;
  displayName: string;
  verified: boolean;
  verificationType: "blue" | "gold" | "grey" | "none";
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  user?: User;
  results?: unknown[];
  users?: unknown[];
};

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;

  const user = value as Record<string, unknown>;

  return (
    typeof user.userId === "string" &&
    typeof user.handle === "string" &&
    typeof user.displayName === "string"
  );
}

function getVerificationType(value: unknown): User["verificationType"] {
  if (value === "blue" || value === "gold" || value === "grey") {
    return value;
  }

  return "none";
}

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;

  const user = value as Record<string, unknown>;

  const userId =
    typeof user.userId === "string"
      ? user.userId
      : typeof user.visitorId === "string"
        ? user.visitorId
        : typeof user.id === "string"
          ? user.id
          : "";

  const handle =
    typeof user.handle === "string"
      ? user.handle
      : "";

  const displayName =
    typeof user.displayName === "string"
      ? user.displayName
      : typeof user.display_name === "string"
        ? user.display_name
        : "";

  if (!userId || !handle) return null;

  const verificationType = getVerificationType(
    user.verificationType
  );

  const verified =
    user.verified === true ||
    user.verified === 1 ||
    user.verified === "1" ||
    verificationType !== "none";

  return {
    userId,
    handle,
    displayName,
    verified,
    verificationType,
  };
}

export default function VerificationAdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [busyUser, setBusyUser] = useState<string | null>(null);

  async function checkAdmin() {
    try {
      const response = await fetch("/api/social-auth/me", {
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success || !data.user) {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(event?: FormEvent) {
    event?.preventDefault();

    setMessage("");

    const query = search.trim();

    if (!query) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/social?action=search&q=${encodeURIComponent(query)}`,
        {
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || "Unable to search users.");
        setUsers([]);
        return;
      }

      const rawResults = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.users)
          ? data.users
          : [];

      const normalizedUsers = rawResults
        .map(normalizeUser)
        .filter((user): user is User => user !== null);

      setUsers(normalizedUsers);
    } catch {
      setMessage("Something went wrong while searching.");
      setUsers([]);
    }
  }

  async function changeVerification(
    user: User,
    verificationType: User["verificationType"]
  ) {
    setBusyUser(user.userId);
    setMessage("");

    try {
      const response = await fetch("/api/social-admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          verificationType,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || "Verification update failed.");
        return;
      }

      setUsers((current) =>
        current.map((item) =>
          item.userId === user.userId
            ? {
                ...item,
                verified: verificationType !== "none",
                verificationType,
              }
            : item
        )
      );

      if (verificationType === "none") {
        setMessage(
          `Verification removed from @${user.handle}.`
        );
      } else {
        setMessage(
          `@${user.handle} is now ${verificationType} verified.`
        );
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setBusyUser(null);
    }
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-white/60">
          Loading admin panel...
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
            🔒
          </div>

          <h1 className="text-2xl font-bold">
            Admin Access
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            You must be signed in to access the RAAKA Social
            verification management panel.
          </p>

          <Link
            href="/social"
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Back to RAAKA Social
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        <Link
          href="/social"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Back to RAAKA Social
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl text-black">
            ✓
          </div>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Verification Management
            </h1>

            <p className="mt-1 text-sm text-white/50">
              Manage blue, gold and grey verification badges.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
          <h2 className="text-lg font-semibold">
            Find a user
          </h2>

          <p className="mt-1 text-sm text-white/45">
            Search by username, handle or display name.
          </p>

          <form
            onSubmit={searchUsers}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search @handle or name"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
            />

            <button
              type="submit"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Search
            </button>
          </form>
        </section>

        {message && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            {message}
          </div>
        )}

        <section className="mt-5 space-y-4">
          {users.length === 0 &&
            search.trim() &&
            !message && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/45">
                No users found.
              </div>
            )}

          {users.map((user) => (
            <div
              key={user.userId}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
                    {(user.displayName || user.handle || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold">
                        {user.displayName || user.handle}
                      </span>

                      {user.verified && (
                        <VerificationBadge
                          type={user.verificationType}
                        />
                      )}
                    </div>

                    <div className="truncate text-sm text-white/45">
                      @{user.handle}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">

                  <VerificationButton
                    label="🔵 Blue"
                    active={user.verificationType === "blue"}
                    disabled={busyUser === user.userId}
                    onClick={() =>
                      changeVerification(user, "blue")
                    }
                  />

                  <VerificationButton
                    label="🟡 Gold"
                    active={user.verificationType === "gold"}
                    disabled={busyUser === user.userId}
                    onClick={() =>
                      changeVerification(user, "gold")
                    }
                  />

                  <VerificationButton
                    label="⚪ Grey"
                    active={user.verificationType === "grey"}
                    disabled={busyUser === user.userId}
                    onClick={() =>
                      changeVerification(user, "grey")
                    }
                  />

                  <button
                    type="button"
                    disabled={busyUser === user.userId}
                    onClick={() =>
                      changeVerification(user, "none")
                    }
                    className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>

                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-blue-400/10 bg-blue-500/[0.06] p-5">
          <h3 className="font-semibold">
            Verification types
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <VerificationInfo
              type="blue"
              title="Blue"
              description="Verified individual, creator or public account."
            />

            <VerificationInfo
              type="gold"
              title="Gold"
              description="Official organization or brand."
            />

            <VerificationInfo
              type="grey"
              title="Grey"
              description="Official government or institutional account."
            />
          </div>
        </section>

      </div>
    </main>
  );
}

function VerificationBadge({
  type,
}: {
  type: User["verificationType"];
}) {
  if (type === "gold") {
    return (
      <span
        title="Official Organization"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-black"
      >
        ✓
      </span>
    );
  }

  if (type === "grey") {
    return (
      <span
        title="Official Account"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] font-black text-black"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      title="Verified"
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0] text-[10px] font-black text-white"
    >
      ✓
    </span>
  );
}

function VerificationButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-white text-black"
          : "border border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function VerificationInfo({
  type,
  title,
  description,
}: {
  type: "blue" | "gold" | "grey";
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2">
        <VerificationBadge type={type} />
        <span className="font-semibold">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-white/45">
        {description}
      </p>
    </div>
  );
}