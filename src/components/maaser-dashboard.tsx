"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarRange, Pencil, Plus } from "lucide-react";
import { MaaserRing } from "./maaser-ring";
import { Button, ButtonLink } from "./ui/button";
import { Chip } from "./ui/chip";
import { Modal } from "./ui/modal";
import { ManualGiftDialog } from "./manual-gift-dialog";
import { summariseMaaser, useDonor } from "@/lib/donor-store";
import { formatCents, formatDate } from "@/lib/format";
import type { MaaserSettings } from "@/lib/types";

const PRESETS = [
  { percent: 10, label: "Maaser — 10%" },
  { percent: 20, label: "Chomesh — 20%" },
];

export function MaaserDashboard() {
  const { maaser, gifts, ready, setMaaser } = useDonor();
  const [editing, setEditing] = React.useState(false);
  const [logging, setLogging] = React.useState(false);

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-[16px] bg-ink-050" aria-hidden />;
  }

  if (!maaser) {
    return (
      <>
        <SetupCard onSave={setMaaser} />
        <ManualGiftDialog open={logging} onClose={() => setLogging(false)} />
      </>
    );
  }

  const summary = summariseMaaser(maaser, gifts);
  const recent = summary.giftsThisYear.slice(0, 3);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="mx-auto lg:mx-0">
          <MaaserRing
            givenCents={summary.givenCents}
            obligationCents={summary.obligationCents}
          />
        </div>

        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Income entered" value={formatCents(maaser.annualIncomeCents)} />
            <Stat label="Your percentage" value={`${maaser.percent}%`} />
            <Stat label="Obligation" value={formatCents(summary.obligationCents)} />
            <Stat label="Given this year" value={formatCents(summary.givenCents)} />
            <Stat label="Gifts logged" value={String(summary.giftsThisYear.length)} />
            <Stat
              label="Giving year"
              value={`${formatDate(summary.yearStart.toISOString())} –`}
              sub={formatDate(new Date(summary.yearEnd.getTime() - 86_400_000).toISOString())}
            />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setLogging(true)}>
              <Plus aria-hidden className="size-4" />
              Log a gift
            </Button>
            <ButtonLink href="/history" variant="secondary" size="lg">
              <CalendarRange aria-hidden className="size-4" />
              History &amp; export
            </ButtonLink>
            <Button variant="ghost" size="lg" onClick={() => setEditing(true)}>
              <Pencil aria-hidden className="size-4" />
              Edit income
            </Button>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-lg font-bold text-ink-900">Most recent</h2>
            {recent.length === 0 ? (
              <p className="mt-2 text-sm text-ink-600">
                Nothing logged yet this year.{" "}
                <Link href="/" className="font-semibold text-brand-700 underline">
                  Find an organization
                </Link>{" "}
                and log the gift when you send it.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-050 border-y border-ink-050">
                {recent.map((gift) => (
                  <li key={gift.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/org/${gift.orgSlug}`}
                        className="block truncate font-semibold text-ink-900 hover:underline"
                      >
                        {gift.orgName}
                      </Link>
                      <span className="text-sm text-ink-600">{formatDate(gift.givenAt)}</span>
                    </div>
                    <span className="tabular font-semibold text-ink-900">
                      {formatCents(gift.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <EditModal
        open={editing}
        onClose={() => setEditing(false)}
        settings={maaser}
        onSave={(next) => {
          setMaaser(next);
          setEditing(false);
        }}
      />
      <ManualGiftDialog open={logging} onClose={() => setLogging(false)} />
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[8px] border border-ink-300 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</dt>
      <dd className="tabular mt-1 font-display text-lg font-bold text-ink-900">
        {value}
        {sub && <span className="block text-sm font-semibold text-ink-600">{sub}</span>}
      </dd>
    </div>
  );
}

function SetupCard({ onSave }: { onSave: (s: MaaserSettings) => void }) {
  return (
    <div className="rounded-[16px] border border-ink-300 p-6 md:p-8">
      <h2 className="font-display text-xl font-bold text-ink-900">Set up your maaser tracker</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Enter your income and the percentage you give. We work out the obligation and draw it down
        as you log gifts. Nothing here is sent anywhere — your income stays in this browser, on
        this device.
      </p>
      <div className="mt-6 max-w-md">
        <SettingsForm onSave={onSave} submitLabel="Start tracking" />
      </div>
    </div>
  );
}

function EditModal({
  open,
  onClose,
  settings,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  settings: MaaserSettings;
  onSave: (s: MaaserSettings) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Income and percentage">
      <SettingsForm initial={settings} onSave={onSave} submitLabel="Save" />
    </Modal>
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
  const effectivePercent = customPercent ? Number(customPercent) : percent;
  const valid = cents > 0 && effectivePercent > 0 && effectivePercent <= 100;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSave({
      annualIncomeCents: cents,
      percent: effectivePercent,
      fiscalYearStart: yearStart,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-900">Annual income</span>
        <div className="flex h-12 items-center rounded-[8px] border border-ink-300 px-3 focus-within:border-brand-500">
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
          Net or gross is between you and your rav — we just do the arithmetic on what you enter.
        </span>
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-900">Percentage</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Chip
              key={preset.percent}
              active={!customPercent && percent === preset.percent}
              onClick={() => {
                setPercent(preset.percent);
                setCustomPercent("");
              }}
            >
              {preset.label}
            </Chip>
          ))}
          <div className="flex h-9 items-center rounded-full border border-ink-300 px-3">
            <input
              type="text"
              inputMode="decimal"
              value={customPercent}
              onChange={(e) => setCustomPercent(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Other"
              aria-label="Custom percentage"
              className="tabular w-16 bg-transparent text-sm outline-none"
            />
            <span className="text-sm text-ink-600">%</span>
          </div>
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-900">Giving year starts</span>
        <select
          value={yearStart}
          onChange={(e) => setYearStart(e.target.value)}
          className="h-12 w-full rounded-[8px] border border-ink-300 bg-white px-3 text-base outline-none focus:border-brand-500"
        >
          <option value="01-01">1 January</option>
          <option value="04-01">1 April</option>
          <option value="07-01">1 July</option>
          <option value="09-01">1 September (around Rosh Hashana)</option>
          <option value="10-01">1 October</option>
        </select>
      </label>

      <Button type="submit" size="lg" full disabled={!valid}>
        {submitLabel}
      </Button>
    </form>
  );
}
