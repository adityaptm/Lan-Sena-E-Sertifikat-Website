import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./app/lib/constants";

/**
 * Next.js Middleware — Proteksi route-level.
 *
 * - Route /dashboard/** harus punya session cookie
 * - Route /api/sertifikat/** harus punya session cookie
 * - Route /api/export/** harus punya session cookie
 * - Route /login dan /api/login tetap publik
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Daftar route yang dilindungi
  const protectedPaths = ["/dashboard", "/api/sertifikat", "/api/export"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !sessionToken) {
    // API routes: kembalikan 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    // Page routes: redirect ke login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Tambahkan security headers ke semua response
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match semua routes kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, ls.ico (icons)
     * - File publik (SVG, images)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|ls\\.ico|.*\\.svg$).*)",
  ],
};
