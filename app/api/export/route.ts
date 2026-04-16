import { db } from "@/lib/db";
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows]: any = await db.query("SELECT * FROM sertifikat");

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=sertifikat.xlsx",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}
