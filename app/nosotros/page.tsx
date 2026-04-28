import { getStoreConfig } from "@/lib/api";
import Link from "next/link";

export default async function NosotrosPage() {
  const config = await getStoreConfig().catch(() => ({
    name: "Nice Joyería",
    mission: null,
    history: null,
    timeline: null,
    values: null,
    socials: null,
  }));

  const timeline = config.timeline || [
    { year: "2024", title: "El origen", description: "Nació la idea de crear joyería de calidad accesible a través de Web3." },
    { year: "2024", title: "Primera colección", description: "Lanzamos nuestra primera colección de 25 piezas únicas." },
    { year: "2025", title: "Pagos Web3", description: "Integramos CNKT+ y USDT en Polygon para pagos descentralizados." },
  ];

  const values = config.values || [
    { icon: "✦", name: "Exclusividad", description: "Piezas únicas con stock limitado. Cada joya es especial." },
    { icon: "🔗", name: "Transparencia", description: "Cada transacción verificada on-chain. Sin intermediarios." },
    { icon: "🌿", name: "Calidad", description: "Materiales premium seleccionados con cuidado y dedicación." },
  ];

  const socials = config.socials || {};

  const SOCIAL_ICONS: Record<string, string> = {
    telegram: "✈️", instagram: "📸", facebook: "💙", tiktok: "🎵", twitter: "🐦", youtube: "▶️",
  };

  const activeSocials = Object.entries(socials).filter(([, val]) => val);

  return (
    <div className="min-h-screen bg-stone-50 pt-20">

      {/* Hero */}
      <section className="bg-stone-900 py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/50 to-stone-900"/>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl"/>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
            <span className="text-white/70 text-xs">Nuestra historia</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-4 leading-tight">
            Somos <span className="text-amber-400 italic">Nice Joyería</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            {config.mission || "Creamos joyería exclusiva que combina tradición artesanal con pagos del futuro."}
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs text-amber-700 uppercase tracking-widest mb-2">Historia</p>
        <h2 className="text-2xl font-light text-stone-800 mb-4">Nuestro camino</h2>
        {config.history && <p className="text-stone-600 text-sm leading-relaxed mb-8">{config.history}</p>}

        <div className="space-y-0">
          {timeline.map((item: any, i: number) => (
            <div key={i} className="flex gap-6 relative">
              {i < timeline.length - 1 && (
                <div className="absolute left-[27px] top-8 bottom-0 w-px bg-stone-200"/>
              )}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-14 text-right">
                  <span className="text-xs font-medium text-amber-700">{item.year}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-8">
                <div className="w-3 h-3 rounded-full bg-amber-600 mt-1 flex-shrink-0 shadow-sm shadow-amber-600/30"/>
                <div>
                  <h3 className="text-sm font-medium text-stone-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="bg-white border-y border-stone-100 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-amber-700 uppercase tracking-widest mb-2 text-center">Valores</p>
          <h2 className="text-2xl font-light text-stone-800 mb-10 text-center">En qué creemos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v: any, i: number) => (
              <div key={i} className="text-center p-6 rounded-2xl border border-stone-100 hover:border-amber-200 transition-colors">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">{v.icon}</div>
                <h3 className="font-medium text-stone-800 mb-2">{v.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redes sociales */}
      {activeSocials.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-xs text-amber-700 uppercase tracking-widest mb-2">Comunidad</p>
          <h2 className="text-2xl font-light text-stone-800 mb-8">Encuéntranos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeSocials.map(([platform, handle]) => (
              <a key={platform} href={String(handle)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100 hover:border-amber-200 hover:shadow-sm transition-all">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-lg">
                  {SOCIAL_ICONS[platform] || "🔗"}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700 capitalize">{platform}</p>
                  <p className="text-xs text-stone-400 truncate max-w-[120px]">{String(handle)}</p>
                </div>
                <span className="ml-auto text-stone-300 text-xs">↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-stone-900 py-16 px-6 text-center">
        <h3 className="text-2xl font-light text-white mb-3">¿Lista para llevar una pieza?</h3>
        <p className="text-stone-400 text-sm mb-8">Cada joya está hecha para perdurar.</p>
        <Link href="/productos"
          className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded-full text-sm font-medium transition-all">
          Ver colección →
        </Link>
      </section>
    </div>
  );
}
