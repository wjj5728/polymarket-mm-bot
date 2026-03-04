export type MarketSnapshot = {
  marketId: string;
  title: string;
  yesPrice: number;
  noPrice: number;
  spread: number;
  depthScore: number;
  volatilityScore: number;
  rewardPool: number;
  competitionScore: number;
};

export type MarketCandidate = MarketSnapshot & {
  score: number;
  reasons: string[];
};
