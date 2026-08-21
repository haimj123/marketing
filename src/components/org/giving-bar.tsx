"use client";

import Link from "next/link";
import { useDonor } from "@/lib/donor-store";

/**
 * Sits above the tab bar once anything is queued, the way a delivery app keeps
 * the cart in reach. Only renders when there is something in it — a permanent
 * empty bar is 52px of screen a phone cannot spare.
 */
export function GivingBar() {
  const { givingList, ready } = useDonor();
  const pending = givingList.filter((i) => i.status === "pending");

  if (!ready || pending.length === 0) return null;

  const orgs = new Set(pending.map((i) => i.orgSlug)).size;

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))] z-30 bg-white pb-3 pt-3">
      <div className="app">
        <Link
          href="/giving-list"
          className="press flex h-13 w-full items-center justify-center rounded-card bg-blue-700 py-4 font-semibold text-white"
        >
          View giving list · {orgs} {orgs === 1 ? "organization" : "organizations"}
        </Link>
      </div>
    </div>
  );
}
