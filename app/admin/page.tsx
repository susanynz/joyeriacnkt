"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetOrders, adminGetProducts } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", PREPARING: "Preparando",
  SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-600", CONFIRMED: "bg-green-100 text-green-700",
  PREPARING: "bg-yellow-100 text-yellow-700", SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-stone-100 text-stone-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false); // ← esperamos al cliente

  useEffect(() => {
    // Solo corre en el cliente — localStorage existe aquí
    setReady(true);
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    Promise.all([adminGetOrders(token), adminGetProducts(token)])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.replace("/admin/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // No renderizar nada hasta que el cliente esté listo
  if (!ready || loading) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const activeOrders = orders.filter(o => ["CONFIRMED", "PREPARING", "SHIPPED"].includes(o.status));
  const lowStock = products.filter(p => p.stock <= 2 && p.isActive);
  const totalCnkt = orders
    .filter(o => o.paymentToken === "CNKT+")
    .reduce((s: number, o: any) => s + o.amountToken, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-medium">✦ Nice Joyería · Admin</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-stone-400 hover:text-white text-sm transition-colors">
            Ver tienda ↗
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              router.replace("/admin/login");
            }}
            className="text-stone-400 hover:text-red-400 text-sm transition-colors">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-stone-800">Dashboard</h1>
          <p className="text-stone-400 text-sm">Panel de gestión de Nice Joyería</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pedidos hoy", value: todayOrders.length, sub: "nuevos" },
            { label: "En proceso", value: activeOrders.length, sub: "activos" },
            { label: "Total CNKT+", value: totalCnkt.toLocaleString(), sub: "recibidos" },
            { label: "Stock bajo", value: lowStock.length, sub: "productos", alert: lowStock.length > 0 },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl p-5 border border-stone-100">
              <p className="text-xs text-stone-400 mb-1">{m.label}</p>
              <p className={`text-2xl font-semibold ${m.alert ? "text-red-500" : "text-stone-800"}`}>
                {m.value}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Gestionar pedidos", href: "/admin/pedidos", icon: "📦" },
            { label: "Productos", href: "/admin/productos", icon: "💎" },
            { label: "Categorías", href: "/admin/categorias", icon: "🗂️" },
            { label: "Configuración", href: "/admin/configuracion", icon: "⚙️" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="bg-white rounded-xl p-4 border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all flex items-center gap-3">
              <span className="text-xl">{link.icon}</span>
              <span className="text-sm font-medium text-stone-700">{link.label}</span>
              <span className="ml-auto text-stone-300 text-xs">→</span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-medium text-stone-800">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-xs text-amber-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">#</th>
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Wallet</th>
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Token</th>
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Total</th>
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">País</th>
                  <th className="px-5 py-3 text-left text-xs text-stone-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order: any) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 text-stone-500">#{order.id}</td>
                    <td className="px-5 py-3 font-mono text-xs text-stone-500">
                      {order.buyerWallet.slice(0, 6)}...{order.buyerWallet.slice(-4)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-medium text-xs ${order.paymentToken === "CNKT+" ? "text-amber-700" : "text-green-700"}`}>
                        {order.paymentToken}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-700">${order.totalUsd.toFixed(2)} USD</td>
                    <td className="px-5 py-3">{order.shippingCountry === "MX" ? "🇲🇽" : "🇺🇸"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400 text-sm">
                      Sin pedidos aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
