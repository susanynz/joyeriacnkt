// MySQL no tiene tipo Array nativo.
// Estos helpers convierten entre arrays de JS y strings JSON para MySQL.

export function toJsonString(arr: string[] | null | undefined): string | null {
  if (!arr || arr.length === 0) return null;
  return JSON.stringify(arr);
}

export function fromJsonString(str: string | null | undefined): string[] {
  if (!str) return [];
  try { return JSON.parse(str); }
  catch { return []; }
}

// Convierte un producto de DB (strings JSON) a objeto con arrays reales
export function parseProduct(product: any) {
  return {
    ...product,
    imageUrls: fromJsonString(product.imageUrls),
    availableSizes: fromJsonString(product.availableSizes),
    availableColors: fromJsonString(product.availableColors),
  };
}

// Convierte una categoría de DB (strings JSON) a objeto con arrays reales
export function parseCategory(category: any) {
  return {
    ...category,
    sizes: fromJsonString(category.sizes),
    colors: fromJsonString(category.colors),
  };
}
