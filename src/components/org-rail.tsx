import { OrgCard } from "./org-card";
import type { OrgListItem } from "@/lib/data";

export function OrgRail({ orgs, showDistance }: { orgs: OrgListItem[]; showDistance?: boolean }) {
  return (
    <ul className="rail -mx-4 px-4 pb-2 md:-mx-6 md:px-6">
      {orgs.map((org) => (
        <li key={org.slug} className="w-[300px]">
          <OrgCard org={org} showDistance={showDistance} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

export function OrgGrid({ orgs, showDistance }: { orgs: OrgListItem[]; showDistance?: boolean }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
      {orgs.map((org) => (
        <li key={org.slug}>
          <OrgCard org={org} showDistance={showDistance} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
