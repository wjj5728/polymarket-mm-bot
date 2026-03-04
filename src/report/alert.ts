import type { BotConfig } from "../types.js";

export async function sendAlert(config: BotConfig, text: string) {
  if (!config.channels.telegram.enabled) {
    return { sent: false as const, reason: "telegram disabled" };
  }

  const token = config.channels.telegram.bot_token || process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = config.channels.telegram.chat_id || process.env.TELEGRAM_CHAT_ID || "";

  if (!token || !chatId) {
    return { sent: false as const, reason: "missing telegram token/chat_id" };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false as const, reason: `telegram http ${response.status}: ${body}` };
  }

  return { sent: true as const };
}
