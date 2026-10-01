"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type VerificationType = "blue" | "gold" | "grey" | "none";

type User = {
  userId: string;
  handle: string;
  displayName: string;
  verified: boolean;
  verificationType: VerificationType;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
  user?: User;
  results?: User[];
  users?: User[];
};

async function readApiResponse(response: Response): Promise<ApiResponse> {
  try {
    const json: unknown = await response.json();

    if (!json || typeof json !== "object") {
      return {};
    }

    return json as ApiResponse;
  } catch {
    return {};
  }
}

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const user = value as Record<string, unknown>;

  const userId =
    typeof user.userId === "string"
      ? user.userId
      : typeof user.visitorId === "string"
        ? user.visitorId
        : "";

  const handle = typeof user.handle === "string" ? user.handle : "";
  const displayName =
    typeof user.displayName === "string" ? user.displayName : "";

  if (!userId || !handle) {
    return null;
  }

  const verificationTypeValue = user.verificationType;

  const verificationType: VerificationType =
    verificationTypeValue === "blue" ||
    verificationTypeValue === "gold" ||
    verificationTypeValue === "grey" ||
    verificationTypeValue === "none"
      ? verificationTypeValue
      : user.verified
        ? "blue"
        : "none";

  return {
    userId,
    handle,
    displayName,
    verified:
      typeof user.verified === "boolean"
        ? user.verified
        : verificationType !== "none",
    verificationType,
  };
}

function VerificationBadge({
  type,
  size = "normal",
}: {
  type: VerificationType;
  size?: "small" | "normal";
}) {
  if (type === "none") {
    return null;
  }

  const sizeClass = size === "small" ? "text-sm" : "text-base";

  if (type === "blue") {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClass} font-bold text-blue-500`}
        title="Verified"
        aria-label="Verified"
      >
        ✓
      </span>
    );
  }

  if (type === "gold") {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClass} font-bold text-yellow-500`}
        title="Official Organization"
        aria-label="Official Organization"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClass} font-bold text-gray-400`}
      title="Official Account"
      aria-label="Official Account"
    >
      ✓
    </span>
  );
}

function VerificationInfo({
  type,
}: {
  type: VerificationType;
}) {
  if (type === "blue") {
    return (
      <span className="text-xs text-blue-500">
        Blue ✓ · Verified
      </span>
    );
  }

  if (type === "gold") {
    return (
      <span className="text-xs text-yellow-500">
        Gold ✓ · Official Organization
      </span>
    );
  }

  if (type === "grey") {
    return (
      <span className="text-xs text-gray-400">
        Grey ✓ · Official Account
      </span>
    );
  }

  return (
    <span className="text-xs text-gray-500">
      No verification
    </span>
  );
}

export default function VerificationAdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState<VerificationType | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentAdmin, setCurrentAdmin] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/social-auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data: ApiResponse = await readApiResponse(response);

        if (!response.ok || !data.success) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const me = data.user;

        if (!me) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setCurrentAdmin({
          userId: me.userId,
          email:
            typeof (me as unknown as { email?: string }).email === "string"
              ? (me as unknown as { email: string }).email
              : "",
        });

        setAuthorized(true);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    void checkAdmin();
  }, []);

  const selectedType = useMemo<VerificationType>(() => {
    return selectedUser?.verificationType ?? "none";
  }, [selectedUser]);

  async function searchUsers(event?: FormEvent) {
    event?.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setUsers([]);
      setSelectedUser(null);
      setError("");
      setMessage("");
      return;
    }

    setSearching(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/social?action=search&q=${encodeURIComponent(trimmedQuery)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: ApiResponse = await readApiResponse(response);

      if (!response.ok || !data.success) {
        setError(data.error || "Search failed.");
        setUsers([]);
        setSelectedUser(null);
        return;
      }

      const rawUsers = Array.isArray(data.users)
        ? data.users
        : Array.isArray(data.results)
          ? data.results
          : [];

      const normalizedUsers = rawUsers
        .map((item) => normalizeUser(item))
        .filter((item): item is User => item !== null);

      setUsers(normalizedUsers);
      setSelectedUser(normalizedUsers[0] ?? null);

      if (normalizedUsers.length === 0) {
        setMessage("No users found.");
      }
    } catch {
      setError("Unable to search users.");
      setUsers([]);
      setSelectedUser(null);
    } finally {
      setSearching(false);
    }
  }

  async function changeVerification(
    verificationType: VerificationType
  ) {
    if (!selectedUser) {
      return;
    }

    setUpdating(verificationType);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/social-admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.userId,
          verificationType,
        }),
      });

      const data: ApiResponse = await readApiResponse(response);

      if (!response.ok || !data.success) {
        setError(data.error || "Verification update failed.");
        return;
      }

      const updatedUser = normalizeUser(data.user);

      if (updatedUser) {
        setSelectedUser(updatedUser);

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.userId === updatedUser.userId
              ? updatedUser
              : user
          )
        );
      } else {
        const fallbackUser: User = {
          ...selectedUser,
          verified: verificationType !== "none",
          verificationType,
        };

        setSelectedUser(fallbackUser);

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.userId === selectedUser.userId
              ? fallbackUser
              : user
          )
        );
      }

      if (verificationType === "none") {
        setMessage("Verification removed successfully.");
      } else if (verificationType === "blue") {
        setMessage("Blue verification applied successfully.");
      } else if (verificationType === "gold") {
        setMessage("Gold verification applied successfully.");
      } else {
        setMessage("Grey verification applied successfully.");
      }
    } catch {
      setError("Unable to update verification.");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">
          Checking admin access...
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>

          <h1 className="text-xl font-bold mb-2">
            Admin Access Required
          </h1>

          <p className="text-sm text-gray-400 mb-6">
            You are not authorized to access the RAAKA Social
            verification panel.
          </p>

          <a
            href="/social"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition"
          >
            Back to RAAKA Social
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">✓</span>

              <h1 className="text-2xl font-bold">
                Verification Center
              </h1>
            </div>

            <p className="text-sm text-gray-400">
              Manually manage verification badges for RAAKA Social
              accounts.
            </p>

            {currentAdmin?.email ? (
              <p className="mt-2 text-xs text-gray-500">
                Admin session active
              </p>
            ) : null}
          </div>

          <a
            href="/social"
            className="inline-flex w-fit items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 transition"
          >
            ← Back to Social
          </a>
        </div>

        {/* Verification types */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <VerificationBadge type="blue" size="normal" />

              <span className="font-semibold">
                Blue Verification
              </span>
            </div>

            <p className="text-xs leading-5 text-gray-400">
              Verified individual, creator or public account.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <VerificationBadge type="gold" size="normal" />

              <span className="font-semibold">
                Gold Verification
              </span>
            </div>

            <p className="text-xs leading-5 text-gray-400">
              Official organization or brand account.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-500/20 bg-gray-500/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <VerificationBadge type="grey" size="normal" />

              <span className="font-semibold">
                Grey Verification
              </span>
            </div>

            <p className="text-xs leading-5 text-gray-400">
              Official account or institution.
            </p>
          </div>
        </div>

        {/* Search */}
        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Find a user
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search by username, handle or display name.
            </p>
          </div>

          <form
            onSubmit={searchUsers}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search @username..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-white/30"
            />

            <button
              type="submit"
              disabled={searching}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          ) : null}

          {/* Results */}
          {users.length > 0 ? (
            <div className="mt-6 space-y-2">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Search results
              </div>

              {users.map((user) => {
                const isSelected =
                  selectedUser?.userId === user.userId;

                return (
                  <button
                    key={user.userId}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setError("");
                      setMessage("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 bg-black hover:bg-white/5"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold">
                          {user.displayName || user.handle}
                        </span>

                        <VerificationBadge
                          type={user.verificationType}
                          size="small"
                        />
                      </div>

                      <div className="mt-1 truncate text-sm text-gray-500">
                        @{user.handle}
                      </div>
                    </div>

                    <div className="ml-4 shrink-0">
                      <VerificationInfo
                        type={user.verificationType}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* Selected user */}
        {selectedUser ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-xl font-bold">
                  {(selectedUser.displayName ||
                    selectedUser.handle ||
                    "R")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate text-lg font-bold">
                      {selectedUser.displayName ||
                        selectedUser.handle}
                    </h2>

                    <VerificationBadge
                      type={selectedUser.verificationType}
                      size="normal"
                    />
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    @{selectedUser.handle}
                  </p>

                  <div className="mt-2">
                    <VerificationInfo
                      type={selectedUser.verificationType}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black px-4 py-3">
                <div className="text-[10px] uppercase tracking-wider text-gray-600">
                  User ID
                </div>

                <div className="mt-1 max-w-[260px] truncate font-mono text-xs text-gray-400">
                  {selectedUser.userId}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Change verification
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Blue */}
                <button
                  type="button"
                  disabled={updating !== null}
                  onClick={() =>
                    void changeVerification("blue")
                  }
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedType === "blue"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/10 bg-black hover:border-blue-500/30 hover:bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <VerificationBadge type="blue" />

                    <span className="font-semibold">
                      Blue ✓
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Verified individual / creator / public account.
                  </p>

                  {updating === "blue" ? (
                    <div className="mt-3 text-xs text-blue-400">
                      Updating...
                    </div>
                  ) : selectedType === "blue" ? (
                    <div className="mt-3 text-xs font-medium text-blue-400">
                      Currently active
                    </div>
                  ) : null}
                </button>

                {/* Gold */}
                <button
                  type="button"
                  disabled={updating !== null}
                  onClick={() =>
                    void changeVerification("gold")
                  }
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedType === "gold"
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : "border-white/10 bg-black hover:border-yellow-500/30 hover:bg-yellow-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <VerificationBadge type="gold" />

                    <span className="font-semibold">
                      Gold ✓
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Official organization / brand account.
                  </p>

                  {updating === "gold" ? (
                    <div className="mt-3 text-xs text-yellow-400">
                      Updating...
                    </div>
                  ) : selectedType === "gold" ? (
                    <div className="mt-3 text-xs font-medium text-yellow-400">
                      Currently active
                    </div>
                  ) : null}
                </button>

                {/* Grey */}
                <button
                  type="button"
                  disabled={updating !== null}
                  onClick={() =>
                    void changeVerification("grey")
                  }
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedType === "grey"
                      ? "border-gray-400/40 bg-gray-400/10"
                      : "border-white/10 bg-black hover:border-gray-400/30 hover:bg-gray-400/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <VerificationBadge type="grey" />

                    <span className="font-semibold">
                      Grey ✓
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Official account / institution.
                  </p>

                  {updating === "grey" ? (
                    <div className="mt-3 text-xs text-gray-400">
                      Updating...
                    </div>
                  ) : selectedType === "grey" ? (
                    <div className="mt-3 text-xs font-medium text-gray-400">
                      Currently active
                    </div>
                  ) : null}
                </button>

                {/* Remove */}
                <button
                  type="button"
                  disabled={updating !== null}
                  onClick={() =>
                    void changeVerification("none")
                  }
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    selectedType === "none"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-white/10 bg-black hover:border-red-500/30 hover:bg-red-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-400">
                      ×
                    </span>

                    <span className="font-semibold">
                      Remove
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Remove the current verification badge.
                  </p>

                  {updating === "none" ? (
                    <div className="mt-3 text-xs text-red-400">
                      Removing...
                    </div>
                  ) : selectedType === "none" ? (
                    <div className="mt-3 text-xs font-medium text-gray-500">
                      No badge active
                    </div>
                  ) : null}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {/* Information */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
          <h2 className="text-sm font-bold">
            Verification system
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
            <p>
              <span className="font-semibold text-blue-400">
                Blue ✓
              </span>{" "}
              is used for verified individual, creator and public
              accounts.
            </p>

            <p>
              <span className="font-semibold text-yellow-400">
                Gold ✓
              </span>{" "}
              is used for official organizations and brands.
            </p>

            <p>
              <span className="font-semibold text-gray-300">
                Grey ✓
              </span>{" "}
              is used for official accounts and institutions.
            </p>

            <p>
              <span className="font-semibold text-red-400">
                Remove
              </span>{" "}
              removes the verification from the selected account.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}