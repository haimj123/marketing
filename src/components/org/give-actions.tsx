"use client";

import * as React from "react";
import { Check, Heart, Plus, Share2 } from "lucide-react";
import { BottomSheet } from "../ui/bottom-sheet";
import { useToast } from "../ui/toast";
import { useDonor } from "@/lib/donor-store";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/cn";

const FALLBACK_AMOUNTS = [1800, 3600, 10000, 18000];

interface Target {
  orgSlug: string;
  orgName: string;
  campaignId?: string | null;
  campaignTitle?: string | null;
  suggestedAmountsCents?: number[];
}

/**
 * The cart replacement. A multi-organization list cannot check out when there
 * is no checkout, so it is a queue: add several, then walk them one at a time.
 */
export function AddToListSheet({
  target,
  onClose,
}: {
  target: Target | null;
  onClose: () => void;
}) {
  const { addToGivingList } = useDonor();
  const toast = useToast();
  const [picked, setPicked] = React.useState<number | null>(null);
  const [custom, setCustom] = React.useState("");

  React.useEffect(() => {
    if (target) {
      setPicked(null);
      setCustom("");
    }
  }, [target]);

  const amounts = target?.suggestedAmountsCents?.length
    ? target.suggestedAmountsCents
    : FALLBACK_AMOUNTS;
  const customCents = Math.round(Number(custom.replace(/[^0-9.]/g, "")) * 100);
  const cents = picked ?? (Number.isFinite(customCents) && customCents > 0 ? customCents : 0);

  function add() {
    if (!target || cents <= 0) return;
    addToGivingList({
      orgSlug: target.orgSlug,
      orgName: target.orgName,
      campaignId: target.campaignId ?? null,
      campaignTitle: target.campaignTitle ?? null,
      amountCents: cents,
    });
    toast(`${target.orgName} added to your giving list`, "success");
    onClose();
  }

  return (
    <BottomSheet
      open={target !== null}
      onClose={onClose}
      title={target ? `Add ${target.orgName}` : ""}
      footer={
        <div className="app py-3">
          <button
            type="button"
            disabled={cents <= 0}
            onClick={add}
            className="press h-13 w-full rounded-card bg-blue-700 px-4 py-3.5 font-semibold text-white disabled:opacity-45"
          >
            Add {cents > 0 ? formatCents(cents) : ""} to giving list
          </button>
        </div>
      }
    >
      <div className="app space-y-4 pb-4">
        {target?.campaignTitle && (
          <p className="text-sm text-ink-600">
            For <span className="font-semibold text-ink-900">{target.campaignTitle}</span>
          </p>
        )}

        <div>
          <span className="mb-2 block text-sm font-bold text-ink-900">
            How much do you intend to give?
          </span>
          <div className="flex flex-wrap gap-2">
            {amounts.map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={picked === amount}
                onClick={() => {
                  setPicked(amount);
                  setCustom("");
                }}
                className={cn(
                  "press tabular flex h-11 items-center rounded-pill border px-4 font-semibold",
                  picked === amount
                    ? "border-blue-700 bg-blue-050 text-blue-900"
                    : "border-ink-300 bg-white text-ink-900",
                )}
              >
                {formatCents(amount)}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-900">Or another amount</span>
          <div
            className={cn(
              "flex h-12 items-center rounded-card border px-3",
              picked === null && custom ? "border-blue-500" : "border-ink-300",
            )}
          >
            <span className="mr-1 text-ink-600">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setPicked(null);
              }}
              placeholder="Custom"
              className="tabular h-full w-full bg-transparent text-base outline-none"
            />
          </div>
        </label>

        <p className="text-xs text-ink-600">
          This is a note to yourself, not a pledge. Nothing is charged and the organization is not
          told.
        </p>
      </div>
    </BottomSheet>
  );
}

/** The 28px circle that overlaps a campaign row's thumbnail. */
export function AddCircleButton({
  onClick,
  label,
  added,
}: {
  onClick: () => void;
  label: string;
  added?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press tap44 absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border border-ink-300 bg-white shadow-float"
    >
      {added ? (
        <Check aria-hidden className="size-4 text-blue-700" strokeWidth={2.5} />
      ) : (
        <Plus aria-hidden className="size-4 text-ink-900" strokeWidth={2.5} />
      )}
    </button>
  );
}

/** The floating circular controls over a hero image. */
export function HeroActions({ orgSlug, orgName }: { orgSlug: string; orgName: string }) {
  const { favorites, toggleFavorite, ready } = useDonor();
  const toast = useToast();
  const saved = ready && favorites.includes(orgSlug);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: orgName, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied", "success");
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="absolute right-4 top-3 flex gap-2">
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${orgName}`}
        className="press tap44 flex size-9 items-center justify-center rounded-full bg-white shadow-float"
      >
        <Share2 aria-hidden className="size-[18px] text-ink-900" />
      </button>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => {
          toggleFavorite(orgSlug);
          toast(saved ? `Removed ${orgName}` : `Saved ${orgName}`);
        }}
        aria-label={saved ? `Remove ${orgName} from favorites` : `Save ${orgName} to favorites`}
        className="press tap44 flex size-9 items-center justify-center rounded-full bg-white shadow-float"
      >
        <Heart
          aria-hidden
          className={cn("size-[18px]", saved ? "text-blue-700" : "text-ink-900")}
          fill={saved ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}

export function BackCircleButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      aria-label="Go back"
      className="press tap44 absolute left-4 top-3 flex size-9 items-center justify-center rounded-full bg-white shadow-float"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
