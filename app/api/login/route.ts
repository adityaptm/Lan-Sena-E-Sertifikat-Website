import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const [rows]: any = await db.query(
      "SELECT * FROM admins WHERE username = ? AND password = ?",
      [username, password],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Login gagal" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
