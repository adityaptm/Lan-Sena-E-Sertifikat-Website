import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/lib/constants";
import { verifySession } from "@/app/lib/session";
import { validateSertifikatPayload, sanitizeString } from "@/app/lib/validation";
import { checkRateLimit, getClientIp } from "@/app/lib/rate-limit";

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_SERTIFIKAT;

/**
 * Helper: Verifikasi session dari cookie.
 */
async function getSessionUser(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  return verifySession(token);
}

/**
 * GET /api/sertifikat
 * Mengambil semua data sertifikat.
 */
export async function GET(req: Request) {
  // Verifikasi session (middleware sudah cek cookie existence, ini verifikasi signature)
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!SCRIPT_URL) {
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(SCRIPT_URL, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 502 }
    );
  }
}

/**
 * POST /api/sertifikat
 * Create, update, atau delete data sertifikat.
 */
export async function POST(req: Request) {
  // Rate limiting
  const clientIp = getClientIp(req);
  if (!checkRateLimit(`sertifikat:${clientIp}`, 30, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak request. Coba lagi nanti." },
      { status: 429 }
    );
  }

  // Verifikasi session
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!SCRIPT_URL) {
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const action = sanitizeString(body.action);

    // Validasi action
    const validActions = ["create", "update", "delete"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action tidak valid" },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;

    if (action === "delete") {
      // Delete hanya butuh id
      const id = sanitizeString(body.id);
      if (!id) {
        return NextResponse.json(
          { success: false, error: "ID wajib untuk delete" },
          { status: 400 }
        );
      }
      payload = { action, id };
    } else {
      // Create/Update: validasi lengkap
      const validation = validateSertifikatPayload(body);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }
      payload = { ...validation.data, action };
    }

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const resultText = await res.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch (e) {
      console.error("Non-JSON response from GAS:", resultText.substring(0, 500));
      return NextResponse.json(
        { success: false, error: "Invalid response from Apps Script" },
        { status: 502 }
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/sertifikat error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses data" },
      { status: 500 }
    );
  }
}
