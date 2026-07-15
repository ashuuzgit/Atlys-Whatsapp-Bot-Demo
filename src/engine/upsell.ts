
import { Slots } from "./slots.js";
import {
  findVisa,
  longerValidityFor,
  multiEntryUpgradeFor,
  VisaOption,
} from "../data/visas.js";
import { logOffer } from "../lib/logger.js";

export interface Offer {
  id: string;
  label: string;
  pitch: string;          // suggested framing — LLM may rephrase, offer stays fixed
  code?: string;          // discount / promo code if any
  priceDeltaInr?: number; // extra cost of the upsell, if applicable
  // Ranking inputs. baseConversion/baseMargin are seeds; the feedback loop
  // (logger stats) can later override baseConversion with observed rates.
  baseConversion: number; // 0..1 expected click→convert
  baseMargin: number;     // 0..1 relative profit weight
}

export interface UpsellContext {
  slots: Slots;
  alreadyShown?: string[]; // offer ids already surfaced this conversation (dedupe)
  sessionId?: string;      // for logging
}

const GROUP_THRESHOLD = 4;
const URGENCY_DAYS = 7;

function daysUntil(dateIso?: string): number | undefined {
  if (!dateIso) return undefined;
  const d = new Date(dateIso + "T00:00:00");
  if (isNaN(d.getTime())) return undefined;
  const ms = d.getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86_400_000);
}

// ── Each candidate is only PUSHED if its trigger + eligibility both pass ────────
function candidateOffers(slots: Slots): Offer[] {
  const offers: Offer[] = [];
  const visa: VisaOption | undefined = slots.visaId ? findVisa(slots.visaId) : undefined;
  const dLeft = daysUntil(slots.travelDate);

  // 1. GROUP DISCOUNT — group_size >= 4
  if ((slots.groupSize ?? 0) >= GROUP_THRESHOLD) {
    offers.push({
      id: "group_discount",
      label: "Group discount",
      pitch: `Travelling as a group of ${slots.groupSize}? Apply code GROUP10 in the app for 10% off every applicant.`,
      code: "GROUP10",
      baseConversion: 0.45,
      baseMargin: 0.5,
    });
  }

  const urgent = dLeft !== undefined && dLeft <= URGENCY_DAYS;
  const visaSelectedExpress = visa?.expressAvailable === true;
  if ((urgent && (!visa || visa.expressAvailable)) || visaSelectedExpress) {
    const addon = visa?.expressAddonInr ?? 3000;
    const hours = visa?.expressProcessingHours ?? 32;
    offers.push({
      id: "express_processing",
      label: "Express processing",
      pitch: `Get your Dubai visa delivered in under ${hours} hours, or the express fee is waived. Add express for ₹${addon}.`,
      priceDeltaInr: addon,
      baseConversion: 0.55,
      baseMargin: 0.8, // highest margin
    });
  }

  // 3. MULTI-ENTRY UPGRADE — picked single, multi exists (eligibility-gated)
  if (visa) {
    const multi = multiEntryUpgradeFor(visa);
    if (multi) {
      offers.push({
        id: "multi_entry_upgrade",
        label: "Multiple-entry upgrade",
        pitch: `Planning more than one trip? Upgrade to ${multi.label} for ₹${
          multi.priceInr - visa.priceInr
        } more.`,
        priceDeltaInr: multi.priceInr - visa.priceInr,
        baseConversion: 0.25,
        baseMargin: 0.6,
      });
    }

    // 4. LONGER VALIDITY — long-stay hint + a longer option exists
    if (slots.longStay) {
      const longer = longerValidityFor(visa);
      if (longer) {
        offers.push({
          id: "longer_validity",
          label: "Longer validity",
          pitch: `Staying a while? ${longer.label} gives you longer validity for ₹${
            longer.priceInr - visa.priceInr
          } more.`,
          priceDeltaInr: longer.priceInr - visa.priceInr,
          baseConversion: 0.2,
          baseMargin: 0.55,
        });
      }
    }
  }

  // 5. DUBAI TRIP ADD-ONS — only once a visa is chosen. These are the Dubai
  //    tourist attach products; ranked among each other by conversion x margin.
  if (visa) {
    offers.push({
      id: "travel_insurance",
      label: "Travel insurance",
      pitch: "Add travel insurance for your Dubai trip - covers medical and trip cancellation.",
      baseConversion: 0.3,
      baseMargin: 0.35,
    });
    offers.push({
      id: "airport_fasttrack",
      label: "Airport fast-track",
      pitch: "Skip the immigration queues at Dubai airport with Marhaba meet and assist. Add for ₹2500.",
      priceDeltaInr: 2500,
      baseConversion: 0.2,
      baseMargin: 0.6,
    });
    offers.push({
      id: "esim",
      label: "UAE eSIM",
      pitch: "Stay connected from the moment you land. Add a UAE eSIM with 5GB data for ₹900.",
      priceDeltaInr: 900,
      baseConversion: 0.28,
      baseMargin: 0.5,
    });
    offers.push({
      id: "attraction_pass",
      label: "Dubai attractions pass",
      pitch: "See more for less with the Dubai pass - Burj Khalifa, desert safari and more. Add from ₹6000.",
      priceDeltaInr: 6000,
      baseConversion: 0.15,
      baseMargin: 0.45,
    });
    offers.push({
      id: "forex_card",
      label: "Zero-markup forex card",
      pitch: "Load a zero-markup forex card and save on currency exchange in Dubai.",
      baseConversion: 0.18,
      baseMargin: 0.4,
    });
    offers.push({
      id: "airport_transfer",
      label: "Airport transfer",
      pitch: "Book a private airport-to-hotel transfer in Dubai for a smooth arrival. Add for ₹1800.",
      priceDeltaInr: 1800,
      baseConversion: 0.17,
      baseMargin: 0.5,
    });
    offers.push({
      id: "photo_service",
      label: "Compliant photo",
      pitch: "Need a visa-ready photo? Get a compliant Dubai visa photo taken for ₹200.",
      priceDeltaInr: 200,
      baseConversion: 0.25,
      baseMargin: 0.3,
    });
  }

  // 6. VISA GUARANTEE / rejection protection — anxiety or prior rejection
  if (slots.priorRejection) {
    offers.push({
      id: "visa_guarantee",
      label: "Visa guarantee",
      pitch: "Worried about rejection? Add Visa Guarantee - full refund of Atlys fees if it's rejected.",
      baseConversion: 0.4,
      baseMargin: 0.5,
    });
  }

  // 7. DONE-FOR-YOU — first-time applicant
  if (slots.firstTimeApplicant) {
    offers.push({
      id: "concierge",
      label: "Concierge / done-for-you",
      pitch: "First time applying? Let an Atlys specialist prepare and submit everything for you.",
      baseConversion: 0.22,
      baseMargin: 0.6,
    });
  }

  // 8. MULTI-COUNTRY BUNDLE — more than one destination mentioned
  if (slots.multipleDestinations && slots.multipleDestinations.length > 1) {
    offers.push({
      id: "multi_country_bundle",
      label: "Multi-country bundle",
      pitch: `Visiting ${slots.multipleDestinations.join(" + ")}? Bundle both visas and save on service fees.`,
      code: "BUNDLE",
      baseConversion: 0.35,
      baseMargin: 0.55,
    });
  }

  return offers;
}

// ── The public entrypoint ──────────────────────────────────────────────────────
export function getUpsellOffer(ctx: UpsellContext): {
  offer: Offer | null;
  suppressed?: string;
  considered: number;
} {
  const { slots, alreadyShown = [], sessionId } = ctx;

  // GUARD: never upsell a frustrated/angry user.
  if (slots.sentiment === "negative") {
    return { offer: null, suppressed: "negative_sentiment", considered: 0 };
  }

  // Gather candidates, drop ones already shown (DEDUPE).
  const candidates = candidateOffers(slots).filter((o) => !alreadyShown.includes(o.id));
  if (candidates.length === 0) {
    return { offer: null, suppressed: alreadyShown.length ? "all_shown" : "no_trigger", considered: 0 };
  }

  // RANK: score = conversion × margin. One best offer per turn (don't spam).
  const ranked = candidates
    .map((o) => ({ o, score: o.baseConversion * o.baseMargin }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0].o;

  // LOG for the feedback loop.
  logOffer({
    sessionId: sessionId ?? "anon",
    offerId: best.id,
    score: ranked[0].score,
    slots,
    ts: new Date().toISOString(),
  });

  return { offer: best, considered: candidates.length };
}
