// ─────────────────────────────────────────────────────────────────────────────
// Conversation controller for the WhatsApp-style web demo.
// Deterministic (no LLM needed) so the demo ALWAYS works and needs no API key.
// Message kinds mirror real WhatsApp interactive messages:
//   reply_buttons  -> WhatsApp reply buttons (max 3)
//   list           -> WhatsApp List message (up to 10 rows)
//   card / text    -> formatted text message
//   cta            -> template with a URL button
// ─────────────────────────────────────────────────────────────────────────────

import { DUBAI_VISAS, DUBAI_DOCUMENTS } from "../data/visas.js";
import { DUBAI_FAQS, pickFaqs, matchFaq } from "../data/faq.js";
import { checkEligibility } from "../engine/eligibility.js";
import { getUpsellOffer } from "../engine/upsell.js";
import { parseMessage, Slots } from "../engine/slots.js";

export interface ChatState {
  stage: "start" | "greeted" | "menu" | "chosen" | "faq";
  slots: Slots;
  shownOffers: string[];
  cameViaMmt?: boolean;
  docsShown?: boolean;       // "Documents required" already used
  dimensionsShown?: boolean; // "Photo and document dimensions" already used
  endNudgeSent?: boolean;    // the one-time "continue on Atlys" closing nudge was sent
}

export interface BotRow {
  label: string;
  description?: string;
  value: string;
}

export interface BotMessage {
  kind: "text" | "reply_buttons" | "list" | "card" | "cta" | "upsell";
  text: string;
  buttons?: { label: string; value: string }[];
  rows?: BotRow[];
  listButtonLabel?: string;
  code?: string;
}

export interface TurnResultMessages {
  messages: BotMessage[];
  state: ChatState;
}

export function initialState(): ChatState {
  return { stage: "start", slots: { sentiment: "neutral" }, shownOffers: [] };
}

// Opening message - sent AFTER the user's first message.
function opening(): BotMessage[] {
  return [
    {
      kind: "text",
      text: "Hello, and welcome to Atlys. I can help you get your visa quickly and correctly.",
    },
    {
      kind: "reply_buttons",
      text: "What do you need help with today?",
      buttons: [
        { label: "Dubai Visa", value: "dubai visa" },
        { label: "Other destination", value: "other" },
        { label: "Talk to an agent", value: "agent" },
      ],
    },
  ];
}

// Dubai visa options as a WhatsApp List message.
function visaList(): BotMessage {
  return {
    kind: "list",
    text: "Here are the Dubai visa options we offer. Select one to see the price, processing time and documents.",
    listButtonLabel: "View visa options",
    rows: DUBAI_VISAS.map((v) => ({
      label: v.label,
      description: `Price: ₹${v.priceInr}  -  Processing: ${v.standardProcessingDays} working days`,
      value: `select:${v.id}`,
    })),
  };
}

// "Anything else?" follow-up: the most common questions for the chosen category,
// plus an option to type your own and an option to reach an agent.
function followUp(visaId?: string): BotMessage {
  const rows: BotRow[] = pickFaqs(visaId).map((f) => ({ label: f.q, value: `faq:${f.id}` }));
  rows.push({ label: "Ask your own question", value: "other_query" });
  rows.push({ label: "Talk to an agent", value: "agent" });
  return {
    kind: "list",
    text: "Is there anything else I can help you with?",
    listButtonLabel: "View common questions",
    rows,
  };
}

const NATIONALITIES = ["india", "pakistan", "bangladesh", "nepal", "sri lanka", "usa", "uk"];
function detectNationality(text: string, slots: Slots) {
  const t = text.toLowerCase();
  for (const n of NATIONALITIES) if (t.includes(n)) slots.passportNationality = n;
  if (!slots.passportNationality) slots.passportNationality = "india"; // demo default
}

function maybeUpsell(state: ChatState): BotMessage | null {
  const res = getUpsellOffer({
    slots: state.slots,
    alreadyShown: state.shownOffers,
    sessionId: "web-demo",
  });
  if (!res.offer) return null;
  state.shownOffers.push(res.offer.id);
  return { kind: "upsell", text: res.offer.pitch, code: res.offer.code };
}

// The application hub. The document-related option advances as it is used:
//   not shown yet      -> "Documents required"
//   docs shown         -> "Photo and document dimensions"
//   dimensions shown   -> dropped entirely (only the remaining two options)
function optionsMenu(state: ChatState): BotMessage {
  const buttons: { label: string; value: string }[] = [];
  if (!state.docsShown) {
    buttons.push({ label: "Documents required", value: "docs_required" });
  } else if (!state.dimensionsShown) {
    buttons.push({ label: "Photo and document dimensions", value: "doc_dimensions" });
  }
  buttons.push({ label: "Anything else I can help with", value: "more_questions" });
  buttons.push({ label: "Complete application in Atlys app", value: "app" });
  return {
    kind: "reply_buttons",
    text: "How can I help you with this application?",
    buttons,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INACTIVITY WIN-BACK OFFER (placeholder - not wired to a scheduler here)
//
// Behaviour we want in production:
//   If a conversation has had no user message for 30 minutes, send a one-time
//   5% win-back discount (code COMEBACK5) to pull the user back to complete
//   their application. Send it at most once per conversation.
//
// How it would be wired (NOT a cron in this demo):
//   - On every inbound message, store `lastUserMessageAt = Date.now()` on the
//     conversation and clear any pending win-back flag.
//   - A scheduler (e.g. a WhatsApp-side delayed job, a Redis TTL key, or a
//     serverless timer) fires 30 min later. If no newer user message arrived
//     and the win-back was not already sent, send the template below and mark
//     `winBackSent = true`.
//   - Must respect the sentiment guard: never send to a user flagged negative.
//
// export function inactivityWinBack(): BotMessage {
//   return {
//     kind: "upsell",
//     text: "Still thinking it over? Here is 5% off to finish your Dubai visa - use code COMEBACK5 in the Atlys app.",
//     code: "COMEBACK5",
//   };
// }
// ─────────────────────────────────────────────────────────────────────────────

// Matched as the WHOLE message (after stripping punctuation), never as a
// substring - short generic tokens like "ok" or "k" would otherwise false-
// positive on any longer message that happens to contain those letters
// (e.g. "Pakistani" contains "k", "book" contains "ok"). Every phrase below
// is something a user would plausibly send as a complete standalone message.
const CLOSING_PHRASES = new Set([
  "bye", "goodbye", "thankyou", "thank you", "thanks", "thnx", "tysm",
  "no thats all", "no that's all", "thats it", "that's it", "nothing else",
  "im good", "i am good", "i am fine", "i'm good", "all good",
  "no more questions", "thats all i needed",
  "ok thanks", "alright thanks", "no im fine", "no i'm fine",
  "nope im good", "nope i'm good", "nope all good", "nope thats all",
  "nope that's all", "nope nothing else", "nope im fine", "nope i'm fine",
  "ok", "okay", "alright", "ok thank you", "okay thanks", "okay thank you",
  "k",
]);
function isClosingMessage(t: string): boolean {
  const normalized = t.trim().replace(/[^\w\s']/g, "").replace(/\s+/g, " ");
  return CLOSING_PHRASES.has(normalized);
}

const DOC_DIMENSIONS = [
  "Your visa photo is taken live inside the Atlys app, so you do not need to upload one.",
  "",
  "*Passport photo standard:*",
  "- Size: 35 mm x 45 mm",
  "- Head height: 32 mm to 36 mm",
  "- Background: plain white",
  "- Colour photo, face clear, neutral expression",
  "",
  "*Passport scan:*",
  "- Clear colour images of the front and back pages",
  "- All four edges visible, no glare or blur",
].join("\n");

export function handleTurn(text: string, state: ChatState): TurnResultMessages {
  const messages: BotMessage[] = [];
  const raw = text.trim();
  const t = raw.toLowerCase();

  // Accumulate structured signals from every message.
  state.slots = parseMessage(raw, state.slots);
  detectNationality(raw, state.slots);
  if (t.includes("mmt") || t.includes("makemytrip")) state.cameViaMmt = true;

  // Frustrated user -> drop everything, route to a human (checked every turn).
  if (state.slots.sentiment === "negative") {
    messages.push({
      kind: "text",
      text: "I am sorry about the trouble. Let me connect you to a human agent right away. No sales, just help.",
    });
    return { messages, state };
  }

  // FIRST message from the user -> send the opening message.
  if (state.stage === "start") {
    state.stage = "greeted";
    return { messages: opening(), state };
  }

  if (isClosingMessage(t)) {
    if (!state.endNudgeSent) {
      state.endNudgeSent = true;
      messages.push({
        kind: "text",
        text: "Glad I could help. Whenever you are ready, you can finish your Dubai visa application in the Atlys app.",
      });
      messages.push({
        kind: "cta",
        text: "",
        buttons: [{ label: "Continue on Atlys", value: "app" }],
      });
    } else {
      messages.push({ kind: "text", text: "You are welcome. Have a great trip." });
    }
    return { messages, state };
  }

  //not dump docs
  if (t.startsWith("select:")) {
    const visaId = raw.split(":")[1];
    state.slots.visaId = visaId;
    state.stage = "faq";

    const elig = checkEligibility({
      passportNationality: state.slots.passportNationality ?? "india",
      visaId,
      cameViaMmt: state.cameViaMmt,
    });

    const statusLine =
      elig.canApply === "yes"
        ? "You can apply."
        : elig.canApply === "conditional"
        ? "You can apply. This nationality needs extra document verification."
        : "Not available for this passport.";

    messages.push({
      kind: "card",
      text:
        `${statusLine}\n` +
        `*${elig.visa?.label}*\n` +
        `Price: ₹${elig.priceInr}\n` +
        `Processing: ${elig.standardProcessing}` +
        (elig.expressProcessing ? `\nExpress: ${elig.expressProcessing}` : ""),
    });

    if (elig.mmtNote) messages.push({ kind: "text", text: elig.mmtNote });

    // Note: no upsell offer is pushed here on purpose - the price card is
    // followed straight by the options menu to keep the selection step clean.
    messages.push(optionsMenu(state));
    return { messages, state };
  }

  // Menu: Documents required -> send docs once, then the updated menu.
  if (t === "docs_required") {
    messages.push({
      kind: "text",
      text: "*Documents you will need:*\n" + DUBAI_DOCUMENTS.map((d) => "- " + d).join("\n"),
    });
    state.docsShown = true;
    messages.push(optionsMenu(state));
    return { messages, state };
  }

  // Menu: Photo and document dimensions -> explain live photo + sizes once.
  if (t === "doc_dimensions") {
    messages.push({ kind: "text", text: DOC_DIMENSIONS });
    state.dimensionsShown = true;
    messages.push(optionsMenu(state));
    return { messages, state };
  }

  // Button: user tapped one of the common questions.
  if (t.startsWith("faq:")) {
    const id = raw.slice(4);
    const f = DUBAI_FAQS.find((x) => x.id === id);
    messages.push({ kind: "text", text: f ? f.a : "Sorry, I could not find that answer." });
    messages.push(followUp(state.slots.visaId));
    state.stage = "faq";
    return { messages, state };
  }

  // Button: user wants to type their own question.
  if (t === "other_query") {
    messages.push({ kind: "text", text: "Sure. Type your question below and I will answer it." });
    state.stage = "faq";
    return { messages, state };
  }

  // Button: show the common questions again.
  if (t === "more_questions") {
    messages.push(followUp(state.slots.visaId));
    state.stage = "faq";
    return { messages, state };
  }

  // Talk to agent.
  if (t.includes("agent") || t.includes("human")) {
    messages.push({ kind: "text", text: "Connecting you to a human agent. One moment." });
    return { messages, state };
  }

  // FAQ stage: a free-typed question. Answer from the knowledge base,
  // or offer an agent if nothing matches.
  if (state.stage === "faq") {
    const hit = matchFaq(raw);
    if (hit) {
      messages.push({ kind: "text", text: hit.a });
      messages.push(followUp(state.slots.visaId));
    } else {
      messages.push({
        kind: "text",
        text: "I could not find a direct answer to that. I can connect you to a human agent who can help.",
      });
      messages.push({
        kind: "reply_buttons",
        text: "",
        buttons: [
          { label: "Talk to an agent", value: "agent" },
          { label: "See common questions", value: "more_questions" },
        ],
      });
    }
    return { messages, state };
  }

  // Discount / coupon question (answer it, do not fall through).
  if (t.includes("discount") || t.includes("coupon") || t.includes("promo") || t.includes("offer")) {
    messages.push({
      kind: "text",
      text: "Yes. Groups of *4 or more* get *10% off* every applicant with code *GROUP10*, applied in the Atlys app.",
    });
    messages.push(visaList());
    state.stage = "menu";
    const up = maybeUpsell(state);
    if (up) messages.push(up);
    return { messages, state };
  }

  // Other destination.
  if (t === "other" || t.includes("other destination")) {
    messages.push({
      kind: "text",
      text: "This demo currently covers Dubai visas. Select Dubai Visa to continue.",
    });
    messages.push({
      kind: "reply_buttons",
      text: "",
      buttons: [{ label: "Dubai Visa", value: "dubai visa" }],
    });
    return { messages, state };
  }

  // Dubai visa / menu -> show the list of options.
  if (t.includes("dubai") || t.includes("visa") || t.includes("document")) {
    messages.push({ kind: "text", text: "Great. Dubai visas it is." });
    messages.push(visaList());
    state.stage = "menu";
    const up = maybeUpsell(state);
    if (up) messages.push(up);
    return { messages, state };
  }

  // Fallback.
  messages.push({
    kind: "text",
    text: "I can help with Dubai visas, required documents, or connect you to an agent.",
  });
  messages.push(opening()[1]);
  return { messages, state };
}
