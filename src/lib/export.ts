import type { Gift } from "./types";
import { formatEin } from "./format";

/**
 * Year-end export. The output has to be something a tax preparer can work
 * from without a conversation: one row per gift, organization legal name, EIN,
 * date, amount, method.
 */
export function giftsToCsv(gifts: Gift[]): string {
  const header = ["Date", "Organization", "EIN", "Amount (USD)", "Method", "Note"];

  const rows = [...gifts]
    .sort((a, b) => a.givenAt.localeCompare(b.givenAt))
    .map((g) => [
      g.givenAt.slice(0, 10),
      g.orgName,
      formatEin(g.ein) ?? "",
      (g.amountCents / 100).toFixed(2),
      g.paymentMethodType ?? "",
      g.note ?? "",
    ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

function escapeCsv(value: string): string {
  // A leading =, +, - or @ is treated as a formula by Excel and Sheets. Prefix
  // with an apostrophe so an organization name can never execute anything.
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(guarded)) return `"${guarded.replace(/"/g, '""')}"`;
  return guarded;
}

export function downloadCsv(filename: string, csv: string) {
  // The BOM keeps Excel from mangling Hebrew organization names.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface OrgTotal {
  orgSlug: string;
  orgName: string;
  ein: string | null;
  totalCents: number;
  count: number;
}

export function totalsByOrganization(gifts: Gift[]): OrgTotal[] {
  const map = new Map<string, OrgTotal>();
  for (const g of gifts) {
    const existing = map.get(g.orgSlug);
    if (existing) {
      existing.totalCents += g.amountCents;
      existing.count += 1;
    } else {
      map.set(g.orgSlug, {
        orgSlug: g.orgSlug,
        orgName: g.orgName,
        ein: g.ein ?? null,
        totalCents: g.amountCents,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.totalCents - a.totalCents);
}
