"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetCategories, adminCreateCategory, adminUpdateCategory } from "@/lib/api";

const COLORS_OPTIONS = ["Oro", "Plata", "Oro rosa", "Bronce", "Negro", "Multicolor"];

export default function AdminCategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", hasSizes: false, hasColors: true,
    sizes: [] as string[], colors: ["Oro", "Plata", "Oro rosa"],
  });

  useEffect(() => {
    setReady(true);
    const t = localStorage.getItem("admin_token");
    if (!t) { router.replace("/admin/login"); return; }
    setToken(t);
    adminGetCategories(t)
      .then(setCategories)
      .catch(() => { localStorage.removeItem("admin_token"); router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  if (!ready || loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await adminUpdateCategory(token, editingId, form);
      } else {
        await adminCreateCategory(token, form);
      }
      const updated = await adminGetCategories(token);
      setCategories(updated);
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", slug: "", hasSizes: false, hasColors: true, sizes: [], colors: ["Oro", "Plata", "Oro rosa"] });
    } catch (err: any) { alert(err.message); }
  };

  const toggleColor = (c: string) =>
    setForm(p => ({ ...p, colors: p.colors.includes(c) ? p.colors.filter(x => x !== c) : [...p.colors, c] }));

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-stone-400 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-white font-medium">Categorías</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-light text-stone-800">Categorías</h1>
          <button onClick={() => setShowForm(true)}
            className="bg-stone-900 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            + Nueva categoría
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6 space-y-4">
            <h2 className="font-medium text-stone-800">{editingId ? "Editar" : "Nueva"} categoría</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
                  placeholder="Anillos"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="anillos"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50 font-mono"/>
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasColors} onChange={e => setForm(p => ({ ...p, hasColors: e.target.checked }))} className="rounded"/>
                <span className="text-sm text-stone-700">Maneja colores / materiales</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.hasSizes} onChange={e => setForm(p => ({ ...p, hasSizes: e.target.checked }))} className="rounded"/>
                <span className="text-sm text-stone-700">Maneja tallas</span>
              </label>
            </div>
            {form.hasColors && (
              <div>
                <label className="text-xs text-stone-500 block mb-2">Colores predeterminados</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleColor(c)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.colors.includes(c) ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-stone-200 rounded-xl text-stone-600">Cancelar</button>
              <button onClick={handleSubmit} className="px-6 py-2 text-sm bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-medium transition-colors">
                {editingId ? "Guardar" : "Crear categoría"}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3 text-lg">💎</div>
              <h3 className="font-medium text-stone-800 mb-1">{cat.name}</h3>
              <p className="text-xs text-stone-400 font-mono mb-2">/{cat.slug}</p>
              <div className="flex gap-1 flex-wrap mb-3">
                {cat.hasColors && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Colores</span>}
                {cat.hasSizes && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Tallas</span>}
                {!cat.hasColors && !cat.hasSizes && <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Sin atributos</span>}
              </div>
              <button onClick={() => { setForm({ name: cat.name, slug: cat.slug, hasSizes: cat.hasSizes, hasColors: cat.hasColors, sizes: cat.sizes || [], colors: cat.colors || [] }); setEditingId(cat.id); setShowForm(true); }}
                className="text-xs text-amber-700 hover:underline">Editar →</button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 text-center py-12 text-stone-400 text-sm">Sin categorías. Crea la primera.</div>
          )}
        </div>
      </div>
    </div>
  );
}
