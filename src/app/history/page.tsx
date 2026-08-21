import type { Metadata } from "next";
import { GivingHistory } from "@/components/giving-history";

export const metadata: Metadata = {
  title: "Giving history",
  description: "Every gift you have logged, with a CSV export and a year-end statement.",
  robots: { index: false, follow: true },
};

export default function HistoryPage() {
  return (
    <div className="page max-w-4xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Giving history
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Self-reported, because we never see the transaction. Kept on this device — export it if you
        want a copy that outlives this browser.
      </p>

      <div className="mt-8">
        <GivingHistory />
      </div>
    </div>
  );
}
