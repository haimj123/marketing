"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileText, Plus, ScrollText, Trash2 } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { GiftFormSheet } from "./gift-form";
import { useDonor } from "@/lib/donor-store";
import { downloadCsv, giftsToCsv, totalsByOrganization } from "@/lib/export";
import { PAYMENT_LABEL, formatCents, formatDate, formatEin } from "@/lib/format";
import type { Gift } from "@/lib/types";

function yearOf(gift: Gift): number {
  return new Date(gift.givenAt).getUTCFullYear();
}

export function GivingHistory() {
  const { gifts, ready, removeGift } = useDonor();
  const [logging, setLogging] = React.useState(false);
  const [year, setYear] = React.useState<number | "all">("all");

  if (!ready) return <div className="skeleton mx-4 h-48 rounded-card" aria-hidden />;

  const years = [...new Set(gifts.map(yearOf))].sort((a, b) => b - a);
  const rows = (year === "all" ? gifts : gifts.filter((g) => yearOf(g) === year))
    .slice()
    .sort((a, b) => b.givenAt.localeCompare(a.givenAt));
  const total = rows.reduce((sum, g) => sum + g.amountCents, 0);
  const byOrg = totalsByOrganization(rows);

  if (gifts.length === 0) {
    return (
      <>
        <EmptyState
          icon={<ScrollText aria-hidden className="size-7" strokeWidth={1.5} />}
          title="No gifts logged yet"
          body="Log a gift when you send one — from an organization's page, or here by hand for anything given elsewhere. The ledger is only as good as what you put in it."
          action={
            <button
              type="button"
              onClick={() => setLogging(true)}
              className="press h-12 rounded-card bg-blue-700 px-6 font-semibold text-white"
            >
              Log a gift
            </button>
          }
        />
        <GiftFormSheet open={logging} onClose={() => setLogging(false)} />
      </>
    );
  }

  return (
    <>
      <div className="app pb-6">
        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => setLogging(true)}
            className="press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-card bg-blue-700 font-semibold text-white"
          >
            <Plus aria-hidden className="size-4" />
            Log a gift
          </button>
          {years.length > 1 && (
            <label className="shrink-0">
              <span className="sr-only">Filter by year</span>
              <select
                value={String(year)}
                onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="h-11 rounded-card border border-ink-300 bg-white px-3 text-sm font-semibold text-ink-900"
              >
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <p className="tabular text-sm text-ink-600">
          {rows.length} {rows.length === 1 ? "gift" : "gifts"} ·{" "}
          <span className="font-semibold text-ink-900">{formatCents(total)}</span>
        </p>

        <ul className="mt-3 divide-y divide-ink-300 border-y border-ink-300">
          {rows.map((gift) => (
            <li key={gift.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                {gift.orgSlug.startsWith("unlisted:") ? (
                  <span className="block truncate font-semibold text-ink-900">{gift.orgName}</span>
                ) : (
                  <Link
                    href={`/org/${gift.orgSlug}`}
                    className="press block truncate font-semibold text-ink-900"
                  >
                    {gift.orgName}
                  </Link>
                )}
                <span className="block truncate text-sm text-ink-600">
                  {formatDate(gift.givenAt)}
                  {gift.paymentMethodType ? ` · ${PAYMENT_LABEL[gift.paymentMethodType]}` : ""}
                  {gift.note ? ` · ${gift.note}` : ""}
                </span>
              </div>
              <span className="tabular shrink-0 font-semibold text-ink-900">
                {formatCents(gift.amountCents)}
              </span>
              <button
                type="button"
                onClick={() => removeGift(gift.id)}
                aria-label={`Remove gift to ${gift.orgName} on ${formatDate(gift.givenAt)}`}
                className="press flex size-11 shrink-0 items-center justify-center rounded-full text-ink-600"
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-ink-900">By organization</h2>
          <ul className="mt-2 divide-y divide-ink-300 border-y border-ink-300">
            {byOrg.map((row) => (
              <li key={row.orgSlug} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink-900">{row.orgName}</span>
                  <span className="tabular block text-xs text-ink-600">
                    {row.count} {row.count === 1 ? "gift" : "gifts"}
                    {row.ein ? ` · EIN ${formatEin(row.ein)}` : ""}
                  </span>
                </span>
                <span className="tabular shrink-0 font-semibold text-ink-900">
                  {formatCents(row.totalCents)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `shaare-tzadaka-giving-${year === "all" ? "all" : year}.csv`,
                giftsToCsv(rows),
              )
            }
            className="press flex h-12 w-full items-center justify-center gap-2 rounded-card border border-ink-300 font-semibold text-ink-900"
          >
            <Download aria-hidden className="size-4" />
            Download CSV
          </button>
          <ButtonLink href="/history/statement" variant="secondary" size="lg" full>
            <FileText aria-hidden className="size-4" />
            Year-end statement
          </ButtonLink>
        </div>
      </div>

      <GiftFormSheet open={logging} onClose={() => setLogging(false)} />
    </>
  );
}
