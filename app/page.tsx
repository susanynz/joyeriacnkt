import Link from "next/link";
import { getProducts, getStoreConfig } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const [config, products] = await Promise.all([
    getStoreConfig().catch(() => ({ name: "Nice Joyería", heroTitle: null, heroSubtitle: null })),
    getProducts().catch(() => []),
  ]);

  const featured = products.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo */}
        <div className="absolute inset-0 bg-stone-900">
          {config.heroImageUrl ? (
            <img src={config.heroImageUrl} alt="portada" className="w-full h-full object-cover opacity-40"/>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900"/>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-900/80"/>
        </div>

        {/* Partículas decorativas */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl"/>

        {/* Contenido */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
            <span className="text-white/80 text-xs">Joyería exclusiva · Polygon</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-4 tracking-wide">
            {config.heroTitle || (
              <>Belleza que <span className="text-amber-400 font-normal italic">perdura</span></>
            )}
          </h1>

          <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            {config.heroSubtitle || "Piezas únicas de joyería. Paga con CNKT+ o USDT directo desde tu wallet."}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/productos"
              className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-amber-700/30">
              Ver colección
            </Link>
            <Link href="/nosotros"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3.5 rounded-full font-medium text-sm border border-white/20 transition-all">
              Conocer más
            </Link>
          </div>

          {/* Tokens */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {[["CNKT+", "#7C3AED"], ["USDT", "#059669"], ["Polygon", "#8247E5"]].map(([token, color]) => (
              <div key={token} className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>
                <span className="text-white/70 text-xs">{token}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs">Ver productos</span>
          <div className="w-4 h-4 border-r border-b border-white/30 rotate-45"/>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-amber-700 uppercase tracking-widest mb-2">Colección</p>
            <h2 className="text-3xl font-light text-stone-800">Piezas destacadas</h2>
          </div>
          <Link href="/productos" className="text-sm text-stone-500 hover:text-amber-700 transition-colors">
            Ver todo →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((product: any) => (
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-4">💎</p>
            <p>Pronto habrá productos disponibles</p>
          </div>
        )}
      </section>

      {/* BANNER CRYPTO */}
      <section className="bg-stone-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-amber-400 uppercase tracking-widest mb-4">Pagos Web3</p>
          <h3 className="text-2xl font-light text-white mb-4">
            Compra con tu wallet, sin intermediarios
          </h3>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            Aceptamos CNKT+ y USDT en Polygon. Cada transacción se verifica on-chain automáticamente.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {["CNKT+ (Polygon)", "USDT (Polygon)", "Verificación on-chain", "Envíos MX y USA"].map(feat => (
              <div key={feat} className="flex items-center gap-2 text-stone-300 text-sm">
                <span className="text-amber-500">✦</span>{feat}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
