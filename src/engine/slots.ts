export interface Slots {
  passportNationality?: string;
  destination?: string;
  visaId?: string;             // which visa option the user picked
  groupSize?: number;
  travelDate?: string;         // ISO yyyy-mm-dd
  longStay?: boolean;          // user hinted at a long trip
  multipleDestinations?: string[];
  firstTimeApplicant?: boolean;
  priorRejection?: boolean;
  // sentiment: negative = frustrated/angry → suppresses ALL upsells
  sentiment?: "positive" | "neutral" | "negative";
}

const WORD_NUMBERS: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

const FRUSTRATION = [
  "angry", "frustrated", "useless", "worst", "terrible", "ridiculous",
  "not working", "still waiting", "no response", "fed up", "refund my", "scam",
  "waste of time", "never again", "not happy", "not satisfied", "not impressed",
  "not good", "not useful", "not helpful", "not working", "not worth it",
  "not reliable", "not trustworthy", "not professional", "not responsive",
  "not what I am looking for " , "not what I expected", "not what I wanted", "not what I needed",
  "not what I was promised", "not what I was told", "not what I was shown",
  "not what I was offered", "not what I was sold", "not what I was charged for",
];

const URGENCY = ["urgent", "asap", "immediately", "right away", "flight is", "leaving", "leave"];

export function parseMessage(text: string, prev: Slots = {}): Slots {
  const t = text.toLowerCase();
  const slots: Slots = { ...prev };

  // ── group size ── "group of 10", "we are 6", "family of ten", "10 people", "10 pax"
  const digitGroup = t.match(/(?:group of|we are|we're|family of|party of|there are)\s*(\d{1,3})/);
  const bareCount = t.match(/(\d{1,3})\s*(?:people|persons|pax|travellers|travelers|adults|of us)/);
  const wordGroup = t.match(/(?:group of|family of|party of|we are|we're)\s*([a-z]+)/);
  if (digitGroup) slots.groupSize = parseInt(digitGroup[1], 10);
  else if (bareCount) slots.groupSize = parseInt(bareCount[1], 10);
  else if (wordGroup && WORD_NUMBERS[wordGroup[1]]) slots.groupSize = WORD_NUMBERS[wordGroup[1]];

  // ── urgency → we don't know the exact date, but flag "soon" ──
  if (URGENCY.some((w) => t.includes(w))) {
    // If no explicit date is set, assume travel within the urgency window (5 days).
    if (!slots.travelDate) {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      slots.travelDate = soon.toISOString().slice(0, 10);
    }
  }

  // ── explicit ISO date ──
  const iso = t.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) slots.travelDate = iso[1];

  // ── long stay hint ──
  if (/(month|weeks|60 day|two months|long trip|extended)/.test(t)) slots.longStay = true;

  // ── first-time / uncertainty ──
  if (/(first time|never applied|new to this|not sure how|how does this work)/.test(t)) {
    slots.firstTimeApplicant = true;
  }

  // ── anxiety / rejection risk ──
  if (/(reject|rejected|will i get|is it safe|guarantee|refused|denied before)/.test(t)) {
    slots.priorRejection = true;
  }

  // ── multi destination ──
  const multi = t.match(/(dubai|turkey|schengen|thailand|singapore|europe|malaysia)/g);
  if (multi && new Set(multi).size > 1) slots.multipleDestinations = Array.from(new Set(multi));

  // ── sentiment (per-message — NOT sticky; recompute every turn) ──
  // A user who was frustrated one message ago may be fine now, so we must not
  // inherit a stale "negative" from prev, or the bot gets stuck in agent-handoff.
  slots.sentiment = FRUSTRATION.some((w) => t.includes(w)) ? "negative" : "neutral";

  return slots;
}
