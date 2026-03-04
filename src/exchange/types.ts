export type Side = "YES" | "NO";

export type PlaceOrderInput = {
  marketId: string;
  side: Side;
  price: number;
  size: number;
  ttlSec: number;
};

export type OrderRecord = PlaceOrderInput & {
  orderId: string;
  status: "OPEN" | "CANCELED" | "FILLED";
  createdAt: number;
};
