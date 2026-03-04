import type { MarketSnapshot } from "./types.js";

export async function fetchMockMarketSnapshots() {
  const rows: MarketSnapshot[] = [
    {
      marketId: "pm-001",
      title: "Election A Winner?",
      yesPrice: 0.51,
      noPrice: 0.49,
      spread: 0.04,
      depthScore: 0.82,
      volatilityScore: 0.24,
      rewardPool: 1250,
      competitionScore: 0.36,
    },
    {
      marketId: "pm-002",
      title: "Macro Rate Cut Before Q4?",
      yesPrice: 0.63,
      noPrice: 0.37,
      spread: 0.02,
      depthScore: 0.74,
      volatilityScore: 0.41,
      rewardPool: 960,
      competitionScore: 0.53,
    },
    {
      marketId: "pm-003",
      title: "Sports Final Result?",
      yesPrice: 0.49,
      noPrice: 0.51,
      spread: 0.06,
      depthScore: 0.77,
      volatilityScore: 0.21,
      rewardPool: 680,
      competitionScore: 0.32,
    },
    {
      marketId: "pm-004",
      title: "Company X Product Launch Date?",
      yesPrice: 0.57,
      noPrice: 0.43,
      spread: 0.03,
      depthScore: 0.65,
      volatilityScore: 0.35,
      rewardPool: 740,
      competitionScore: 0.62,
    },
  ];

  return rows;
}
