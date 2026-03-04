import type { ExecutedQuotePair } from "../quote/executor.js";
import type { FillEvent } from "./types.js";

export function simulateSingleSideFill(pairs: ExecutedQuotePair[]) {
  if (!pairs.length) return null;
  const first = pairs[0];

  const event: FillEvent = {
    marketId: first.marketId,
    side: "YES",
    orderId: first.yesOrderId,
    fillPrice: 0.49,
    fillSize: 10,
    ts: Date.now(),
  };

  return event;
}
