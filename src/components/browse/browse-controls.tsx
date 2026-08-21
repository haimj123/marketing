"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, SlidersHorizontal, X } from "lucide-react";
import { BottomSheet } from "../ui/bottom-sheet";
import { BUDGET_BAND_LABEL } from "@/lib/format";
import type { BudgetBand } from "@/lib/types";
import { useDonor } from "@/lib/donor-store";
import { cn } from "@/lib/cn";

const SORTS = [
  { key: "relevance", label: "Most relevant" },
  { key: "distance", label: "Distance", needsCity: true },
  { key: "urgency", label: "Most urgent" },
  { key: "newest", label: "Newest" },
  { key: "progress", label: "Progress" },
] as const;

const TRUST: [string, string][] = [
  ["verified", "Verified"],
  ["claimed", "Claimed"],
];

const GIVING: [string, string][] = [
  ["matching", "Matching now"],
  ["zelle", "Accepts Zelle"],
  ["israel", "Israel"],
];

const BANDS: BudgetBand[] = ["under_100k", "100k_500k", "500k_2m", "2m_10m", "over_10m"];

const RADII = [10, 25, 50, 100];

const CLEARABLE = [
  "verified",
  "claimed",
  "matching",
  "zelle",
  "israel",
  "budget",
  "radius",
  "lat",
  "lng",
];

function useFilterWriter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return React.useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      const qs = next.toString();
      // scroll:false keeps the sheet where the thumb left it while the server
      // re-renders the list underneath.
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
}

/**
 * The sticky control row: sort on the left, filters beside it, then whatever
 * filters are already on as removable pills.
 *
 * Filters apply the moment you tap one rather than on a submit. The result
 * count in the sheet footer is therefore always the real server count, not an
 * optimistic guess — which is the whole reason it can be trusted.
 */
export function BrowseControls({ resultCount }: { resultCount: number }) {
  const params = useSearchParams();
  const write = useFilterWriter();
  const { city } = useDonor();
  const [sortOpen, setSortOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const sort = params.get("sort") ?? "relevance";
  const activeSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];
  const activeCount = countActive(params);

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-ink-300 bg-white py-2">
        <div className="rail bleed">
          <button
            type="button"
            onClick={() => setSortOpen(true)}
            className="press flex h-9 items-center gap-1.5 rounded-pill border border-ink-300 bg-white px-3.5 text-sm font-semibold text-ink-900"
          >
            <ArrowUpDown aria-hidden className="size-4 text-ink-600" />
            {activeSort.label}
          </button>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={cn(
              "press flex h-9 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-semibold",
              activeCount > 0
                ? "border-blue-700 bg-blue-050 text-blue-900"
                : "border-ink-300 bg-white text-ink-900",
            )}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="tabular rounded-pill bg-blue-700 px-1.5 text-xs text-white">
                {activeCount}
              </span>
            )}
          </button>

          {activePills(params).map((pill) => (
            <button
              key={pill.key}
              type="button"
              onClick={() => write(pill.clear)}
              className="press flex h-9 items-center gap-1.5 rounded-pill border border-blue-700 bg-blue-050 px-3.5 text-sm font-semibold text-blue-900"
            >
              {pill.label}
              <X aria-hidden className="size-3.5" />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
        </div>
      </div>

      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        <ul className="app pb-6">
          {SORTS.map((option) => {
            const selected = option.key === sort;
            const blocked = "needsCity" in option && option.needsCity && !city;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => {
                    write((next) => {
                      next.set("sort", option.key);
                      if (option.key === "distance" && city) {
                        next.set("lat", city.lat.toFixed(4));
                        next.set("lng", city.lng.toFixed(4));
                      }
                    });
                    setSortOpen(false);
                  }}
                  className="press flex min-h-[52px] w-full items-center justify-between gap-3 border-b border-ink-300 py-3 text-left disabled:opacity-45"
                >
                  <span className={cn("font-semibold", selected ? "text-blue-700" : "text-ink-900")}>
                    {option.label}
                    {blocked && (
                      <span className="block text-sm font-normal text-ink-600">
                        Set your location on the home screen first
                      </span>
                    )}
                  </span>
                  {selected && <Check aria-hidden className="size-5 shrink-0 text-blue-700" />}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>

      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        footer={
          <div className="app flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={() => write((next) => CLEARABLE.forEach((k) => next.delete(k)))}
              className="press shrink-0 px-1 text-sm font-semibold text-ink-900"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="press h-12 flex-1 rounded-card bg-blue-700 px-4 font-semibold text-white"
            >
              Show {resultCount} {resultCount === 1 ? "result" : "results"}
            </button>
          </div>
        }
      >
        <div className="app space-y-6 pb-6">
          <Group title="Trust">
            {TRUST.map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                active={params.get(key) === "1"}
                onClick={() => write((n) => toggle(n, key))}
              />
            ))}
            <p className="mt-2 w-full text-xs text-ink-600">
              Verified means someone proved control of the organization&rsquo;s email, phone or
              domain — not that we audited its finances.
            </p>
          </Group>

          <Group title="Giving">
            {GIVING.map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                active={params.get(key) === "1"}
                onClick={() => write((n) => toggle(n, key))}
              />
            ))}
          </Group>

          <Group title="Annual budget">
            {BANDS.map((band) => {
              const set = new Set((params.get("budget") ?? "").split(",").filter(Boolean));
              return (
                <Toggle
                  key={band}
                  label={BUDGET_BAND_LABEL[band].replace(" a year", "")}
                  active={set.has(band)}
                  onClick={() =>
                    write((next) => {
                      if (set.has(band)) set.delete(band);
                      else set.add(band);
                      if (set.size === 0) next.delete("budget");
                      else next.set("budget", [...set].join(","));
                    })
                  }
                />
              );
            })}
          </Group>

          <Group title="Distance">
            {city ? (
              RADII.map((miles) => (
                <Toggle
                  key={miles}
                  label={`Within ${miles} mi`}
                  active={params.get("radius") === String(miles)}
                  onClick={() =>
                    write((next) => {
                      if (next.get("radius") === String(miles)) {
                        next.delete("radius");
                      } else {
                        next.set("radius", String(miles));
                        next.set("lat", city.lat.toFixed(4));
                        next.set("lng", city.lng.toFixed(4));
                      }
                    })
                  }
                />
              ))
            ) : (
              <p className="text-sm text-ink-600">
                Set your location on the home screen and distance filters appear here.
              </p>
            )}
          </Group>
        </div>
      </BottomSheet>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-ink-900">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press flex h-9 items-center rounded-pill border px-3.5 text-sm font-semibold",
        active
          ? "border-blue-700 bg-blue-050 text-blue-900"
          : "border-ink-300 bg-white text-ink-900",
      )}
    >
      {label}
    </button>
  );
}

function toggle(next: URLSearchParams, key: string) {
  if (next.get(key) === "1") next.delete(key);
  else next.set(key, "1");
}

function countActive(params: URLSearchParams): number {
  let n = 0;
  for (const key of ["verified", "claimed", "matching", "zelle", "israel", "radius"]) {
    if (params.get(key)) n += 1;
  }
  const budget = params.get("budget");
  if (budget) n += budget.split(",").filter(Boolean).length;
  return n;
}

function activePills(params: URLSearchParams) {
  const pills: { key: string; label: string; clear: (n: URLSearchParams) => void }[] = [];
  for (const [key, label] of [...TRUST, ...GIVING]) {
    if (params.get(key) === "1") {
      pills.push({ key, label, clear: (n) => n.delete(key) });
    }
  }
  const budget = params.get("budget");
  if (budget) {
    for (const band of budget.split(",").filter(Boolean)) {
      pills.push({
        key: `budget-${band}`,
        label: BUDGET_BAND_LABEL[band as BudgetBand] ?? band,
        clear: (n) => {
          const rest = budget.split(",").filter((b) => b !== band);
          if (rest.length) n.set("budget", rest.join(","));
          else n.delete("budget");
        },
      });
    }
  }
  const radius = params.get("radius");
  if (radius) {
    pills.push({ key: "radius", label: `Within ${radius} mi`, clear: (n) => n.delete("radius") });
  }
  return pills;
}
