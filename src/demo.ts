import { parseMessage } from "./engine/slots.js";
import { getUpsellOffer } from "./engine/upsell.js";
import { checkEligibility } from "./engine/eligibility.js";

const line = (s = "") => console.log(s);
const hr = () => line("─".repeat(70));

interface Case {
  title: string;
  message: string;
  visaId?: string;
  cameViaMmt?: boolean;
}

const CASES: Case[] = [
  { title: "Group of 10 → group discount", message: "Hi, we are travelling in a group of 10, any discount?", visaId: "uae_30_single" },
  { title: "Urgent traveller → express (highest margin, beats group)", message: "I need the Dubai visa urgently, my flight is in 3 days and we are 5 people", visaId: "uae_30_single" },
  { title: "Single entry picked → multi-entry upgrade", message: "I want the 30 day single entry Dubai visa", visaId: "uae_30_single" },
  { title: "First-timer + rejection worry", message: "First time applying, will it get rejected?", visaId: "uae_30_single" },
  { title: "Angry user → ALL upsells suppressed", message: "This is ridiculous, I am still waiting and no response, useless service", visaId: "uae_30_single" },
  { title: "MMT user → eligibility with MMT price note", message: "Can I apply with my Indian passport?", visaId: "uae_60_multi", cameViaMmt: true },
];

for (const c of CASES) {
  hr();
  line(`▶ ${c.title}`);
  line(`  user: "${c.message}"`);

  const slots = parseMessage(c.message);
  slots.visaId = c.visaId;
  line(`  slots: ${JSON.stringify(slots)}`);

  if (c.cameViaMmt !== undefined && c.visaId) {
    const elig = checkEligibility({
      passportNationality: slots.passportNationality ?? "India",
      visaId: c.visaId,
      cameViaMmt: c.cameViaMmt,
    });
    line(`  eligibility: ${elig.canApply}  price ₹${elig.priceInr}`);
    if (elig.mmtNote) line(`  ⚠ MMT: ${elig.mmtNote}`);
  }

  const result = getUpsellOffer({ slots, sessionId: "demo" });
  if (result.offer) {
    line(`   UPSELL → [${result.offer.id}] ${result.offer.pitch}`);
    if (result.offer.code) line(`     code: ${result.offer.code}`);
    line(`     (chosen from ${result.considered} eligible offer(s), ranked by conversion×margin)`);
  } else {
    line(`   no upsell — reason: ${result.suppressed}`);
  }
}
hr();
line("Offers were logged to offers_log.jsonl (feedback-loop hook).");
