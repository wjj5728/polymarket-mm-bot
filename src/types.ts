export type BotConfig = {
  scan_interval_ms: number;
  max_markets_active: number;
  order_ttl_sec: number;
  hedge_timeout_sec: number;
  delta_max: number;
  max_position_per_market: number;
  max_global_exposure: number;
  daily_max_loss_pct: number;
  channels: {
    telegram: {
      enabled: boolean;
      bot_token: string;
      chat_id: string;
    };
  };
};

export type BotState = "IDLE" | "SCAN" | "QUOTE" | "MONITOR" | "HEDGE" | "REBALANCE" | "PAUSE" | "STOP";
