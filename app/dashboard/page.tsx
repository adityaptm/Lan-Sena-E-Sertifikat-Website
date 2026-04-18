"use client";
import { useEffect, useState, useCallback } from "react";

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    id: "",
    blok: "",
    nomor_shgb: "",
    desa: "",
    luas: "",
    posisi: "KANTOR",
    proses: "Belum Selesai",
    keterangan: "",
  });

  const posisiConfig: Record<string, { bg: string; text: string; icon: string }> = {
    KANTOR: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "bx-buildings" },
    NOTARIS: { bg: "bg-violet-100", text: "text-violet-700", icon: "bx-edit-alt" },
    BANK: { bg: "bg-blue-100", text: "text-blue-700", icon: "bx-building-house" },
    BPN: { bg: "bg-amber-100", text: "text-amber-700", icon: "bx-map-pin" },
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sertifikat");
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error("Fetch Error");
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      window.location.href = "/login";
    } else {
      setCurrentUser(savedUser);
      fetchData();
    }

    const linkId = "boxicons-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
      document.head.appendChild(link);
    }
  }, [fetchData]);

  // FIX: Format CSV agar kolom rapi dan tidak bergeser
  const downloadExcel = () => {
    const headers = ["No", "Blok", "No SHGB", "Desa", "Luas", "Posisi", "Status", "Keterangan", "Editor", "Waktu Update"].join(",");
    
    const rows = data.map((item) => [
      item.id,
      item.blok,
      `'${item.nomor_shgb}`, // Tanda petik satu agar angka panjang tidak berantakan di Excel
      item.desa,
      item.luas,
      item.posisi,
      item.proses,
      `"${(item.keterangan || "-").replace(/"/g, '""')}"`,
      item.editor,
      item.tanggal,
    ].join(","));

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Sertifikat_Lansena.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (action: string, payload: any) => {
    setLoading(true);
    try {
      // FIX TANGGAL: Menggunakan format Indonesia (WIB) sebagai String
      const now = new Date();
      const timestamp = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta"
      }).format(now).replace(/\//g, "-");

      const res = await fetch("/api/sertifikat", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          action,
          editor: currentUser,
          tanggal: timestamp, // Dikirim sebagai teks: "18 Apr 2026 11:15"
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert("Error: " + resData.error);
      }
    } catch (err) {
      alert("Gagal memproses data");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: data.length,
    selesai: data.filter((item) => item.proses === "Selesai").length,
    belumSelesai: data.filter((item) => item.proses !== "Selesai").length,
    persentase: data.length > 0 ? Math.round((data.filter((item) => item.proses === "Selesai").length / data.length) * 100) : 0,
  };

  if (!isMounted) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A3660] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <i className="bx bxs-buildings text-lg"></i>
          </div>
          <h1 className="font-black text-xs tracking-tighter uppercase">LAN SENA</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg">
          <i className="bx bx-menu-alt-right text-2xl"></i>
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0A3660] text-white flex flex-col z-[110] transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 flex-1">
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-6 right-6 text-2xl text-white/50">
            <i className="bx bx-x"></i>
          </button>
          <div className="hidden md:flex items-center gap-4 mb-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="bx bxs-buildings text-xl"></i>
            </div>
            <h1 className="font-black text-base tracking-tighter uppercase">LAN SENA E-System</h1>
          </div>
          <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-xs uppercase shadow-inner">
              {currentUser.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest leading-none">Staff Aktif</p>
              <h4 className="text-xs font-bold truncate mt-1 uppercase">{currentUser}</h4>
            </div>
          </div>
          <nav>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 text-emerald-400 rounded-xl border border-white/10 text-sm font-bold">
              <i className="bx bxs-grid-alt"></i> Dashboard
            </div>
          </nav>
        </div>
        <div className="p-6">
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="w-full py-3.5 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all tracking-widest">
            Logout
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Halo, {currentUser}!</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Manajemen E-Sertifikat</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button onClick={downloadExcel} className="flex-1 lg:flex-none px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-sm">
              <i className="bx bxs-file-export text-emerald-500 text-lg"></i> Export CSV
            </button>
            <button onClick={() => { setForm({ id: "", blok: "", nomor_shgb: "", desa: "", luas: "", posisi: "KANTOR", proses: "Belum Selesai", keterangan: "" }); setShowModal(true); }} className="flex-[2] lg:flex-none px-8 py-3.5 bg-[#0A3660] text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-xl">
              <i className="bx bx-plus-circle text-lg"></i> Tambah Berkas
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { label: "Total Unit", val: stats.total, color: "text-[#0A3660]", sub: "Data Berkas" },
            { label: "Selesai", val: stats.selesai, color: "text-emerald-600", sub: "SHGB Ready" },
            { label: "Proses", val: stats.belumSelesai, color: "text-amber-600", sub: "On Progress" },
            { label: "Progress", val: `${stats.persentase}%`, color: "text-white", bg: "bg-[#0A3660]", sub: "Achievement" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg || "bg-white"} p-5 md:p-6 rounded-[2rem] border ${s.bg ? "border-transparent" : "border-slate-100"} shadow-sm`}>
              <p className={`text-[9px] font-black uppercase tracking-widest ${s.bg ? "text-emerald-400" : "text-slate-400"}`}>{s.label}</p>
              <h3 className={`text-2xl md:text-3xl font-black mt-2 ${s.color}`}>{s.val}</h3>
              <p className={`text-[8px] font-bold uppercase mt-1 ${s.bg ? "text-white/50" : "text-slate-300"}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="relative mb-6">
          <i className="bx bx-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-2xl"></i>
          <input type="text" placeholder="Cari berdasarkan Blok, Desa, atau No SHGB..." className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-semibold outline-none focus:border-[#0A3660] shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {["Blok", "No. SHGB", "Luas", "Posisi", "Status", "Keterangan", "Editor & Waktu", "Aksi"].map((h) => (
                    <th key={h} className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 group">
                    <td className="px-8 py-5 font-black text-[#0A3660] text-sm">{item.blok}</td>
                    <td className="px-8 py-5 font-mono text-[10px] font-bold text-slate-500">{item.nomor_shgb}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600">{item.luas} m²</td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${posisiConfig[item.posisi]?.bg} ${posisiConfig[item.posisi]?.text}`}>
                        <i className={`bx ${posisiConfig[item.posisi]?.icon} text-sm`}></i>
                        <span className="text-[9px] font-black uppercase tracking-wider">{item.posisi}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase ${item.proses === "Selesai" ? "text-emerald-500" : "text-amber-500"}`}>{item.proses}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[10px] text-slate-400 italic max-w-[150px] truncate group-hover:whitespace-normal group-hover:text-slate-600 cursor-help" title={item.keterangan}>{item.keterangan || "—"}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-[#0A3660] uppercase">{item.editor || "System"}</span>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1"><i className="bx bx-time-five"></i> {item.tanggal}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => { setForm(item); setShowModal(true); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><i className="bx bxs-edit-alt text-lg"></i></button>
                        <button onClick={() => { if (confirm("Hapus data?")) handleAction("delete", { id: item.id }); }} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><i className="bx bxs-trash text-lg"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-8 md:p-12 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0A3660] tracking-tight uppercase">
                {form.id ? "Update" : "Tambah"} <span className="text-emerald-500">Berkas</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-rose-500 text-3xl"><i className="bx bx-x"></i></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {[{ l: "Blok Unit", k: "blok" }, { l: "No. SHGB", k: "nomor_shgb" }, { l: "Nama Desa", k: "desa" }, { l: "Luas (m²)", k: "luas" }].map((f) => (
                <div key={f.k} className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.l}</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold focus:bg-white focus:border-[#0A3660]/20 outline-none uppercase" value={(form as any)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Posisi Berkas</label>
                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold" value={form.posisi} onChange={(e) => setForm({ ...form, posisi: e.target.value })}>
                  <option value="KANTOR">KANTOR</option>
                  <option value="NOTARIS">NOTARIS</option>
                  <option value="BANK">BANK</option>
                  <option value="BPN">BPN</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Proses</label>
                <select className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold" value={form.proses} onChange={(e) => setForm({ ...form, proses: e.target.value })}>
                  <option value="Belum Selesai">BELUM SELESAI</option>
                  <option value="Selesai">SELESAI</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan Tambahan</label>
                <textarea className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm font-bold min-h-[100px]" placeholder="Isi keterangan..." value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase">Batal</button>
              <button onClick={() => handleAction(form.id ? "update" : "create", form)} disabled={loading} className="flex-[2] py-4 bg-[#0A3660] text-white rounded-[1.5rem] font-black text-[10px] uppercase shadow-xl disabled:opacity-50">
                {loading ? "Wait..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
