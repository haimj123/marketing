import type { Metadata } from "next";
import type { RawParams } from "@/lib/search-params";
import { OrgRequestForm } from "@/components/org-request-form";

export const metadata: Metadata = {
  title: "Claim your listing",
  description:
    "Find your organization, prove you represent it, and take over the listing. Claiming is free, there is no fee to be listed, and we never take a cut of your donations.",
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const org = typeof raw.org === "string" ? raw.org : undefined;

  return (
    <div className="app max-w-2xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Claim your listing
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Most organizations are already here — we seed the directory from the IRS Exempt
        Organizations Business Master File, which is public record. Claiming your stub lets you add
        your departments, campaigns and payment details, and turns off the unclaimed banner.
      </p>

      <ul className="mt-6 space-y-2 rounded-card bg-blue-050 p-5 text-sm text-blue-900">
        <li>· Free. There is no listing fee, no subscription and no paid placement.</li>
        <li>· We never receive your donations — donors pay you directly, through your own rails.</li>
        <li>· You can ask us to remove the listing entirely instead, and we will.</li>
      </ul>

      <div className="mt-8">
        <OrgRequestForm kind="claim" initialOrgSlug={org} />
      </div>
    </div>
  );
}
