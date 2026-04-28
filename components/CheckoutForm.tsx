"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { parseUnits } from "viem";
import { polygon } from "wagmi/chains";
import { TOKENS, ERC20_ABI, type TokenKey } from "@/lib/wagmi";
import { createOrder, getProductPrices } from "@/lib/api";

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price_usd: number;
  unit_price_mxn: number;
  selected_color?: string;
  selected_size?: string;
}

interface Props {
  items: CartItem[];
  totalUsd: number;
  totalMxn: number;
  onSuccess: (orderId: number) => void;
}

const STORE_WALLET = process.env.NEXT_PUBLIC_STORE_WALLET as `0x${string}`;
const SHIPPING_MX = 180;

export function CheckoutForm({ items, totalUsd, totalMxn, onSuccess }: Props) {
  const { address, isConnected, chainId } = useAccount();
  const { open } = useWeb3Modal();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const [step, setStep] = useState<"address" | "payment" | "confirming">("address");
  const [selectedToken, setSelectedToken] = useState<TokenKey>("CNKT");
  const [prices, setPrices] = useState<{ cnkt: number; usdt: number } | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);

  const [shipping, setShipping] = useState({
    full_name: "", street: "", city: "", state: "",
    zip_code: "", country: "MX", phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setShipping(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleContinue = async () => {
    const required = ["full_name", "street", "city", "state", "zip_code", "phone"];
    if (required.some(f => !shipping[f as keyof typeof shipping])) {
      return setError("Por favor completa todos los campos");
    }
    setError("");
    setLoadingPrices(true);
    try {
      const priceData = await getProductPrices(items[0].product_id);
      const cnktPerUsd = priceData.cnkt / priceData.usd;
      setPrices({ cnkt: totalUsd * cnktPerUsd, usdt: totalUsd });
      setStep("payment");
    } catch {
      setError("Error al cargar precios. Intenta de nuevo.");
    } finally {
      setLoadingPrices(false);
    }
  };

  const handlePay = async () => {
    if (!prices || !address) return;
    setStep("confirming");
    setError("");
    try {
      const token = TOKENS[selectedToken];
      const amountToken = selectedToken === "CNKT" ? prices.cnkt : prices.usdt;
      const hash = await writeContractAsync({
        address: token.address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [STORE_WALLET, parseUnits(amountToken.toFixed(token.decimals), token.decimals)],
      });
      setTxHash(hash);
      const order = await createOrder({
        buyerWallet: address, txHash: hash, paymentToken: token.symbol,
        amountToken, totalUsd, totalMxn, shipping, items,
      });
      onSuccess(order.id);
    } catch (err: any) {
      setError(err.message || "Error al procesar el pago");
      setStep("payment");
    }
  };

  const shippingCostMxn = shipping.country === "MX" ? SHIPPING_MX : 0;
  const grandTotalMxn = totalMxn + shippingCostMxn;

  const PayButton = () => {
    if (!isConnected) return (
      <button onClick={() => open()} className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-xl font-medium text-sm transition-colors">
        Conectar wallet para pagar
      </button>
    );
    if (chainId !== polygon.id) return (
      <button onClick={() => switchChain({ chainId: polygon.id })} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-medium text-sm transition-colors">
        Cambiar red a Polygon
      </button>
    );
    return (
      <button onClick={handlePay} className="w-full bg-stone-900 hover:bg-amber-800 text-white py-3 rounded-xl font-medium text-sm transition-colors">
        Pagar {selectedToken === "CNKT" ? prices!.cnkt.toFixed(2) : prices!.usdt.toFixed(2)} {TOKENS[selectedToken].symbol}
      </button>
    );
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">

      {step === "address" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Dirección de envío</h2>

          {[
            { name: "full_name", placeholder: "Nombre completo", full: true },
            { name: "street", placeholder: "Calle y número", full: true },
          ].map(f => (
            <input key={f.name} name={f.name} placeholder={f.placeholder}
              value={shipping[f.name as keyof typeof shipping]}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[["city", "Ciudad"], ["state", "Estado"]].map(([name, ph]) => (
              <input key={name} name={name} placeholder={ph}
                value={shipping[name as keyof typeof shipping]}
                onChange={handleChange}
                className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="zip_code" placeholder="C.P." value={shipping.zip_code}
              onChange={handleChange}
              className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>
            <select name="country" value={shipping.country} onChange={handleChange}
              className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50">
              <option value="MX">🇲🇽 México (+$180 MXN)</option>
              <option value="US">🇺🇸 USA (por definir)</option>
            </select>
          </div>

          <input name="phone" placeholder="Teléfono con lada" value={shipping.phone}
            onChange={handleChange}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-stone-50"/>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p className="text-xs text-amber-700">Tu dirección se cifra con AES-256 antes de guardarse — nunca se almacena en texto plano.</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button onClick={handleContinue} disabled={loadingPrices}
            className="w-full bg-stone-900 hover:bg-amber-800 disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm transition-colors">
            {loadingPrices ? "Cargando precios..." : "Continuar al pago →"}
          </button>
        </div>
      )}

      {step === "payment" && prices && (
        <div className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Pago con crypto</h2>

          <div className="bg-stone-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>${totalMxn.toFixed(2)} MXN</span></div>
            {shippingCostMxn > 0 && (
              <div className="flex justify-between text-stone-600"><span>Envío {shipping.country === "MX" ? "México" : "USA"}</span><span>${shippingCostMxn} MXN</span></div>
            )}
            {shipping.country === "US" && (
              <div className="flex justify-between text-amber-600 text-xs"><span>Costo de envío USA por confirmar</span></div>
            )}
            <div className="flex justify-between font-semibold text-stone-800 pt-1 border-t border-stone-200 mt-1">
              <span>Total</span><span>${grandTotalMxn.toFixed(2)} MXN · ${totalUsd.toFixed(2)} USD</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["CNKT", "USDT"] as TokenKey[]).map(key => (
              <button key={key} onClick={() => setSelectedToken(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${selectedToken === key
                  ? "border-amber-600 bg-amber-50" : "border-stone-200 hover:border-stone-300"}`}>
                <p className="font-semibold text-stone-800">{TOKENS[key].symbol}</p>
                <p className="text-amber-700 font-mono text-lg mt-0.5">
                  {key === "CNKT" ? prices.cnkt.toFixed(2) : prices.usdt.toFixed(2)}
                </p>
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <PayButton />
          <button onClick={() => setStep("address")} className="w-full text-stone-400 text-sm hover:text-stone-600">
            ← Editar dirección
          </button>
        </div>
      )}

      {step === "confirming" && (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="font-semibold text-stone-800">Verificando pago en Polygon...</p>
          {txHash && (
            <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              className="text-amber-700 text-sm hover:underline block">Ver en Polygonscan ↗</a>
          )}
          <p className="text-xs text-stone-400">Esto tarda unos segundos</p>
        </div>
      )}
    </div>
  );
}
