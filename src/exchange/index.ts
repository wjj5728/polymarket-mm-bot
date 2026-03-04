import type { ExchangeAdapter } from "./adapter.js";
import { buildOrderKey, getIdempotentOrderId, setIdempotentOrderId } from "./idempotency.js";
import { mockAdapter } from "./mock.js";
import { realAdapter } from "./real.js";
import type { PlaceOrderInput } from "./types.js";

function resolveAdapter(): ExchangeAdapter {
  const mode = process.env.EXCHANGE_MODE?.toLowerCase() || "mock";
  return mode === "real" ? realAdapter : mockAdapter;
}

export async function submitOrder(input: PlaceOrderInput) {
  const adapter = resolveAdapter();
  const key = buildOrderKey(input);
  const existingOrderId = getIdempotentOrderId(key);

  if (existingOrderId) {
    const opens = await adapter.listOpenOrders();
    const found = opens.find((x) => x.orderId === existingOrderId);
    if (found) return found;
  }

  const order = await adapter.placeOrder(input);
  setIdempotentOrderId(key, order.orderId);
  return order;
}

export async function cancelOrder(orderId: string) {
  const adapter = resolveAdapter();
  return adapter.cancelOrder(orderId);
}

export async function listOpenOrders() {
  const adapter = resolveAdapter();
  return adapter.listOpenOrders();
}
