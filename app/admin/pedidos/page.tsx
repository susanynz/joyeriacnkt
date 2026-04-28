"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetOrders, adminGetOrderAddress, adminUpdateOrderStatus } from "@/lib/api";

const STATUSES = ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", PREPARING: "Preparando",
  SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-600", CONFIRMED: "bg-green-100 text-green-700",
  PREPARING: "bg-yellow-100 text-yellow-700", SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-stone-100 text-stone-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminPedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [expandedAddress, setExpandedAddress] = useState<Record<number, any>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    setReady(true);
    const t = localStorage.getItem("admin_token");
    if (!t) { router.replace("/admin/login"); return; }
    setToken(t);
    adminGetOrders(t)
      .then(setOrders)
      .catch(() => { localStorage.removeItem("admin_token"); router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleViewAddress = async (orderId: number) => {
    if (expandedAddress[orderId]) {
      setExpandedAddress(p => { const n = { ...p }; delete n[orderId]; return n; });
      return;
    }
    try {
      const { shippingAddress } = await adminGetOrderAddress(token, orderId);
      setExpandedAddress(p => ({ ...p, [orderId]: shippingAddress }));
    } catch { alert("Error al obtener dirección"); }
  };

  const handleUpdateStatus = async (orderId: number, status: string, trackingNumber?: string) => {
    setUpdatingId(orderId);
    try {
      await adminUpdateOrderStatus(token, orderId, { status, trackingNumber });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, trackingNumber: trackingNumber || o.trackingNumber } : o));
    } catch { alert("Error al actualizar"); }
    finally { setUpdatingId(null); }
  };

  if (!ready || loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const filtered = orders.filter(o =>
    (!filterStatus || o.status === filterStatus) &&
    (!filterCountry || o.shippingCountry === filterCountry)
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-stone-900 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-stone-400 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-white font-medium">Pedidos</span>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-stone-800">Pedidos</h1>
            <p className="text-stone-400 text-sm">{filtered.length} pedidos</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap mb-6">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-stone-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-amber-400">
            <option value="">Todos los status</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            className="border border-stone-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-amber-400">
            <option value="">Todos los países</option>
            <option value="MX">🇲🇽 México</option>
            <option value="US">🇺🇸 USA</option>
          </select>
        </div>
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-stone-800">Pedido #{order.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString("es-MX")}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono mb-2">{order.buyerWallet}</div>
                  <div className="flex gap-4 text-sm">
                    <span className={`font-medium ${order.paymentToken === "CNKT+" ? "text-amber-700" : "text-green-700"}`}>
                      {order.amountToken?.toLocaleString()} {order.paymentToken}
                    </span>
                    <span className="text-stone-500">${order.totalUsd?.toFixed(2)} USD</span>
                    <span>{order.shippingCountry === "MX" ? "🇲🇽 México" : "🇺🇸 USA"}</span>
                  </div>
                  {order.trackingNumber && (
                    <p className="text-xs text-blue-600 mt-1">Guía: {order.trackingNumber}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleViewAddress(order.id)}
                    className="text-xs border border-stone-200 hover:border-amber-400 hover:text-amber-700 text-stone-500 px-3 py-1.5 rounded-lg transition-colors">
                    {expandedAddress[order.id] ? "Ocultar dirección" : "Ver dirección"}
                  </button>
                  <a href={`https://polygonscan.com/tx/${order.txHash}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs border border-stone-200 hover:border-amber-400 hover:text-amber-700 text-stone-500 px-3 py-1.5 rounded-lg transition-colors text-center">
                    Polygonscan ↗
                  </a>
                </div>
              </div>
              {expandedAddress[order.id] && (
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-sm text-stone-700">
                  <p className="font-medium mb-1 text-amber-800">📍 Dirección de envío</p>
                  <p>{expandedAddress[order.id].full_name}</p>
                  <p>{expandedAddress[order.id].street}</p>
                  <p>{expandedAddress[order.id].city}, {expandedAddress[order.id].state} {expandedAddress[order.id].zip_code}</p>
                  <p>{expandedAddress[order.id].country === "MX" ? "México" : "Estados Unidos"}</p>
                  <p className="text-stone-500">Tel: {expandedAddress[order.id].phone}</p>
                </div>
              )}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-stone-400">Cambiar a:</span>
                {STATUSES.filter(s => s !== order.status).map(s => (
                  <button key={s} disabled={updatingId === order.id}
                    onClick={() => {
                      if (s === "SHIPPED") {
                        const tracking = prompt("Número de guía (opcional):");
                        handleUpdateStatus(order.id, s, tracking || undefined);
                      } else {
                        handleUpdateStatus(order.id, s);
                      }
                    }}
                    className="text-xs border border-stone-200 hover:border-amber-400 hover:text-amber-700 text-stone-500 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-400 text-sm">Sin pedidos con este filtro</div>
          )}
        </div>
      </div>
    </div>
  );
}
