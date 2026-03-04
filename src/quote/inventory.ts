import type { ExecutedQuotePair } from "./executor.js";

export type InventoryState = {
  activePairs: ExecutedQuotePair[];
  canceledPairs: number;
};

const state: InventoryState = {
  activePairs: [],
  canceledPairs: 0,
};

export function getInventoryState() {
  return state;
}

export function addActivePairs(pairs: ExecutedQuotePair[]) {
  state.activePairs.push(...pairs);
}

export function removePair(marketId: string) {
  const before = state.activePairs.length;
  state.activePairs = state.activePairs.filter((x) => x.marketId !== marketId);
  if (state.activePairs.length < before) state.canceledPairs += 1;
}
