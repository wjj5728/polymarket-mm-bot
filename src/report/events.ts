import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";

type EventLevel = "INFO" | "WARN" | "ERROR";

type BotEvent = {
  ts: number;
  level: EventLevel;
  type: string;
  message: string;
  meta?: Record<string, unknown>;
};

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "events.jsonl");

export async function writeEvent(level: EventLevel, type: string, message: string, meta?: Record<string, unknown>) {
  const item: BotEvent = { ts: Date.now(), level, type, message, meta };
  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_FILE, `${JSON.stringify(item)}\n`, "utf8");
}
