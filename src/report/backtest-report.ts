import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "reports");

type BacktestSummary = {
  rounds: number;
  fills: number;
  hedged: number;
  hedgeRatePct: number;
  totalNetPnl: number;
  avgNetPnlPerFill: number;
};

export async function writeBacktestReport(summary: BacktestSummary) {
  await mkdir(OUT_DIR, { recursive: true });

  const ts = Date.now();
  const jsonPath = join(OUT_DIR, `backtest-${ts}.json`);
  const csvPath = join(OUT_DIR, `backtest-${ts}.csv`);

  await writeFile(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  const csv = [
    "rounds,fills,hedged,hedgeRatePct,totalNetPnl,avgNetPnlPerFill",
    `${summary.rounds},${summary.fills},${summary.hedged},${summary.hedgeRatePct},${summary.totalNetPnl},${summary.avgNetPnlPerFill}`,
  ].join("\n");
  await writeFile(csvPath, `${csv}\n`, "utf8");

  return { jsonPath, csvPath };
}
