import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { hedgeIfNeeded } from "../src/hedge/index.js";
import { simulateSingleSideFill } from "../src/hedge/sim-fill.js";
import { placeTwoSidedQuotes } from "../src/quote/index.js";
import { scanMarkets } from "../src/scanner/index.js";
import type { BotConfig } from "../src/types.js";

async function loadConfig(path = "config/default.yaml"): Promise<BotConfig> {
  const raw = await readFile(path, "utf8");
  return YAML.parse(raw) as BotConfig;
}

async function run() {
  const config = await loadConfig();

  const rounds = 50;
  let totalFills = 0;
  let hedgedCount = 0;
  let totalFillSize = 0;

  for (let i = 0; i < rounds; i += 1) {
    const scan = await scanMarkets(config);
    const quote = await placeTwoSidedQuotes(scan.filtered, config);
    const fill = simulateSingleSideFill(quote.executedPairs || [], {
      fillProbability: 0.6,
      maxFillSize: 25,
    });

    if (fill) {
      totalFills += 1;
      totalFillSize += fill.fillSize;
    }

    const hedge = await hedgeIfNeeded(fill);
    if (hedge.hedged) hedgedCount += 1;
  }

  const hedgeRate = totalFills > 0 ? (hedgedCount / totalFills) * 100 : 0;

  console.log("[backtest] rounds=", rounds);
  console.log("[backtest] fills=", totalFills, "avgFillSize=", totalFills ? (totalFillSize / totalFills).toFixed(2) : 0);
  console.log("[backtest] hedged=", hedgedCount, "hedgeRate=", `${hedgeRate.toFixed(2)}%`);
}

run().catch((error) => {
  console.error("[backtest] fatal", error);
  process.exit(1);
});
