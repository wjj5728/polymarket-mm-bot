import "dotenv/config";
import { readFile } from "node:fs/promises";
import YAML from "yaml";

import { consumeRecoveryMessage } from "./exchange/circuit-breaker.js";
import { verifyExchangeConnection } from "./exchange/health.js";
import { hedgeIfNeeded } from "./hedge/index.js";
import { simulateSingleSideFill } from "./hedge/sim-fill.js";
import { isHedgeTimeout } from "./hedge/timeout.js";
import { placeTwoSidedQuotes } from "./quote/index.js";
import { forceRebalanceAllOpenOrders } from "./quote/rebalance.js";
import { sendAlert } from "./report/alert.js";
import { writeEvent } from "./report/events.js";
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
  let quoteResult;
  try {
    quoteResult = await placeTwoSidedQuotes(scanResult.filtered, config);
    console.log(`[quote] planned=${quoteResult.planned}, active=${quoteResult.active}, expired=${quoteResult.expired}`);
    await writeEvent("INFO", "QUOTE", "quote placement done", {
      planned: quoteResult.planned,
      active: quoteResult.active,
      expired: quoteResult.expired,
    });
  } catch (error) {
    state = "PAUSE";
    const reason = (error as Error).message;
    console.log(`[risk] pause=true reason=${reason}`);
    await writeEvent("ERROR", "PAUSE", "quote failed and paused", { reason });
    await sendAlert(config, `⚠️ polymarket-mm-bot PAUSE\nreason: ${reason}`);
    console.log(`[bot] state=${state} interval=${config.scan_interval_ms}ms`);
    return;
  }

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
    await writeEvent("WARN", "PAUSE", "risk pause triggered", { reason: pause.reason });
    await sendAlert(config, `⚠️ polymarket-mm-bot 风控暂停\nreason: ${pause.reason}`);
  }

  const recovered = consumeRecoveryMessage();
  if (recovered) {
    await writeEvent("INFO", "RECOVERY", recovered);
    await sendAlert(config, `✅ polymarket-mm-bot\n${recovered}`);
  }

  console.log(`[bot] state=${state} interval=${config.scan_interval_ms}ms`);
}

async function main() {
  const config = await loadConfig();
  console.log("[bot] polymarket-mm-bot v1.4.0 boot");
  await writeEvent("INFO", "BOOT", "bot boot", { version: "v1.4.0" });

  const health = await verifyExchangeConnection();
  if (health.ok) {
    console.log(`[exchange] health=ok latency=${health.latencyMs}ms openOrders=${health.openOrders}`);
    await writeEvent("INFO", "EXCHANGE_HEALTH", "exchange health ok", health as unknown as Record<string, unknown>);
  } else {
    console.log(`[exchange] health=degraded latency=${health.latencyMs}ms error=${health.error}`);
    await writeEvent("WARN", "EXCHANGE_HEALTH", "exchange health degraded", health as unknown as Record<string, unknown>);
    await sendAlert(config, `⚠️ polymarket-mm-bot 交易连接异常\nerror: ${health.error}`);
  }

  await tick(config);
}

main().catch((error) => {
  console.error("[bot] fatal:", error);
  process.exit(1);
});
