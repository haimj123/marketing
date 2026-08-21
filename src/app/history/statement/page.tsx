import type { Metadata } from "next";
import { YearEndStatement } from "@/components/year-end-statement";

export const metadata: Metadata = {
  title: "Year-end statement",
  robots: { index: false, follow: false },
};

export default function StatementPage() {
  return (
    <div className="page max-w-3xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 print:hidden">
        Year-end statement
      </h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm text-ink-600 print:hidden">
        A printable summary of what you logged, by organization and with EINs.
      </p>
      <YearEndStatement />
    </div>
  );
}
