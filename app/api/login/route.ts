import { NextResponse } from "next/server";
import { createSession, createSessionCookie } from "@/app/lib/session";
import { sanitizeString } from "@/app/lib/validation";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";

const APPS_SCRIPT_URL = process.env.GOOGLE_SCRIPT_SERTIFIKAT;

export async function POST(req: Request) {
  try {
    // Rate limiting: maks 10 percobaan login per menit per IP
    const clientIp = getClientIp(req);
    if (!checkRateLimit(`login:${clientIp}`, 10, 60 * 1000)) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429 }
      );
    }

    // Validasi environment
    if (!APPS_SCRIPT_URL) {
      console.error("GOOGLE_SCRIPT_LOGIN tidak di-set di .env.local");
      return NextResponse.json(
        { success: false, message: "Konfigurasi server error" },
        { status: 500 }
      );
    }

    // Parse & sanitasi input
    const body = await req.json();
    const username = sanitizeString(body.username);
    const password = sanitizeString(body.password);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Kirim ke Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username, password }),
    });

    const result = await response.json();

    if (result.success) {
      // Buat session token dan set cookie HttpOnly
      const sessionToken = await createSession(username);
      const res = NextResponse.json({
        success: true,
        user: username.toLowerCase(),
      });

      res.headers.set("Set-Cookie", createSessionCookie(sessionToken));
      return res;
    }

    return NextResponse.json(
      { success: false, message: "Username atau password salah" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
