import { submitOrder } from "../exchange/index.js";
import { buildHedgeAction } from "./trigger.js";
import type { FillEvent } from "./types.js";

export async function hedgeIfNeeded(fillEvent: FillEvent | null) {
  if (!fillEvent) {
    return { hedged: false as const, reason: "no fill event" };
  }

  const action = buildHedgeAction(fillEvent);
  const order = await submitOrder({
    marketId: action.marketId,
    side: action.sideToHedge,
    price: action.targetPrice,
    size: action.size,
    ttlSec: 10,
  });

  return {
    hedged: true as const,
    action,
    orderId: order.orderId,
  };
}
