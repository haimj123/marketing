"use client";

import * as React from "react";
import { MapPin, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Chip } from "./ui/chip";
import { OrgRail } from "./org-rail";
import { EmptyState } from "./ui/empty-state";
import type { City } from "@/lib/cities";
import type { OrgListItem } from "@/lib/data";

type State =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "denied" }
  | { kind: "loaded"; label: string; orgs: OrgListItem[] };

export function NearYou({ cities }: { cities: City[] }) {
  const [state, setState] = React.useState<State>({ kind: "idle" });

  const load = React.useCallback(async (lat: number, lng: number, label: string) => {
    const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`);
    const data = (await res.json()) as { results: OrgListItem[] };
    setState({ kind: "loaded", label, orgs: data.results });
  }, []);

  function askBrowser() {
    if (!("geolocation" in navigator)) {
      setState({ kind: "denied" });
      return;
    }
    setState({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => void load(pos.coords.latitude, pos.coords.longitude, "your location"),
      () => setState({ kind: "denied" }),
      { timeout: 8000, maximumAge: 300_000 },
    );
  }

  if (state.kind === "loaded") {
    return (
      <div>
        <p className="mb-4 flex items-center gap-1.5 text-sm text-ink-600">
          <MapPin aria-hidden className="size-4" />
          Sorted by distance from {state.label}.
          <button
            type="button"
            onClick={() => setState({ kind: "denied" })}
            className="font-semibold text-blue-700 underline underline-offset-2"
          >
            Change
          </button>
        </p>
        {state.orgs.length > 0 ? (
          <OrgRail orgs={state.orgs} showDistance />
        ) : (
          <EmptyState
            title="Nothing listed nearby yet"
            body="No organization in the directory has an address near that point. Try a wider search."
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-300 bg-ink-050 p-6">
      <p className="text-sm text-ink-900">
        Local giving is usually the first call — a food program two towns over is one you can check
        on yourself.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={askBrowser} disabled={state.kind === "locating"}>
          {state.kind === "locating" ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <MapPin aria-hidden className="size-4" />
          )}
          {state.kind === "locating" ? "Finding you…" : "Use my location"}
        </Button>
        <span className="text-sm text-ink-600">or pick a city:</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {cities.slice(0, 10).map((city) => (
          <Chip key={city.label} onClick={() => void load(city.lat, city.lng, city.label)}>
            {city.label}
            <span className="tabular text-ink-600">{city.count}</span>
          </Chip>
        ))}
      </div>
      {state.kind === "denied" && (
        <p className="mt-3 text-sm text-ink-600">
          No location — that&rsquo;s fine. Choose a city above.
        </p>
      )}
    </div>
  );
}
