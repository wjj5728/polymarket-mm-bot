import type { BotConfig } from "../types.js";
import type { MarketCandidate } from "../scanner/types.js";
import type { QuotePlan } from "./types.js";

export function buildQuotePlans(candidates: MarketCandidate[], config: BotConfig): QuotePlan[] {
  const now = Date.now();
  return candidates.map((item) => {
    const edge = Math.max(config.delta_max / 2, 0.005);
    const yesPrice = Math.max(0.01, Math.min(0.99, item.yesPrice - edge));
    const noPrice = Math.max(0.01, Math.min(0.99, item.noPrice - edge));

    return {
      marketId: item.marketId,
      yesPrice: Number(yesPrice.toFixed(3)),
      noPrice: Number(noPrice.toFixed(3)),
      size: Math.min(config.max_position_per_market, 100),
      ttlSec: config.order_ttl_sec,
      createdAt: now,
    };
  });
}
