import type { Metadata } from "next";
import type { RawParams } from "@/lib/search-params";
import { OrgRequestForm } from "@/components/org-request-form";

export const metadata: Metadata = {
  title: "Request removal",
  description: "Ask us to remove an organization's listing from Shaare Tzadaka.",
};

export default async function RequestRemovalPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const org = typeof raw.org === "string" ? raw.org : undefined;

  return (
    <div className="page max-w-2xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Request removal
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Publishing the IRS public record is lawful, but it is not compulsory for us to keep doing
        it. If you represent an organization and would rather not be listed, say so here and we
        will take the listing down — you do not have to give a reason we agree with.
      </p>

      <div className="mt-8">
        <OrgRequestForm kind="removal" initialOrgSlug={org} />
      </div>
    </div>
  );
}
