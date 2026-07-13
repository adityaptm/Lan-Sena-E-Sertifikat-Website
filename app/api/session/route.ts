import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/constants";
import { verifySession } from "@/app/lib/session";

/**
 * GET /api/session
 * Mengecek status session saat ini.
 * Digunakan oleh client untuk cek apakah masih login.
 */
export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await verifySession(token);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
