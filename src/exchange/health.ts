import { listOpenOrders } from "./index.js";

export async function verifyExchangeConnection() {
  const startedAt = Date.now();
  try {
    const opens = await listOpenOrders();
    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      openOrders: opens.length,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: (error as Error).message,
    };
  }
}
