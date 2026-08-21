"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "./ui/button";
import { EmptyState } from "./ui/empty-state";
import { ManualGiftDialog } from "./manual-gift-dialog";
import { useDonor } from "@/lib/donor-store";
import { downloadCsv, giftsToCsv, totalsByOrganization } from "@/lib/export";
import { formatCents, formatDate, formatEin, PAYMENT_LABEL } from "@/lib/format";
import type { Gift } from "@/lib/types";

function yearOf(gift: Gift): number {
  return new Date(gift.givenAt).getUTCFullYear();
}

export function GivingHistory() {
  const { gifts, ready, removeGift } = useDonor();
  const [logging, setLogging] = React.useState(false);
  const [year, setYear] = React.useState<number | "all">("all");

  if (!ready) return <div className="h-48 animate-pulse rounded-card bg-ink-050" aria-hidden />;

  const years = [...new Set(gifts.map(yearOf))].sort((a, b) => b - a);
  const rows = (year === "all" ? gifts : gifts.filter((g) => yearOf(g) === year)).slice().sort(
    (a, b) => b.givenAt.localeCompare(a.givenAt),
  );
  const total = rows.reduce((sum, g) => sum + g.amountCents, 0);
  const byOrg = totalsByOrganization(rows);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setLogging(true)}>
            <Plus aria-hidden className="size-4" />
            Log a gift
          </Button>
          {years.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-ink-600">
              Year
              <select
                value={String(year)}
                onChange={(e) =>
                  setYear(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="h-10 rounded-card border border-ink-300 bg-white px-3 text-sm font-semibold text-ink-900"
              >
                <option value="all">All</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `shaare-tzadaka-giving-${year === "all" ? "all" : year}.csv`,
                  giftsToCsv(rows),
                )
              }
            >
              <Download aria-hidden className="size-4" />
              Download CSV
            </Button>
            <ButtonLink variant="secondary" href="/history/statement">
              <FileText aria-hidden className="size-4" />
              Year-end statement
            </ButtonLink>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No gifts logged yet"
          body="Log a gift when you send one — from an organization's page, or here by hand for anything you gave elsewhere. The ledger is only as good as what you put in it."
          action={<Button onClick={() => setLogging(true)}>Log a gift</Button>}
        />
      ) : (
        <>
          <p className="tabular mb-4 text-sm text-ink-600">
            {rows.length} {rows.length === 1 ? "gift" : "gifts"} ·{" "}
            <span className="font-semibold text-ink-900">{formatCents(total)}</span>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-600">
                  <th scope="col" className="py-2 pr-4 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Organization</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Method</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((gift) => (
                  <tr key={gift.id} className="border-b border-ink-050">
                    <td className="tabular py-3 pr-4 whitespace-nowrap text-ink-600">
                      {formatDate(gift.givenAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {gift.orgSlug.startsWith("unlisted:") ? (
                        <span className="font-semibold text-ink-900">{gift.orgName}</span>
                      ) : (
                        <Link
                          href={`/org/${gift.orgSlug}`}
                          className="font-semibold text-ink-900 hover:underline"
                        >
                          {gift.orgName}
                        </Link>
                      )}
                      {gift.note && <span className="block text-xs text-ink-600">{gift.note}</span>}
                    </td>
                    <td className="py-3 pr-4 text-ink-600">
                      {gift.paymentMethodType ? PAYMENT_LABEL[gift.paymentMethodType] : "—"}
                    </td>
                    <td className="tabular py-3 pr-4 text-right font-semibold text-ink-900">
                      {formatCents(gift.amountCents)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeGift(gift.id)}
                        aria-label={`Remove gift to ${gift.orgName} on ${formatDate(gift.givenAt)}`}
                        className="rounded-card p-2 text-ink-600 hover:bg-ink-050 hover:text-danger"
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-lg font-bold text-ink-900">By organization</h2>
            <ul className="mt-3 divide-y divide-ink-050 border-y border-ink-050">
              {byOrg.map((row) => (
                <li key={row.orgSlug} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <span className="block truncate font-semibold text-ink-900">{row.orgName}</span>
                    <span className="tabular block text-xs text-ink-600">
                      {row.count} {row.count === 1 ? "gift" : "gifts"}
                      {row.ein ? ` · EIN ${formatEin(row.ein)}` : ""}
                    </span>
                  </div>
                  <span className="tabular font-semibold text-ink-900">
                    {formatCents(row.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <ManualGiftDialog open={logging} onClose={() => setLogging(false)} />
    </>
  );
}
