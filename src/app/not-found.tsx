import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page max-w-xl py-20 text-center">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
        We can&rsquo;t find that page
      </h1>
      <p className="mt-3 text-ink-600">
        The listing may have been removed at the organization&rsquo;s request, or the link may be
        wrong.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Browse categories
        </ButtonLink>
        <ButtonLink href="/search" variant="secondary" size="lg">
          Search
        </ButtonLink>
      </div>
      <p className="mt-6 text-sm text-ink-600">
        Looking for an organization that should be here?{" "}
        <Link href="/claim" className="font-semibold text-brand-700 underline">
          Claim or add it
        </Link>
        .
      </p>
    </div>
  );
}
