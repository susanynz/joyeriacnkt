"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Si ya tiene token válido, redirigir al dashboard
    const token = localStorage.getItem("admin_token");
    if (token) {
      router.replace("/admin");
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleLogin = async () => {
    if (!secret) return setError("Ingresa la clave");
    setLoading(true);
    setError("");
    try {
      const { token } = await adminLogin(secret);
      localStorage.setItem("admin_token", token);
      router.replace("/admin");
    } catch {
      setError("Clave incorrecta");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-white">✦ Nice Joyería</h1>
          <p className="text-stone-400 text-sm mt-1">Panel de administración</p>
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-stone-800">Acceso</h2>
          <div>
            <label className="text-xs text-stone-500 block mb-1.5">Clave secreta</label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="••••••••••••"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-amber-800 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors">
            {loading ? "Verificando..." : "Entrar al panel"}
          </button>
        </div>
      </div>
    </div>
  );
}
