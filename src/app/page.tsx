import { UserRound } from "lucide-react";
import Link from "next/link";
import { CategoryRail } from "@/components/home/category-rail";
import { FeedSection } from "@/components/home/feed-section";
import { FilterChipRow } from "@/components/home/filter-chip-row";
import { LocationChip } from "@/components/home/location-chip";
import { NearYouRail } from "@/components/home/near-you-rail";
import { SearchTrigger } from "@/components/home/search-trigger";
import { OrgFeed, OrgRail } from "@/components/org-rail";
import { getCities } from "@/lib/cities";
import {
  getCategories,
  getFeaturedOrganizations,
  getMatchingOrganizations,
  listOrganizations,
} from "@/lib/data";

export const revalidate = 3600;

export default function HomePage() {
  const categories = getCategories();
  const cities = getCities();
  const matching = getMatchingOrganizations(8);
  const featured = getFeaturedOrganizations(8);
  const recent = listOrganizations({}, "newest").slice(0, 8);
  const browseAll = listOrganizations({}).slice(0, 6);

  return (
    <>
      {/*
        Home has no AppHeader: the location chip is the header, and it scrolls
        away rather than hiding on scroll, because the sticky element on this
        screen is the filter chip row underneath it.
      */}
      <div className="app pt-2">
        <div className="flex items-center justify-between gap-3">
          <LocationChip cities={cities} />
          <Link
            href="/account"
            aria-label="Account"
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-050 text-ink-900"
          >
            <UserRound aria-hidden className="size-5" />
          </Link>
        </div>

        <div className="pb-3 pt-2">
          <SearchTrigger />
        </div>

        <CategoryRail categories={categories} />
      </div>

      <div className="app">
        <FilterChipRow />

        {matching.length > 0 && (
          <FeedSection
            title="Matching now"
            subtitle="Every dollar multiplied before the deadline"
            href="/search?matching=1"
          >
            <OrgRail orgs={matching} />
          </FeedSection>
        )}

        <FeedSection title="Near you" href="/search?sort=distance">
          <NearYouRail />
        </FeedSection>

        {recent.length > 0 && (
          <FeedSection title="Recently added" href="/categories">
            <OrgRail orgs={recent} />
          </FeedSection>
        )}

        {featured.length > 0 && (
          <FeedSection
            title="Verified, with something live"
            subtitle="Contact details confirmed, campaign open"
            href="/search?verified=1"
          >
            <OrgRail orgs={featured} />
          </FeedSection>
        )}

        <FeedSection title="Browse all" href="/categories">
          <OrgFeed orgs={browseAll} />
        </FeedSection>

        <p className="py-8 text-center text-xs text-ink-600">
          We never handle your donation and never take a cut.
        </p>
      </div>
    </>
  );
}
