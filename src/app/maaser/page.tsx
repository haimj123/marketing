import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { MaaserDashboard } from "@/components/giving/maaser-dashboard";

export const metadata: Metadata = {
  title: "Maaser tracker",
  description:
    "Track your maaser obligation across the year. Enter your income and percentage, log gifts as you give them, and export a year-end statement with EINs for your tax preparer.",
};

export default function MaaserPage() {
  return (
    <>
      <AppHeader back title="Maaser tracker" />
      <MaaserDashboard />
    </>
  );
}
