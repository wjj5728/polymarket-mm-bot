import type { BotConfig } from "../types.js";
import { applyRiskFilters } from "../risk/filter.js";
import { fetchMockMarketSnapshots } from "./mock-feed.js";
import { rankCandidates } from "./score.js";

export async function scanMarkets(config: BotConfig) {
  const snapshots = await fetchMockMarketSnapshots();
  const ranked = rankCandidates(snapshots, config);
  const filtered = applyRiskFilters(ranked, config);

  return {
    snapshots,
    ranked,
    filtered: filtered.slice(0, config.max_markets_active),
  };
}
