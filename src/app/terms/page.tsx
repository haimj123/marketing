import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Shaare Tzadaka.",
};

export default function TermsPage() {
  return (
    <Prose title="Terms of use" lead="Short, because the service is narrow.">
      <p className="rounded-card bg-bronze-100 p-4 text-sm text-bronze-600">
        <strong>Draft.</strong> These terms describe how the service actually behaves and are
        written to be read, not to be relied on as a finished legal document. Have a lawyer review
        them before launch.
      </p>

      <h2>What this service is</h2>
      <p>
        Shaare Tzadaka is a directory. We publish information about charitable organizations — some
        of it drawn from public records, some supplied by the organizations themselves — so that
        you can find them and contact or pay them directly.
      </p>

      <h2>We are not a party to your donation</h2>
      <p>
        We do not receive, hold, transmit or refund donations. When you send money to an
        organization listed here, the transaction is between you and that organization, on
        infrastructure neither of us controls. We cannot reverse it, trace it, or help you recover
        it.
      </p>

      <h2>A listing is not an endorsement</h2>
      <p>
        We do not audit finances or vouch for any organization&rsquo;s conduct, effectiveness or
        governance. Verification badges mean only what{" "}
        <Link href="/verification">the verification page</Link> says they mean. You are responsible
        for your own diligence.
      </p>

      <h2>Accuracy</h2>
      <p>
        Information from the IRS Business Master File is reproduced as published and may be out of
        date. Information supplied by an organization is theirs, not ours, and we do not verify its
        truth. Amounts shown as raised are self-reported by the organization and carry the date
        they were last updated.
      </p>

      <h2>Nothing here is tax advice</h2>
      <p>
        Whether a gift is deductible depends on the organization&rsquo;s status and your own
        circumstances. The maaser tracker and any statement it produces are your own records, not
        receipts, and do not substantiate a deduction.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not scrape the directory at a rate that degrades it for other people.</li>
        <li>Do not claim a listing for an organization you do not represent.</li>
        <li>Do not submit payment details you do not control.</li>
      </ul>

      <h2>Removal and complaints</h2>
      <p>
        An organization may <Link href="/request-removal">request removal</Link> of its listing at
        any time and we will honor it. Anyone may <Link href="/report">report a listing</Link>. For
        copyright complaints, use the <Link href="/contact">contact page</Link>.
      </p>

      <h2>No warranty, limited liability</h2>
      <p>
        The service is provided as-is, free of charge, with no warranty of any kind. To the fullest
        extent the law allows, we are not liable for losses arising from your use of it — including
        any donation you make to any organization you find here.
      </p>
    </Prose>
  );
}
