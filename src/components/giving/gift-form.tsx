"use client";

import * as React from "react";
import { BottomSheet } from "../ui/bottom-sheet";
import { useToast } from "../ui/toast";
import { useDonor } from "@/lib/donor-store";
import { PAYMENT_LABEL } from "@/lib/format";
import type { PaymentMethodType } from "@/lib/types";

const METHODS: PaymentMethodType[] = [
  "zelle",
  "quickpay",
  "paypal",
  "venmo",
  "check",
  "wire",
  "external",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

interface Hit {
  slug: string;
  name: string;
  city: string;
}

/**
 * One sheet for both ways a gift gets logged: confirmed straight after a
 * handoff (the organization is known), or entered by hand later for something
 * given elsewhere (it is not).
 *
 * The self-reporting step reads as friction on most products. Here it is the
 * only way the ledger can exist at all — we never see the transaction — which
 * is exactly why a maaser tracker is the right feature for a directory that
 * never touches money.
 */
export function GiftFormSheet({
  open,
  onClose,
  fixedOrg,
  defaultAmountCents,
  defaultMethod,
  campaignId,
}: {
  open: boolean;
  onClose: () => void;
  /** When set the organization is locked; when absent the donor picks one. */
  fixedOrg?: { slug: string; name: string; ein?: string | null };
  defaultAmountCents?: number;
  defaultMethod?: PaymentMethodType | null;
  campaignId?: string | null;
}) {
  const { logGift } = useDonor();
  const toast = useToast();

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState<string | null>(null);
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [method, setMethod] = React.useState<PaymentMethodType | "">("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(fixedOrg?.name ?? "");
    setSlug(fixedOrg?.slug ?? null);
    setHits([]);
    setAmount(defaultAmountCents ? String(defaultAmountCents / 100) : "");
    setDate(todayISO());
    setMethod(defaultMethod ?? "");
    setNote("");
  }, [open, fixedOrg, defaultAmountCents, defaultMethod]);

  React.useEffect(() => {
    if (fixedOrg || slug || name.trim().length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(name.trim())}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results.slice(0, 4));
      } catch {
        /* aborted */
      }
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [name, slug, fixedOrg]);

  const cents = Math.round(Number(amount.replace(/[^0-9.]/g, "")) * 100);
  const valid = cents > 0 && name.trim().length > 1;

  function submit() {
    if (!valid) return;
    logGift({
      orgSlug: slug ?? `unlisted:${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
      orgName: name.trim(),
      ein: fixedOrg?.ein ?? null,
      campaignId: campaignId ?? null,
      amountCents: cents,
      currency: "USD",
      givenAt: new Date(`${date}T12:00:00Z`).toISOString(),
      paymentMethodType: method || null,
      note: note.trim() || undefined,
    });
    toast("Logged to your maaser ledger", "success");
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={fixedOrg ? `Log a gift to ${fixedOrg.name}` : "Log a gift"}
      footer={
        <div className="app py-3">
          <button
            type="button"
            disabled={!valid}
            onClick={submit}
            className="press h-13 w-full rounded-card bg-blue-700 py-4 font-semibold text-white disabled:opacity-45"
          >
            Log gift
          </button>
        </div>
      }
    >
      <div className="app space-y-4 pb-4">
        <p className="text-sm text-ink-600">
          We have no way to see your bank, so nothing is logged unless you tell us. This stays on
          your device and feeds your maaser balance and year-end statement.
        </p>

        {!fixedOrg && (
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-900">Organization</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(null);
              }}
              placeholder="Start typing, or enter any name"
              className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
            />
            {slug && (
              <span className="mt-1 block text-xs text-success">
                Linked to this organization&rsquo;s listing.
              </span>
            )}
          </label>
        )}

        {hits.length > 0 && (
          <ul className="-mt-2 overflow-hidden rounded-card border border-ink-300">
            {hits.map((hit) => (
              <li key={hit.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setName(hit.name);
                    setSlug(hit.slug);
                    setHits([]);
                  }}
                  className="press flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm"
                >
                  <span className="font-semibold text-ink-900">{hit.name}</span>
                  <span className="text-xs text-ink-600">{hit.city}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-900">Amount</span>
            <div className="flex h-12 items-center rounded-card border border-ink-300 px-3 focus-within:border-blue-500">
              <span className="mr-1 text-ink-600">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="180"
                className="tabular h-full w-full bg-transparent text-base outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold text-ink-900">Date</span>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-900">
            How you sent it <span className="font-normal text-ink-600">(optional)</span>
          </span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethodType | "")}
            className="h-12 w-full rounded-card border border-ink-300 bg-white px-3 text-base outline-none focus:border-blue-500"
          >
            <option value="">Not recorded</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_LABEL[m]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-ink-900">
            Note <span className="font-normal text-ink-600">(optional)</span>
          </span>
          <input
            type="text"
            value={note}
            maxLength={140}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Yom Tov drive, in memory of…"
            className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
          />
        </label>
      </div>
    </BottomSheet>
  );
}
