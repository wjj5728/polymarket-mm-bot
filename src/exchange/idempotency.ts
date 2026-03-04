const orderKeys = new Map<string, string>();

export function buildOrderKey(input: {
  marketId: string;
  side: string;
  price: number;
  size: number;
  ttlSec: number;
}) {
  return `${input.marketId}|${input.side}|${input.price}|${input.size}|${input.ttlSec}`;
}

export function getIdempotentOrderId(key: string) {
  return orderKeys.get(key) || null;
}

export function setIdempotentOrderId(key: string, orderId: string) {
  orderKeys.set(key, orderId);
}
