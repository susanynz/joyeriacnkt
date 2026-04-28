import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";

const CATEGORIES = [
  { slug: "todos", label: "Todos" },
  { slug: "anillos", label: "Anillos" },
  { slug: "collares", label: "Collares" },
  { slug: "aretes", label: "Aretes" },
  { slug: "pulseras", label: "Pulseras" },
];

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const category = searchParams.categoria !== "todos" ? searchParams.categoria : undefined;
  const products = await getProducts(category).catch(() => []);

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="text-xs text-amber-700 uppercase tracking-widest mb-2">Colección</p>
          <h1 className="text-3xl font-light text-stone-800">Todas las piezas</h1>
          <p className="text-stone-500 text-sm mt-1">
            {products.length} {products.length === 1 ? "pieza disponible" : "piezas disponibles"}
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => {
            const isActive = (!searchParams.categoria && cat.slug === "todos") ||
              searchParams.categoria === cat.slug;
            return (
              <a key={cat.slug}
                href={cat.slug === "todos" ? "/productos" : `/productos?categoria=${cat.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${isActive
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-700"}`}>
                {cat.label}
              </a>
            );
          })}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-stone-400">
            <p className="text-4xl mb-4">💎</p>
            <p className="text-sm">No hay productos en esta categoría</p>
            <a href="/productos" className="text-amber-700 text-sm hover:underline mt-2 inline-block">
              Ver todos →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
