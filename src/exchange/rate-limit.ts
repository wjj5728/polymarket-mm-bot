const orderTimestamps: number[] = [];

export function allowPlaceOrder(now = Date.now()) {
  const maxPerMinute = Number(process.env.ORDER_RATE_LIMIT_PER_MIN || 30);
  const windowMs = 60_000;

  while (orderTimestamps.length && now - orderTimestamps[0] > windowMs) {
    orderTimestamps.shift();
  }

  if (orderTimestamps.length >= maxPerMinute) {
    return { ok: false as const, reason: `rate limit exceeded: ${orderTimestamps.length}/${maxPerMinute} per minute` };
  }

  orderTimestamps.push(now);
  return { ok: true as const };
}
