import "server-only";

import seed from "@/data/seed-organizations.json";
import type { Organization } from "./types";

export interface City {
  label: string;
  lat: number;
  lng: number;
  count: number;
}

/**
 * The manual fallback behind "near me". A donor who declines the location
 * prompt — and plenty will, on a charity site they have just met — still
 * needs a one-tap way to say where they are.
 */
export function getCities(): City[] {
  const byLabel = new Map<string, City>();

  for (const org of seed.organizations as unknown as Organization[]) {
    if (!org.isPublished || org.lat == null || org.lng == null || !org.city) continue;
    const label = [org.city, org.region].filter(Boolean).join(", ");
    const existing = byLabel.get(label);
    if (existing) {
      existing.count += 1;
    } else {
      byLabel.set(label, { label, lat: org.lat, lng: org.lng, count: 1 });
    }
  }

  return [...byLabel.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
