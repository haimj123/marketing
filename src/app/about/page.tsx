import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "About",
  description:
    "Shaare Tzadaka is a free directory of Jewish tzedaka organizations. We never handle donations, never charge organizations, and never sell placement.",
};

export default function AboutPage() {
  return (
    <Prose
      title="About Shaare Tzadaka"
      lead="A directory, not a payment processor. We help you find an organization; you pay it directly."
    >
      <h2>We never touch the money</h2>
      <p>
        Every gift you make goes straight from you to the organization, through the
        organization&rsquo;s own account — Zelle, PayPal, a check in the mail, whatever they use.
        We do not receive it, hold it, forward it or see it. There is no card form on this site and
        there never will be.
      </p>

      <h2>We take nothing</h2>
      <p>
        There is no platform fee, no subscription for organizations, no sponsored placement and no
        advertising. Nobody can pay to rank higher here, because there is nothing to pay us for.
      </p>
      <p>
        That is worth stating plainly because it is the whole basis for trusting a charity
        directory. A directory that sells placement is an advertising business wearing a
        directory&rsquo;s clothes; the ranking is the product, and the ranking is only worth
        anything if it is honest.
      </p>

      <h2>Where the listings come from</h2>
      <p>
        Most of them come from the IRS Exempt Organizations Business Master File, a public dataset
        of every US tax-exempt organization. We filter it for Jewish organizations and publish what
        the record says: legal name, EIN, city, ruling year, classification. Nothing is invented.
      </p>
      <p>
        An organization can then <Link href="/claim">claim its listing</Link> and add the parts
        only it can know — what its departments do, what it is raising for, how to send it money.
        Until then the page is clearly marked as unclaimed and shows no payment details at all.
      </p>

      <h2>What we deliberately do not build</h2>
      <ul>
        <li>
          <strong>Star ratings and reviews.</strong> Public ratings on charities invite lashon hara,
          and one bad interaction can materially damage a legitimate organization. We publish
          objective signals instead — verification level, ruling year, budget band, named
          endorsements.
        </li>
        <li>
          <strong>Payment processing.</strong> Permanently out of scope.
        </li>
        <li>
          <strong>Campaign mechanics.</strong> Twenty-four-hour matching campaigns are somebody
          else&rsquo;s craft and they are good at it. Our job is discovery and your maaser ledger.
        </li>
      </ul>

      <h2>What a listing is not</h2>
      <p>
        A listing is not an endorsement. We do not audit anyone&rsquo;s finances, and we cannot
        tell you whether an organization spends well. Verification means we confirmed someone
        controls the organization&rsquo;s published contact details — no more than that. Read{" "}
        <Link href="/verification">how verification works</Link>, and do your own diligence before
        giving anything substantial.
      </p>

      <h2>Who runs it</h2>
      <p>
        A small, unpaid effort. Running costs are kept deliberately low so that money never forces
        a decision about what this becomes. If you want to help, the most useful things are telling
        an organization to claim its listing, and{" "}
        <Link href="/report">reporting anything that looks wrong</Link>.
      </p>
    </Prose>
  );
}
