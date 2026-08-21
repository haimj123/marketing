import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { GivingHistory } from "@/components/giving/giving-history";

export const metadata: Metadata = {
  title: "Giving history",
  description: "Every gift you have logged, with a CSV export and a year-end statement.",
  robots: { index: false, follow: true },
};

export default function HistoryPage() {
  return (
    <>
      <AppHeader back title="Giving history" />
      <GivingHistory />
    </>
  );
}
