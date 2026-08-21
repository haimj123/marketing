"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Globe, HandCoins, MapPin, Sparkles, UserCheck } from "lucide-react";
import { useDonor } from "@/lib/donor-store";
import { useToast } from "../ui/toast";
import type { LucideIcon } from "lucide-react";

interface FilterChip {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Query the chip applies on the search screen. */
  param: string;
  /** Needs a location before it means anything. */
  needsCity?: boolean;
}

const CHIPS: FilterChip[] = [
  { key: "verified", label: "Verified", icon: BadgeCheck, param: "verified=1" },
  { key: "near", label: "Near me", icon: MapPin, param: "sort=distance", needsCity: true },
  { key: "matching", label: "Matching now", icon: Sparkles, param: "matching=1" },
  { key: "zelle", label: "Accepts Zelle", icon: HandCoins, param: "zelle=1" },
  { key: "israel", label: "Israel", icon: Globe, param: "israel=1" },
  { key: "claimed", label: "Claimed", icon: UserCheck, param: "claimed=1" },
];

/**
 * Sticky filter chips.
 *
 * On a delivery app these filter the feed in place. Here the feed is composed
 * of editorial sections rather than one list, so a chip takes you to the
 * filtered list instead of quietly rearranging the page under your thumb. The
 * filtering itself is the existing URL-param path — no new query, no new
 * endpoint.
 */
export function FilterChipRow() {
  const router = useRouter();
  const { city } = useDonor();
  const toast = useToast();

  function apply(chip: FilterChip) {
    if (chip.needsCity) {
      if (!city) {
        toast("Set your location first — tap the address at the top");
        return;
      }
      router.push(`/search?sort=distance&lat=${city.lat.toFixed(4)}&lng=${city.lng.toFixed(4)}`);
      return;
    }
    router.push(`/search?${chip.param}`);
  }

  return (
    <div className="sticky top-0 z-20 -mt-px border-b border-ink-300 bg-white py-2">
      <ul className="rail bleed">
        {CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => apply(chip)}
                className="press flex h-9 items-center gap-1.5 rounded-pill border border-ink-300 bg-white px-3.5 text-sm font-semibold text-ink-900"
              >
                <Icon aria-hidden className="size-4 text-ink-600" />
                {chip.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
