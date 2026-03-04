import type { BotConfig } from "../types.js";
import type { MarketCandidate } from "../scanner/types.js";
import { executeQuotePlans, cancelQuotePair } from "./executor.js";
import { addActivePairs, getInventoryState, removePair } from "./inventory.js";
import { buildQuotePlans } from "./planner.js";

export async function placeTwoSidedQuotes(candidates: MarketCandidate[], config: BotConfig) {
  const plans = buildQuotePlans(candidates, config);
  const executed = await executeQuotePlans(plans);
  addActivePairs(executed);

  const now = Date.now();
  const inventory = getInventoryState();
  let expired = 0;

  for (const pair of [...inventory.activePairs]) {
    const ageSec = (now - pair.createdAt) / 1000;
    if (ageSec >= pair.ttlSec) {
      await cancelQuotePair(pair);
      removePair(pair.marketId);
      expired += 1;
    }
  }

  const refreshed = getInventoryState();

  return {
    planned: plans.length,
    active: refreshed.activePairs.length,
    expired,
    canceledTotal: refreshed.canceledPairs,
    sample: plans.slice(0, 2),
    executedPairs: executed,
  };
}
