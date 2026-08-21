import type { Metadata } from "next";
import type { RawParams } from "@/lib/search-params";
import { OrgRequestForm } from "@/components/org-request-form";

export const metadata: Metadata = {
  title: "Report a listing",
  robots: { index: false, follow: true },
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const org = typeof raw.org === "string" ? raw.org : undefined;

  return (
    <div className="page max-w-2xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Report a problem with a listing
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        Wrong details, a payment handle that looks off, an organization that no longer exists, or
        something that looks like an impersonation. Reports about payment details are looked at
        first — a fraudulent listing is the one failure this project could not survive.
      </p>

      <div className="mt-8">
        <OrgRequestForm kind="abuse" initialOrgSlug={org} />
      </div>
    </div>
  );
}
