import type { OrderRecord, PlaceOrderInput } from "./types.js";

const orders = new Map<string, OrderRecord>();

export async function mockPlaceOrder(input: PlaceOrderInput) {
  const orderId = `${input.marketId}-${input.side}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const record: OrderRecord = {
    ...input,
    orderId,
    status: "OPEN",
    createdAt: Date.now(),
  };
  orders.set(orderId, record);
  return record;
}

export async function mockCancelOrder(orderId: string) {
  const found = orders.get(orderId);
  if (!found) return { ok: false, reason: "not found" };
  if (found.status !== "OPEN") return { ok: false, reason: `already ${found.status}` };
  found.status = "CANCELED";
  orders.set(orderId, found);
  return { ok: true };
}

export async function mockListOpenOrders() {
  return [...orders.values()].filter((x) => x.status === "OPEN");
}
