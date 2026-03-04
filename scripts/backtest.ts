import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { hedgeIfNeeded } from "../src/hedge/index.js";
import { simulateSingleSideFill } from "../src/hedge/sim-fill.js";
import { placeTwoSidedQuotes } from "../src/quote/index.js";
import { writeBacktestReport } from "../src/report/backtest-report.js";
import { estimateHedgePnl } from "../src/report/pnl.js";
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
  let totalNetPnl = 0;

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
    if (hedge.hedged && fill) {
      hedgedCount += 1;
      const pnl = estimateHedgePnl(fill, hedge.action.targetPrice);
      totalNetPnl += pnl.net;
    }
  }

  const hedgeRate = totalFills > 0 ? (hedgedCount / totalFills) * 100 : 0;
  const avgFillSize = totalFills ? totalFillSize / totalFills : 0;
  const avgNetPnlPerFill = totalFills ? totalNetPnl / totalFills : 0;

  const summary = {
    rounds,
    fills: totalFills,
    hedged: hedgedCount,
    hedgeRatePct: Number(hedgeRate.toFixed(2)),
    totalNetPnl: Number(totalNetPnl.toFixed(4)),
    avgNetPnlPerFill: Number(avgNetPnlPerFill.toFixed(4)),
  };

  const files = await writeBacktestReport(summary);

  console.log("[backtest] rounds=", rounds);
  console.log("[backtest] fills=", totalFills, "avgFillSize=", avgFillSize.toFixed(2));
  console.log("[backtest] hedged=", hedgedCount, "hedgeRate=", `${hedgeRate.toFixed(2)}%`);
  console.log("[backtest] totalNetPnl=", summary.totalNetPnl, "avgNetPnlPerFill=", summary.avgNetPnlPerFill);
  console.log("[backtest] reports:", files.jsonPath, files.csvPath);
}

run().catch((error) => {
  console.error("[backtest] fatal", error);
  process.exit(1);
});
