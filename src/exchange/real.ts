import type { ExchangeAdapter } from "./adapter.js";
import type { OrderRecord, PlaceOrderInput } from "./types.js";

export const realAdapter: ExchangeAdapter = {
  async placeOrder(_input: PlaceOrderInput): Promise<OrderRecord> {
    throw new Error("real adapter not implemented yet");
  },
  async cancelOrder(_orderId: string) {
    throw new Error("real adapter not implemented yet");
  },
  async listOpenOrders() {
    throw new Error("real adapter not implemented yet");
  },
};
