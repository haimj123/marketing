import type { Metadata } from "next";
import type { RawParams } from "@/lib/search-params";
import { AppHeader } from "@/components/shell/app-header";
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
    <>
      <AppHeader back title="Request removal" />
      <div className="app py-5">
      <p className="mt-2 text-sm text-ink-600">
        Publishing the IRS public record is lawful, but it is not compulsory for us to keep doing
        it. If you represent an organization and would rather not be listed, say so here and we
        will take the listing down — you do not have to give a reason we agree with.
      </p>

      <div className="mt-8">
        <OrgRequestForm kind="removal" initialOrgSlug={org} />
      </div>
        <div className="h-8" />
      </div>
    </>
  );
}
