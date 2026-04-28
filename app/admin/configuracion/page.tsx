"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoreConfig, adminUpdateConfig } from "@/lib/api";

export default function AdminConfigPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState({
    name: "Nice Joyería",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    mission: "",
    history: "",
    shippingMxMxn: 180,
    shippingUsDollars: 0,
    socials: { telegram: "", instagram: "", tiktok: "", facebook: "", twitter: "" },
  });

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin/login"); return; }
    setToken(t);
    getStoreConfig().then((data: any) => {
      setConfig(prev => ({
        ...prev, ...data,
        socials: { telegram: "", instagram: "", tiktok: "", facebook: "", twitter: "", ...(data.socials || {}) },
      }));
    }).catch(() => {});
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminUpdateConfig(token, config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert("Error al guardar"); }
    finally { setSaving(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setConfig(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setConfig(p => ({ ...p, socials: { ...p.socials, [e.target.name]: e.target.value } }));

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-stone-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-white font-medium">Configuración</span>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${saved
            ? "bg-green-600 text-white" : "bg-amber-700 hover:bg-amber-600 text-white disabled:opacity-50"}`}>
          {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Homepage */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Portada (Homepage)</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Frase principal</label>
              <input name="heroTitle" value={config.heroTitle} onChange={handleChange}
                placeholder="Belleza que perdura..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Subtítulo</label>
              <input name="heroSubtitle" value={config.heroSubtitle} onChange={handleChange}
                placeholder="Piezas únicas de joyería con pagos en CNKT+..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">URL imagen de fondo</label>
              <input name="heroImageUrl" value={config.heroImageUrl} onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            </div>
          </div>
        </div>

        {/* Nosotros */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Página Nosotros</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Misión</label>
              <textarea name="mission" value={config.mission} onChange={handleChange} rows={2}
                placeholder="Una o dos frases que definen la esencia de Nice Joyería..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50 resize-none"/>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Historia</label>
              <textarea name="history" value={config.history} onChange={handleChange} rows={4}
                placeholder="Cuéntale a tus clientes el origen de Nice Joyería..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50 resize-none"/>
            </div>
          </div>
        </div>

        {/* Envíos */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Costos de envío</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 block mb-1">México (MXN)</label>
              <input type="number" name="shippingMxMxn" value={config.shippingMxMxn}
                onChange={e => setConfig(p => ({ ...p, shippingMxMxn: parseFloat(e.target.value) }))}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">USA (USD)</label>
              <input type="number" name="shippingUsDollars" value={config.shippingUsDollars}
                onChange={e => setConfig(p => ({ ...p, shippingUsDollars: parseFloat(e.target.value) }))}
                placeholder="0 = por definir"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-medium text-stone-800 mb-4">Redes sociales</h2>
          <div className="space-y-3">
            {[
              ["telegram", "✈️ Telegram", "https://t.me/nicejoyeria"],
              ["instagram", "📸 Instagram", "https://instagram.com/nicejoyeria"],
              ["tiktok", "🎵 TikTok", "https://tiktok.com/@nicejoyeria"],
              ["facebook", "💙 Facebook", "https://facebook.com/nicejoyeria"],
              ["twitter", "🐦 Twitter / X", "https://twitter.com/nicejoyeria"],
            ].map(([name, label, ph]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm w-28 text-stone-500">{label}</span>
                <input name={name} value={(config.socials as any)[name]} onChange={handleSocialChange}
                  placeholder={ph}
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">Los campos vacíos no se mostrarán en la tienda.</p>
        </div>

      </div>
    </div>
  );
}
