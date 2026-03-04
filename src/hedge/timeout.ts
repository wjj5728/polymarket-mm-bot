import type { FillEvent } from "./types.js";

export function isHedgeTimeout(fill: FillEvent, now: number, timeoutSec: number) {
  return (now - fill.ts) / 1000 > timeoutSec;
}
