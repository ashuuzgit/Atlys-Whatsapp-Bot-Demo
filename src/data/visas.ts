
export type EntryType = "single" | "multiple";

export interface VisaOption {
  id: string;
  label: string;
  durationDays: number;      // stay validity
  entry: EntryType;
  priceInr: number;
  standardProcessingDays: number;
  expressAvailable: boolean;
  expressProcessingHours: number;
  expressAddonInr: number;
}

// The 5–6 options shown as the WhatsApp button menu for "Dubai Visa".
export const DUBAI_VISAS: VisaOption[] = [
  {
    id: "uae_30_single",
    label: "Dubai 30-day - Single entry",
    durationDays: 30,
    entry: "single",
    priceInr: 6500,
    standardProcessingDays: 2,
    expressAvailable: true,
    expressProcessingHours: 32,
    expressAddonInr: 3000,
  },
  {
    id: "uae_30_multi",
    label: "Dubai 30-day - Multiple entry",
    durationDays: 30,
    entry: "multiple",
    priceInr: 9500,
    standardProcessingDays: 2,
    expressAvailable: true,
    expressProcessingHours: 32,
    expressAddonInr: 3000,
  },
  {
    id: "uae_60_single",
    label: "Dubai 60-day - Single entry",
    durationDays: 60,
    entry: "single",
    priceInr: 11000,
    standardProcessingDays: 2,
    expressAvailable: true,
    expressProcessingHours: 32,
    expressAddonInr: 3500,
  },
  {
    id: "uae_60_multi",
    label: "Dubai 60-day - Multiple entry",
    durationDays: 60,
    entry: "multiple",
    priceInr: 14500,
    standardProcessingDays: 2,
    expressAvailable: true,
    expressProcessingHours: 32,
    expressAddonInr: 3500,
  },
  {
    id: "uae_5yr_multi",
    label: "Dubai 5-year - Multiple entry",
    durationDays: 1825,
    entry: "multiple",
    priceInr: 55000,
    standardProcessingDays: 2,
    expressAvailable: true,
    expressProcessingHours: 32,
    expressAddonInr: 4000,
  },
];

export const DUBAI_DOCUMENTS: string[] = [
  "Passport scan - front & back, min. 6 months validity remaining",
  "Passport-size photo - white background, face clearly visible",
];


const CONDITIONAL_NATIONALITIES = new Set(["pakistan", "bangladesh", "afghanistan",
   "iraq", "yemen"]);

export function nationalityStatus(passportNationality: string): "yes" | "conditional" {
  return CONDITIONAL_NATIONALITIES.has(passportNationality.trim().toLowerCase())
    ? "conditional"
    : "yes";
}

export function findVisa(visaId: string): VisaOption | undefined {
  return DUBAI_VISAS.find((v) => v.id === visaId);
}

// Is a multi-entry version of the given single-entry visa available?
export function multiEntryUpgradeFor(visa: VisaOption): VisaOption | undefined {
  if (visa.entry !== "single") return undefined;
  return DUBAI_VISAS.find(
    (v) => v.entry === "multiple" && v.durationDays === visa.durationDays
  );
}

// Is a longer-validity version available (e.g. 30-day → 60-day, same entry type)?
export function longerValidityFor(visa: VisaOption): VisaOption | undefined {
  return DUBAI_VISAS.find(
    (v) => v.entry === visa.entry && v.durationDays > visa.durationDays
  );
}
