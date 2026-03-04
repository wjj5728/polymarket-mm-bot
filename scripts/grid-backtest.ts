import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { hedgeIfNeeded } from "../src/hedge/index.js";
import { simulateSingleSideFill } from "../src/hedge/sim-fill.js";
import { placeTwoSidedQuotes } from "../src/quote/index.js";
import { writeGridReport, type GridRow } from "../src/report/grid-report.js";
import { estimateHedgePnl } from "../src/report/pnl.js";
import { scanMarkets } from "../src/scanner/index.js";
import type { BotConfig } from "../src/types.js";

async function loadConfig(path = "config/default.yaml"): Promise<BotConfig> {
  const raw = await readFile(path, "utf8");
  return YAML.parse(raw) as BotConfig;
}

async function runOne(config: BotConfig, fillProbability: number, maxFillSize: number, feeRate: number): Promise<GridRow> {
  const rounds = 40;
  let fills = 0;
  let hedged = 0;
  let totalNetPnl = 0;

  for (let i = 0; i < rounds; i += 1) {
    const scan = await scanMarkets(config);
    const quote = await placeTwoSidedQuotes(scan.filtered, config);
    const fill = simulateSingleSideFill(quote.executedPairs || [], { fillProbability, maxFillSize });
    if (fill) fills += 1;

    const hedge = await hedgeIfNeeded(fill);
    if (hedge.hedged && fill) {
      hedged += 1;
      const pnl = estimateHedgePnl(fill, hedge.action.targetPrice, feeRate);
      totalNetPnl += pnl.net;
    }
  }

  const hedgeRatePct = fills ? (hedged / fills) * 100 : 0;
  const avgNetPnlPerFill = fills ? totalNetPnl / fills : 0;

  return {
    fillProbability,
    maxFillSize,
    feeRate,
    rounds,
    fills,
    hedgeRatePct: Number(hedgeRatePct.toFixed(2)),
    totalNetPnl: Number(totalNetPnl.toFixed(4)),
    avgNetPnlPerFill: Number(avgNetPnlPerFill.toFixed(4)),
  };
}

async function main() {
  const config = await loadConfig();

  const fillProbabilities = [0.45, 0.55, 0.65];
  const maxFillSizes = [10, 20, 30];
  const feeRates = [0.0008, 0.001, 0.0015];

  const rows: GridRow[] = [];
  for (const p of fillProbabilities) {
    for (const s of maxFillSizes) {
      for (const f of feeRates) {
        rows.push(await runOne(config, p, s, f));
      }
    }
  }

  rows.sort((a, b) => b.totalNetPnl - a.totalNetPnl);
  const best = rows[0];

  const files = await writeGridReport(rows);
  console.log("[grid] tested=", rows.length);
  console.log("[grid] best=", best);
  console.log("[grid] reports:", files.jsonPath, files.csvPath);
}

main().catch((error) => {
  console.error("[grid] fatal", error);
  process.exit(1);
});
