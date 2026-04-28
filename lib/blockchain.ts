import { createPublicClient, http, parseAbiItem, type Hash } from "viem";
import { polygon } from "viem/chains";

const client = createPublicClient({
  chain: polygon,
  transport: http(process.env.POLYGON_RPC_URL || "https://polygon-rpc.com"),
});

const STORE_WALLET = (process.env.STORE_WALLET_ADDRESS || "").toLowerCase() as `0x${string}`;
const CNKT = (process.env.CNKT_TOKEN_ADDRESS || "0x87bdfbe98ba55104701b2f2e999982a317905637").toLowerCase() as `0x${string}`;
const USDT = (process.env.USDT_TOKEN_ADDRESS || "0xc2132D05D31c914a87C6611C10748AEb04B58e8F").toLowerCase() as `0x${string}`;
const DECIMALS: Record<string, number> = { [CNKT]: 18, [USDT]: 6 };

const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

export async function verifyERC20Payment(
  txHash: Hash,
  paymentToken: "CNKT+" | "USDT",
  expectedAmount: number,
  tolerance = 0.02
): Promise<{ valid: boolean; reason: string; actualAmount?: number }> {
  try {
    const tokenAddress = paymentToken === "CNKT+" ? CNKT : USDT;
    const decimals = DECIMALS[tokenAddress] ?? 18;

    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (!receipt) return { valid: false, reason: "Transacción no encontrada" };
    if (receipt.status !== "success") return { valid: false, reason: "La transacción falló on-chain" };

    const currentBlock = await client.getBlockNumber();
    if (Number(currentBlock - receipt.blockNumber) < 1)
      return { valid: false, reason: "Sin confirmaciones aún" };

    const logs = await client.getLogs({
      address: tokenAddress,
      event: TRANSFER_EVENT,
      args: { to: STORE_WALLET },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    const match = logs.find(l => l.transactionHash.toLowerCase() === txHash.toLowerCase());
    if (!match) return { valid: false, reason: "No se encontró transferencia a la wallet de la tienda" };

    const actualAmount = Number(match.args.value as bigint) / 10 ** decimals;
    if (actualAmount < expectedAmount * (1 - tolerance))
      return { valid: false, reason: `Monto insuficiente. Recibido: ${actualAmount}, Esperado: ${expectedAmount}` };

    return { valid: true, reason: "Pago verificado", actualAmount };
  } catch (e: any) {
    return { valid: false, reason: `Error: ${e.message}` };
  }
}
