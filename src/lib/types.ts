/**
 * Domain types for the directory. These mirror `src/db/schema.ts` one-for-one
 * so that the seed-file data source and the Postgres data source are
 * interchangeable behind `src/lib/data.ts`.
 */

export type ClaimStatus = "unclaimed" | "claimed" | "verified_contact";

/**
 * A ladder, not a flag. Each rung gets a distinct visual treatment and is
 * explained on /verification.
 */
export type VerificationLevel =
  | "unverified"
  | "irs_listed"
  | "claimed"
  | "claim_verified"
  | "endorsed";

export const VERIFICATION_ORDER: VerificationLevel[] = [
  "unverified",
  "irs_listed",
  "claimed",
  "claim_verified",
  "endorsed",
];

/**
 * Not a boolean. Many Jewish charities are Israeli amutot with 46א status
 * rather than US 501(c)(3); US donors reaching them usually route through an
 * American "friends of" entity, which is what `usPartnerOrgSlug` records.
 * Getting this wrong means misrepresenting deductibility.
 */
export type TaxStatus =
  | "us_501c3"
  | "israeli_amuta"
  | "uk_charity"
  | "canadian"
  | "other"
  | "unverified";

export type OrgSource = "irs_bmf" | "self_submitted";

export type PaymentMethodType =
  | "zelle"
  | "quickpay"
  | "paypal"
  | "venmo"
  | "check"
  | "wire"
  | "external";

export type CampaignStatus = "active" | "flagged_stale" | "archived" | "complete";

/** IRS BMF income/asset bands, collapsed to something a donor can read. */
export type BudgetBand =
  | "under_100k"
  | "100k_500k"
  | "500k_2m"
  | "2m_10m"
  | "over_10m"
  | "unknown";

export interface Category {
  slug: string;
  nameEn: string;
  nameHe: string;
  iconKey: string;
  blurb: string;
  sortOrder: number;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  /** The Zelle email/phone, PayPal handle, payee name for a check, etc. */
  handle: string;
  displayName: string;
  instructionsMd?: string;
  externalUrl?: string;
  isPrimary: boolean;
  /** Null means the method covers the whole organization. */
  departmentId?: string | null;
  sortOrder: number;
}

export interface Campaign {
  id: string;
  slug: string;
  departmentId?: string | null;
  title: string;
  description: string;
  goalCents?: number | null;
  /**
   * Self-reported by the organization and always will be — there is no
   * transaction data to derive it from. Never render this without
   * `raisedUpdatedAt` beside it.
   */
  raisedCents?: number | null;
  raisedUpdatedAt?: string | null;
  currency: "USD" | "ILS" | "GBP" | "CAD";
  startsAt?: string | null;
  endsAt?: string | null;
  matchMultiplier?: number | null;
  matcherName?: string | null;
  suggestedAmountsCents?: number[];
  status: CampaignStatus;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Endorsement {
  id: string;
  endorserName: string;
  endorserTitle: string;
  quote: string;
  verifiedAt?: string | null;
}

export interface Organization {
  slug: string;
  legalName: string;
  dba?: string | null;
  ein?: string | null;
  taxStatus: TaxStatus;
  usPartnerOrgSlug?: string | null;
  claimStatus: ClaimStatus;
  verificationLevel: VerificationLevel;
  source: OrgSource;

  tagline?: string | null;
  storyMd?: string | null;
  logoUrl?: string | null;
  heroUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;

  addressLine1?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country: string;
  lat?: number | null;
  lng?: number | null;

  rulingYear?: number | null;
  nteeCode?: string | null;
  budgetBand: BudgetBand;

  categorySlugs: string[];
  departments: Department[];
  campaigns: Campaign[];
  paymentMethods: PaymentMethod[];
  endorsements: Endorsement[];

  isPublished: boolean;
  irsLastSyncedAt?: string | null;
}

/** A logged gift — the maaser ledger. Self-reported after a handoff. */
export interface Gift {
  id: string;
  orgSlug: string;
  orgName: string;
  campaignId?: string | null;
  amountCents: number;
  currency: string;
  givenAt: string;
  paymentMethodType?: PaymentMethodType | null;
  note?: string;
  ein?: string | null;
}

export type GivingListStatus = "pending" | "given" | "skipped";

export interface GivingListItem {
  id: string;
  orgSlug: string;
  orgName: string;
  campaignId?: string | null;
  campaignTitle?: string | null;
  amountCents: number;
  status: GivingListStatus;
  addedAt: string;
}

export interface MaaserSettings {
  /** Annual income in cents. Stored on the donor's own device by default. */
  annualIncomeCents: number;
  /** Chosen percentage — 10 for maaser, 20 for chomesh, anything else. */
  percent: number;
  /** ISO date (MM-DD) the donor's giving year starts. Default 01-01. */
  fiscalYearStart: string;
}
