"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, SlidersHorizontal, X } from "lucide-react";
import { Button } from "./ui/button";
import { Chip } from "./ui/chip";
import { BUDGET_BAND_LABEL } from "@/lib/format";
import type { BudgetBand } from "@/lib/types";
import { cn } from "@/lib/cn";

const BUDGET_BANDS: BudgetBand[] = [
  "under_100k",
  "100k_500k",
  "500k_2m",
  "2m_10m",
  "over_10m",
];

export const SORTS = [
  { key: "relevance", label: "Most relevant" },
  { key: "distance", label: "Nearest" },
  { key: "urgency", label: "Closing soonest" },
  { key: "progress", label: "Furthest along" },
  { key: "newest", label: "Newest" },
] as const;

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
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
}

function toggleParam(next: URLSearchParams, key: string) {
  if (next.get(key) === "1") next.delete(key);
  else next.set(key, "1");
}

function FilterBody({ onDone }: { onDone?: () => void }) {
  const params = useSearchParams();
  const write = useFilterWriter();
  const [locating, setLocating] = React.useState(false);

  const on = (key: string) => params.get(key) === "1";
  const bands = new Set((params.get("budget") ?? "").split(",").filter(Boolean));
  const hasLocation = params.has("lat") && params.has("lng");

  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        write((next) => {
          next.set("lat", pos.coords.latitude.toFixed(4));
          next.set("lng", pos.coords.longitude.toFixed(4));
          next.set("sort", "distance");
        });
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 300_000 },
    );
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-bold text-ink-900">Trust</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={on("verified")} onClick={() => write((n) => toggleParam(n, "verified"))}>
            Verified only
          </Chip>
          <Chip active={on("claimed")} onClick={() => write((n) => toggleParam(n, "claimed"))}>
            Claimed profiles
          </Chip>
        </div>
        <p className="mt-2 text-xs text-ink-600">
          Verified means someone proved control of the organization&rsquo;s email, phone or
          domain — not that we audited its finances.
        </p>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-ink-900">Giving</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={on("matching")} onClick={() => write((n) => toggleParam(n, "matching"))}>
            Matching active
          </Chip>
          <Chip active={on("zelle")} onClick={() => write((n) => toggleParam(n, "zelle"))}>
            Accepts Zelle
          </Chip>
          <Chip active={on("israel")} onClick={() => write((n) => toggleParam(n, "israel"))}>
            Israel-based
          </Chip>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-ink-900">Annual budget</legend>
        <div className="flex flex-wrap gap-2">
          {BUDGET_BANDS.map((band) => (
            <Chip
              key={band}
              active={bands.has(band)}
              onClick={() =>
                write((next) => {
                  const set = new Set(bands);
                  if (set.has(band)) set.delete(band);
                  else set.add(band);
                  if (set.size === 0) next.delete("budget");
                  else next.set("budget", [...set].join(","));
                })
              }
            >
              {BUDGET_BAND_LABEL[band].replace(" a year", "")}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-ink-900">Distance</legend>
        {hasLocation ? (
          <div className="flex flex-wrap gap-2">
            {[10, 25, 50, 100].map((miles) => (
              <Chip
                key={miles}
                active={params.get("radius") === String(miles)}
                onClick={() =>
                  write((next) => {
                    if (next.get("radius") === String(miles)) next.delete("radius");
                    else next.set("radius", String(miles));
                  })
                }
              >
                Within {miles} mi
              </Chip>
            ))}
            <button
              type="button"
              onClick={() =>
                write((next) => {
                  next.delete("lat");
                  next.delete("lng");
                  next.delete("radius");
                })
              }
              className="text-sm font-semibold text-brand-700 underline underline-offset-2"
            >
              Clear location
            </button>
          </div>
        ) : (
          <Button variant="secondary" onClick={useMyLocation} disabled={locating}>
            <MapPin aria-hidden className="size-4" />
            {locating ? "Finding you…" : "Use my location"}
          </Button>
        )}
      </fieldset>

      <div className="flex gap-2 pt-2">
        <Button
          variant="secondary"
          onClick={() =>
            write((next) => {
              for (const key of [
                "verified",
                "claimed",
                "matching",
                "zelle",
                "israel",
                "budget",
                "radius",
                "lat",
                "lng",
              ]) {
                next.delete(key);
              }
            })
          }
        >
          Clear all
        </Button>
        {onDone && (
          <Button full onClick={onDone}>
            Show results
          </Button>
        )}
      </div>
    </div>
  );
}

export function FilterSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Filters</h2>
      <FilterBody />
    </aside>
  );
}

/** Bottom sheet on mobile, per §5. */
export function FilterSheetButton({ activeCount }: { activeCount: number }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="lg:hidden">
        <SlidersHorizontal aria-hidden className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="tabular rounded-full bg-brand-700 px-1.5 text-xs text-white">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-900/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[16px] bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-2 hover:bg-ink-050"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <FilterBody onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect({ value }: { value: string }) {
  const write = useFilterWriter();
  return (
    <label className="flex items-center gap-2 text-sm text-ink-600">
      <span className="sr-only sm:not-sr-only">Sort</span>
      <select
        value={value}
        onChange={(e) => write((next) => next.set("sort", e.target.value))}
        className="h-10 rounded-[8px] border border-ink-300 bg-white px-3 text-sm font-semibold text-ink-900"
      >
        {SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ActiveFilterPills() {
  const params = useSearchParams();
  const write = useFilterWriter();
  const pills: { key: string; label: string; clear: (n: URLSearchParams) => void }[] = [];

  const flags: [string, string][] = [
    ["verified", "Verified only"],
    ["claimed", "Claimed"],
    ["matching", "Matching active"],
    ["zelle", "Accepts Zelle"],
    ["israel", "Israel-based"],
  ];
  for (const [key, label] of flags) {
    if (params.get(key) === "1") {
      pills.push({ key, label, clear: (n) => n.delete(key) });
    }
  }
  const budget = params.get("budget");
  if (budget) {
    for (const band of budget.split(",")) {
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
    pills.push({
      key: "radius",
      label: `Within ${radius} mi`,
      clear: (n) => n.delete("radius"),
    });
  }

  if (pills.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2")}>
      {pills.map((pill) => (
        <li key={pill.key}>
          <button
            type="button"
            onClick={() => write(pill.clear)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-700 bg-brand-050 px-3 text-xs font-semibold text-brand-900"
          >
            {pill.label}
            <X aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
