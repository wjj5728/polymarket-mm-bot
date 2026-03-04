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

  try {
    if (existingOrderId) {
      const opens = await adapter.listOpenOrders();
      const found = opens.find((x) => x.orderId === existingOrderId);
      if (found) return found;
    }

    const order = await adapter.placeOrder(input);
    setIdempotentOrderId(key, order.orderId);
    return order;
  } catch (error) {
    if (process.env.EXCHANGE_MODE?.toLowerCase() === "real") {
      console.warn("[exchange] real mode failed, fallback to mock:", (error as Error).message);
      const fallbackOrder = await mockAdapter.placeOrder(input);
      setIdempotentOrderId(key, fallbackOrder.orderId);
      return fallbackOrder;
    }
    throw error;
  }
}

export async function cancelOrder(orderId: string) {
  const adapter = resolveAdapter();
  try {
    return await adapter.cancelOrder(orderId);
  } catch (error) {
    if (process.env.EXCHANGE_MODE?.toLowerCase() === "real") {
      console.warn("[exchange] real cancel failed, fallback to mock:", (error as Error).message);
      return mockAdapter.cancelOrder(orderId);
    }
    throw error;
  }
}

export async function listOpenOrders() {
  const adapter = resolveAdapter();
  try {
    return await adapter.listOpenOrders();
  } catch (error) {
    if (process.env.EXCHANGE_MODE?.toLowerCase() === "real") {
      console.warn("[exchange] real list failed, fallback to mock:", (error as Error).message);
      return mockAdapter.listOpenOrders();
    }
    throw error;
  }
}
