import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "For organizations",
  description:
    "How Shaare Tzadaka works for tzedaka organizations: free listings, no fees, no cut of donations, and donors who pay you directly.",
};

export default function ForOrganizationsPage() {
  return (
    <Prose
      title="For organizations"
      lead="Free to list, free to claim, and we never see a shekel of what your donors send you."
    >
      <h2>You are probably already listed</h2>
      <p>
        We seed the directory from the IRS Exempt Organizations Business Master File. If you are a
        registered US tax-exempt organization there is likely already a stub with your legal name,
        EIN and city on it — showing only what the public record says, marked as unclaimed, with no
        payment details.
      </p>

      <h2>What claiming gets you</h2>
      <ul>
        <li>Your story, in your words, instead of an IRS classification code.</li>
        <li>
          Departments and campaigns — the same structure a menu has, so a donor can give to your
          emergency fund without it landing in general operations.
        </li>
        <li>
          Payment details, per department if you want them separated, with copy buttons and mobile
          deep links.
        </li>
        <li>The unclaimed banner gone, and a verification badge that means something.</li>
      </ul>

      <h2>What it costs</h2>
      <p>
        Nothing. There is no listing fee, no subscription, no featured placement to buy and no
        commission on donations — we never receive them, so there is nothing to take a commission
        from. If someone contacts you claiming to sell placement on Shaare Tzadaka, they are not us.
      </p>

      <h2>What we ask of you</h2>
      <ul>
        <li>
          Keep your &ldquo;raised so far&rdquo; figures current. We timestamp every one publicly,
          flag a campaign at 60 days without an update and stop showing it at 120.
        </li>
        <li>Do not list a payment handle you do not control.</li>
        <li>
          Be accurate about tax status. If you are an Israeli amuta, say so and point US donors at
          your American friends organization — implying deductibility that does not exist is the
          one thing that will get a listing pulled immediately.
        </li>
      </ul>

      <h2>If you would rather not be listed</h2>
      <p>
        <Link href="/request-removal">Ask us to remove you</Link>. You do not need to justify it,
        and we do not argue.
      </p>

      <p>
        <Link href="/claim">Claim your listing</Link>
      </p>
    </Prose>
  );
}
