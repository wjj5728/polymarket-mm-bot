import type { BotConfig } from "../types.js";
import type { MarketCandidate } from "../scanner/types.js";
import { buildQuotePlans } from "./planner.js";
import { splitExpiredQuotes } from "./ttl.js";
import type { ActiveQuote } from "./types.js";

let activeQuotes: ActiveQuote[] = [];

export async function placeTwoSidedQuotes(candidates: MarketCandidate[], config: BotConfig) {
  const plans = buildQuotePlans(candidates, config);

  const created: ActiveQuote[] = plans.map((p, idx) => ({
    ...p,
    quoteId: `${p.marketId}-${Date.now()}-${idx}`,
  }));
  activeQuotes.push(...created);

  const { keep, expired } = splitExpiredQuotes(activeQuotes);
  activeQuotes = keep;

  return {
    planned: plans.length,
    active: activeQuotes.length,
    expired: expired.length,
    sample: plans.slice(0, 2),
  };
}
