import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "./constants";

/**
 * Session management menggunakan signed cookies.
 * Menggunakan Web Crypto API (tersedia di Next.js Edge & Node runtime).
 */

const encoder = new TextEncoder();

/**
 * Mengambil secret key dari environment variable.
 * Throws error jika tidak di-set.
 */
function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET harus di-set di .env.local (minimal 32 karakter)"
    );
  }
  return secret;
}

/**
 * Membuat HMAC signature untuk data session.
 */
async function sign(payload: string): Promise<string> {
  const secret = getSecretKey();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${payload}.${hashHex}`;
}

/**
 * Memverifikasi dan mengekstrak data dari signed session string.
 * Returns null jika signature tidak valid atau session expired.
 */
async function verify(signedValue: string): Promise<string | null> {
  const lastDotIndex = signedValue.lastIndexOf(".");
  if (lastDotIndex === -1) return null;

  const payload = signedValue.substring(0, lastDotIndex);
  const expectedSigned = await sign(payload);

  if (expectedSigned !== signedValue) return null;

  // Cek expiry
  try {
    const data = JSON.parse(payload);
    if (data.exp && Date.now() > data.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Membuat session token yang ditandatangani.
 */
export async function createSession(username: string): Promise<string> {
  const payload = JSON.stringify({
    user: username.toLowerCase(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  return sign(payload);
}

/**
 * Memverifikasi session token dan mengembalikan username.
 * Returns null jika token tidak valid.
 */
export async function verifySession(
  token: string
): Promise<string | null> {
  const payload = await verify(token);
  if (!payload) return null;

  try {
    const data = JSON.parse(payload);
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Menghasilkan Set-Cookie header string untuk session.
 */
export function createSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

/**
 * Menghasilkan Set-Cookie header string untuk menghapus session.
 */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
