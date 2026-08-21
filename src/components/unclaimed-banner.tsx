import Link from "next/link";
import { FileText } from "lucide-react";

/**
 * The visual difference between a stub and a full listing has to be obvious at
 * a glance. A donor who mistakes an IRS record for a maintained profile is the
 * beginning of every bad outcome this project can have.
 */
export function UnclaimedBanner({ orgSlug, legalName }: { orgSlug: string; legalName: string }) {
  return (
    <div className="rounded-[8px] border border-ink-300 bg-ink-050 p-5">
      <div className="flex items-start gap-3">
        <FileText aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-600" />
        <div>
          <h2 className="font-display text-base font-bold text-ink-900">
            This organization hasn&rsquo;t claimed its profile yet
          </h2>
          <p className="mt-1.5 text-sm text-ink-600">
            Everything on this page comes from the IRS Exempt Organizations Business Master File,
            which is public record. Nobody from {legalName} has reviewed it, and we do not show
            payment details for an unclaimed listing — we have no way to know they would be
            correct.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/claim?org=${orgSlug}`}
              className="inline-flex h-10 items-center rounded-[8px] bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-900"
            >
              Claim this profile
            </Link>
            <Link
              href={`/request-removal?org=${orgSlug}`}
              className="inline-flex h-10 items-center rounded-[8px] border border-ink-300 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-ink-600"
            >
              Request removal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
