import "dotenv/config";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

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
  state = "MONITOR";
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
