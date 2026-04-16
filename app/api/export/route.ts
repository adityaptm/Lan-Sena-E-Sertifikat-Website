import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // Ambil data langsung dari Google Apps Script (sama seperti di Dashboard)
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL || "");
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Data format is invalid");
    }

    // Buat worksheet dari data JSON
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sertifikat");

    // Generate buffer Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Kirim sebagai file download
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Disposition":
          'attachment; filename="Data_Sertifikat_Lansena.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { error: "Gagal mengunduh data" },
      { status: 500 },
    );
  }
}
