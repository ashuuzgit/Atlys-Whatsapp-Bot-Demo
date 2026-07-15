export interface FaqEntry {
  id: string;
  q: string;
  a: string;
  tags: string[];       // 'top' = most frequent; plus category tags
  keywords: string[];   // extra match terms
  escalate?: boolean;   // true = this topic should route to a human agent,
                         // not just return a canned answer (mirrors the KB's
                         // Escalation Matrix - refund, cancellation, rejection-
                         // linked refund claims, and location-dependent
                         // extension questions are not safe as pure self-service)
}

// Sources of truth: (1) the internal UAE visa KB v1, (2) the business-team
// fill-in sheet v2, and (3) a direct Q&A pass with the business team that
// resolved every contradiction between v1 and v2 (see answers below). Where
// the direct answers were themselves ambiguous or compound, that is noted
// inline rather than guessed at.
//
//   RESOLVED - overstay fine: AED 50 per day of overstay. If overstay
//   continues past 5 days (treated as absconding), a AED 2500 fine applies.
//   RESOLVED - children's visa fee: same as an individual applicant, no
//   discount or free tier.
//   RESOLVED - grace period after expiry: none (0 days). Matches v2's "not a
//   single grace day."
//   RESOLVED - extension fee: INR 30,000 covers the 30-day extension in full;
//   the separate AED figure is not used.
//   RESOLVED - processing-start boundary (refund eligibility): starts once
//   the application reaches "Pending Approval" status. Before that, full
//   refund; once reached, no refund. All-or-nothing, no partial refunds.
//   RESOLVED - processing time: Regular up to 48 hours, Express up to 32
//   hours. The earlier "2 working days" / "4-5 days" framing is retired.
//
//   STILL AMBIGUOUS - family/minor cancellation: the direct answers to
//   "can one family member cancel without affecting others" and "is a
//   minor's visa cancelled differently" were compound/unclear and do not
//   fully agree with each other. Kept escalate-flagged rather than guessed.
//   STILL AMBIGUOUS - existing UAE resident applying for a tourist visa: the
//   question was compound and the one-word answer doesn't disambiguate which
//   half it answers. Kept escalate-flagged.
//   STILL UNCONFIRMED - AtlysProtect refund-on-rejection claim (skipped).
export const DUBAI_FAQS: FaqEntry[] = [
  { id: "processing_time", q: "How long does the Dubai visa take?", a: "Standard processing takes up to 48 hours. Express processing delivers in under 32 hours.", tags: ["top", "express"], keywords: ["time", "long", "take", "processing", "days", "fast", "kitna", "milega", "kab"] },
  { id: "entry_window_days", q: "How long do I have to enter the UAE after my visa is issued?", a: "You have 60 days from the date of issue to enter the UAE. This is your visa's validity window. Your actual stay (30 or 60 days, depending on your visa) starts from the day you enter the UAE.", tags: ["general"], keywords: ["entrywindow", "60days", "issue", "enter", "validfrom", "validto"] },
  { id: "validity", q: "What's the difference between visa validity and how long I can stay?", a: "Visa validity is the period during which you must enter the UAE. Your stay duration starts from your actual date of entry. For example, a 30-day visa allows 30 days of stay from arrival, while a 60-day visa allows 60 days.", tags: ["top", "general"], keywords: ["valid", "validity", "days", "long", "stay", "window"] },
  { id: "single_vs_multiple", q: "Single vs multiple entry - what is the difference?", a: "A single-entry visa allows one entry into the UAE. A multiple-entry visa allows you to enter and leave the UAE as many times as you like during the visa's validity period.", tags: ["top", "single", "multiple"], keywords: ["difference", "single", "multiple", "entry"] },
  { id: "entry_count", q: "How many times can I enter on a multiple-entry visa?", a: "You can enter and exit the UAE as many times as you like within the visa's validity period.", tags: ["multiple"], keywords: ["enter", "times", "multiple"] },
  { id: "when_starts", q: "Does the 30-day stay count from arrival or visa issue?", a: "The stay period starts from your date of entry into the UAE, not from the visa issue date.", tags: ["top", "single"], keywords: ["start", "count", "arrival", "issue", "from"] },
  { id: "express_time", q: "How fast is express processing?", a: "Express processing delivers your Dubai visa in under 32 hours. If it takes longer, the express processing fee is waived.", tags: ["express", "top"], keywords: ["express", "fast", "urgent", "quick", "32"] },
  { id: "apply_time_before", q: "How early should I apply before travelling?", a: "Standard processing takes up to 48 hours, while express processing takes up to 32 hours. If you're travelling soon, choosing express processing is recommended.", tags: ["express"], keywords: ["early", "before", "advance", "when"] },
  { id: "visa_choice_help", q: "Which visa type should I choose?", a: "It depends on your travel plans:\n- 30-day single-entry: Best for a one-time visit.\n- Multiple-entry: Ideal if you'll leave and re-enter the UAE during your trip.\n- 5-year multiple-entry: Suitable for frequent travellers.", tags: ["general", "top"], keywords: ["which", "choose", "recommend", "best", "suitable"] },
  { id: "five_year_stay", q: "How long can I stay on the 5-year visa?", a: "The 5-year multiple-entry visa allows stays of up to 180 days per visit during its 5-year validity period.", tags: ["fiveyear", "top"], keywords: ["five", "year", "stay", "long", "1825", "180"] },
  { id: "five_year_worth", q: "Is the 5-year visa worth it?", a: "If you travel to Dubai frequently, the 5-year visa saves you from applying for a new visa before every trip and is generally more economical over time.", tags: ["fiveyear"], keywords: ["five", "year", "worth", "frequent"] },
  { id: "processing_business_days", q: "Are processing times counted in business days or calendar days?", a: "Processing times are calculated in business days. UAE public holidays may delay processing, while Indian public holidays do not.", tags: ["general"], keywords: ["business", "calendar", "days", "holiday", "weekend"] },
  { id: "transit_visa_layover", q: "Do I need a visa if I'm only transiting through Dubai Airport?", a: "Visa requirements depend on your layover duration and airline. Please connect with a human agent for confirmation.", tags: ["general"], keywords: ["transit", "layover", "airport", "stopover", "connecting"], escalate: true },
  { id: "passport_validity", q: "What passport validity is required?", a: "Your passport must be valid for at least 6 months from your travel date and contain at least 3 blank pages.", tags: ["top", "docs"], keywords: ["passport", "validity", "months", "expire", "blank", "pages"] },
  { id: "single_name_passport", q: "Can I apply if my passport has no surname?", a: "Yes. Passports with only a first name or only a surname are supported and do not cause issues at UAE immigration.", tags: ["docs"], keywords: ["surname", "single", "name", "last"] },
  { id: "photos", q: "What are the photo requirements?", a: "Upload one recent passport-size photograph with:\n- White background\n- Neutral facial expression\n- No glasses\n- No shadows on the face", tags: ["docs"], keywords: ["photo", "picture", "size", "background"] },
  { id: "return_ticket", q: "Do I need a return flight ticket?", a: "A confirmed return or onward ticket is recommended and may be checked by immigration, but it is not required for the visa application.", tags: ["docs"], keywords: ["return", "ticket", "flight", "onward"] },
  { id: "hotel", q: "Do I need a hotel booking?", a: "Proof of accommodation is recommended but is not mandatory for the visa application.", tags: ["docs"], keywords: ["hotel", "accommodation", "stay", "booking"] },
  { id: "bank_statement", q: "Do I need to submit bank statements?", a: "Bank statements are not always required for a Dubai tourist visa. However, having sufficient funds for your trip is advisable and immigration may request proof if needed.", tags: ["docs"], keywords: ["bank", "statement", "funds", "money"] },
  { id: "handwritten_passport", q: "Can I apply with a handwritten passport?", a: "No. Only machine-readable passports are accepted.", tags: ["docs"], keywords: ["handwritten", "passport", "machine"] },
  { id: "password_pdf", q: "Can I upload a password-protected PDF?", a: "No. Please upload an unprotected PDF.", tags: ["docs"], keywords: ["password", "protected", "pdf", "locked", "encrypted"] },
  { id: "document_replace", q: "I uploaded the wrong or blurry document, can I replace it?", a: "Yes. You can replace uploaded documents directly within the Atlys app without restarting your application.", tags: ["docs", "top"], keywords: ["replace", "reupload", "wrong", "blurry", "unclear", "fix", "document"] },
  { id: "passport_lost_damaged", q: "My passport is lost, stolen, or damaged. What should I do?", a: "You'll need to obtain a replacement passport through the relevant passport authority or your embassy. Please connect with a human agent regarding your application.", tags: ["docs"], keywords: ["lost", "stolen", "damaged", "torn", "waterdamaged", "passport"], escalate: true },
  { id: "name_change_process", q: "I changed my name (for example, after marriage). What happens to my application?", a: "Existing applications cannot be updated with a new name. If your passport has changed, you'll need to submit a new application using the updated passport. Please connect with a human agent.", tags: ["docs"], keywords: ["name", "change", "changed", "marriage", "married"], escalate: true },
  { id: "nationality_change_process", q: "What if my nationality changes during my application?", a: "Nationality is linked to your passport, so this situation generally does not arise during an application. No separate process exists.", tags: ["docs"], keywords: ["nationality", "change", "changed"] },
  { id: "passport_renewed_midway", q: "My passport was renewed while my application was in progress. What happens?", a: "Passport details are locked once documents are submitted. Please connect with a human agent to review your application.", tags: ["docs"], keywords: ["renew", "renewed", "new", "passport", "changed"], escalate: true },
  { id: "non_indian", q: "I don't hold an Indian passport. Can I still apply?", a: "Eligibility depends on your nationality. Most nationalities are supported except African nationalities (South Africa is an exception), Afghan nationals, and certain Pakistani applicants. Please connect with a human agent to confirm your eligibility.", tags: ["general", "top"], keywords: ["nationality", "non", "indian", "other", "citizen", "african", "pakistani", "afghan"], escalate: true },
  { id: "min_age", q: "Is there a minimum age to apply as the primary applicant?", a: "Yes. The primary applicant must be at least 18 years old. Minors can be added as co-travellers under an adult's application.", tags: ["general"], keywords: ["age", "minimum", "18", "adult", "primary"] },
  { id: "solo_travel", q: "Can I apply if I'm travelling alone?", a: "Yes. Solo travellers can apply through the standard process.", tags: ["general"], keywords: ["alone", "solo", "single", "traveller", "myself"] },
  { id: "work", q: "Can I work on a Dubai tourist visa?", a: "No. A tourist visa does not permit employment. You must obtain a work visa sponsored by an employer.", tags: ["general"], keywords: ["work", "job", "employment"] },
  { id: "emirates_id", q: "Do I need an Emirates ID?", a: "No. Emirates ID is only for UAE residents. Tourists travel using their visa.", tags: ["general"], keywords: ["emirates", "resident"] },
  { id: "resident_tourist_visa", q: "I'm an existing UAE resident. Can I apply for a tourist visa?", a: "Eligibility depends on your residency status. Please connect with a human agent.", tags: ["general"], keywords: ["resident", "residency", "tourist", "existing"], escalate: true },
  { id: "existing_visa_reject", q: "I already have a valid UAE visa. Can I apply for another one?", a: "No. If you already hold a valid UAE visa, a new tourist visa application will be rejected.", tags: ["general", "top"], keywords: ["already", "existing", "have", "valid", "reject", "another"] },
  { id: "blacklisted_traveler", q: "Can I apply if I was previously deported or blacklisted from the UAE?", a: "Applicants who are blacklisted cannot apply for a new visa. If you're unsure of your status, please connect with a human agent.", tags: ["rejection"], keywords: ["blacklisted", "deported", "banned", "previously"], escalate: true },
  { id: "pregnant_traveler", q: "Is there a different process for pregnant travellers?", a: "No. The standard application process applies.", tags: ["general"], keywords: ["pregnant", "pregnancy", "traveller"] },
  { id: "elderly_disabled_traveler", q: "Is there special support for elderly or disabled travellers?", a: "No. The standard application process applies to all travellers.", tags: ["general"], keywords: ["elderly", "disabled", "disability", "support", "special"] },
  { id: "voa", q: "Can I get a visa on arrival instead?", a: "Atlys does not process visas on arrival. Some travellers may independently qualify through UAE immigration based on their travel documents. Please connect with a human agent.", tags: ["general"], keywords: ["arrival", "voa", "land", "without", "applying"], escalate: true },
  { id: "other_visa_types", q: "Do you offer business, student, transit, or cruise visas?", a: "No. Only 30-day single-entry, 60-day multiple-entry, and 5-year multiple-entry tourist visas are available.", tags: ["general"], keywords: ["business", "student", "transit", "cruise", "layover", "study"] },
  { id: "kids", q: "Can children and infants get a Dubai visa?", a: "Yes. A minor cannot apply independently and must be linked to a parent's application. A parent or guardian must accompany any traveller under 18. Required documents include:\n- Parent's photo ID\n- A copy of the parent's Dubai visa\n- The child's machine-readable passport\n- Birth certificate\n\nA child pays the same fee as an individual applicant, with no discount or free tier.", tags: ["kids"], keywords: ["child", "children", "infant", "baby", "kid", "minor"] },
  { id: "child_fee", q: "How much does a child's visa cost?", a: "A child pays the same fee as an individual adult applicant. There is no discount or free tier for children. Groups of 4 or more, including children, get 10% off using code GROUP10.", tags: ["kids", "top"], keywords: ["child", "children", "kid", "fee", "cost", "price", "pay", "howmuch", "free", "discount"] },
  { id: "child_alone_travel", q: "Can a child travel and apply without a parent?", a: "A child's visa must be linked to a parent's application, and a parent or guardian must accompany any traveller under 18. Atlys does not support a fully independent application for an unaccompanied minor. Please connect with a human agent.", tags: ["kids"], keywords: ["child", "alone", "unaccompanied", "without", "parent"], escalate: true },
  { id: "family", q: "Can I apply for my whole family together?", a: "Yes. There is no cap on the number of co-travellers, and each traveller submits their own documents. Groups of 4 or more get 10% off using code GROUP10, an Atlys offer separate from government visa fees.", tags: ["top", "kids"], keywords: ["family", "together", "group", "people"] },
  { id: "add_cotraveler_process", q: "How do I add co-travellers to my application?", a: "You can add co-travellers directly during the application. Each co-traveller submits their own passport photo and personal photograph, the same as the primary applicant.", tags: ["kids"], keywords: ["add", "cotraveler", "family", "member", "howto"] },
  { id: "group_discount", q: "Is there a group discount?", a: "Yes. Groups of 4 or more get 10% off every applicant using code GROUP10, applied in the Atlys app. This is an Atlys offer, not a government fee waiver.", tags: ["top"], keywords: ["group", "discount", "coupon", "offer", "cheap"] },
  { id: "co_traveler_timing", q: "If we apply together, will everyone be approved at the same time?", a: "Not necessarily. Co-travellers can be added to one application, but for adults, individual visas within the group can be processed and approved at different times, even if submitted together.", tags: ["kids"], keywords: ["cotraveler", "together", "sametime", "group", "family", "approved"] },
  { id: "family_split", q: "Can my family apply separately even if we planned to apply together?", a: "Yes. A family or group application can be split into separate applications without issue.", tags: ["kids"], keywords: ["split", "separately", "apart", "family", "individually"] },
  { id: "family_cancel_nuance", q: "If my family applies together, can one person cancel without affecting the others?", a: "In general, co-travellers can be cancelled individually without affecting the rest of the group. Where a minor's visa is linked to a parent's application, that linkage can change how cancellation works. Please connect with a human agent to confirm your specific case.", tags: ["kids"], keywords: ["family", "cancel", "one", "member", "affect", "others"], escalate: true },
  { id: "minor_cancel_nuance", q: "Is a minor's visa cancelled differently from an adult's?", a: "It can be, since a minor's visa is linked to a parent's application. Please connect with a human agent to confirm how cancellation works for your family's specific case.", tags: ["kids"], keywords: ["minor", "cancel", "child", "different"], escalate: true },
  { id: "payment_methods", q: "What payment methods are accepted?", a: "You can pay by card, including international cards, UPI, net banking, or wallet, securely in the Atlys app. Someone else can also pay on your behalf.", tags: ["payment"], keywords: ["pay", "payment", "card", "upi", "method", "wallet", "international"] },
  { id: "duplicate_charge", q: "I was charged twice for my visa. What do I do?", a: "Please connect with a human agent and share your transaction details so your payment records can be checked and resolved.", tags: ["payment"], keywords: ["double", "twice", "duplicate", "charged", "again"], escalate: true },
  { id: "chargeback", q: "I want to file a chargeback with my bank for this payment.", a: "A chargeback is a bank-initiated dispute and is handled differently from a standard refund request. Please connect with a human agent for direct assistance.", tags: ["payment"], keywords: ["chargeback", "dispute", "bank", "reverse"], escalate: true },
  { id: "refund_rejection", q: "Will I get a refund if my visa is rejected?", a: "Refund eligibility is all-or-nothing and is based on your application's status, not the outcome. Once your application reaches Pending Approval, it is considered processed and no refund applies, whether it is later approved or rejected. Before that stage, cancelling gets a full refund. Please connect with a human agent to confirm where your application currently stands.", tags: ["rejection", "top"], keywords: ["refund", "reject", "rejected", "money", "back", "paisa", "wapas"], escalate: true },
  { id: "cancel_refund_full", q: "How do I cancel my application?", a: "You can cancel from the Help Centre in the Atlys app. A full refund applies if you cancel before your application reaches Pending Approval status; once it reaches that stage, it is not refundable. Please connect with a human agent to confirm the status of your specific application.", tags: ["rejection"], keywords: ["cancel", "cancellation", "stop", "withdraw"], escalate: true },
  { id: "cancel_doc_review_refund", q: "If I cancel while my documents are still being reviewed, do I get a full refund?", a: "Yes. Your application reaching Pending Approval is the point at which processing is considered to have started. Before that, including while documents are under review or if you cancel due to a wrong travel date, you get a full refund. Please connect with a human agent to confirm where your application currently stands.", tags: ["rejection"], keywords: ["cancel", "review", "fullrefund", "100", "wrongdate"], escalate: true },
  { id: "duplicate_application", q: "I accidentally submitted my application twice. What happens?", a: "No action is needed. If a duplicate application is detected, it is cancelled automatically on Atlys's end.", tags: ["general"], keywords: ["duplicate", "twice", "again", "submitted", "accidentally"] },
  { id: "atlys_protect_claim", q: "Is the AtlysProtect refund guarantee real?", a: "This has not been confirmed and depends on your application's status. Please connect with a human agent for your specific case.", tags: ["rejection"], keywords: ["atlysprotect", "guarantee", "protect", "moneyback"], escalate: true },
  { id: "download_issue", q: "My visa is approved but I can't download it.", a: "Downloading your approved visa requires the applicable service fee to be paid first. If you've already paid and still can't download it, please connect with a human agent.", tags: ["general"], keywords: ["download", "cant", "unable", "approved", "receive"], escalate: true },
  { id: "someone_else_download", q: "Can someone else download my visa for me?", a: "Yes. Someone else can download your visa on your behalf if they have your Atlys account login details.", tags: ["general"], keywords: ["someone", "else", "download", "behalf", "collect"] },
  { id: "rejection_reasons", q: "Why do Dubai visas get rejected?", a: "Immigration does not disclose a specific reason. Common contributing factors include unclear travel purpose, missing ties to your home country, weak travel history, or insufficient funds for your stay.", tags: ["rejection", "top"], keywords: ["reject", "rejection", "why", "fail", "denied"] },
  { id: "previous_rejection", q: "I was rejected before. Can I reapply?", a: "Yes. There is no cooling-off period, and you can reapply right away, though approval is not guaranteed. Since immigration does not share the exact rejection reason, adding clearer financial proof can help if funds were a likely factor.", tags: ["rejection"], keywords: ["previous", "again", "reapply", "before"] },
  { id: "criminal_background", q: "Will a past visa rejection or travel issue affect this application?", a: "This is a sensitive, case-specific question. Please connect with a human agent for a direct review.", tags: ["rejection"], keywords: ["criminal", "record", "background", "history", "issue", "disclose"], escalate: true },
  { id: "correction_fee", q: "I noticed an error on my approved visa. How do I fix it?", a: "You can request a correction from the Help Centre in the Atlys app once your visa is approved. This costs 4,500 rupees and takes 24 to 48 working hours. If the field affected is your name shown alongside your father's name, or your profession, that is standard formatting, not an error, and does not need correction.", tags: ["general"], keywords: ["correct", "correction", "wrong", "mistake", "typo", "edit", "amount", "howmuch"] },
  { id: "name_profession_display", q: "My father's name shows next to mine, or my profession looks off. Is that an error?", a: "No correction is needed. Your name appearing alongside your father's name is standard procedure, and minor profession-field differences are not considered critical by immigration. Neither affects entry. If you spot any other discrepancy, flag it for review.", tags: ["general"], keywords: ["fathername", "profession", "job", "field", "wrong", "display"] },
  { id: "track_status", q: "Can I track my visa status?", a: "Yes. You can track your application status any time in the Atlys app. Pending Approval means it is being processed and a decision will be shared before the date shown; Pending Documents means something is still missing from your upload.", tags: ["top"], keywords: ["track", "status", "where", "progress", "pending", "kahan", "update"] },
  { id: "apply_later_status", q: "I applied but my travel date is more than 30 days away. Why hasn't it moved?", a: "This is expected. Per government regulation, applications are only sent to the embassy once your travel date is less than 30 days away, shown as Apply Later status. Submission happens automatically at that point; no action is needed from you.", tags: ["general", "top"], keywords: ["applylater", "later", "notmoving", "notsubmitted", "30days", "waiting"] },
  { id: "tracking_stages", q: "What do the tracking stages in the app mean?", a: "After submission, you may see stages such as sent to the immigration supervisor, sent to internal intelligence, or sent to clearance officer. These are normal in-app tracking checkpoints, not a sign of a problem.", tags: ["general"], keywords: ["stage", "tracking", "supervisor", "clearance", "intelligence"] },
  { id: "under_review_who", q: "When my application says Under Review, who is reviewing it?", a: "That stage means Atlys's own internal team is reviewing your application before it moves further along.", tags: ["general"], keywords: ["underreview", "review", "who", "reviewing"] },
  { id: "embassy_delay", q: "It has been more than 48 hours since submission and my status hasn't changed.", a: "A delay in reaching the embassy beyond 48 hours after submission can happen due to missing documents or high application volume. Please connect with a human agent to check your specific application.", tags: ["general"], keywords: ["48hours", "notsubmitted", "delay", "stuck", "embassy"], escalate: true },
  { id: "delivery", q: "How will I receive my visa?", a: "Your approved visa is uploaded to the Atlys app for you to download and carry. No physical copy is needed. You can also independently verify it on the UAE government's ICP portal using your passport details.", tags: ["top"], keywords: ["receive", "delivery", "get", "download", "copy", "verify"] },
  { id: "verify_visa", q: "How can I check that my visa is genuine?", a: "You can independently verify your visa on the UAE government's ICP Smart Services portal using your passport number, passport expiry date, and nationality, in addition to viewing it in the Atlys app.", tags: ["general"], keywords: ["verify", "genuine", "real", "check", "government", "icp"] },
  { id: "extend", q: "Can I extend my Dubai visa?", a: "Yes, but only while you are physically present in the UAE. A first extension of 30 days is possible, and a second extension can follow, though your total stay should not exceed 90 days from your initial entry. If you're asking about extending while already outside the UAE, please connect with a human agent to confirm your specific case.", tags: ["extend", "top"], keywords: ["extend", "extension", "renew", "longer", "renewal"] },
  { id: "extension_docs", q: "What do I need to apply for a visa extension?", a: "A passport valid at least 6 months beyond the new extended period, a copy of your current visa, proof of accommodation for the extended period, and a completed extension form. This can only be applied for while you are physically in the UAE. The 30,000 rupee fee covers a 30-day extension in full.", tags: ["extend"], keywords: ["extension", "documents", "extend", "need", "apply"] },
  { id: "expired_before_extension", q: "My visa already expired. Can I still extend it?", a: "No. Extensions must be requested before your visa expires; there is no grace period once it has expired. If it has already expired, you would need to leave the UAE and may need to reapply for a new visa to re-enter. Please connect with a human agent to confirm your specific situation.", tags: ["extend"], keywords: ["expired", "already", "graceperiod", "late", "extend"], escalate: true },
  { id: "extension_cancel_transfer", q: "Can I cancel my extension or transfer it to someone else?", a: "You can cancel an extension for a 100% refund. An extension cannot be transferred to another person.", tags: ["extend"], keywords: ["extension", "cancel", "transfer", "another", "person"] },
  { id: "overstay", q: "What happens if I overstay?", a: "Overstaying results in a fine of 50 AED per day, payable before departure. If the overstay continues beyond 5 days, it is treated as absconding, and a 2,500 AED fine applies. Leave before your visa expires or apply for an extension in time.", tags: ["overstay", "top"], keywords: ["overstay", "fine", "expire", "late", "penalty", "charge", "zyada", "din", "rukna", "abscond"] },
  { id: "travel_postponed", q: "My travel plans got delayed. What should I do with my visa?", a: "If your trip is significantly delayed, it is often best to cancel the current application and reapply closer to your new travel date, rather than risk an invalid or expired visa.", tags: ["general"], keywords: ["postpone", "delay", "pushed", "reschedule", "later", "changed"] },
  { id: "inter_emirate_travel", q: "Can I visit Abu Dhabi or Sharjah with my Dubai visa?", a: "Yes. A Dubai-issued visa is valid for entry and travel across all seven Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al-Quwain. You can also enter through one Emirate and exit through another.", tags: ["general", "top"], keywords: ["abu", "dhabi", "sharjah", "emirate", "ajman", "fujairah", "visit"] },
  { id: "gcc_travel", q: "Can I use my Dubai visa to visit Saudi Arabia or Qatar?", a: "No. A Dubai visa only covers the seven Emirates. Entry into other Gulf countries such as Saudi Arabia, Qatar, Oman, Bahrain, or Kuwait needs a separate visa for that country.", tags: ["general"], keywords: ["saudi", "qatar", "oman", "bahrain", "kuwait", "gcc", "gulf"] },
  { id: "oktb", q: "What is OKTB, and do I need it before my flight?", a: "OKTB, or OK-to-Board, is airline approval confirming you hold a valid UAE visa. Some airlines require it before boarding. If your visa was issued via certain partner airlines, it is usually automatic; otherwise, you may need to share your visa copy with the airline. Confirm requirements with your airline a few days before flying.", tags: ["general"], keywords: ["oktb", "boarding", "board", "airline", "clearance"] },
  { id: "vaccination", q: "Do I need any vaccinations to enter Dubai?", a: "There is no mandatory vaccination requirement documented for entry. It's a good idea to check current health advisories closer to your travel date.", tags: ["general"], keywords: ["vaccine", "vaccination", "health", "covid", "medical"] },
  { id: "insurance", q: "Do I need travel insurance for Dubai?", a: "No, it is not mandatory, but it is strongly recommended and can be added to your application.", tags: ["general"], keywords: ["insurance", "medical", "cover"] },
  { id: "add_insurance_later", q: "Can I add travel insurance after I've already submitted my application?", a: "Yes. Go to Profile, select your UAE application, and choose the travel insurance option to purchase it.", tags: ["general"], keywords: ["insurance", "add", "later", "after", "submitted"] },
  { id: "insurance_date_change", q: "Can I change my travel insurance dates?", a: "Yes. You can adjust the dates from the Help Centre in the Atlys app, as long as the new dates fall within your originally purchased coverage. Changes need to be made before travel, so update it as soon as your plans change.", tags: ["general"], keywords: ["insurance", "date", "change", "update"] },
  { id: "login_issue", q: "I can't log in to the Atlys app.", a: "A human agent can raise a query to reset your password and help recover your account access. Please share the login method you originally used, such as mobile number, email, or Google, when connected.", tags: ["general"], keywords: ["login", "sign", "account", "password", "access", "reset"], escalate: true },
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
