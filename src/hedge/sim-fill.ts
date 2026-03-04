import type { ExecutedQuotePair } from "../quote/executor.js";
import type { FillEvent } from "./types.js";

export type FillSimulationOptions = {
  fillProbability?: number;
  maxFillSize?: number;
};

export function simulateSingleSideFill(
  pairs: ExecutedQuotePair[],
  options: FillSimulationOptions = {},
): FillEvent | null {
  if (!pairs.length) return null;

  const fillProbability = options.fillProbability ?? 0.55;
  const maxFillSize = options.maxFillSize ?? 20;

  if (Math.random() > fillProbability) {
    return null;
  }

  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const side = Math.random() > 0.5 ? "YES" : "NO";
  const orderId = side === "YES" ? pair.yesOrderId : pair.noOrderId;

  const fillSize = Math.max(1, Math.floor(Math.random() * maxFillSize));
  const rawPrice = side === "YES" ? 0.48 + Math.random() * 0.08 : 0.44 + Math.random() * 0.08;

  return {
    marketId: pair.marketId,
    side,
    orderId,
    fillPrice: Number(rawPrice.toFixed(3)),
    fillSize,
    ts: Date.now(),
  };
}
