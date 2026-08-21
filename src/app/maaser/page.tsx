import type { Metadata } from "next";
import { MaaserDashboard } from "@/components/maaser-dashboard";

export const metadata: Metadata = {
  title: "Maaser tracker",
  description:
    "Track your maaser obligation across the year. Enter your income and percentage, log gifts as you give them, and export a year-end statement with EINs for your tax preparer.",
  robots: { index: true, follow: true },
};

export default function MaaserPage() {
  return (
    <div className="app max-w-5xl py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Maaser tracker
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Your obligation for the year, and what is left of it. Everything on this page is stored in
        this browser on this device — we do not have your income, and there is no account to sign
        into yet.
      </p>

      <div className="mt-8">
        <MaaserDashboard />
      </div>
    </div>
  );
}
