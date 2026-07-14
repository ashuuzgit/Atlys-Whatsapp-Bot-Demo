import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { DUBAI_VISAS, DUBAI_DOCUMENTS } from "./data/visas.js";
import { checkEligibility } from "./engine/eligibility.js";
import { getUpsellOffer } from "./engine/upsell.js";
import { parseMessage, Slots } from "./engine/slots.js";

const server = new McpServer({ name: "atlys-visa", version: "1.0.0" });

// ── 1. list_dubai_visa_options — the WhatsApp button menu ───────────────────────
server.tool(
  "list_dubai_visa_options",
  "List the Dubai (UAE) visa options Atlys offers, with price and processing time. Use this to show the menu after a user asks for a Dubai visa.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          DUBAI_VISAS.map((v) => ({
            id: v.id,
            option: v.label,
            priceInr: v.priceInr,
            standardProcessing: `${v.standardProcessingDays} working days`,
            express: v.expressAvailable
              ? `${v.expressProcessingHours}h (+₹${v.expressAddonInr})`
              : "not available",
          })),
          null,
          2
        ),
      },
    ],
  })
);

// ── 2. get_required_documents ───────────────────────────────────────────────────
server.tool(
  "get_required_documents",
  "Get the exact document checklist for a Dubai visa. Return this after the user selects an option.",
  { visaId: z.string().describe("id from list_dubai_visa_options, e.g. uae_30_single") },
  async () => ({
    content: [{ type: "text", text: JSON.stringify(DUBAI_DOCUMENTS, null, 2) }],
  })
);

// ── 3. check_eligibility ────────────────────────────────────────────────────────
server.tool(
  "check_eligibility",
  "Strict lookup: can this passport apply for this Dubai visa? Returns status, docs, processing, price, and an MMT note if the user came via MakeMyTrip. Never reason about visa rules yourself — call this.",
  {
    passportNationality: z.string().describe("e.g. India, Pakistan"),
    visaId: z.string().describe("id from list_dubai_visa_options"),
    cameViaMmt: z.boolean().optional().describe("true if user arrived via a MakeMyTrip package"),
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(checkEligibility(args), null, 2) }],
  })
);

// ── 4. parse_message — free text → structured slots (fallback extractor) ─────────
server.tool(
  "parse_message",
  "Extract structured signals (group size, travel urgency, sentiment, first-time, rejection worry, multi-destination) from a free-form user message. Feed the result into get_upsell_offer.",
  {
    message: z.string(),
    priorSlots: z.record(z.any()).optional().describe("slots already known from earlier in the chat"),
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(parseMessage(args.message, (args.priorSlots ?? {}) as Slots), null, 2),
      },
    ],
  })
);

// ── 5. get_upsell_offer — the deterministic money tool ──────────────────────────
server.tool(
  "get_upsell_offer",
  "Given the current structured slots, return the single best upsell offer (ranked, eligibility-gated, sentiment-suppressed, deduped) — or null if none should be shown. The DECISION is made here; you only rephrase offer.pitch naturally. Never invent offers.",
  {
    slots: z
      .object({
        passportNationality: z.string().optional(),
        destination: z.string().optional(),
        visaId: z.string().optional(),
        groupSize: z.number().optional(),
        travelDate: z.string().optional().describe("ISO yyyy-mm-dd"),
        longStay: z.boolean().optional(),
        multipleDestinations: z.array(z.string()).optional(),
        firstTimeApplicant: z.boolean().optional(),
        priorRejection: z.boolean().optional(),
        sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
      })
      .describe("structured signals, e.g. from parse_message"),
    alreadyShown: z.array(z.string()).optional().describe("offer ids already surfaced this chat"),
    sessionId: z.string().optional(),
  },
  async (args) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          getUpsellOffer({
            slots: args.slots as Slots,
            alreadyShown: args.alreadyShown,
            sessionId: args.sessionId,
          }),
          null,
          2
        ),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("atlys-visa MCP server running on stdio");
