import { mockCancelOrder, mockListOpenOrders, mockPlaceOrder } from "./mock.js";
import type { PlaceOrderInput } from "./types.js";

export async function submitOrder(input: PlaceOrderInput) {
  return mockPlaceOrder(input);
}

export async function cancelOrder(orderId: string) {
  return mockCancelOrder(orderId);
}

export async function listOpenOrders() {
  return mockListOpenOrders();
}
