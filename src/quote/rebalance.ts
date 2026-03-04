import { listOpenOrders, cancelOrder } from "../exchange/index.js";

export async function forceRebalanceAllOpenOrders() {
  const open = await listOpenOrders();
  let canceled = 0;

  for (const item of open) {
    const res = await cancelOrder(item.orderId);
    if (res.ok) canceled += 1;
  }

  return {
    openBefore: open.length,
    canceled,
    left: open.length - canceled,
  };
}
