"use client";

import type { PosisiBerkas, Sertifikat, SertifikatForm, DashboardStats } from "@/app/lib/types";
import { POSISI_CONFIG, POSISI_OPTIONS, EMPTY_FORM, MAX_PDF_SIZE_BYTES } from "@/app/lib/constants";

/* ──────────────────────────────────────────────
 * Sidebar Component
 * ────────────────────────────────────────────── */

interface SidebarProps {
  currentUser: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ currentUser, isOpen, onClose, onLogout }: SidebarProps) {
  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#0A3660] text-white flex flex-col z-[120] transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex-1">
          {/* Tombol Close (Mobile) */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-6 right-6 text-2xl text-white/50"
            aria-label="Tutup menu"
          >
            <i className="bx bx-x" />
          </button>

          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/10 overflow-hidden">
              <img src="/ls.ico" alt="Lan Sena Logo" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="font-black text-base tracking-tighter uppercase">
              LAN SENA E-System
            </h1>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs uppercase shadow-inner">
              {currentUser.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest leading-none">
                Staff Aktif
              </p>
              <h4 className="text-xs font-bold truncate mt-1 uppercase">
                {currentUser}
              </h4>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 text-emerald-400 rounded-xl border border-white/10 text-sm font-bold cursor-pointer">
              <i className="bx bxs-grid-alt" /> Dashboard
            </div>
          </nav>
        </div>

        <div className="p-6">
          <button
            id="logout-button"
            onClick={onLogout}
            className="w-full py-3.5 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all tracking-widest"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

/* ──────────────────────────────────────────────
 * Mobile Header Component
 * ────────────────────────────────────────────── */

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: MobileHeaderProps) {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-[#0A3660] text-white sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 overflow-hidden">
          <img src="/ls.ico" alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <h1 className="font-black text-xs tracking-tighter uppercase">LAN SENA</h1>
      </div>
      <button
        onClick={onMenuOpen}
        className="p-2 bg-white/10 rounded-lg"
        aria-label="Buka menu"
      >
        <i className="bx bx-menu-alt-right text-2xl" />
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Stats Cards Component
 * ────────────────────────────────────────────── */

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: "Total Unit", val: stats.total, color: "text-[#0A3660]", sub: "Data Berkas" },
    { label: "Selesai", val: stats.selesai, color: "text-emerald-600", sub: "SHGB Ready" },
    { label: "Proses", val: stats.belumSelesai, color: "text-amber-600", sub: "On Progress" },
    { label: "Progress", val: `${stats.persentase}%`, color: "text-white", bg: "bg-[#0A3660]", sub: "Achievement" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {cards.map((s, i) => (
        <div
          key={i}
          className={`${s.bg || "bg-white"} p-5 md:p-6 rounded-[2rem] border ${
            s.bg ? "border-transparent" : "border-slate-100"
          } shadow-sm`}
        >
          <p
            className={`text-[9px] font-black uppercase tracking-widest ${
              s.bg ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {s.label}
          </p>
          <h3 className={`text-2xl md:text-3xl font-black mt-2 ${s.color}`}>
            {s.val}
          </h3>
          <p
            className={`text-[8px] font-bold uppercase mt-1 ${
              s.bg ? "text-white/50" : "text-slate-300"
            }`}
          >
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Data Table Component
 * ────────────────────────────────────────────── */

interface DataTableProps {
  data: Sertifikat[];
  onEdit: (item: Sertifikat) => void;
  onDelete: (id: string) => void;
  onViewPdf: (item: Sertifikat) => void;
}

export function DataTable({ data, onEdit, onDelete, onViewPdf }: DataTableProps) {
  const headers = ["Blok", "No. SHGB", "Luas", "Posisi", "Status", "Keterangan", "Editor & Waktu", "Aksi"];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
              data.map((item) => (
                <DataTableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewPdf={onViewPdf}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <i className="bx bx-search-alt text-5xl text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Data Tidak Ditemukan
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Data Table Row (Sub-component)
 * ────────────────────────────────────────────── */

interface DataTableRowProps {
  item: Sertifikat;
  onEdit: (item: Sertifikat) => void;
  onDelete: (id: string) => void;
  onViewPdf: (item: Sertifikat) => void;
}

function DataTableRow({ item, onEdit, onDelete, onViewPdf }: DataTableRowProps) {
  const posisi = POSISI_CONFIG[item.posisi as PosisiBerkas];

  return (
    <tr className="hover:bg-blue-50/30 group">
      <td className="px-8 py-5 font-black text-[#0A3660] text-sm uppercase">
        {item.blok}
      </td>
      <td className="px-8 py-5 font-mono text-[10px] font-bold text-slate-500 uppercase">
        {item.nomor_shgb}
      </td>
      <td className="px-8 py-5 text-xs font-bold text-slate-600">
        {item.luas} m²
      </td>
      <td className="px-8 py-5">
        {posisi && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${posisi.bg} ${posisi.text}`}>
            <i className={`bx ${posisi.icon} text-sm`} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {item.posisi}
            </span>
          </div>
        )}
      </td>
      <td className="px-8 py-5">
        <span
          className={`text-[10px] font-black uppercase ${
            item.proses === "Selesai" ? "text-emerald-500" : "text-amber-500"
          }`}
        >
          {item.proses}
        </span>
      </td>
      <td className="px-8 py-5">
        <p
          className="text-[10px] text-slate-400 italic max-w-[150px] truncate group-hover:whitespace-normal group-hover:text-slate-600 cursor-help uppercase"
          title={item.keterangan}
        >
          {item.keterangan || "—"}
        </p>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#0A3660] uppercase">
            {item.editor || "System"}
          </span>
          <span className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1 uppercase">
            <i className="bx bx-time-five" /> {item.tanggal}
          </span>
        </div>
      </td>
      <td className="px-8 py-5 flex gap-2">
        {item.link_pdf && (
          <button
            onClick={() => onViewPdf(item)}
            className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
            title="Lihat PDF"
          >
            <i className="bx bx-printer text-lg" />
          </button>
        )}
        <button
          onClick={() => onEdit(item)}
          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
          title="Edit Data"
        >
          <i className="bx bxs-edit-alt text-lg" />
        </button>
        <button
          onClick={() => {
            if (confirm("Hapus data ini?")) onDelete(item.id);
          }}
          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
          title="Hapus Data"
        >
          <i className="bx bxs-trash text-lg" />
        </button>
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────
 * Sertifikat Form Modal Component
 * ────────────────────────────────────────────── */

interface FormModalProps {
  form: SertifikatForm;
  loading: boolean;
  onFormChange: (form: SertifikatForm) => void;
  onSave: () => void;
  onClose: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormModal({
  form,
  loading,
  onFormChange,
  onSave,
  onClose,
  onFileChange,
}: FormModalProps) {
  const isEditing = Boolean(form.id);

  const textFields = [
    { label: "Blok Unit", key: "blok" },
    { label: "No. SHGB", key: "nomor_shgb" },
    { label: "Nama Desa", key: "desa" },
    { label: "Luas (m²)", key: "luas" },
  ] as const;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-[#0A3660] tracking-tight uppercase">
            {isEditing ? "Update" : "Tambah"}{" "}
            <span className="text-emerald-500">Berkas</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-rose-500 text-3xl"
            aria-label="Tutup modal"
          >
            <i className="bx bx-x" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {textFields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {f.label}
              </label>
              <input
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#0A3660]/20 outline-none uppercase"
                value={form[f.key]}
                onChange={(e) =>
                  onFormChange({ ...form, [f.key]: e.target.value.toUpperCase() })
                }
              />
            </div>
          ))}

          {/* Posisi Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Posisi Berkas
            </label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold"
              value={form.posisi}
              onChange={(e) =>
                onFormChange({ ...form, posisi: e.target.value as PosisiBerkas })
              }
            >
              {POSISI_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Status Proses
            </label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold"
              value={form.proses}
              onChange={(e) =>
                onFormChange({
                  ...form,
                  proses: e.target.value as "Selesai" | "Belum Selesai",
                })
              }
            >
              <option value="Belum Selesai">BELUM SELESAI</option>
              <option value="Selesai">SELESAI</option>
            </select>
          </div>

          {/* Keterangan */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Keterangan Tambahan
            </label>
            <textarea
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold min-h-[100px] uppercase"
              placeholder="ISI KETERANGAN..."
              value={form.keterangan || ""}
              onChange={(e) =>
                onFormChange({ ...form, keterangan: e.target.value.toUpperCase() })
              }
            />
          </div>

          {/* PDF Upload */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Upload File PDF Sertifikat (Opsional)
            </label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <input
                  key={form.link_pdf ? "has-file" : "no-file"}
                  type="file"
                  accept="application/pdf"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#0A3660]/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A3660] file:text-white hover:file:bg-[#0d467a] cursor-pointer"
                  onChange={onFileChange}
                />

                {/* Overlay jika sudah ada file */}
                {form.link_pdf && !form.link_pdf.startsWith("data:") && (
                  <div className="absolute inset-0 bg-slate-50 border-2 border-slate-50 rounded-2xl flex items-center px-5 py-4 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold">
                        File Terlampir
                      </div>
                      <span className="text-sm font-bold text-slate-600 truncate">
                        {form.nama_file_pdf || "Sudah ada file PDF di sistem"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {form.link_pdf && (
                <button
                  type="button"
                  onClick={() =>
                    onFormChange({ ...form, link_pdf: "", nama_file_pdf: "" })
                  }
                  className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all border-2 border-rose-50 h-full flex items-center justify-center shadow-sm relative z-10"
                >
                  <i className="bx bx-trash text-lg mr-1" /> Hapus
                </button>
              )}
            </div>
            {form.link_pdf && form.link_pdf.startsWith("data:application/pdf") && (
              <p className="text-[10px] text-emerald-500 font-bold ml-1 mt-1 flex items-center gap-1">
                <i className="bx bx-check-circle" /> File baru siap disimpan:{" "}
                {form.nama_file_pdf}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-[2] py-4 bg-[#0A3660] text-white rounded-[1.5rem] font-black text-[10px] uppercase shadow-xl hover:bg-[#0d467a] disabled:opacity-50 transition-all"
          >
            {loading ? "WAIT..." : "SIMPAN DATA"}
          </button>
        </div>
      </div>
    </div>
  );
}
