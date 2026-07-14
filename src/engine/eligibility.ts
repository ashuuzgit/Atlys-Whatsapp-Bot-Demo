
import {
  DUBAI_DOCUMENTS,
  findVisa,
  nationalityStatus,
  VisaOption,
} from "../data/visas.js";

export interface EligibilityResult {
  canApply: "yes" | "conditional" | "no";
  visa?: VisaOption;
  note?: string;
  requiredDocuments: string[];
  standardProcessing: string;
  expressProcessing?: string;
  priceInr?: number;
  mmtNote?: string;
}

export function checkEligibility(params: {
  passportNationality: string;
  visaId: string;
  cameViaMmt?: boolean;
}): EligibilityResult {
  const visa = findVisa(params.visaId);
  if (!visa) {
    return {
      canApply: "no",
      requiredDocuments: [],
      standardProcessing: "-",
      note: `Unknown visa option "${params.visaId}".`,
    };
  }

  const natStatus = nationalityStatus(params.passportNationality);

  return {
    canApply: natStatus,
    visa,
    note:
      natStatus === "conditional"
        ? "Your nationality needs additional document verification — a specialist will confirm before submission."
        : undefined,
    requiredDocuments: DUBAI_DOCUMENTS,
    standardProcessing: `${visa.standardProcessingDays} working days`,
    expressProcessing: visa.expressAvailable
      ? `${visa.expressProcessingHours} hours (+₹${visa.expressAddonInr})`
      : undefined,
    priceInr: visa.priceInr,
    // MMT-specific note directly addresses the "MMT Expectation Mismatch" NPS root cause.
    mmtNote: params.cameViaMmt
      ? "Your MakeMyTrip package price does NOT include the visa fee shown above - this is billed separately by Atlys."
      : undefined,
  };
}
