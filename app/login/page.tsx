"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Harap isi username dan password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sertifikat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, action: "login" }),
      });

      const data = await res.json();

      if (data.success) {
        // PERBAIKAN LOGIKA: Simpan ke localStorage agar Dashboard mengenali sesi
        localStorage.setItem("isLogin", "true");
        // Gunakan kunci "user" agar sinkron dengan pengecekan di Dashboard
        localStorage.setItem("user", username.toLowerCase());

        router.push("/dashboard");
      } else {
        alert(data.message || "Login gagal. Periksa kembali akun Anda.");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-200">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0C447C] rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
            <i className="bx bxs-buildings text-3xl sm:text-4xl text-blue-300"></i>
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
              Login Admin
            </h1>
            <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-2">
              Dashboard E-Sertifikat
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
              Username
            </label>
            <div className="relative">
              <i className="bx bx-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                className="w-full border-none bg-slate-50 pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] transition-all text-slate-700 font-bold"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
              Password
            </label>
            <div className="relative">
              <i className="bx bx-lock-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border-none bg-slate-50 pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#0C447C] transition-all text-slate-700 font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0C447C] transition-colors"
              >
                <i
                  className={`bx ${showPassword ? "bx-hide" : "bx-show"} text-xl`}
                ></i>
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full bg-[#0C447C] text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 uppercase text-xs tracking-widest ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#093561]"
            }`}
          >
            {loading ? (
              <i className="bx bx-loader-alt animate-spin text-xl"></i>
            ) : (
              <i className="bx bx-log-in-circle text-xl"></i>
            )}
            <span>{loading ? "Memproses..." : "Masuk"}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
            &copy; 2026 PT Lan Sena Jaya.
            <br />
            All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
