import { OrgCard } from "./org-card";
import type { OrgListItem } from "@/lib/data";

/**
 * The horizontal carousel. 168px cards, and the rail runs full-bleed to the
 * screen edge on purpose so the last card is visibly cut off — that is the
 * only affordance telling a thumb there is more to the right.
 */
export function OrgRail({ orgs, showDistance }: { orgs: OrgListItem[]; showDistance?: boolean }) {
  return (
    <ul className="rail bleed pb-1">
      {orgs.map((org) => (
        <li key={org.slug} className="w-[168px]">
          <OrgCard org={org} variant="rail" showDistance={showDistance} />
        </li>
      ))}
    </ul>
  );
}

/** The vertical feed. 20px between cards. */
export function OrgFeed({ orgs, showDistance }: { orgs: OrgListItem[]; showDistance?: boolean }) {
  return (
    <ul className="space-y-5">
      {orgs.map((org) => (
        <li key={org.slug}>
          <OrgCard org={org} showDistance={showDistance} />
        </li>
      ))}
    </ul>
  );
}

/** Kept as an alias so screens not yet redesigned keep compiling. */
export const OrgGrid = OrgFeed;
