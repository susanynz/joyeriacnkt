"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProduct, getProductPrices } from "@/lib/api";

export default function ProductoPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [prices, setPrices] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getProduct(Number(id)).then(p => {
      setProduct(p);
      if (p.availableColors?.[0]) setSelectedColor(p.availableColors[0]);
    }).catch(() => {});
    getProductPrices(Number(id)).then(setPrices).catch(() => {});
  }, [id]);

  if (!product) return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-stone-400">
      Cargando...
    </div>
  );

  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-8">
          <Link href="/" className="hover:text-amber-700">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-amber-700">Productos</Link>
          <span>/</span>
          <span className="text-stone-600">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* Galería */}
          <div className="space-y-3">
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
              {allImages[mainImg] ? (
                <img src={allImages[mainImg]} alt={product.name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">💎</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img: string, i: number) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${mainImg === i ? "border-amber-600" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {product.category && (
              <p className="text-xs text-amber-700 uppercase tracking-widest">{product.category.name}</p>
            )}
            <div>
              <h1 className="text-2xl font-light text-stone-800">{product.name}</h1>
              {product.subtitle && <p className="text-stone-500 text-sm mt-1">{product.subtitle}</p>}
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.ribbon && (
                <span className="bg-amber-700 text-white text-xs px-3 py-1 rounded-full">{product.ribbon}</span>
              )}
              {product.stock <= 2 && (
                <span className="bg-red-50 text-red-600 border border-red-100 text-xs px-3 py-1 rounded-full">
                  ¡Últimas {product.stock} piezas!
                </span>
              )}
              {product.material && (
                <span className="bg-stone-100 text-stone-600 text-xs px-3 py-1 rounded-full">{product.material}</span>
              )}
            </div>

            {/* Precios */}
            <div className="bg-stone-50 rounded-xl p-4 space-y-2">
              <p className="text-2xl font-semibold text-stone-800">
                ${product.priceMxn.toLocaleString()} MXN
              </p>
              <p className="text-stone-400 text-sm">${product.priceUsd.toFixed(2)} USD</p>
              {prices && (
                <div className="pt-2 border-t border-stone-200 flex gap-4 text-sm">
                  <div>
                    <span className="text-stone-400 text-xs">CNKT+</span>
                    <p className="text-amber-700 font-medium">{prices.cnkt.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 text-xs">USDT</span>
                    <p className="text-green-700 font-medium">{prices.usdt.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>

            {/* Colores */}
            {product.availableColors?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Material / Color</p>
                <div className="flex gap-2 flex-wrap">
                  {product.availableColors.map((color: string) => (
                    <button key={color} onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 rounded-full text-sm border transition-all ${selectedColor === color
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Cantidad</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors">−</button>
                  <span className="w-10 text-center text-sm font-medium">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors">+</button>
                </div>
                <span className="text-xs text-stone-400">{product.stock} disponibles</span>
              </div>
            </div>

            <button onClick={handleAdd}
              className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${added
                ? "bg-green-600 text-white"
                : "bg-stone-900 hover:bg-amber-800 text-white"}`}>
              {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
            </button>

            {product.descriptionLong && (
              <div className="border-t border-stone-100 pt-4">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Detalles</p>
                <p className="text-sm text-stone-600 leading-relaxed">{product.descriptionLong}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600"/>
              Pago verificado en Polygon · Envíos a México y USA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
