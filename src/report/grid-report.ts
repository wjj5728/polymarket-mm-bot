import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "reports");

export type GridRow = {
  fillProbability: number;
  maxFillSize: number;
  feeRate: number;
  rounds: number;
  fills: number;
  hedgeRatePct: number;
  totalNetPnl: number;
  avgNetPnlPerFill: number;
};

export async function writeGridReport(rows: GridRow[]) {
  await mkdir(OUT_DIR, { recursive: true });
  const ts = Date.now();
  const jsonPath = join(OUT_DIR, `grid-${ts}.json`);
  const csvPath = join(OUT_DIR, `grid-${ts}.csv`);

  await writeFile(jsonPath, JSON.stringify(rows, null, 2), "utf8");

  const header = "fillProbability,maxFillSize,feeRate,rounds,fills,hedgeRatePct,totalNetPnl,avgNetPnlPerFill";
  const body = rows
    .map((r) => `${r.fillProbability},${r.maxFillSize},${r.feeRate},${r.rounds},${r.fills},${r.hedgeRatePct},${r.totalNetPnl},${r.avgNetPnlPerFill}`)
    .join("\n");
  await writeFile(csvPath, `${header}\n${body}\n`, "utf8");

  return { jsonPath, csvPath };
}
