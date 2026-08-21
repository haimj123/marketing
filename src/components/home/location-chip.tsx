"use client";

import * as React from "react";
import { ChevronDown, Crosshair, MapPin } from "lucide-react";
import { BottomSheet } from "../ui/bottom-sheet";
import { useDonor } from "@/lib/donor-store";
import { useToast } from "../ui/toast";
import type { City } from "@/lib/cities";
import { cn } from "@/lib/cn";

/**
 * Where a delivery app puts the delivery address. The parallel is exact: local
 * giving is usually the first call, and a food program two towns over is one
 * you can go and look at yourself.
 *
 * The city lives in localStorage only. A browser coordinate goes to the nearby
 * endpoint to sort listings and is never stored.
 */
export function LocationChip({ cities }: { cities: City[] }) {
  const { city, setCity, ready } = useDonor();
  const [open, setOpen] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const toast = useToast();

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast("This browser can't share a location");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Snap to the nearest listed city so the chip reads as a place name
        // rather than a coordinate.
        const nearest = [...cities].sort(
          (a, b) =>
            Math.hypot(a.lat - pos.coords.latitude, a.lng - pos.coords.longitude) -
            Math.hypot(b.lat - pos.coords.latitude, b.lng - pos.coords.longitude),
        )[0];
        setCity({
          label: nearest?.label ?? "Near you",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
        setOpen(false);
      },
      () => {
        setLocating(false);
        toast("Couldn't get your location — pick a city instead");
      },
      { timeout: 8000, maximumAge: 300_000 },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press -ml-1 flex min-h-11 min-w-0 items-center gap-1 rounded-pill px-1 text-left"
      >
        <MapPin aria-hidden className="size-4 shrink-0 text-ink-900" />
        <span className="min-w-0">
          <span className="block text-2xs font-semibold uppercase tracking-wide text-ink-600">
            Giving near
          </span>
          <span className="block truncate text-sm font-bold text-ink-900">
            {ready && city ? city.label : "Set your location"}
          </span>
        </span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-900" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Where are you giving?">
        <div className="app pb-6">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="press flex min-h-[52px] w-full items-center gap-3 border-b border-ink-300 py-3 text-left"
          >
            <Crosshair aria-hidden className="size-5 shrink-0 text-blue-700" />
            <span className="font-semibold text-blue-700">
              {locating ? "Finding you…" : "Use my current location"}
            </span>
          </button>

          <ul>
            {cities.map((option) => {
              const active = city?.label === option.label;
              return (
                <li key={option.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setCity({ label: option.label, lat: option.lat, lng: option.lng });
                      setOpen(false);
                    }}
                    className="press flex min-h-[52px] w-full items-center justify-between gap-3 border-b border-ink-300 py-3 text-left"
                  >
                    <span
                      className={cn(
                        "font-semibold",
                        active ? "text-blue-700" : "text-ink-900",
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="tabular text-sm text-ink-600">{option.count} listed</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {city && (
            <button
              type="button"
              onClick={() => {
                setCity(null);
                setOpen(false);
              }}
              className="press mt-4 text-sm font-semibold text-ink-600 underline underline-offset-2"
            >
              Clear location
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
