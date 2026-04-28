const CNKT_PRICE_USD = parseFloat(process.env.CNKT_PRICE_USD || "0.05");
const MXN_FALLBACK = parseFloat(process.env.MXN_TO_USD_FALLBACK || "0.058");

export async function getMxnRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const data = await res.json();
    return 1 / data.rates.MXN;
  } catch { return MXN_FALLBACK; }
}

export async function getCnktPrice(): Promise<number> {
  try {
    const addr = process.env.CNKT_TOKEN_ADDRESS;
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${addr}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    if (data[addr!.toLowerCase()]?.usd) return data[addr!.toLowerCase()].usd;
  } catch {}
  return CNKT_PRICE_USD;
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
