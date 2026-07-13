/**
 * Input validation & sanitization utilities.
 * Digunakan di API routes untuk mencegah injection dan data kotor.
 */

/** Membersihkan string dari karakter berbahaya */
export function sanitizeString(input: unknown): string {
  if (input === null || input === undefined) return "";
  const strInput = typeof input === "string" ? input : String(input);
  return strInput
    .replace(/[<>]/g, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Strip inline event handlers
    .trim();
}

/** Daftar posisi yang valid */
const VALID_POSISI = ["KANTOR", "NOTARIS", "BANK", "BPN"];

/** Daftar status proses yang valid */
const VALID_PROSES = ["Selesai", "Belum Selesai"];

/** Validasi apakah nilai adalah posisi yang valid */
export function isValidPosisi(value: string): boolean {
  return VALID_POSISI.includes(value.toUpperCase());
}

/** Validasi apakah nilai adalah status proses yang valid */
export function isValidProses(value: string): boolean {
  return VALID_PROSES.includes(value);
}

/**
 * Validasi apakah link_pdf aman.
 * Boleh kosong, boleh base64 PDF, boleh URL Google Drive/https.
 */
export function isValidPdfLink(value: string): boolean {
  if (!value) return true; // Opsional
  if (value.startsWith("data:application/pdf;base64,")) return true;
  if (value.startsWith("https://")) return true; // Google Drive dan URL aman lainnya
  return false;
}

/**
 * Validasi dan sanitasi form sertifikat.
 * Returns objek bersih atau error jika data tidak valid.
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

  // Validasi field wajib
  if (!blok) return { valid: false, error: "Blok wajib diisi" };
  if (!nomor_shgb) return { valid: false, error: "No. SHGB wajib diisi" };

  // Posisi dan proses: validasi jika ada, default jika kosong
  const finalPosisi = posisi && isValidPosisi(posisi) ? posisi : "KANTOR";
  const finalProses = proses && isValidProses(proses) ? proses : "Belum Selesai";

  // PDF validation (opsional, tapi jika ada harus aman)
  const link_pdf = typeof body.link_pdf === "string" ? body.link_pdf : "";
  if (link_pdf && !isValidPdfLink(link_pdf)) {
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
      posisi: finalPosisi,
      proses: finalProses,
      keterangan,
      link_pdf,
      nama_file_pdf: sanitizeString(body.nama_file_pdf),
      editor,
      tanggal,
    },
  };
}
