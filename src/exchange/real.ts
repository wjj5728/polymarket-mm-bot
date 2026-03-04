import { createHmac } from "node:crypto";

import type { ExchangeAdapter } from "./adapter.js";
import type { OrderRecord, PlaceOrderInput } from "./types.js";

type RealApiConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  passphrase: string;
};

type RequestMethod = "GET" | "POST" | "DELETE";

function loadRealApiConfig(): RealApiConfig {
  const baseUrl = process.env.POLYMARKET_API_BASE?.trim() || "";
  const apiKey = process.env.POLYMARKET_API_KEY?.trim() || "";
  const apiSecret = process.env.POLYMARKET_API_SECRET?.trim() || "";
  const passphrase = process.env.POLYMARKET_API_PASSPHRASE?.trim() || "";

  if (!baseUrl || !apiKey || !apiSecret || !passphrase) {
    throw new Error("real adapter missing env: POLYMARKET_API_BASE / KEY / SECRET / PASSPHRASE");
  }

  return { baseUrl, apiKey, apiSecret, passphrase };
}

function buildHeaders(method: RequestMethod, path: string, body: string, cfg: RealApiConfig) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}${method}${path}${body}`;
  const signature = createHmac("sha256", cfg.apiSecret).update(payload).digest("base64");

  return {
    "Content-Type": "application/json",
    "PM-API-KEY": cfg.apiKey,
    "PM-API-PASSPHRASE": cfg.passphrase,
    "PM-API-TIMESTAMP": timestamp,
    "PM-API-SIGNATURE": signature,
  };
}

async function callJson<T>(method: RequestMethod, path: string, bodyObj?: object): Promise<T> {
  const cfg = loadRealApiConfig();
  const body = bodyObj ? JSON.stringify(bodyObj) : "";
  const headers = buildHeaders(method, path, body, cfg);

  const response = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers,
    body: method === "GET" ? undefined : body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`real adapter http ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

function mapRecord(input: PlaceOrderInput, api: any): OrderRecord {
  return {
    marketId: input.marketId,
    side: input.side,
    price: input.price,
    size: input.size,
    ttlSec: input.ttlSec,
    orderId: String(api.orderId || api.id || `real-${Date.now()}`),
    status: "OPEN",
    createdAt: Date.now(),
  };
}

export const realAdapter: ExchangeAdapter = {
  async placeOrder(input: PlaceOrderInput): Promise<OrderRecord> {
    const api = await callJson<any>("POST", "/orders", {
      marketId: input.marketId,
      side: input.side,
      price: input.price,
      size: input.size,
      ttlSec: input.ttlSec,
      timeInForce: "GTT",
    });

    return mapRecord(input, api);
  },

  async cancelOrder(orderId: string) {
    await callJson("DELETE", `/orders/${orderId}`);
    return { ok: true };
  },

  async listOpenOrders() {
    const api = await callJson<any[]>("GET", "/orders?status=open");
    return api.map((item) => ({
      marketId: String(item.marketId || "unknown"),
      side: item.side === "NO" ? "NO" : "YES",
      price: Number(item.price || 0),
      size: Number(item.size || 0),
      ttlSec: Number(item.ttlSec || 0),
      orderId: String(item.orderId || item.id),
      status: "OPEN",
      createdAt: Number(item.createdAt || Date.now()),
    })) as OrderRecord[];
  },
};
