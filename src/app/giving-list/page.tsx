import type { Metadata } from "next";
import { GivingList } from "@/components/giving-list";

export const metadata: Metadata = {
  title: "Giving list",
  description: "The organizations you have queued up to give to, and a guided way to work through them.",
  robots: { index: false, follow: true },
};

export default function GivingListPage() {
  return (
    <div className="app max-w-3xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Giving list
      </h1>
      <p className="mt-2 text-sm text-ink-600">
        A queue, not a cart. We never take payment — you send each gift through the
        organization&rsquo;s own account, and we keep your place in the list.
      </p>

      <div className="mt-8">
        <GivingList />
      </div>
    </div>
  );
}
