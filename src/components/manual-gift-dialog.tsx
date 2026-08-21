"use client";

import * as React from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast";
import { useDonor } from "@/lib/donor-store";
import { PAYMENT_LABEL } from "@/lib/format";
import type { PaymentMethodType } from "@/lib/types";

interface Hit {
  slug: string;
  name: string;
  city: string;
}

const METHODS: PaymentMethodType[] = ["zelle", "quickpay", "paypal", "venmo", "check", "wire", "external"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Manual entry for a gift that did not start here — a shul appeal, a
 * collector at the door, a standing order. A maaser ledger that only knows
 * about gifts made through this site is a ledger nobody can rely on, so it
 * accepts an organization we have never heard of too.
 */
export function ManualGiftDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    setName("");
    setSlug(null);
    setHits([]);
    setAmount("");
    setDate(todayISO());
    setMethod("");
    setNote("");
  }, [open]);

  React.useEffect(() => {
    if (slug || name.trim().length < 2) {
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
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [name, slug]);

  const cents = Math.round(Number(amount.replace(/[^0-9.]/g, "")) * 100);
  const valid = cents > 0 && name.trim().length > 1;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    logGift({
      orgSlug: slug ?? `unlisted:${name.trim().toLowerCase().replace(/\s+/g, "-")}`,
      orgName: name.trim(),
      ein: null,
      campaignId: null,
      amountCents: cents,
      currency: "USD",
      givenAt: new Date(`${date}T12:00:00Z`).toISOString(),
      paymentMethodType: method || null,
      note: note.trim() || undefined,
    });
    toast("Gift logged", "success");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log a gift">
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Organization</span>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setSlug(null);
            }}
            placeholder="Start typing, or enter any name"
            className="h-12 w-full rounded-[8px] border border-ink-300 px-3 text-base outline-none focus:border-brand-500"
          />
          {slug && (
            <span className="mt-1 block text-xs text-success">
              Linked to this organization&rsquo;s listing.
            </span>
          )}
        </label>

        {hits.length > 0 && (
          <ul className="-mt-2 overflow-hidden rounded-[8px] border border-ink-300">
            {hits.map((hit) => (
              <li key={hit.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setName(hit.name);
                    setSlug(hit.slug);
                    setHits([]);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-ink-050"
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
            <span className="mb-1 block text-sm font-semibold text-ink-900">Amount</span>
            <div className="flex h-12 items-center rounded-[8px] border border-ink-300 px-3 focus-within:border-brand-500">
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
            <span className="mb-1 block text-sm font-semibold text-ink-900">Date</span>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-[8px] border border-ink-300 px-3 text-base outline-none focus:border-brand-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">
            How you sent it <span className="font-normal text-ink-600">(optional)</span>
          </span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethodType | "")}
            className="h-12 w-full rounded-[8px] border border-ink-300 bg-white px-3 text-base outline-none focus:border-brand-500"
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
          <span className="mb-1 block text-sm font-semibold text-ink-900">
            Note <span className="font-normal text-ink-600">(optional)</span>
          </span>
          <input
            type="text"
            value={note}
            maxLength={140}
            onChange={(e) => setNote(e.target.value)}
            className="h-12 w-full rounded-[8px] border border-ink-300 px-3 text-base outline-none focus:border-brand-500"
          />
        </label>

        <Button type="submit" size="lg" full disabled={!valid}>
          Log gift
        </Button>
      </form>
    </Modal>
  );
}
