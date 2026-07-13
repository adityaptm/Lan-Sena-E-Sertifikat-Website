/**
 * Simple in-memory rate limiter untuk API routes.
 * Membatasi jumlah request per IP dalam window waktu tertentu.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Bersihkan entries yang sudah expired setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Mengecek apakah request dari IP tertentu masih dalam batas.
 *
 * @param identifier - IP address atau identifier lain
 * @param maxRequests - Jumlah maksimal request dalam window
 * @param windowMs - Window waktu dalam milidetik
 * @returns true jika masih dalam batas, false jika rate limited
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Mengekstrak IP dari request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}
