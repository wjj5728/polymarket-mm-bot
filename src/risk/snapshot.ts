import type { FillEvent } from "../hedge/types.js";
import type { RiskSnapshot } from "./pause.js";

export function buildRiskSnapshot(fill: FillEvent | null, dayPnlPct: number): RiskSnapshot {
  const hedgeLatencySec = fill ? Math.max(0, (Date.now() - fill.ts) / 1000) : 0;
  return {
    dayPnlPct,
    hedgeLatencySec,
  };
}
