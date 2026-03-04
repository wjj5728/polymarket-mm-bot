export type QuotePlan = {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  size: number;
  ttlSec: number;
  createdAt: number;
};

export type ActiveQuote = QuotePlan & {
  quoteId: string;
};
