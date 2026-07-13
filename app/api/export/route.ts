import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { SESSION_COOKIE_NAME } from "@/app/lib/constants";
import { verifySession } from "@/app/lib/session";

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_SERTIFIKAT;

export async function GET(req: Request) {
  // Verifikasi session
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, val.join("=")];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await verifySession(token);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Session expired" },
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

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "Format data tidak valid" },
        { status: 502 }
      );
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sertifikat");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Disposition":
          'attachment; filename="Data_Sertifikat_Lansena.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal mengunduh data" },
      { status: 500 }
    );
  }
}
