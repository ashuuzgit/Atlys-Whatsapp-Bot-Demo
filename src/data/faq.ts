// ─────────────────────────────────────────────────────────────────────────────
// Dubai tourist visa FAQ knowledge base (prototype mock).
// Used for: (a) the "anything else?" follow-up options, and
//           (b) answering a user's own typed question, falling back to an agent.
// All answers are illustrative, not live Atlys policy.
// ─────────────────────────────────────────────────────────────────────────────

export interface FaqEntry {
  id: string;
  q: string;
  a: string;
  tags: string[];       // 'top' = most frequent; plus category tags
  keywords: string[];   // extra match terms
}

export const DUBAI_FAQS: FaqEntry[] = [
  { id: "processing_time", q: "How long does the Dubai visa take?", a: "Standard processing is about 2 to 4 working days. Express delivers in under 48 hours.", tags: ["top", "express"], keywords: ["time", "long", "take", "processing", "days", "fast"] },
  { id: "validity", q: "How long is the Dubai visa valid?", a: "A 30-day visa gives 30 days of stay and a 60-day visa gives 60 days. Validity is counted from your entry date.", tags: ["top", "general"], keywords: ["valid", "validity", "days", "long"] },
  { id: "single_vs_multiple", q: "Single vs multiple entry - what is the difference?", a: "Single entry lets you enter Dubai once. Multiple entry lets you enter and exit as many times as you like within the validity period.", tags: ["top", "single", "multiple"], keywords: ["difference", "single", "multiple", "entry"] },
  { id: "return_ticket", q: "Do I need a return flight ticket?", a: "A confirmed return or onward ticket is recommended and may be checked at immigration, but it is not required to apply.", tags: ["docs"], keywords: ["return", "ticket", "flight", "onward"] },
  { id: "hotel", q: "Do I need a hotel booking?", a: "Proof of accommodation is recommended but not mandatory to apply for the visa.", tags: ["docs"], keywords: ["hotel", "accommodation", "stay", "booking"] },
  { id: "passport_validity", q: "What passport validity do I need?", a: "Your passport must have at least 6 months validity remaining from your date of travel.", tags: ["top", "docs"], keywords: ["passport", "validity", "months", "expire"] },
  { id: "photos", q: "What are the photo requirements?", a: "One recent passport-size photo with a white background and your face clearly visible.", tags: ["docs"], keywords: ["photo", "picture", "size", "background"] },
  { id: "kids", q: "Can children and infants get a Dubai visa?", a: "Yes. Every traveller including infants needs their own visa, applied with their own passport and photo.", tags: ["kids"], keywords: ["child", "children", "infant", "baby", "kid"] },
  { id: "work", q: "Can I work on a Dubai tourist visa?", a: "No. A tourist visa does not allow employment. You would need a work visa sponsored by an employer.", tags: ["general"], keywords: ["work", "job", "employment"] },
  { id: "overstay", q: "What happens if I overstay?", a: "Overstaying leads to a daily fine. Leave before your visa expires or apply for an extension in time.", tags: ["overstay"], keywords: ["overstay", "fine", "expire", "late"] },
  { id: "overstay_fine", q: "What is the overstay fine?", a: "Overstay fines are charged per day by UAE immigration and paid at departure. The amount is set by the authorities.", tags: ["overstay"], keywords: ["fine", "penalty", "overstay", "charge"] },
  { id: "extend", q: "Can I extend my Dubai visa?", a: "Some Dubai visas can be extended once before they expire, for an additional fee. Ask us before the expiry date.", tags: ["extend"], keywords: ["extend", "extension", "renew", "longer"] },
  { id: "refund_rejection", q: "Do I get a refund if my visa is rejected?", a: "With Visa Guarantee, Atlys fees are refunded if your visa is rejected. Without it, government fees are non-refundable.", tags: ["rejection"], keywords: ["refund", "reject", "rejected", "money", "back"] },
  { id: "rejection_reasons", q: "Why do Dubai visas get rejected?", a: "Common reasons are unclear passport scans, wrong photos, previous overstays, or incomplete details. We check your documents to reduce this risk.", tags: ["rejection"], keywords: ["reject", "rejection", "why", "fail", "denied"] },
  { id: "insurance", q: "Do I need travel insurance for Dubai?", a: "Travel insurance is not mandatory for the visa but is strongly recommended and can be added to your application.", tags: ["general"], keywords: ["insurance", "medical", "cover"] },
  { id: "express_time", q: "How fast is express processing?", a: "Express delivers your Dubai visa in under 48 hours, or the express fee is waived.", tags: ["express", "top"], keywords: ["express", "fast", "urgent", "quick", "48"] },
  { id: "five_year_stay", q: "How long can I stay on the 5-year visa?", a: "The 5-year visa allows multiple visits, usually up to 90 days per stay, extendable once, within a 5-year validity.", tags: ["fiveyear"], keywords: ["five", "year", "stay", "long", "1825"] },
  { id: "five_year_worth", q: "Is the 5-year visa worth it?", a: "If you travel to Dubai often, the 5-year multiple entry visa saves you applying each time and works out cheaper per trip.", tags: ["fiveyear"], keywords: ["five", "year", "worth", "frequent"] },
  { id: "bank_statement", q: "Do I need to show bank statements?", a: "Bank statements are not always required for a Dubai tourist visa, but having funds for your trip is advisable.", tags: ["docs"], keywords: ["bank", "statement", "funds", "money"] },
  { id: "family", q: "Can I apply for my whole family together?", a: "Yes. You can add multiple applicants in one application. Groups of 4 or more get 10% off with code GROUP10.", tags: ["top", "kids"], keywords: ["family", "together", "group", "people"] },
  { id: "group_discount", q: "Is there a group discount?", a: "Yes. Groups of 4 or more get 10% off every applicant with code GROUP10, applied in the Atlys app.", tags: ["top"], keywords: ["group", "discount", "coupon", "offer", "cheap"] },
  { id: "payment_methods", q: "What payment methods are accepted?", a: "You can pay by card, UPI, or net banking securely in the Atlys app.", tags: ["payment"], keywords: ["pay", "payment", "card", "upi", "method"] },
  { id: "track_status", q: "Can I track my visa status?", a: "Yes. You can track your application status any time in the Atlys app, and we notify you at each step.", tags: ["top"], keywords: ["track", "status", "where", "progress"] },
  { id: "entry_count", q: "How many times can I enter on a multiple entry visa?", a: "As many times as you like within the visa validity period.", tags: ["multiple"], keywords: ["enter", "times", "multiple"] },
  { id: "when_starts", q: "Does the 30-day count from arrival or issue?", a: "The stay period is counted from your date of entry into the UAE, not from the issue date.", tags: ["top", "single"], keywords: ["start", "count", "arrival", "issue", "from"] },
  { id: "apply_time_before", q: "How early should I apply before travel?", a: "Apply at least 3 to 5 days before travel for standard processing, or use express if you are short on time.", tags: ["top", "express"], keywords: ["early", "before", "advance", "when"] },
  { id: "handwritten_passport", q: "Can I apply with a handwritten passport?", a: "Handwritten passports are usually not accepted for UAE visas. A machine-readable passport is required.", tags: ["docs"], keywords: ["handwritten", "passport", "machine"] },
  { id: "previous_rejection", q: "I was rejected before, can I reapply?", a: "Yes, you can reapply. Share the earlier details so we can correct the issue that caused the rejection.", tags: ["rejection"], keywords: ["previous", "again", "reapply", "before"] },
  { id: "emirates_id", q: "Do I need an Emirates ID?", a: "No. Emirates ID is for residents. Tourists travel on the visa alone.", tags: ["general"], keywords: ["emirates", "resident"] },
  { id: "delivery", q: "How will I receive my visa?", a: "Your approved visa is uploaded to the Atlys app for you to download and carry. No physical copy is needed.", tags: ["top"], keywords: ["receive", "delivery", "get", "download", "copy"] },
];

// Category of the selected visa, used to tailor follow-up questions.
function categoryOf(visaId?: string): string {
  if (!visaId) return "general";
  if (visaId.includes("5yr")) return "fiveyear";
  if (visaId.includes("multi")) return "multiple";
  if (visaId.includes("single")) return "single";
  return "general";
}

// Pick up to 8 relevant follow-up questions: category-specific first, then top.
export function pickFaqs(visaId?: string): FaqEntry[] {
  const cat = categoryOf(visaId);
  const out: FaqEntry[] = DUBAI_FAQS.filter((f) => f.tags.includes(cat)).slice(0, 3);
  for (const f of DUBAI_FAQS) {
    if (out.length >= 8) break;
    if (f.tags.includes("top") && !out.includes(f)) out.push(f);
  }
  for (const f of DUBAI_FAQS) {
    if (out.length >= 8) break;
    if (!out.includes(f)) out.push(f);
  }
  return out.slice(0, 8);
}

const STOP = new Set([
  "the", "a", "an", "is", "are", "do", "does", "i", "my", "to", "for", "of",
  "on", "in", "and", "can", "what", "how", "need", "you", "me", "will", "with",
  "get", "many", "much", "there", "this", "that", "have", "has",
]);
// crude singular stem so "photos" matches "photo", "documents" matches "document".
function stem(w: string): string {
  return w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w;
}
function toks(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w)).map(stem);
}

// Match a free-typed question to the best FAQ, or null if nothing is close.
// Keyword hits are weighted x2 so a single strong term (e.g. "photo") can match,
// while unrelated text (e.g. "pizza") scores 0 and falls back to an agent.
export function matchFaq(text: string): FaqEntry | null {
  const q = toks(text);
  if (!q.length) return null;
  let best: FaqEntry | null = null;
  let bestScore = 0;
  for (const f of DUBAI_FAQS) {
    const kw = new Set(f.keywords.map(stem));
    const qw = new Set(toks(f.q));
    let s = 0;
    for (const w of q) {
      if (kw.has(w)) s += 2;
      else if (qw.has(w)) s += 1;
    }
    if (s > bestScore) { bestScore = s; best = f; }
  }
  return bestScore >= 2 ? best : null;
}
