"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminUpdateStock, adminGetCategories } from "@/lib/api";

export default function AdminProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "", subtitle: "", ribbon: "", description: "", descriptionLong: "",
    priceUsd: "", priceMxn: "", discountPrice: "", sku: "", weightGr: "",
    material: "", stock: "2", categoryId: "", imageUrl: "",
    availableColors: ["Oro", "Plata", "Oro rosa"],
    isActive: true,
  });

  useEffect(() => {
    setReady(true);
    const t = localStorage.getItem("admin_token");
    if (!t) { router.push("/admin/login"); return; }
    setToken(t);
    Promise.all([adminGetProducts(t), adminGetCategories(t)])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleColor = (color: string) =>
    setForm(p => ({
      ...p,
      availableColors: p.availableColors.includes(color)
        ? p.availableColors.filter(c => c !== color)
        : [...p.availableColors, color],
    }));

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        priceUsd: parseFloat(form.priceUsd),
        priceMxn: parseFloat(form.priceMxn),
        stock: parseInt(form.stock),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        weightGr: form.weightGr ? parseFloat(form.weightGr) : null,
      };
      if (editingId) {
        await adminUpdateProduct(token, editingId, data);
      } else {
        await adminCreateProduct(token, data);
      }
      const updated = await adminGetProducts(token);
      setProducts(updated);
      setShowForm(false);
      setEditingId(null);
      resetForm();
    } catch (err: any) { alert(err.message); }
  };

  const resetForm = () => setForm({
    name: "", subtitle: "", ribbon: "", description: "", descriptionLong: "",
    priceUsd: "", priceMxn: "", discountPrice: "", sku: "", weightGr: "",
    material: "", stock: "2", categoryId: "", imageUrl: "",
    availableColors: ["Oro", "Plata", "Oro rosa"], isActive: true,
  });

  const handleEdit = (p: any) => {
    setForm({
      name: p.name, subtitle: p.subtitle || "", ribbon: p.ribbon || "",
      description: p.description, descriptionLong: p.descriptionLong || "",
      priceUsd: String(p.priceUsd), priceMxn: String(p.priceMxn),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      sku: p.sku || "", weightGr: p.weightGr ? String(p.weightGr) : "",
      material: p.material || "", stock: String(p.stock),
      categoryId: p.categoryId ? String(p.categoryId) : "",
      imageUrl: p.imageUrl || "",
      availableColors: p.availableColors || ["Oro", "Plata", "Oro rosa"],
      isActive: p.isActive,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const COLORS = ["Oro", "Plata", "Oro rosa", "Bronce", "Negro", "Multicolor"];

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-stone-400 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-white font-medium">Productos</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-stone-800">Productos</h1>
            <p className="text-stone-400 text-sm">{products.length} productos · stock inicial 2 piezas c/u</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="bg-stone-900 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            + Nuevo producto
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
            <h2 className="text-lg font-medium text-stone-800 mb-5">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">Nombre *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Anillo Solitario Oro 14k"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Subtítulo</label>
                <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Ej. Oro 14k · Talla 7"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Ribbon / Badge</label>
                <input name="ribbon" value={form.ribbon} onChange={handleChange} placeholder="NUEVO · ÚLTIMA PIEZA · OFERTA"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Material</label>
                <input name="material" value={form.material} onChange={handleChange} placeholder="Oro 14k · Plata 925"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Categoría</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50">
                  <option value="">Sin categoría</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">Descripción corta *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  placeholder="Aparece en la tarjeta del catálogo..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50 resize-none"/>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">Descripción detallada</label>
                <textarea name="descriptionLong" value={form.descriptionLong} onChange={handleChange} rows={3}
                  placeholder="Materiales, talla, peso, detalles de fabricación..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50 resize-none"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Precio MXN *</label>
                <input name="priceMxn" value={form.priceMxn} onChange={handleChange} type="number" placeholder="1200"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Precio USD *</label>
                <input name="priceUsd" value={form.priceUsd} onChange={handleChange} type="number" placeholder="60"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Precio con descuento MXN</label>
                <input name="discountPrice" value={form.discountPrice} onChange={handleChange} type="number" placeholder="Opcional"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Stock</label>
                <input name="stock" value={form.stock} onChange={handleChange} type="number" min="0"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="NJ-001"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Peso (gramos)</label>
                <input name="weightGr" value={form.weightGr} onChange={handleChange} type="number" placeholder="5.2"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">URL imagen principal</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-stone-500 block mb-2">Colores / Materiales disponibles</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => toggleColor(c)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.availableColors.includes(c)
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 text-sm border border-stone-200 rounded-xl text-stone-600 hover:border-stone-300 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit}
                className="px-6 py-2 text-sm bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-medium transition-colors">
                {editingId ? "Guardar cambios" : "Publicar producto"}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Producto</th>
                <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Precio</th>
                <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Stock</th>
                <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Status</th>
                <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-stone-400">Cargando...</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-stone-800">{p.name}</p>
                    {p.category && <p className="text-xs text-amber-700">{p.category.name}</p>}
                    {p.material && <p className="text-xs text-stone-400">{p.material}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-stone-700">${p.priceMxn.toLocaleString()} MXN</p>
                    <p className="text-xs text-stone-400">${p.priceUsd} USD</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${p.stock <= 2 ? "text-red-500" : "text-stone-700"}`}>{p.stock}</span>
                    {p.stock <= 2 && <span className="text-xs text-red-400 ml-1">bajo</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {p.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleEdit(p)}
                      className="text-xs text-amber-700 hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-stone-400 text-sm">Sin productos aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
