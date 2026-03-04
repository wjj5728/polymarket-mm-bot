import type { BotConfig } from "../types.js";
import type { MarketCandidate, MarketSnapshot } from "./types.js";

function evaluateOne(market: MarketSnapshot, config: BotConfig): MarketCandidate {
  const reasons: string[] = [];
  let score = 0;

  const priceBalance = 1 - Math.abs(market.yesPrice - 0.5) * 2;
  score += priceBalance * 30;
  reasons.push(`priceBalance=${priceBalance.toFixed(2)}`);

  const spreadScore = Math.min(1, market.spread / Math.max(config.delta_max, 0.001));
  score += spreadScore * 20;
  reasons.push(`spreadScore=${spreadScore.toFixed(2)}`);

  score += market.depthScore * 20;
  reasons.push(`depthScore=${market.depthScore.toFixed(2)}`);

  const lowVolScore = 1 - market.volatilityScore;
  score += lowVolScore * 15;
  reasons.push(`lowVolScore=${lowVolScore.toFixed(2)}`);

  const rewardScore = Math.min(1, market.rewardPool / 1500);
  score += rewardScore * 10;
  reasons.push(`rewardScore=${rewardScore.toFixed(2)}`);

  const lowCompetition = 1 - market.competitionScore;
  score += lowCompetition * 5;
  reasons.push(`lowCompetition=${lowCompetition.toFixed(2)}`);

  return {
    ...market,
    score: Number(score.toFixed(2)),
    reasons,
  };
}

export function rankCandidates(markets: MarketSnapshot[], config: BotConfig) {
  const rows = markets.map((m) => evaluateOne(m, config));
  rows.sort((a, b) => b.score - a.score);
  return rows;
}
