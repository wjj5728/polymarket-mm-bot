import type { BotConfig } from "../types.js";

export type RiskSnapshot = {
  dayPnlPct: number;
  hedgeLatencySec: number;
};

export function shouldPause(snapshot: RiskSnapshot, config: BotConfig) {
  if (snapshot.dayPnlPct <= -Math.abs(config.daily_max_loss_pct)) {
    return { pause: true, reason: `daily drawdown reached ${snapshot.dayPnlPct}` };
  }
  if (snapshot.hedgeLatencySec > config.hedge_timeout_sec) {
    return { pause: true, reason: `hedge timeout ${snapshot.hedgeLatencySec}s` };
  }
  return { pause: false, reason: "ok" };
}
