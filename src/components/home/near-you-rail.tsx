"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { OrgRail } from "../org-rail";
import { SkeletonRail } from "../shell/skeleton";
import { useDonor } from "@/lib/donor-store";
import type { OrgListItem } from "@/lib/data";

/**
 * Reads the city the donor set on the location chip and asks the server to
 * sort by distance from it. If no city is set, this is a prompt rather than an
 * empty rail — a section that renders nothing is worse than one that says what
 * it needs.
 */
export function NearYouRail() {
  const { city, ready } = useDonor();
  const [orgs, setOrgs] = React.useState<OrgListItem[] | null>(null);

  React.useEffect(() => {
    if (!city) {
      setOrgs(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/nearby?lat=${city.lat}&lng=${city.lng}`);
      const data = (await res.json()) as { results: OrgListItem[] };
      if (!cancelled) setOrgs(data.results);
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (!ready) return <SkeletonRail />;

  if (!city) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-ink-050 p-4">
        <MapPin aria-hidden className="size-5 shrink-0 text-ink-600" />
        <p className="text-sm text-ink-600">
          Set your location at the top of the screen and this becomes the organizations closest to
          you.
        </p>
      </div>
    );
  }

  if (orgs === null) return <SkeletonRail />;

  return <OrgRail orgs={orgs} showDistance />;
}
