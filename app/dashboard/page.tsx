"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import type { Sertifikat, SertifikatForm, DashboardStats } from "@/app/lib/types";
import { FILTER_OPTIONS, EMPTY_FORM, MAX_PDF_SIZE_BYTES } from "@/app/lib/constants";
import {
  Sidebar,
  MobileHeader,
  StatsCards,
  DataTable,
  FormModal,
} from "@/app/components/dashboard-components";

/**
 * Dashboard — Halaman utama manajemen sertifikat.
 */
export default function Dashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<Sertifikat[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [form, setForm] = useState<SertifikatForm>({ ...EMPTY_FORM });

  /* ── Data Fetching ── */

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sertifikat");

      if (res.status === 401) {
        // Session expired — redirect ke login
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch {
      // Network error — jangan crash
    }
  }, [router]);

  /* ── Initialization ── */

  useEffect(() => {
    setIsMounted(true);

    // Load Boxicons CSS
    const linkId = "boxicons-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
      document.head.appendChild(link);
    }

    // Cek session via API
    async function init() {
      try {
        const sessionRes = await fetch("/api/session");
        if (!sessionRes.ok) {
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }

        const sessionData = await sessionRes.json();
        setCurrentUser(sessionData.user);
        localStorage.setItem("user", sessionData.user);
        fetchData();
      } catch {
        router.replace("/login");
      }
    }

    init();
  }, [fetchData, router]);

  /* ── Computed Values ── */

  const stats: DashboardStats = useMemo(() => {
    const selesai = data.filter((item) => item.proses === "Selesai").length;
    return {
      total: data.length,
      selesai,
      belumSelesai: data.length - selesai,
      persentase: data.length > 0 ? Math.round((selesai / data.length) * 100) : 0,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        item.blok.toLowerCase().includes(searchLower) ||
        item.nomor_shgb.toLowerCase().includes(searchLower) ||
        item.desa.toLowerCase().includes(searchLower) ||
        item.keterangan?.toLowerCase().includes(searchLower);

      const matchesFilter =
        activeFilter === "Semua" || item.proses === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, activeFilter]);

  /* ── Handlers ── */

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      localStorage.removeItem("user");
      router.replace("/login");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      alert("File terlalu besar. Maksimal 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({
          ...prev,
          link_pdf: event.target!.result as string,
          nama_file_pdf: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAction = async (action: string, payload: Record<string, unknown>) => {
    setLoading(true);
    try {
      const timestamp = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      })
        .format(new Date())
        .replace(/\//g, "-");

      const res = await fetch("/api/sertifikat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          nomor_shgb: String(payload.nomor_shgb),
          action,
          editor: currentUser,
          tanggal: timestamp,
        }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const resData = await res.json();
      if (resData.success) {
        setShowModal(false);
        setForm({ ...EMPTY_FORM });
        fetchData();
      } else {
        alert("Error: " + (resData.error || "Gagal memproses data"));
      }
    } catch {
      alert("Gagal memproses data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * PDF viewer aman — menggunakan window.open dengan URL.createObjectURL
   * alih-alih document.write() yang rentan XSS.
   */
  const handleViewPdf = (item: Sertifikat) => {
    if (!item.link_pdf) return;

    if (item.link_pdf.startsWith("data:application/pdf")) {
      // Konversi base64 ke Blob untuk menghindari XSS via document.write
      try {
        const byteString = atob(item.link_pdf.split(",")[1]);
        const mimeString = item.link_pdf.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        alert("Gagal membuka file PDF");
      }
    } else if (
      item.link_pdf.startsWith("https://drive.google.com/")
    ) {
      // Google Drive link — buka langsung dengan noopener
      window.open(item.link_pdf, "_blank", "noopener,noreferrer");
    }
  };

  const downloadExcel = () => {
    const excelData = data.map((item, index) => ({
      No: index + 1,
      Blok: item.blok,
      "No SHGB": String(item.nomor_shgb || ""),
      Desa: item.desa,
      Luas: item.luas,
      Posisi: item.posisi,
      Status: item.proses,
      Keterangan: item.keterangan || "-",
      "Link PDF": item.link_pdf?.startsWith("data:") ? "Terlampir" : item.link_pdf || "-",
      Editor: item.editor,
      "Waktu Update": item.tanggal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (worksheet[cellAddress]) worksheet[cellAddress].t = "s";
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lansena Data");
    XLSX.writeFile(workbook, `Laporan_Sertifikat_${new Date().getTime()}.xlsx`);
  };

  /* ── Render ── */

  if (!isMounted) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Mobile Header */}
      <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">
              Halo, {currentUser}!
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Sistem Manajemen E-Sertifikat
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              id="export-button"
              onClick={downloadExcel}
              className="flex-1 lg:flex-none px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-sm"
            >
              <i className="bx bxs-file-export text-emerald-500 text-lg" /> Export
              Excel
            </button>
            <button
              id="add-button"
              onClick={() => {
                setForm({ ...EMPTY_FORM });
                setShowModal(true);
              }}
              className="flex-[2] lg:flex-none px-8 py-3.5 bg-[#0A3660] text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl"
            >
              <i className="bx bx-plus-circle text-lg" /> Tambah Berkas
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter
                  ? "bg-[#0A3660] text-white shadow-lg"
                  : "bg-white text-slate-400 border border-slate-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <i className="bx bx-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-2xl" />
          <input
            id="search-input"
            type="text"
            placeholder="CARI DATA..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:border-[#0A3660] shadow-sm uppercase placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Data Table */}
        <DataTable
          data={filteredData}
          onEdit={(item) => {
            setForm(item as unknown as SertifikatForm);
            setShowModal(true);
          }}
          onDelete={(id) => handleAction("delete", { id })}
          onViewPdf={handleViewPdf}
        />
      </main>

      {/* Form Modal */}
      {showModal && (
        <FormModal
          form={form}
          loading={loading}
          onFormChange={setForm}
          onSave={() => handleAction(form.id ? "update" : "create", form as unknown as Record<string, unknown>)}
          onClose={() => setShowModal(false)}
          onFileChange={handleFileChange}
        />
      )}
    </div>
  );
}
