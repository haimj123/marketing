"use client";

import * as React from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { useToast } from "./ui/toast";
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The close of the giving flow. The donor has already left for their banking
 * app; this is where they say what actually happened.
 *
 * Everywhere else, self-reporting is friction. Here it is the only way the
 * maaser ledger can exist at all — which is exactly why the maaser tracker is
 * the right feature for a directory that never touches money.
 */
export function LogGiftDialog({
  open,
  onClose,
  orgSlug,
  orgName,
  ein,
  campaignId,
  defaultAmountCents,
  defaultMethod,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  orgSlug: string;
  orgName: string;
  ein?: string | null;
  campaignId?: string | null;
  defaultAmountCents?: number;
  defaultMethod?: PaymentMethodType | null;
  onLogged?: () => void;
}) {
  const { logGift } = useDonor();
  const toast = useToast();
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(todayISO());
  const [method, setMethod] = React.useState<PaymentMethodType | "">("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setAmount(defaultAmountCents ? String(defaultAmountCents / 100) : "");
    setDate(todayISO());
    setMethod(defaultMethod ?? "");
    setNote("");
  }, [open, defaultAmountCents, defaultMethod]);

  const cents = Math.round(Number(amount.replace(/[^0-9.]/g, "")) * 100);
  const valid = Number.isFinite(cents) && cents > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    logGift({
      orgSlug,
      orgName,
      ein: ein ?? null,
      campaignId: campaignId ?? null,
      amountCents: cents,
      currency: "USD",
      givenAt: new Date(`${date}T12:00:00Z`).toISOString(),
      paymentMethodType: method || null,
      note: note.trim() || undefined,
    });
    toast("Logged to your maaser ledger", "success");
    onLogged?.();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Log a gift to ${orgName}`}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-ink-600">
          We have no way to see your bank, so nothing is logged unless you tell us. This entry
          stays on your device and feeds your maaser balance and year-end statement.
        </p>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Amount</span>
          <div className="flex h-12 items-center rounded-[8px] border border-ink-300 px-3 focus-within:border-brand-500">
            <span className="mr-1 text-ink-600">$</span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="180"
              className="tabular h-full w-full bg-transparent text-base outline-none"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Date given</span>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-[8px] border border-ink-300 px-3 text-base outline-none focus:border-brand-500"
          />
        </label>

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
            placeholder="Yom Tov drive, in memory of…"
            className="h-12 w-full rounded-[8px] border border-ink-300 px-3 text-base outline-none focus:border-brand-500"
          />
        </label>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose} full>
            Cancel
          </Button>
          <Button type="submit" size="lg" full disabled={!valid}>
            Log gift
          </Button>
        </div>
      </form>
    </Modal>
  );
}
