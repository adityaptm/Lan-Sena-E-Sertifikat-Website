import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET
export async function GET() {
  const [rows] = await db.query("SELECT * FROM sertifikat ORDER BY id DESC");

  return NextResponse.json(rows);
}

// POST
export async function POST(req: Request) {
  const body = await req.json();

  await db.query(
    `INSERT INTO sertifikat 
    (blok, nomor_shgb, desa, luas, posisi, proses, keterangan, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
      body.blok,
      body.nomor_shgb,
      body.desa,
      body.luas,
      body.posisi,
      body.proses,
      body.keterangan,
      body.updated_by || "system",
    ],
  );

  return NextResponse.json({ success: true });
}

// PUT
export async function PUT(req: Request) {
  const body = await req.json();

  await db.query(
    `UPDATE sertifikat SET
      blok=?,
      nomor_shgb=?,
      desa=?,
      luas=?,
      posisi=?,
      proses=?,
      keterangan=?,
      updated_at = NOW(),
      updated_by = ?
    WHERE id=?`,
    [
      body.blok,
      body.nomor_shgb,
      body.desa,
      body.luas,
      body.posisi,
      body.proses,
      body.keterangan,
      body.updated_by || "system",
      body.id,
    ],
  );

  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(req: Request) {
  const { id } = await req.json();

  await db.query("DELETE FROM sertifikat WHERE id=?", [id]);

  return NextResponse.json({ success: true });
}
