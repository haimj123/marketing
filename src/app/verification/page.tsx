import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";
import { VerificationBadge } from "@/components/verification-badge";
import { VERIFICATION_MEANING } from "@/lib/format";
import { VERIFICATION_ORDER } from "@/lib/types";

export const metadata: Metadata = {
  title: "How verification works",
  description:
    "What each verification badge on Shaare Tzadaka means, what it does not mean, and how an organization moves up the ladder.",
};

export default function VerificationPage() {
  return (
    <Prose
      title="How verification works"
      lead="A ladder, not a checkmark. Each rung means something specific and narrow."
    >
      <ul className="!list-none !pl-0">
        {VERIFICATION_ORDER.map((level) => (
          <li key={level} className="rounded-[8px] border border-ink-300 p-5 !mb-4">
            <VerificationBadge level={level} size="md" asLink={false} />
            <p className="mt-2">{VERIFICATION_MEANING[level]}</p>
          </li>
        ))}
      </ul>

      <h2>What verification is not</h2>
      <p>
        It is not a financial audit. It is not a judgment about how well an organization spends
        money, how much reaches the ground, or whether its programs work. We have no view on any of
        that and we will not pretend to.
      </p>
      <p>
        The highest rung, <strong>Endorsed</strong>, means a named person with a communal position
        put their name to a written endorsement we hold on file. That is their judgment, on the
        record, not ours.
      </p>

      <h2>Why we check the IRS record every month</h2>
      <p>
        Exempt status can be revoked — most often for failing to file for three consecutive years.
        We re-sync the Business Master File monthly, and an organization that has lost its status
        loses its badge automatically. The date of the last check is shown on every profile.
      </p>

      <h2>Why progress bars always carry a date</h2>
      <p>
        We have no transaction data, because we never handle the money. Every &ldquo;raised so
        far&rdquo; figure is typed in by the organization. So we show when it was last updated,
        flag a campaign whose figure has not moved in 60 days, and stop showing it at 120.
      </p>

      <h2>If something looks wrong</h2>
      <p>
        <Link href="/report">Report the listing</Link>. Reports about payment details are looked at
        first. An organization that would rather not be listed at all can{" "}
        <Link href="/request-removal">ask for removal</Link>, and we honor that without argument.
      </p>
    </Prose>
  );
}
