import { NextResponse } from "next/server";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyLObg54w-fU6PV-qBN_dwBYpiiR1RsmhkenTvUGBnwlvu2fu0p1419oQdDvv09_3lEEg/exec"; // MASUKKAN URL /exec DISINI

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
