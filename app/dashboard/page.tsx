"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      window.location.href = "/login";
    } else {
      setCurrentUser(savedUser);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sertifikat");
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error("Fetch Error");
    }
  };

  // FUNGSI UNDUH EXCEL (CSV)
  const downloadExcel = () => {
    const headers = [
      "Blok",
      "No SHGB",
      "Lokasi",
      "Luas",
      "Posisi",
      "Keterangan",
      "Editor",
      "Tanggal",
    ].join(",");
    const rows = data.map((item) =>
      [
        item.blok,
        item.nomor_shgb,
        item.desa,
        item.luas,
        item.posisi,
        `"${item.keterangan || "-"}"`, // Tanda kutip untuk menjaga koma dalam teks
        item.editor,
        item.tanggal,
      ].join(","),
    );

    const csvContent =
      "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Sertifikat_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (action: string, payload: any) => {
    setLoading(true);
    await fetch("/api/sertifikat", {
      method: "POST",
      body: JSON.stringify({ ...payload, action, editor: currentUser }),
    });
    setShowModal(false);
    fetchData();
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <link
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        rel="stylesheet"
      />

      {/* SIDEBAR */}
      <div className="w-72 bg-[#0C447C] text-white p-8 flex flex-col shadow-2xl shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0C447C] shadow-lg">
            <i className="bx bxs-business text-3xl"></i>
          </div>
          <div>
            <h1 className="font-black text-sm italic leading-none uppercase">
              PT Lan Sena Jaya
            </h1>
            <p className="text-[9px] font-bold opacity-50 mt-1 uppercase tracking-tighter">
              e-Sertifikat System
            </p>
          </div>
        </div>

        <nav className="flex-1">
          <div className="p-4 bg-white/10 rounded-2xl flex items-center gap-3 font-bold text-sm border border-white/5 shadow-inner">
            <i className="bx bxs-dashboard text-xl"></i> Database Monitor
          </div>
        </nav>

        <div className="mb-6 p-4 bg-blue-900/40 rounded-2xl border border-white/5 text-center">
          <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest text-white">
            Logged In As
          </p>
          <p className="text-xs font-bold text-emerald-400 uppercase italic tracking-wider">
            {currentUser || "Loading..."}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="p-4 flex items-center gap-3 text-rose-300 font-bold text-sm hover:bg-rose-500/10 rounded-2xl transition-all"
        >
          <i className="bx bx-log-out-circle text-xl"></i> Logout Sistem
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
              Monitoring Berkas
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
              Data Operasional Sertifikat
            </p>
          </div>

          {/* TOMBOL AKSI ATAS */}
          <div className="flex gap-3">
            <button
              onClick={downloadExcel}
              className="bg-white text-slate-700 border border-slate-200 px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
            >
              <i className="bx bxs-file-export text-lg text-emerald-600"></i>{" "}
              Unduh Excel
            </button>
            <button
              onClick={() => {
                setForm({
                  id: "",
                  blok: "",
                  nomor_shgb: "",
                  desa: "",
                  luas: "",
                  posisi: "KANTOR",
                  proses: "Belum Selesai",
                  keterangan: "",
                });
                setShowModal(true);
              }}
              className="bg-[#0C447C] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <i className="bx bx-plus text-lg"></i> Tambah Unit
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Blok</th>
                <th className="p-6">No. SHGB</th>
                <th className="p-6">Lokasi</th>
                <th className="p-6">Luas (m²)</th>
                <th className="p-6">Posisi</th>
                <th className="p-6">Keterangan</th>
                <th className="p-6">Editor</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-all text-xs font-bold"
                >
                  <td className="p-6 text-slate-800 font-black">{item.blok}</td>
                  <td className="p-6 text-blue-600 uppercase">
                    {item.nomor_shgb}
                  </td>
                  <td className="p-6 text-slate-700 uppercase">{item.desa}</td>
                  <td className="p-6 text-slate-500">{item.luas}</td>
                  <td className="p-6">
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-[9px] uppercase border border-amber-200">
                      {item.posisi}
                    </span>
                  </td>
                  <td className="p-6 text-slate-400 font-medium italic max-w-[150px] truncate">
                    {item.keterangan || "-"}
                  </td>
                  <td className="p-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase">
                      {item.editor}
                    </div>
                    <div className="text-[8px] text-slate-300 uppercase leading-none mt-1">
                      {item.tanggal}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setForm(item);
                          setShowModal(true);
                        }}
                        className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <i className="bx bxs-edit-alt text-lg"></i>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Hapus data?"))
                            handleAction("delete", { id: item.id });
                        }}
                        className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      >
                        <i className="bx bxs-trash text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative border border-slate-100">
            <h3 className="font-black text-2xl uppercase tracking-tighter mb-8 text-slate-800 italic">
              Input Sertifikat
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Blok
                </label>
                <input
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="A1"
                  value={form.blok}
                  onChange={(e) =>
                    setForm({ ...form, blok: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  No SHGB
                </label>
                <input
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="1234"
                  value={form.nomor_shgb}
                  onChange={(e) =>
                    setForm({ ...form, nomor_shgb: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Desa/Lokasi
                </label>
                <input
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="NAMA DESA"
                  value={form.desa}
                  onChange={(e) =>
                    setForm({ ...form, desa: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Luas Tanah
                </label>
                <input
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="72"
                  value={form.luas}
                  onChange={(e) => setForm({ ...form, luas: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Posisi Berkas
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none appearance-none"
                  value={form.posisi}
                  onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                >
                  <option value="KANTOR">KANTOR</option>
                  <option value="NOTARIS">NOTARIS</option>
                  <option value="BANK">BANK</option>
                  <option value="BPN">BPN</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Status Proses
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none appearance-none"
                  value={form.proses}
                  onChange={(e) => setForm({ ...form, proses: e.target.value })}
                >
                  <option value="Belum Selesai">BELUM SELESAI</option>
                  <option value="Selesai">SELESAI</option>
                  <option value="Proses BPN">PROSES BPN</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Keterangan Tambahan
                </label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
                  rows={2}
                  placeholder="Catatan berkas..."
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() =>
                  handleAction(form.id ? "update" : "create", form)
                }
                className="flex-1 py-5 bg-[#0C447C] text-white rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
