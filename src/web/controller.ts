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

// The application hub: one small menu shown after the price, and again after
// documents. Option 1 changes once documents have been shown.
function optionsMenu(afterDocs: boolean): BotMessage {
  return {
    kind: "reply_buttons",
    text: afterDocs ? "Anything else on this application?" : "How can I help you with this application?",
    buttons: afterDocs
      ? [
          { label: "Photo and document dimensions", value: "doc_dimensions" },
          { label: "Anything else I can help with", value: "more_questions" },
          { label: "Complete application in Atlys app", value: "app" },
        ]
      : [
          { label: "Documents required", value: "docs_required" },
          { label: "Anything else I can help with", value: "more_questions" },
          { label: "Complete application in Atlys app", value: "app" },
        ],
  };
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

  // Button: user selected a specific visa. Send ONLY the price card (+ offer),
  // then a small menu - do not dump docs, redirect and questions all at once.
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

    const up = maybeUpsell(state);
    if (up) messages.push(up);

    messages.push(optionsMenu(false));
    return { messages, state };
  }

  // Menu: Documents required -> send docs, then the after-docs menu.
  if (t === "docs_required") {
    messages.push({
      kind: "text",
      text: "*Documents you will need:*\n" + DUBAI_DOCUMENTS.map((d) => "- " + d).join("\n"),
    });
    messages.push(optionsMenu(true));
    return { messages, state };
  }

  // Menu: Photo and document dimensions -> explain live photo + sizes.
  if (t === "doc_dimensions") {
    messages.push({ kind: "text", text: DOC_DIMENSIONS });
    messages.push(optionsMenu(true));
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
