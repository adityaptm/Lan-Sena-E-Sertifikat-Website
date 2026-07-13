"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { LoginResponse } from "@/app/lib/types";

/**
 * Halaman login admin Lan Sena E-Sertifikat.
 */
export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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

    // Cek apakah sudah login (redirect ke dashboard)
    async function checkSession() {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          router.replace("/dashboard");
        }
      } catch {
        // Tidak perlu handle error
      }
    }
    checkSession();
  }, [router]);

  /**
   * Handler login — POST ke /api/login, bukan /api/sertifikat.
   */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data: LoginResponse = await res.json();

      if (data.success) {
        // Simpan user display name (non-sensitive, hanya untuk UI)
        localStorage.setItem("user", data.user || username.toLowerCase());
        router.replace("/dashboard");
      } else {
        setError(data.message || "Login gagal");
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A3660] relative overflow-hidden p-4">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20"
        >
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-[#0A3660] rounded-2xl flex items-center justify-center shadow-xl mb-4">
              <i className="bx bxs-buildings text-3xl text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Login <span className="text-[#0A3660]">Admin</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              Lan Sena E-Sertifikat System
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="login-error"
              className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="username-input"
                className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest"
              >
                Username
              </label>
              <div className="relative">
                <i className="bx bx-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  id="username-input"
                  type="text"
                  autoComplete="username"
                  className="w-full bg-slate-50 pl-12 pr-4 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3660]/10 font-bold text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password-input"
                className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest"
              >
                Password
              </label>
              <div className="relative">
                <i className="bx bx-lock-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full bg-slate-50 pl-12 pr-12 py-4 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3660]/10 font-bold text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <i className={`bx ${showPassword ? "bx-hide" : "bx-show"} text-xl`} />
                </button>
              </div>
            </div>

            <button
              id="login-button"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A3660] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/30 active:scale-95 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Masuk Sistem"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-8 text-center text-white/50 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Lan Sena Jaya All Right Reserved.
          </p>
          <div className="flex justify-center items-center gap-4 text-[9px] font-black uppercase tracking-widest">
            <span className="hover:text-emerald-400 transition-colors cursor-default">
              Privacy Policy
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="hover:text-emerald-400 transition-colors cursor-default">
              Support Center
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
