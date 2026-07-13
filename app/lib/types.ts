/**
 * Type definitions untuk Lan Sena E-Sertifikat
 */

/** Posisi berkas yang valid */
export type PosisiBerkas = "KANTOR" | "NOTARIS" | "BANK" | "BPN";

/** Status proses berkas */
export type StatusProses = "Selesai" | "Belum Selesai";

/** Data sertifikat dari backend */
export interface Sertifikat {
  id: string;
  blok: string;
  nomor_shgb: string;
  desa: string;
  luas: string;
  posisi: PosisiBerkas;
  proses: StatusProses;
  keterangan: string;
  link_pdf: string;
  nama_file_pdf: string;
  editor: string;
  tanggal: string;
}

/** Form data untuk create/update sertifikat */
export interface SertifikatForm {
  id: string;
  blok: string;
  nomor_shgb: string;
  desa: string;
  luas: string;
  posisi: PosisiBerkas;
  proses: StatusProses;
  keterangan: string;
  link_pdf: string;
  nama_file_pdf: string;
}

/** Statistik dashboard */
export interface DashboardStats {
  total: number;
  selesai: number;
  belumSelesai: number;
  persentase: number;
}

/** Konfigurasi visual posisi berkas */
export interface PosisiConfig {
  bg: string;
  text: string;
  icon: string;
}

/** Response dari API login */
export interface LoginResponse {
  success: boolean;
  user?: string;
  message?: string;
}

/** Response dari API sertifikat */
export interface ApiResponse {
  success: boolean;
  error?: string;
}
