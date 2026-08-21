"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { OrgFeed } from "../org-rail";
import { EmptyState } from "../ui/empty-state";
import { ButtonLink } from "../ui/button";
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
    return <div className="skeleton mx-4 h-64 rounded-card" aria-hidden />;
  }

  if (orgs.length === 0) {
    return (
      <EmptyState
        icon={<Heart aria-hidden className="size-7" strokeWidth={1.5} />}
        title="No favorites yet"
        body="Tap the heart on any organization and it waits here. Useful for the ones you give to every year without thinking about it."
        action={<ButtonLink href="/categories">Browse categories</ButtonLink>}
      />
    );
  }

  return (
    <div className="app py-4">
      <OrgFeed orgs={orgs as OrgListItem[]} />
    </div>
  );
}
