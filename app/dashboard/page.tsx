"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [adminName, setAdminName] = useState("Administrator");

  const [form, setForm] = useState<any>({
    id: null,
    blok: "",
    nomor_shgb: "",
    desa: "",
    posisi: "",
    proses: "",
    keterangan: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sertifikat");
      if (!res.ok) return;
      const result = await res.json();
      setData(result || []);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) setAdminName(storedAdmin);
    if (!isLogin) {
      router.push("/login");
      return;
    }
    const link = document.createElement("link");
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        item.blok?.toLowerCase().includes(searchStr) ||
        item.nomor_shgb?.toLowerCase().includes(searchStr) ||
        item.desa?.toLowerCase().includes(searchStr) ||
        item.keterangan?.toLowerCase().includes(searchStr)
      );
    });
  }, [data, searchTerm]);

  const total = data.length;
  const selesai = useMemo(
    () => data.filter((d) => d.proses === "Selesai").length,
    [data],
  );
  const belum = useMemo(
    () => data.filter((d) => d.proses !== "Selesai").length,
    [data],
  );

  const downloadExcel = () => {
    if (data.length === 0) return alert("Tidak ada data");
    const excelData = data.map((item) => ({
      Blok: item.blok,
      "Nomor SHGB": item.nomor_shgb,
      Desa: item.desa,
      Posisi: item.posisi,
      Status: item.proses,
      Keterangan: item.keterangan || "-",
      Petugas: item.updated_by || "Admin",
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    XLSX.writeFile(workbook, `Laporan_Sertifikat_${Date.now()}.xlsx`);
  };

  const handleSubmit = async () => {
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/sertifikat", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, updated_by: adminName }),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({
        id: null,
        blok: "",
        nomor_shgb: "",
        desa: "",
        posisi: "",
        proses: "",
        keterangan: "",
      });
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data sertifikat ini?")) return;
    await fetch("/api/sertifikat", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[50] w-72 bg-[#0C447C] text-white p-6 transition-transform duration-300 shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <i className="bx bxs-buildings text-3xl text-blue-300"></i>
            <h2 className="text-lg font-bold tracking-tight uppercase italic">
              PT LAN SENA JAYA
            </h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-2xl"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5">
            <i className="bx bxs-dashboard text-xl text-blue-300"></i>
            <span className="font-bold text-sm">Database Sertifikat</span>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-4 md:px-8 py-4 shadow-sm flex justify-between items-center z-10 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-2xl text-[#0C447C]"
            >
              <i className="bx bx-menu-alt-left"></i>
            </button>
            <div>
              <h1 className="font-black text-lg md:text-xl text-slate-800 tracking-tight leading-none uppercase italic">
                Dashboard Admin
              </h1>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">
                Staff: {adminName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("isLogin");
              router.push("/login");
            }}
            className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <i className="bx bx-power-off"></i>{" "}
            <span className="hidden md:block">Logout</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Unit",
                val: total,
                color: "text-[#0C447C]",
                bg: "bg-blue-50",
                icon: "bx-folder",
              },
              {
                label: "Selesai",
                val: selesai,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                icon: "bx-check-double",
              },
              {
                label: "Proses",
                val: belum,
                color: "text-rose-600",
                bg: "bg-rose-50",
                icon: "bx-time",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                    {stat.label}
                  </p>
                  <h3 className={`text-3xl font-black ${stat.color}`}>
                    {stat.val}
                  </h3>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-2xl`}
                >
                  <i className={`bx ${stat.icon}`}></i>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="relative w-full xl:max-w-md">
              <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="Cari data..."
                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] transition-all font-bold text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full xl:w-auto">
              <button
                onClick={downloadExcel}
                className="flex-1 xl:flex-none bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <i className="bx bxs-file-export text-lg"></i> Unduh
              </button>
              <button
                onClick={() => {
                  setShowModal(true);
                  setIsEdit(false);
                  setForm({
                    id: null,
                    blok: "",
                    nomor_shgb: "",
                    desa: "",
                    posisi: "",
                    proses: "",
                    keterangan: "",
                  });
                }}
                className="flex-1 xl:flex-none bg-[#0C447C] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[#093561] active:scale-95 transition-all"
              >
                <i className="bx bx-plus-circle text-lg"></i> Tambah
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-6">Blok</th>
                    <th className="p-6">No. SHGB</th>
                    <th className="p-6 text-center">Desa</th>
                    <th className="p-6 text-center">Posisi</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6">Keterangan</th>
                    <th className="p-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-20 text-center text-slate-400 font-black animate-pulse uppercase text-xs"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-20 text-center text-slate-300 font-black uppercase text-xs italic"
                      >
                        Data tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="p-6 font-black text-slate-800 text-lg uppercase">
                          {d.blok}
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-[11px] border border-blue-100">
                            {d.nomor_shgb}
                          </span>
                        </td>
                        <td className="p-6 text-center text-xs font-bold text-slate-500 uppercase">
                          {d.desa}
                        </td>
                        <td className="p-6 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border inline-flex items-center gap-2 ${d.posisi === "Bank" ? "bg-amber-50 text-amber-600 border-amber-100" : d.posisi === "Notaris" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                          >
                            {d.posisi || "Kantor"}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${d.proses === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {d.proses}
                          </span>
                        </td>
                        <td className="p-6">
                          <p className="text-[10px] font-medium text-slate-400 max-w-[150px] truncate">
                            {d.keterangan || "-"}
                          </p>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setForm(d);
                                setIsEdit(true);
                                setShowModal(true);
                              }}
                              className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-[#0C447C] hover:text-white transition-all"
                            >
                              <i className="bx bx-edit-alt"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <i className="bx bx-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white my-auto">
            <div className="bg-[#0C447C] p-6 text-white flex justify-between items-center">
              <h2 className="font-black text-lg uppercase italic tracking-widest">
                {isEdit ? "Update Data" : "Entri Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-3xl">
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Blok
                </label>
                <input
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold uppercase text-sm"
                  value={form.blok}
                  onChange={(e) => setForm({ ...form, blok: e.target.value })}
                  placeholder="A1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  No SHGB
                </label>
                <input
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold text-sm"
                  value={form.nomor_shgb}
                  onChange={(e) =>
                    setForm({ ...form, nomor_shgb: e.target.value })
                  }
                  placeholder="0122"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Desa
                </label>
                <input
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold text-sm uppercase"
                  value={form.desa}
                  onChange={(e) => setForm({ ...form, desa: e.target.value })}
                  placeholder="Nama Desa..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Posisi
                </label>
                <select
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold text-sm appearance-none"
                  value={form.posisi}
                  onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                >
                  <option value="">Pilih</option>
                  <option value="Kantor">KANTOR</option>
                  <option value="Notaris">NOTARIS</option>
                  <option value="Bank">BANK</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Status
                </label>
                <select
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold text-sm appearance-none"
                  value={form.proses}
                  onChange={(e) => setForm({ ...form, proses: e.target.value })}
                >
                  <option value="">Pilih</option>
                  <option value="Belum Selesai">BELUM SELESAI</option>
                  <option value="Selesai">SELESAI</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                  Keterangan
                </label>
                <textarea
                  className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] font-bold h-20 text-xs"
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                  placeholder="Catatan..."
                />
              </div>
              <div className="col-span-2 mt-4 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-black text-slate-400 bg-slate-100 rounded-2xl uppercase text-[10px]"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-4 font-black text-white bg-[#0C447C] rounded-2xl shadow-xl uppercase text-[10px]"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
