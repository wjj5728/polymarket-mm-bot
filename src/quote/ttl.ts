import type { ActiveQuote } from "./types.js";

export function splitExpiredQuotes(quotes: ActiveQuote[], now = Date.now()) {
  const keep: ActiveQuote[] = [];
  const expired: ActiveQuote[] = [];

  for (const q of quotes) {
    const ageSec = (now - q.createdAt) / 1000;
    if (ageSec >= q.ttlSec) expired.push(q);
    else keep.push(q);
  }

  return { keep, expired };
}
