import type { FillEvent } from "../hedge/types.js";

export type PnlResult = {
  gross: number;
  feeCost: number;
  net: number;
};

export function estimateHedgePnl(fill: FillEvent, hedgePrice: number, feeRate = 0.001): PnlResult {
  const gross = Math.max(0, 1 - (fill.fillPrice + hedgePrice)) * fill.fillSize;
  const feeCost = (fill.fillPrice * fill.fillSize + hedgePrice * fill.fillSize) * feeRate;
  const net = gross - feeCost;
  return {
    gross: Number(gross.toFixed(4)),
    feeCost: Number(feeCost.toFixed(4)),
    net: Number(net.toFixed(4)),
  };
}
