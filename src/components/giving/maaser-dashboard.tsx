"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { MaaserRing } from "../maaser-ring";
import { BottomSheet } from "../ui/bottom-sheet";
import { GiftFormSheet } from "./gift-form";
import { summariseMaaser, useDonor } from "@/lib/donor-store";
import { formatCents, formatDate } from "@/lib/format";
import type { MaaserSettings } from "@/lib/types";
import { cn } from "@/lib/cn";

const PRESETS = [
  { percent: 10, label: "Maaser · 10%" },
  { percent: 20, label: "Chomesh · 20%" },
];

export function MaaserDashboard() {
  const { maaser, gifts, ready, setMaaser } = useDonor();
  const [editing, setEditing] = React.useState(false);
  const [logging, setLogging] = React.useState(false);

  if (!ready) return <div className="skeleton mx-4 h-64 rounded-card" aria-hidden />;

  if (!maaser) {
    return (
      <div className="app py-4">
        <h2 className="font-display text-xl font-bold text-ink-900">Set up your maaser tracker</h2>
        <p className="mt-1.5 text-sm text-ink-600">
          Enter your income and the percentage you give. We work out the obligation and draw it
          down as you log gifts. Nothing is sent anywhere — your income stays in this browser, on
          this device.
        </p>
        <div className="mt-5">
          <SettingsForm onSave={setMaaser} submitLabel="Start tracking" />
        </div>
      </div>
    );
  }

  const summary = summariseMaaser(maaser, gifts);
  const recent = summary.giftsThisYear.slice(0, 3);

  return (
    <>
      <div className="app pb-6">
        <div className="flex justify-center py-5">
          <MaaserRing
            givenCents={summary.givenCents}
            obligationCents={summary.obligationCents}
            size={240}
          />
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Stat label="Income entered" value={formatCents(maaser.annualIncomeCents)} />
          <Stat label="Percentage" value={`${maaser.percent}%`} />
          <Stat label="Obligation" value={formatCents(summary.obligationCents)} />
          <Stat label="Given this year" value={formatCents(summary.givenCents)} />
        </dl>

        <p className="mt-2 text-xs text-ink-600">
          Giving year {formatDate(summary.yearStart.toISOString())} –{" "}
          {formatDate(new Date(summary.yearEnd.getTime() - 86_400_000).toISOString())}
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => setLogging(true)}
            className="press flex h-13 w-full items-center justify-center gap-2 rounded-card bg-blue-700 py-4 font-semibold text-white"
          >
            <Plus aria-hidden className="size-4" />
            Log a gift
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="press flex h-12 w-full items-center justify-center gap-2 rounded-card border border-ink-300 font-semibold text-ink-900"
          >
            <Pencil aria-hidden className="size-4" />
            Edit income
          </button>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink-900">Most recent</h2>
            <Link href="/history" className="press flex min-h-11 items-center gap-1 text-sm font-semibold text-blue-700">
              All gifts
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="mt-1 text-sm text-ink-600">
              Nothing logged yet this year.{" "}
              <Link href="/categories" className="font-semibold text-blue-700 underline">
                Find an organization
              </Link>{" "}
              and log the gift when you send it.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-ink-300 border-y border-ink-300">
              {recent.map((gift) => (
                <li key={gift.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-900">
                      {gift.orgName}
                    </span>
                    <span className="block text-sm text-ink-600">{formatDate(gift.givenAt)}</span>
                  </span>
                  <span className="tabular shrink-0 font-semibold text-ink-900">
                    {formatCents(gift.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <BottomSheet
        open={editing}
        onClose={() => setEditing(false)}
        title="Income and percentage"
      >
        <div className="app pb-6">
          <SettingsForm
            initial={maaser}
            submitLabel="Save"
            onSave={(next) => {
              setMaaser(next);
              setEditing(false);
            }}
          />
        </div>
      </BottomSheet>

      <GiftFormSheet open={logging} onClose={() => setLogging(false)} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-ink-050 p-3">
      <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-600">{label}</dt>
      <dd className="tabular mt-0.5 font-display text-lg font-bold text-ink-900">{value}</dd>
    </div>
  );
}

function SettingsForm({
  initial,
  onSave,
  submitLabel,
}: {
  initial?: MaaserSettings;
  onSave: (s: MaaserSettings) => void;
  submitLabel: string;
}) {
  const [income, setIncome] = React.useState(
    initial ? String(initial.annualIncomeCents / 100) : "",
  );
  const [percent, setPercent] = React.useState(initial?.percent ?? 10);
  const [customPercent, setCustomPercent] = React.useState("");
  const [yearStart, setYearStart] = React.useState(initial?.fiscalYearStart ?? "01-01");

  const cents = Math.round(Number(income.replace(/[^0-9.]/g, "")) * 100);
  const effective = customPercent ? Number(customPercent) : percent;
  const valid = cents > 0 && effective > 0 && effective <= 100;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSave({ annualIncomeCents: cents, percent: effective, fiscalYearStart: yearStart });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-ink-900">Annual income</span>
        <div className="flex h-12 items-center rounded-card border border-ink-300 px-3 focus-within:border-blue-500">
          <span className="mr-1 text-ink-600">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="120,000"
            className="tabular h-full w-full bg-transparent text-base outline-none"
          />
        </div>
        <span className="mt-1 block text-xs text-ink-600">
          Net or gross is between you and your rav — we do the arithmetic on what you enter.
        </span>
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink-900">Percentage</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.percent}
              type="button"
              aria-pressed={!customPercent && percent === preset.percent}
              onClick={() => {
                setPercent(preset.percent);
                setCustomPercent("");
              }}
              className={cn(
                "press flex h-11 items-center rounded-pill border px-4 text-sm font-semibold",
                !customPercent && percent === preset.percent
                  ? "border-blue-700 bg-blue-050 text-blue-900"
                  : "border-ink-300 bg-white text-ink-900",
              )}
            >
              {preset.label}
            </button>
          ))}
          <div className="flex h-11 items-center rounded-pill border border-ink-300 px-4">
            <input
              type="text"
              inputMode="decimal"
              value={customPercent}
              onChange={(e) => setCustomPercent(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Other"
              aria-label="Custom percentage"
              className="tabular w-14 bg-transparent text-sm outline-none"
            />
            <span className="text-sm text-ink-600">%</span>
          </div>
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-ink-900">Giving year starts</span>
        <select
          value={yearStart}
          onChange={(e) => setYearStart(e.target.value)}
          className="h-12 w-full rounded-card border border-ink-300 bg-white px-3 text-base outline-none focus:border-blue-500"
        >
          <option value="01-01">1 January</option>
          <option value="04-01">1 April</option>
          <option value="07-01">1 July</option>
          <option value="09-01">1 September (around Rosh Hashana)</option>
          <option value="10-01">1 October</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={!valid}
        className="press h-13 w-full rounded-card bg-blue-700 py-4 font-semibold text-white disabled:opacity-45"
      >
        {submitLabel}
      </button>
    </form>
  );
}
