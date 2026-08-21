"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Button } from "./ui/button";
import { EmptyState } from "./ui/empty-state";
import { ButtonLink } from "./ui/button";
import { useDonor } from "@/lib/donor-store";
import { totalsByOrganization } from "@/lib/export";
import { formatCents, formatDate, formatEin } from "@/lib/format";

/**
 * The exit test for M6 is that an accountant accepts this. So it leads with
 * what an accountant needs — organization legal name, EIN, dates, amounts —
 * and states plainly what it is not: a receipt. We never handled the money,
 * so we cannot substantiate anything; the organization's own acknowledgment
 * is what does that.
 */
export function YearEndStatement() {
  const { gifts, ready } = useDonor();
  const years = [...new Set(gifts.map((g) => new Date(g.givenAt).getUTCFullYear()))].sort(
    (a, b) => b - a,
  );
  const [year, setYear] = React.useState<number | null>(null);
  const active = year ?? years[0] ?? new Date().getUTCFullYear();

  if (!ready) return <div className="h-64 animate-pulse rounded-[8px] bg-ink-050" aria-hidden />;

  const rows = gifts
    .filter((g) => new Date(g.givenAt).getUTCFullYear() === active)
    .sort((a, b) => a.givenAt.localeCompare(b.givenAt));

  if (gifts.length === 0) {
    return (
      <EmptyState
        title="Nothing to report yet"
        body="Log some gifts and this becomes a statement you can hand to a tax preparer."
        action={<ButtonLink href="/history">Go to giving history</ButtonLink>}
      />
    );
  }

  const total = rows.reduce((sum, g) => sum + g.amountCents, 0);
  const byOrg = totalsByOrganization(rows);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          Year
          <select
            value={active}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10 rounded-[8px] border border-ink-300 bg-white px-3 text-sm font-semibold text-ink-900"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <Button onClick={() => window.print()}>
          <Printer aria-hidden className="size-4" />
          Print or save as PDF
        </Button>
      </div>

      <article className="rounded-[8px] border border-ink-300 p-6 print:border-0 print:p-0">
        <header className="border-b border-ink-300 pb-4">
          <h2 className="font-display text-xl font-extrabold text-ink-900">
            Charitable giving statement — {active}
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Self-reported record prepared from a personal giving log. Shaare Tzadaka did not
            process, receive or hold any of these payments.
          </p>
        </header>

        <table className="mt-6 w-full border-collapse text-sm">
          <caption className="sr-only">Gifts logged in {active}</caption>
          <thead>
            <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-600">
              <th scope="col" className="py-2 pr-4 font-semibold">Date</th>
              <th scope="col" className="py-2 pr-4 font-semibold">Organization</th>
              <th scope="col" className="py-2 pr-4 font-semibold">EIN</th>
              <th scope="col" className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((gift) => (
              <tr key={gift.id} className="border-b border-ink-050">
                <td className="tabular py-2 pr-4 whitespace-nowrap">{formatDate(gift.givenAt)}</td>
                <td className="py-2 pr-4">{gift.orgName}</td>
                <td className="tabular py-2 pr-4">{formatEin(gift.ein) ?? "—"}</td>
                <td className="tabular py-2 text-right font-semibold">
                  {formatCents(gift.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="py-3 pr-4 text-right font-bold">
                Total
              </th>
              <td className="tabular py-3 text-right font-display text-lg font-extrabold">
                {formatCents(total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <section className="mt-8">
          <h3 className="font-display text-base font-bold text-ink-900">Summary by organization</h3>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-600">
                <th scope="col" className="py-2 pr-4 font-semibold">Organization</th>
                <th scope="col" className="py-2 pr-4 font-semibold">EIN</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Gifts</th>
                <th scope="col" className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {byOrg.map((row) => (
                <tr key={row.orgSlug} className="border-b border-ink-050">
                  <td className="py-2 pr-4">{row.orgName}</td>
                  <td className="tabular py-2 pr-4">{formatEin(row.ein) ?? "—"}</td>
                  <td className="tabular py-2 pr-4">{row.count}</td>
                  <td className="tabular py-2 text-right font-semibold">
                    {formatCents(row.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t border-ink-300 pt-4 text-xs leading-relaxed text-ink-600">
          <p>
            <strong>This is not a receipt and not tax advice.</strong> It is a record you entered
            yourself. Deductibility depends on each organization&rsquo;s tax status and on your own
            circumstances; the organization&rsquo;s own written acknowledgment is what substantiates
            a deduction. EINs shown are taken from the organization&rsquo;s listing at the time each
            gift was logged.
          </p>
          <p className="mt-2">Prepared {formatDate(new Date().toISOString())} · shaaretzadaka</p>
        </footer>
      </article>
    </div>
  );
}
