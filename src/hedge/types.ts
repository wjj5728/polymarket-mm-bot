export type FillEvent = {
  marketId: string;
  side: "YES" | "NO";
  orderId: string;
  fillPrice: number;
  fillSize: number;
  ts: number;
};

export type HedgeAction = {
  marketId: string;
  sideToHedge: "YES" | "NO";
  targetPrice: number;
  size: number;
  reason: string;
};
