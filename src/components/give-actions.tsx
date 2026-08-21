"use client";

import * as React from "react";
import { Check, Heart, ListPlus, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Modal } from "./ui/modal";
import { Chip } from "./ui/chip";
import { useToast } from "./ui/toast";
import { useDonor } from "@/lib/donor-store";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/cn";

const FALLBACK_AMOUNTS = [1800, 3600, 10000, 18000];

/**
 * The cart replacement. A multi-organization cart cannot check out when there
 * is no checkout, so the list is a queue instead: add several, then walk them
 * one at a time in /giving-list, copying a handle and logging each as you go.
 */
export function AddToGivingListButton({
  orgSlug,
  orgName,
  campaignId,
  campaignTitle,
  suggestedAmountsCents,
  variant = "primary",
  size = "lg",
  className,
}: {
  orgSlug: string;
  orgName: string;
  campaignId?: string | null;
  campaignTitle?: string | null;
  suggestedAmountsCents?: number[];
  variant?: "primary" | "secondary";
  size?: "lg" | "md";
  className?: string;
}) {
  const { addToGivingList, givingList } = useDonor();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [custom, setCustom] = React.useState("");
  const [picked, setPicked] = React.useState<number | null>(null);

  const amounts = suggestedAmountsCents?.length ? suggestedAmountsCents : FALLBACK_AMOUNTS;

  const alreadyQueued = givingList.some(
    (i) =>
      i.orgSlug === orgSlug &&
      (i.campaignId ?? null) === (campaignId ?? null) &&
      i.status === "pending",
  );

  const customCents = Math.round(Number(custom.replace(/[^0-9.]/g, "")) * 100);
  const amountCents = picked ?? (Number.isFinite(customCents) && customCents > 0 ? customCents : 0);

  function add() {
    if (amountCents <= 0) return;
    addToGivingList({
      orgSlug,
      orgName,
      campaignId: campaignId ?? null,
      campaignTitle: campaignTitle ?? null,
      amountCents,
    });
    toast(`${orgName} added to your giving list`, "success");
    setOpen(false);
    setPicked(null);
    setCustom("");
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {alreadyQueued ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <ListPlus aria-hidden className="size-4" />
        )}
        {alreadyQueued ? "On your giving list" : "Add to giving list"}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Add ${orgName}`}>
        <div className="space-y-4">
          {campaignTitle && (
            <p className="text-sm text-ink-600">
              For <span className="font-semibold text-ink-900">{campaignTitle}</span>
            </p>
          )}
          <div>
            <span className="mb-2 block text-sm font-semibold text-ink-900">
              How much do you intend to give?
            </span>
            <div className="flex flex-wrap gap-2">
              {amounts.map((cents) => (
                <Chip
                  key={cents}
                  active={picked === cents}
                  onClick={() => {
                    setPicked(cents);
                    setCustom("");
                  }}
                >
                  {formatCents(cents)}
                </Chip>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-900">Or another amount</span>
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
            This is a note to yourself, not a pledge. Nothing is charged and the organization is
            not told.
          </p>

          <Button size="lg" full disabled={amountCents <= 0} onClick={add}>
            Add {amountCents > 0 ? formatCents(amountCents) : ""} to giving list
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function FavoriteButton({ orgSlug, orgName }: { orgSlug: string; orgName: string }) {
  const { favorites, toggleFavorite, ready } = useDonor();
  const toast = useToast();
  const on = favorites.includes(orgSlug);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        toggleFavorite(orgSlug);
        toast(on ? `Removed ${orgName} from favorites` : `Saved ${orgName} to favorites`);
      }}
      className={cn(
        "inline-flex h-12 items-center gap-2 rounded-card border px-4 text-sm font-semibold transition-colors",
        on
          ? "border-blue-700 bg-blue-050 text-blue-900"
          : "border-ink-300 bg-white text-ink-900 hover:border-blue-500",
      )}
    >
      <Heart aria-hidden className={cn("size-4", on && "fill-blue-700 text-blue-700")} />
      {ready && on ? "Saved" : "Save"}
    </button>
  );
}

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const toast = useToast();

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
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
    <button
      type="button"
      onClick={share}
      className="inline-flex h-12 items-center gap-2 rounded-card border border-ink-300 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-blue-500"
    >
      <Share2 aria-hidden className="size-4" />
      Share
    </button>
  );
}
