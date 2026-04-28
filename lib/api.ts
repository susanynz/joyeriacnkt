const base = "/api";

async function req(path: string, options?: RequestInit) {
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error del servidor" }));
    throw new Error(err.error || "Error desconocido");
  }
  return res.json();
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

// Productos
export const getProducts = (category?: string) =>
  req(`/products${category ? `?category=${category}` : ""}`);
export const getProduct = (id: number) => req(`/products/${id}`);
export const getProductPrices = (id: number) => req(`/products/${id}/prices`);

// Órdenes
export const createOrder = (data: object) =>
  req("/orders", { method: "POST", body: JSON.stringify(data) });
export const getMyOrders = (wallet: string) => req(`/orders/my/${wallet}`);

// Config
export const getStoreConfig = () => req("/config");

// Admin
export const adminLogin = (secret: string) =>
  req("/admin/login", { method: "POST", body: JSON.stringify({ secret }) });
export const adminGetProducts = (token: string) =>
  req("/products?admin=true", { headers: auth(token) });
export const adminCreateProduct = (token: string, data: object) =>
  req("/products", { method: "POST", headers: auth(token), body: JSON.stringify(data) });
export const adminUpdateProduct = (token: string, id: number, data: object) =>
  req(`/products/${id}`, { method: "PATCH", headers: auth(token), body: JSON.stringify(data) });
export const adminUpdateStock = (token: string, id: number, stock: number) =>
  req(`/products/${id}/stock`, { method: "PATCH", headers: auth(token), body: JSON.stringify({ stock }) });
export const adminGetOrders = (token: string, status?: string) =>
  req(`/orders/admin${status ? `?status=${status}` : ""}`, { headers: auth(token) });
export const adminGetOrderAddress = (token: string, id: number) =>
  req(`/orders/admin/${id}/address`, { headers: auth(token) });
export const adminUpdateOrderStatus = (token: string, id: number, data: object) =>
  req(`/orders/admin/${id}/status`, { method: "PATCH", headers: auth(token), body: JSON.stringify(data) });
export const adminUpdateConfig = (token: string, data: object) =>
  req("/config", { method: "PATCH", headers: auth(token), body: JSON.stringify(data) });
export const adminGetCategories = (token: string) =>
  req("/categories?admin=true", { headers: auth(token) });
export const adminCreateCategory = (token: string, data: object) =>
  req("/categories", { method: "POST", headers: auth(token), body: JSON.stringify(data) });
export const adminUpdateCategory = (token: string, id: number, data: object) =>
  req(`/categories/${id}`, { method: "PATCH", headers: auth(token), body: JSON.stringify(data) });
