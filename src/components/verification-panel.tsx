import Link from "next/link";
import { CalendarDays, Hash, Landmark, RefreshCw, Wallet } from "lucide-react";
import { VerificationBadge } from "./verification-badge";
import {
  BUDGET_BAND_LABEL,
  TAX_STATUS_LABEL,
  TAX_STATUS_NOTE,
  VERIFICATION_MEANING,
  formatEin,
  timeAgo,
} from "@/lib/format";
import type { Organization } from "@/lib/types";

/**
 * The objective-signals panel that stands in for star ratings (§8.4). Ruling
 * year, budget band, tax status and how the listing was verified — facts a
 * donor can check, none of which can be used to publish lashon hara about an
 * organization that had one bad week.
 */
export function VerificationPanel({
  org,
  usPartner,
}: {
  org: Organization;
  usPartner?: Organization;
}) {
  const rows: { icon: typeof Hash; label: string; value: string }[] = [];

  const ein = formatEin(org.ein);
  if (ein) rows.push({ icon: Hash, label: "EIN", value: ein });
  rows.push({ icon: Landmark, label: "Tax status", value: TAX_STATUS_LABEL[org.taxStatus] });
  if (org.rulingYear) {
    rows.push({
      icon: CalendarDays,
      label: "Recognised since",
      value: String(org.rulingYear),
    });
  }
  rows.push({ icon: Wallet, label: "Annual budget", value: BUDGET_BAND_LABEL[org.budgetBand] });
  if (org.irsLastSyncedAt) {
    rows.push({
      icon: RefreshCw,
      label: "IRS record checked",
      value: timeAgo(org.irsLastSyncedAt),
    });
  }

  return (
    <section
      aria-labelledby="verification-heading"
      className="rounded-[8px] border border-ink-300 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="verification-heading" className="font-display text-lg font-bold text-ink-900">
          Verification
        </h2>
        <VerificationBadge level={org.verificationLevel} size="md" />
      </div>

      <p className="mt-2 text-sm text-ink-600">{VERIFICATION_MEANING[org.verificationLevel]}</p>

      <dl className="mt-4 divide-y divide-ink-050 border-t border-ink-050">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="flex items-center gap-2 text-sm text-ink-600">
              <row.icon aria-hidden className="size-4" />
              {row.label}
            </dt>
            <dd className="tabular text-sm font-semibold text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-[8px] bg-ink-050 p-3 text-sm text-ink-600">
        {TAX_STATUS_NOTE[org.taxStatus]}
      </p>

      {usPartner && (
        <p className="mt-3 text-sm text-ink-900">
          US donors: give through{" "}
          <Link href={`/org/${usPartner.slug}`} className="font-semibold text-brand-700 underline">
            {usPartner.dba ?? usPartner.legalName}
          </Link>
          , the American entity for this organization.
        </p>
      )}

      <p className="mt-4 text-xs text-ink-600">
        <Link href="/verification" className="font-semibold text-brand-700 underline">
          How verification works
        </Link>{" "}
        · A listing is not an endorsement, and we do not audit finances.
      </p>
    </section>
  );
}
