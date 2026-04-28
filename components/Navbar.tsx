"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { getMyOrders } from "@/lib/api";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Order {
  id: number;
  txHash: string;
  paymentToken: string;
  amountToken: number;
  totalUsd: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  items: { productName: string; quantity: number; selectedColor?: string }[];
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmado", PREPARING: "Preparando",
  SHIPPED: "Enviado", DELIVERED: "Entregado", CANCELLED: "Cancelado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-stone-100 text-stone-600",
  CONFIRMED: "bg-green-100 text-green-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-stone-100 text-stone-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const ACTIVE_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "SHIPPED"];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "active" | "history">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isConnected && address && panelOpen) {
      getMyOrders(address).then(setOrders).catch(() => {});
    }
  }, [isConnected, address, panelOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isAdmin) return null;

  const navBg = isHome && !scrolled
    ? "bg-transparent"
    : "bg-white border-b border-stone-200 shadow-sm";

  const textColor = isHome && !scrolled ? "text-white" : "text-stone-800";
  const logoColor = isHome && !scrolled ? "text-white" : "text-amber-800";

  const displayedOrders =
    tab === "all" ? orders :
    tab === "active" ? orders.filter(o => ACTIVE_STATUSES.includes(o.status)) :
    orders.filter(o => o.status === "DELIVERED");

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className={`text-lg font-semibold tracking-wide ${logoColor}`}>
          ✦ Nice Joyería
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[["Inicio", "/"], ["Productos", "/productos"], ["Nosotros", "/nosotros"]].map(([label, href]) => (
            <Link key={href} href={href}
              className={`text-sm transition-colors ${pathname === href
                ? "font-medium text-amber-600"
                : `${textColor} hover:text-amber-600 opacity-80 hover:opacity-100`}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Derecha */}
        <div className="flex items-center gap-3" ref={panelRef}>

          {/* Carrito */}
          <Link href="/carrito" className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${textColor}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Cuenta */}
          <div className="relative">
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-all
                ${isHome && !scrolled
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-stone-200 text-stone-700 hover:border-amber-400 bg-white"}`}>
              {isConnected
                ? <><span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"/>
                    <span className="font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</span></>
                : <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>Mi cuenta</>}
            </button>

            {/* Dropdown panel */}
            {panelOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">

                {!isConnected ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/>
                        <path d="M2 10h20"/>
                      </svg>
                    </div>
                    <p className="font-medium text-stone-800 mb-1">Tu cuenta</p>
                    <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                      Conecta tu wallet para ver tus pedidos y estado de envío.
                    </p>
                    <button onClick={() => { open(); setPanelOpen(false); }}
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                      Conectar wallet
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header wallet */}
                    <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-white text-sm">✦</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-stone-700 truncate">{address}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-600"/>
                          <span className="text-xs text-stone-400">Polygon</span>
                        </div>
                      </div>
                      <button onClick={() => disconnect()} className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                        Salir
                      </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-stone-100">
                      {([["all","Todos"], ["active","En curso"], ["history","Entregados"]] as const).map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)}
                          className={`flex-1 py-2 text-xs transition-colors border-b-2 ${tab === id
                            ? "border-amber-600 text-amber-700 font-medium"
                            : "border-transparent text-stone-400 hover:text-stone-600"}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Órdenes */}
                    <div className="max-h-64 overflow-y-auto">
                      {displayedOrders.length === 0 ? (
                        <div className="py-8 text-center text-xs text-stone-400">Sin pedidos aquí</div>
                      ) : displayedOrders.map(order => (
                        <div key={order.id} className="px-4 py-3 border-b border-stone-50 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-stone-700">Pedido #{order.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                              {STATUS_LABEL[order.status]}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mb-1">
                            {order.items.map(i => `${i.productName} ×${i.quantity}`).join(", ")}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-700 font-medium">
                              {order.amountToken.toLocaleString()} {order.paymentToken}
                            </span>
                            <a href={`https://polygonscan.com/tx/${order.txHash}`}
                              target="_blank" rel="noopener noreferrer"
                              className="text-xs text-stone-400 hover:text-amber-600">
                              Ver tx ↗
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-stone-100 text-center">
                      <Link href="/productos" onClick={() => setPanelOpen(false)}
                        className="text-xs text-amber-700 hover:text-amber-800">
                        ← Ver más productos
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
