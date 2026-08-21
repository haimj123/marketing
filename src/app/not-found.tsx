import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="app py-10">
      <EmptyState
        icon={<Compass aria-hidden className="size-7" strokeWidth={1.5} />}
        title="We can't find that page"
        body="The listing may have been removed at the organization's request, or the link may be wrong."
        action={
          <div className="flex flex-col gap-2">
            <ButtonLink href="/categories">Browse categories</ButtonLink>
            <ButtonLink href="/search" variant="secondary">
              Search
            </ButtonLink>
          </div>
        }
      />
      <p className="mt-2 text-center text-sm text-ink-600">
        Looking for an organization that should be here?{" "}
        <Link href="/claim" className="font-semibold text-blue-700 underline">
          Claim or add it
        </Link>
        .
      </p>
    </div>
  );
}
