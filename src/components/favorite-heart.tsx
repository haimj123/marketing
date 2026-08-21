"use client";

import { Heart } from "lucide-react";
import { useDonor } from "@/lib/donor-store";
import { useToast } from "./ui/toast";
import { cn } from "@/lib/cn";

/**
 * The heart that floats over a card image. 32px white circle, subtle shadow.
 *
 * It sits inside a link that covers the whole card, so it has to stop both
 * propagation and the default navigation — otherwise saving an organization
 * also opens it, which is the single most annoying bug this pattern has.
 */
export function FavoriteHeart({
  orgSlug,
  orgName,
  className,
}: {
  orgSlug: string;
  orgName: string;
  className?: string;
}) {
  const { favorites, toggleFavorite, ready } = useDonor();
  const toast = useToast();
  const on = ready && favorites.includes(orgSlug);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${orgName} from favorites` : `Save ${orgName} to favorites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(orgSlug);
        toast(on ? `Removed ${orgName}` : `Saved ${orgName}`);
      }}
      className={cn(
        "press tap44 flex size-8 items-center justify-center rounded-full bg-white shadow-float",
        className,
      )}
    >
      <Heart
        aria-hidden
        className={cn("size-[18px]", on ? "text-blue-700" : "text-ink-900")}
        strokeWidth={2}
        fill={on ? "currentColor" : "none"}
      />
    </button>
  );
}
