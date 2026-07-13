import type { PosisiBerkas, PosisiConfig, SertifikatForm } from "./types";

/**
 * Konfigurasi visual untuk setiap posisi berkas
 */
export const POSISI_CONFIG: Record<PosisiBerkas, PosisiConfig> = {
  KANTOR: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "bx-buildings" },
  NOTARIS: { bg: "bg-violet-100", text: "text-violet-700", icon: "bx-edit-alt" },
  BANK: { bg: "bg-blue-100", text: "text-blue-700", icon: "bx-building-house" },
  BPN: { bg: "bg-amber-100", text: "text-amber-700", icon: "bx-map-pin" },
};

/** Opsi posisi berkas */
export const POSISI_OPTIONS: PosisiBerkas[] = ["KANTOR", "NOTARIS", "BANK", "BPN"];

/** Opsi filter status */
export const FILTER_OPTIONS = ["Semua", "Selesai", "Belum Selesai"] as const;

/** Batas ukuran file PDF (3MB — Vercel serverless limit 4.5MB, base64 +33%) */
export const MAX_PDF_SIZE_BYTES = 3 * 1024 * 1024;

/** Nama cookie session */
export const SESSION_COOKIE_NAME = "ls_session";

/** Durasi session (24 jam dalam detik) */
export const SESSION_MAX_AGE = 60 * 60 * 24;

/** Form kosong default */
export const EMPTY_FORM: SertifikatForm = {
  id: "",
  blok: "",
  nomor_shgb: "",
  desa: "",
  luas: "",
  posisi: "KANTOR",
  proses: "Belum Selesai",
  keterangan: "",
  link_pdf: "",
  nama_file_pdf: "",
};
