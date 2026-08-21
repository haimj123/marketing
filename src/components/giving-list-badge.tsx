"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { useDonor } from "@/lib/donor-store";

export function GivingListBadge() {
  const { givingList, ready } = useDonor();
  const pending = givingList.filter((i) => i.status === "pending").length;

  return (
    <Link
      href="/giving-list"
      className="relative inline-flex h-10 items-center gap-2 rounded-[8px] px-3 text-sm font-semibold text-ink-900 hover:bg-ink-050"
    >
      <ListChecks aria-hidden className="size-5" />
      <span className="hidden sm:inline">Giving list</span>
      {ready && pending > 0 && (
        <span className="tabular absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
          {pending}
        </span>
      )}
      <span className="sr-only">{ready ? `${pending} organizations waiting` : ""}</span>
    </Link>
  );
}
