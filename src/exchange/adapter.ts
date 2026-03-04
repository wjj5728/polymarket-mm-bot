import type { OrderRecord, PlaceOrderInput } from "./types.js";

export type ExchangeAdapter = {
  placeOrder(input: PlaceOrderInput): Promise<OrderRecord>;
  cancelOrder(orderId: string): Promise<{ ok: boolean; reason?: string }>;
  listOpenOrders(): Promise<OrderRecord[]>;
};
