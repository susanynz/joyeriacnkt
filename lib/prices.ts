const MXN_FALLBACK = parseFloat(process.env.MXN_TO_USD_FALLBACK || "0.058");
const CNKT_FALLBACK = parseFloat(process.env.CNKT_PRICE_USD || "0.05");

// Dirección CNKT+ en Polygon
const CNKT_ADDRESS = "0x87bdfbe98ba55104701b2f2e999982a317905637";

export async function getMxnRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 }, // cache 1 hora
    });
    const data = await res.json();
    return 1 / data.rates.MXN;
  } catch {
    return MXN_FALLBACK;
  }
}

export async function getCnktPrice(): Promise<number> {
  // Intentar GeckoTerminal primero (gratuito, sin API key)
  try {
    const res = await fetch(
      `https://api.geckoterminal.com/api/v2/simple/networks/polygon_pos/token_price/${CNKT_ADDRESS}`,
      {
        headers: { Accept: "application/json;version=20230302" },
        next: { revalidate: 60 }, // cache 1 minuto
      }
    );
    const data = await res.json();
    const price = data?.data?.attributes?.token_prices?.[CNKT_ADDRESS.toLowerCase()];
    if (price && parseFloat(price) > 0) {
      return parseFloat(price);
    }
  } catch {}

  // Fallback: CoinGecko
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${CNKT_ADDRESS}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const price = data?.[CNKT_ADDRESS.toLowerCase()]?.usd;
    if (price && price > 0) return price;
  } catch {}

  // Último fallback: precio configurado en env
  return CNKT_FALLBACK;
}

export async function getCheckoutPrices(priceUsd: number) {
  const [mxnRate, cnktPrice] = await Promise.all([getMxnRate(), getCnktPrice()]);
  return {
    usd: Math.round(priceUsd * 100) / 100,
    mxn: Math.round((priceUsd / mxnRate) * 100) / 100,
    cnkt: Math.round((priceUsd / cnktPrice) * 10000) / 10000,
    usdt: Math.round(priceUsd * 100) / 100,
    cnktPriceUsd: cnktPrice,
    mxnUsdRate: mxnRate,
  };
}
