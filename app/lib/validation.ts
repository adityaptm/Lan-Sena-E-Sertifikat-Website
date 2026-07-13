/**
 * Input validation & sanitization utilities.
 * Digunakan di API routes untuk mencegah injection dan data kotor.
 */

/** Membersihkan string dari karakter berbahaya */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Strip inline event handlers
    .trim();
}

/** Validasi apakah nilai adalah posisi yang valid */
export function isValidPosisi(value: unknown): boolean {
  const valid = ["KANTOR", "NOTARIS", "BANK", "BPN"];
  return typeof value === "string" && valid.includes(value);
}

/** Validasi apakah nilai adalah status proses yang valid */
export function isValidProses(value: unknown): boolean {
  const valid = ["Selesai", "Belum Selesai"];
  return typeof value === "string" && valid.includes(value);
}

/** Validasi apakah string adalah base64 PDF yang valid */
export function isValidPdfBase64(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (!value) return true; // Opsional, boleh kosong
  // Harus dimulai dengan data:application/pdf;base64, atau URL Google Drive
  return (
    value.startsWith("data:application/pdf;base64,") ||
    value.startsWith("https://drive.google.com/")
  );
}

/**
 * Validasi dan sanitasi form sertifikat.
 * Returns objek bersih atau null jika data tidak valid.
 */
export function validateSertifikatPayload(body: Record<string, unknown>): {
  valid: boolean;
  error?: string;
  data?: Record<string, string>;
} {
  const blok = sanitizeString(body.blok);
  const nomor_shgb = sanitizeString(body.nomor_shgb);
  const desa = sanitizeString(body.desa);
  const luas = sanitizeString(body.luas);
  const posisi = sanitizeString(body.posisi);
  const proses = sanitizeString(body.proses);
  const keterangan = sanitizeString(body.keterangan);
  const editor = sanitizeString(body.editor);
  const tanggal = sanitizeString(body.tanggal);

  if (!blok) return { valid: false, error: "Blok wajib diisi" };
  if (!nomor_shgb) return { valid: false, error: "No. SHGB wajib diisi" };
  if (!desa) return { valid: false, error: "Desa wajib diisi" };
  if (!luas) return { valid: false, error: "Luas wajib diisi" };
  if (!isValidPosisi(posisi)) return { valid: false, error: "Posisi tidak valid" };
  if (!isValidProses(proses)) return { valid: false, error: "Status proses tidak valid" };

  // PDF validation (opsional, tapi jika ada harus valid)
  const link_pdf = typeof body.link_pdf === "string" ? body.link_pdf : "";
  if (link_pdf && !isValidPdfBase64(link_pdf)) {
    return { valid: false, error: "Format PDF tidak valid" };
  }

  return {
    valid: true,
    data: {
      id: sanitizeString(body.id),
      blok,
      nomor_shgb: String(nomor_shgb),
      desa,
      luas,
      posisi,
      proses,
      keterangan,
      link_pdf,
      nama_file_pdf: sanitizeString(body.nama_file_pdf),
      editor,
      tanggal,
    },
  };
}
