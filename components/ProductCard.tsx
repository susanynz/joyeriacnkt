"use client";

import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  subtitle?: string;
  ribbon?: string;
  description: string;
  priceUsd: number;
  priceMxn: number;
  discountPrice?: number;
  stock: number;
  imageUrl?: string;
  availableColors: string[];
  category?: { name: string; slug: string };
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
  const isLowStock = product.stock <= 2 && product.stock > 0;
  const stockPct = Math.min(100, (product.stock / 5) * 100);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-amber-200 hover:shadow-md transition-all duration-200 group">

      {/* Imagen */}
      <Link href={`/producto/${product.id}`}>
        <div className="relative h-52 bg-stone-50 overflow-hidden">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">💎</div>
          )}
          {product.ribbon && (
            <div className="absolute top-3 left-3 bg-amber-700 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {product.ribbon}
            </div>
          )}
          {isLowStock && (
            <div className="absolute top-3 right-3 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full border border-red-100">
              ¡Últimas {product.stock}!
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <p className="text-xs text-amber-700 uppercase tracking-wider mb-1">{product.category.name}</p>
        )}

        <Link href={`/producto/${product.id}`}>
          <h3 className="font-medium text-stone-800 hover:text-amber-700 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.subtitle && (
          <p className="text-xs text-stone-500 mt-0.5">{product.subtitle}</p>
        )}

        {/* Barra stock — solo si quedan pocas piezas */}
        {isLowStock && (
          <div className="mt-2 mb-2">
            <div className="w-full h-1 bg-stone-100 rounded-full">
              <div className="h-1 bg-red-400 rounded-full transition-all" style={{ width: `${stockPct}%` }}/>
            </div>
          </div>
        )}

        {/* Colores */}
        {product.availableColors?.length > 0 && (
          <div className="flex gap-1.5 mt-2 mb-3">
            {product.availableColors.map(color => (
              <span key={color} className="text-xs text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">
                {color}
              </span>
            ))}
          </div>
        )}

        {/* Precios */}
        <div className="mt-2 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-stone-800">${product.priceMxn.toLocaleString()} MXN</span>
            {product.discountPrice && (
              <span className="text-sm text-stone-400 line-through">${(product.priceMxn * 1.2).toLocaleString()}</span>
            )}
          </div>
          <p className="text-xs text-stone-400">${product.priceUsd.toFixed(2)} USD</p>
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          className="w-full bg-stone-900 hover:bg-amber-800 text-white text-sm py-2.5 rounded-xl font-medium transition-colors duration-200">
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
