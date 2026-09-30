import { getD1 } from "@/lib/d1";

const SESSION_COOKIE = "__Host-raaka-social-session";
const SESSION_DAYS = 30;
const VERIFICATION_HOURS = 24;

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);

  crypto.getRandomValues(data);

  return bytesToBase64(data);
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return bytesToBase64(new Uint8Array(hash));
}

export async function hashPassword(password: string) {
  const iterations = 100000;

  const salt = new Uint8Array(16);

  crypto.getRandomValues(salt);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    key,
    256
  );

  return [
    "pbkdf2_sha256",
    iterations,
    bytesToBase64(salt),
    bytesToBase64(new Uint8Array(bits)),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  stored: string
) {
  const parts = stored.split("$");

  if (
    parts.length !== 4 ||
    parts[0] !== "pbkdf2_sha256"
  ) {
    return false;
  }

  const iterations = Number(parts[1]);

  if (
    !Number.isFinite(iterations) ||
    iterations < 10000
  ) {
    return false;
  }

  const salt = base64ToBytes(parts[2]);
  const expected = base64ToBytes(parts[3]);

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    key,
    expected.length * 8
  );

  const actual = new Uint8Array(bits);

  if (actual.length !== expected.length) {
    return false;
  }

  let difference = 0;

  for (let i = 0; i < actual.length; i++) {
    difference |= actual[i] ^ expected[i];
  }

  return difference === 0;
}

export function sessionCookie(
  token: string,
  maxAge: number
) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function getSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") || "";

  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) =>
      part.startsWith(`${SESSION_COOKIE}=`)
    );

  return match
    ? match.slice(SESSION_COOKIE.length + 1)
    : null;
}

export async function createSession(userId: string) {
  const db = getD1();

  const token = randomToken(32);
  const tokenHash = await sha256(token);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await db
    .prepare(
      `INSERT INTO social_auth_sessions
       (token_hash, user_id, expires_at)
       VALUES (?, ?, ?)`
    )
    .bind(
      tokenHash,
      userId,
      expiresAt
    )
    .run();

  return {
    token,
    expiresAt,
  };
}

export async function getCurrentUser(
  request: Request
) {
  const token = getSessionToken(request);

  if (!token) {
    return null;
  }

  const tokenHash = await sha256(token);

  const db = getD1();

  const result = await db
    .prepare(
      `SELECT
         u.user_id,
         u.email,
         u.verified_at
       FROM social_auth_sessions s
       INNER JOIN social_auth_users u
         ON u.user_id = s.user_id
       WHERE s.token_hash = ?
         AND s.expires_at > datetime('now')
       LIMIT 1`
    )
    .bind(tokenHash)
    .first<{
      user_id: string;
      email: string;
      verified_at: string | null;
    }>();

  if (!result) {
    return null;
  }

  return {
    userId: result.user_id,
    email: result.email,
    verifiedAt: result.verified_at,
  };
}

export async function createVerificationToken(
  userId: string
) {
  const db = getD1();

  const token = randomToken(32);
  const tokenHash = await sha256(token);

  // Temporary production diagnostic.
  // Only the SHA-256 hash is logged; the raw verification
  // token is never logged.
  console.log(
    "RAAKA VERIFY TOKEN HASH:",
    tokenHash
  );

  const expiresAt = new Date(
    Date.now() +
      VERIFICATION_HOURS * 60 * 60 * 1000
  ).toISOString();

  await db
    .prepare(
      `INSERT INTO social_email_verifications
       (token_hash, user_id, expires_at)
       VALUES (?, ?, ?)`
    )
    .bind(
      tokenHash,
      userId,
      expiresAt
    )
    .run();

  return {
    token,
    expiresAt,
  };
}

export async function hashToken(token: string) {
  return sha256(token);
}