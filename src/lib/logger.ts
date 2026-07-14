import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Slots } from "../engine/slots.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = join(__dirname, "..", "..", "offers_log.jsonl");

export interface OfferLogEntry {
  sessionId: string;
  offerId: string;
  score: number;
  slots: Slots;
  ts: string;
}

export function logOffer(entry: OfferLogEntry): void {
  try {
    appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n", "utf8");
  } catch {
  }
}
