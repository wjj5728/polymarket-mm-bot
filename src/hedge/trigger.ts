import type { FillEvent, HedgeAction } from "./types.js";

export function buildHedgeAction(event: FillEvent): HedgeAction {
  const sideToHedge = event.side === "YES" ? "NO" : "YES";
  const targetPrice = Math.max(0.01, Math.min(0.99, 1 - event.fillPrice));

  return {
    marketId: event.marketId,
    sideToHedge,
    targetPrice: Number(targetPrice.toFixed(3)),
    size: event.fillSize,
    reason: `single-side fill detected (${event.side})`,
  };
}
