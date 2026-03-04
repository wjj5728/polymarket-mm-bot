import { cancelOrder, submitOrder } from "../exchange/index.js";
import type { QuotePlan } from "./types.js";

export type ExecutedQuotePair = {
  marketId: string;
  yesOrderId: string;
  noOrderId: string;
  createdAt: number;
  ttlSec: number;
};

export async function executeQuotePlans(plans: QuotePlan[]) {
  const pairs: ExecutedQuotePair[] = [];

  for (const p of plans) {
    const yes = await submitOrder({
      marketId: p.marketId,
      side: "YES",
      price: p.yesPrice,
      size: p.size,
      ttlSec: p.ttlSec,
    });
    const no = await submitOrder({
      marketId: p.marketId,
      side: "NO",
      price: p.noPrice,
      size: p.size,
      ttlSec: p.ttlSec,
    });

    pairs.push({
      marketId: p.marketId,
      yesOrderId: yes.orderId,
      noOrderId: no.orderId,
      createdAt: p.createdAt,
      ttlSec: p.ttlSec,
    });
  }

  return pairs;
}

export async function cancelQuotePair(pair: ExecutedQuotePair) {
  const yes = await cancelOrder(pair.yesOrderId);
  const no = await cancelOrder(pair.noOrderId);
  return { yes, no };
}
