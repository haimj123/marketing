"use client";

import * as React from "react";
import { OrgGrid } from "./org-rail";
import { EmptyState } from "./ui/empty-state";
import { ButtonLink } from "./ui/button";
import { useDonor } from "@/lib/donor-store";
import type { OrgListItem } from "@/lib/data";
import type { Organization } from "@/lib/types";

export function FavoritesList() {
  const { favorites, ready } = useDonor();
  const [orgs, setOrgs] = React.useState<Organization[] | null>(null);
  const key = [...favorites].sort().join(",");

  React.useEffect(() => {
    if (!key) {
      setOrgs([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/orgs?slugs=${encodeURIComponent(key)}`);
      const data = (await res.json()) as { organizations: Organization[] };
      if (!cancelled) setOrgs(data.organizations);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!ready || orgs === null) {
    return <div className="h-64 animate-pulse rounded-card bg-ink-050" aria-hidden />;
  }

  if (orgs.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        body="Save an organization from its profile and it will wait here. Useful for the ones you give to every year without thinking about it."
        action={<ButtonLink href="/">Browse categories</ButtonLink>}
      />
    );
  }

  return <OrgGrid orgs={orgs as OrgListItem[]} />;
}
