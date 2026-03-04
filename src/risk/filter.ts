import type { BotConfig } from "../types.js";
import type { MarketCandidate } from "../scanner/types.js";

export function applyRiskFilters(candidates: MarketCandidate[], config: BotConfig) {
  return candidates.filter((item) => {
    const balanced = Math.abs(item.yesPrice - 0.5) <= 0.18;
    const spreadOk = item.spread >= config.delta_max * 0.8;
    const volOk = item.volatilityScore <= 0.45;
    const depthOk = item.depthScore >= 0.6;
    return balanced && spreadOk && volOk && depthOk;
  });
}
