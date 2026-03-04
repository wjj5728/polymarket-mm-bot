import "dotenv/config";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { hedgeIfNeeded } from "./hedge/index.js";
import { simulateSingleSideFill } from "./hedge/sim-fill.js";
import { isHedgeTimeout } from "./hedge/timeout.js";
import { placeTwoSidedQuotes } from "./quote/index.js";
import { forceRebalanceAllOpenOrders } from "./quote/rebalance.js";
import { shouldPause } from "./risk/pause.js";
import { buildRiskSnapshot } from "./risk/snapshot.js";
import { scanMarkets } from "./scanner/index.js";
import type { BotConfig, BotState } from "./types.js";

async function loadConfig(path = "config/default.yaml"): Promise<BotConfig> {
  const raw = await readFile(path, "utf8");
  return YAML.parse(raw) as BotConfig;
}

async function tick(config: BotConfig) {
  let state: BotState = "IDLE";
  state = "SCAN";

  const scanResult = await scanMarkets(config);
  console.log(`[scan] total=${scanResult.snapshots.length}, ranked=${scanResult.ranked.length}, filtered=${scanResult.filtered.length}`);
  scanResult.filtered.forEach((x, idx) => {
    console.log(`[scan][${idx + 1}] ${x.marketId} score=${x.score} spread=${x.spread} reasons=${x.reasons.slice(0, 2).join(";")}`);
  });

  state = "QUOTE";
  const quoteResult = await placeTwoSidedQuotes(scanResult.filtered, config);
  console.log(`[quote] planned=${quoteResult.planned}, active=${quoteResult.active}, expired=${quoteResult.expired}`);

  state = "MONITOR";
  const fillEvent = simulateSingleSideFill(quoteResult.executedPairs || []);

  if (fillEvent && isHedgeTimeout(fillEvent, Date.now(), config.hedge_timeout_sec)) {
    state = "REBALANCE";
    const rebalance = await forceRebalanceAllOpenOrders();
    console.log(`[rebalance] openBefore=${rebalance.openBefore} canceled=${rebalance.canceled} left=${rebalance.left}`);
  }

  const hedgeResult = await hedgeIfNeeded(fillEvent);
  if (hedgeResult.hedged) {
    state = "HEDGE";
    console.log(`[hedge] hedged=true side=${hedgeResult.action.sideToHedge} order=${hedgeResult.orderId}`);
  } else {
    console.log(`[hedge] hedged=false reason=${hedgeResult.reason}`);
  }

  const risk = buildRiskSnapshot(fillEvent, -0.002);
  const pause = shouldPause(risk, config);
  if (pause.pause) {
    state = "PAUSE";
    console.log(`[risk] pause=true reason=${pause.reason}`);
  }

  console.log(`[bot] state=${state} interval=${config.scan_interval_ms}ms`);
}

async function main() {
  const config = await loadConfig();
  console.log("[bot] polymarket-mm-bot v0.1.0 boot");
  await tick(config);
}

main().catch((error) => {
  console.error("[bot] fatal:", error);
  process.exit(1);
});
