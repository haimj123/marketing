import type { BudgetBand, PaymentMethodType, TaxStatus, VerificationLevel } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number, opts: { exact?: boolean } = {}): string {
  if (opts.exact || cents % 100 !== 0) return usdCents.format(cents / 100);
  return usd.format(cents / 100);
}

export function formatCompactCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${trim(dollars / 1_000_000)}M`;
  if (dollars >= 1_000) return `$${trim(dollars / 1_000)}K`;
  return usd.format(dollars);
}

function trim(n: number): string {
  return n >= 10 ? String(Math.round(n)) : n.toFixed(1).replace(/\.0$/, "");
}

export function formatPercent(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return Math.min(999, Math.round((part / whole) * 100));
}

/**
 * "3 days ago". Rendered next to every self-reported figure — a progress bar
 * without a timestamp is a claim with no date on it.
 */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return "date unknown";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "date unknown";
  const days = Math.floor((now - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function daysSince(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((now - then) / 86_400_000);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatEin(ein: string | null | undefined): string | null {
  if (!ein) return null;
  const digits = ein.replace(/\D/g, "");
  if (digits.length !== 9) return ein;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export const BUDGET_BAND_LABEL: Record<BudgetBand, string> = {
  under_100k: "Under $100K a year",
  "100k_500k": "$100K – $500K a year",
  "500k_2m": "$500K – $2M a year",
  "2m_10m": "$2M – $10M a year",
  over_10m: "Over $10M a year",
  unknown: "Budget not reported",
};

export const TAX_STATUS_LABEL: Record<TaxStatus, string> = {
  us_501c3: "US 501(c)(3)",
  israeli_amuta: "Israeli amuta (46א)",
  uk_charity: "UK registered charity",
  canadian: "Canadian registered charity",
  other: "Other jurisdiction",
  unverified: "Status unverified",
};

/**
 * The deductibility sentence. Never imply a gift is deductible unless the
 * record supports it, and always name whose determination it is.
 */
export const TAX_STATUS_NOTE: Record<TaxStatus, string> = {
  us_501c3:
    "The IRS lists this organization as eligible to receive tax-deductible contributions. Confirm with your own tax adviser.",
  israeli_amuta:
    "This is an Israeli organization. A gift sent directly to it is generally not deductible on a US return. Check whether an American friends organization is listed below.",
  uk_charity:
    "Registered in the United Kingdom. A gift is generally not deductible on a US return.",
  canadian:
    "Registered in Canada. US deductibility is limited and depends on treaty rules — ask your tax adviser.",
  other:
    "Deductibility depends on your country of residence. We make no representation either way.",
  unverified:
    "We have not been able to confirm this organization's tax status. Do not assume a gift is deductible.",
};

export const VERIFICATION_LABEL: Record<VerificationLevel, string> = {
  unverified: "Unverified",
  irs_listed: "IRS listed",
  claimed: "Claimed",
  claim_verified: "Verified",
  endorsed: "Endorsed",
};

export const VERIFICATION_MEANING: Record<VerificationLevel, string> = {
  unverified: "Submitted to us and not yet matched to any public record.",
  irs_listed:
    "Appears in the IRS Exempt Organizations Business Master File under this EIN. Nobody from the organization has claimed the listing.",
  claimed: "Someone has claimed this listing and is editing it. Their control is not yet confirmed.",
  claim_verified:
    "Whoever edits this listing proved control of the email address, phone number or web domain on the organization's public record.",
  endorsed:
    "Verified, plus a named communal figure has put their name to a public endorsement we hold on file.",
};

export const PAYMENT_LABEL: Record<PaymentMethodType, string> = {
  zelle: "Zelle",
  quickpay: "Chase QuickPay",
  paypal: "PayPal",
  venmo: "Venmo",
  check: "Check by mail",
  wire: "Bank wire",
  external: "Organization's own page",
};

export function paymentDeepLink(type: PaymentMethodType, handle: string): string | null {
  switch (type) {
    case "paypal":
      return `https://www.paypal.com/paypalme/${encodeURIComponent(handle.replace(/^@/, ""))}`;
    case "venmo":
      return `https://venmo.com/${encodeURIComponent(handle.replace(/^@/, ""))}`;
    default:
      // Zelle has no public deep-link scheme that works across banks; the
      // honest move is copy-to-clipboard plus "open your banking app".
      return null;
  }
}

const EARTH_MILES = 3958.8;

export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_MILES * 2 * Math.asin(Math.sqrt(s));
}
