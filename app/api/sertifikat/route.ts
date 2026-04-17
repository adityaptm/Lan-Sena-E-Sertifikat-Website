import { NextResponse } from "next/server";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxaH5X6BBn5inr_yrtTCua2x8nPHCHKAhJmDJHlgITcLoZ0w4mcvxxDFjreJAx-9zZJdw/exec"; // MASUKKAN URL /exec DISINI

export async function GET() {
  const res = await fetch(SCRIPT_URL, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const result = await res.json();
  return NextResponse.json(result);
}
