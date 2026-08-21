import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { GivingList } from "@/components/giving/giving-list";

export const metadata: Metadata = {
  title: "Giving list",
  description:
    "The organizations you have queued up to give to, and a guided way to work through them.",
  robots: { index: false, follow: true },
};

export default function GivingListPage() {
  return (
    <>
      <AppHeader title="Giving list" />
      <GivingList />
    </>
  );
}
