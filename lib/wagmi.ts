import { createConfig, http } from "wagmi";
import { polygon } from "wagmi/chains";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const metadata = {
  name: "Nice Joyería",
  description: "Joyería exclusiva con pagos en CNKT+ y USDT",
  url: "https://nicejoyeria.com",
  icons: ["/logo.png"],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: [polygon],
  projectId,
  metadata,
  transports: { [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC || "https://polygon-rpc.com") },
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  defaultChain: polygon,
  themeMode: "light",
  themeVariables: { "--w3m-accent": "#B45309" },
});

export const TOKENS = {
  CNKT: { symbol: "CNKT+", address: process.env.NEXT_PUBLIC_CNKT_ADDRESS as `0x${string}`, decimals: 18 },
  USDT: { symbol: "USDT",  address: process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`, decimals: 6  },
} as const;

export type TokenKey = keyof typeof TOKENS;

export const ERC20_ABI = [
  { name: "transfer", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
] as const;
