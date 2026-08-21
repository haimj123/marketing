import Image from "next/image";
import Link from "next/link";
import { HandHeart, Landmark, ShieldCheck } from "lucide-react";
import { CategoryCard } from "@/components/category-tile";
import { CategoryTile } from "@/components/category-tile";
import { NearYou } from "@/components/near-you";
import { OrgRail } from "@/components/org-rail";
import { Section } from "@/components/section";
import { SearchBox } from "@/components/search-box";
import { getCities } from "@/lib/cities";
import {
  getCategories,
  getCategoryCounts,
  getClaimedCount,
  getFeaturedOrganizations,
  getMatchingOrganizations,
  getOrganizationCount,
} from "@/lib/data";

export const revalidate = 3600;

export default function HomePage() {
  const categories = getCategories();
  const counts = getCategoryCounts();
  const matching = getMatchingOrganizations();
  const featured = getFeaturedOrganizations();
  const cities = getCities();
  const total = getOrganizationCount();
  const claimed = getClaimedCount();

  return (
    <>
      <section className="border-b border-ink-300 bg-brand-050">
        <div className="page grid items-center gap-8 py-10 md:grid-cols-[1fr_auto] md:py-14">
          <div>
          <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-brand-900 md:text-4xl">
            Where would you like your tzedaka to go?
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink-600">
            {total.toLocaleString()} organizations, {claimed.toLocaleString()} of them claimed and
            maintained by the people who run them. Give directly — we never handle the money and
            never take a cut.
          </p>

          <div className="mt-6 max-w-xl">
            <SearchBox placeholder="Try “Tomchei Shabbos”, a city, or an EIN" />
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
            <li className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden className="size-4 text-bronze-600" />
              Seeded from IRS public records
            </li>
            <li className="flex items-center gap-1.5">
              <HandHeart aria-hidden className="size-4 text-bronze-600" />
              No platform fee, ever
            </li>
            <li className="flex items-center gap-1.5">
              <Landmark aria-hidden className="size-4 text-bronze-600" />
              No paid placement
            </li>
          </ul>
          </div>

          <Image
            src="/logo.png"
            alt=""
            width={280}
            height={280}
            priority
            className="hidden size-56 object-contain mix-blend-multiply md:block lg:size-64"
          />
        </div>
      </section>

      <div className="page">
        {/* The category rail is the primary navigation, exactly as the cuisine
            rail is on a delivery app: the first decision is what kind of need,
            not which organization. */}
        <section className="py-8">
          <h2 className="sr-only">Browse by category</h2>
          <ul className="rail -mx-4 px-4 pb-2 md:hidden">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryTile category={category} count={counts[category.slug]} />
              </li>
            ))}
          </ul>
          <ul className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <CategoryCard category={category} count={counts[category.slug]} />
              </li>
            ))}
          </ul>
        </section>

        {matching.length > 0 && (
          <Section
            title="Matching now"
            subtitle="A sponsor has committed to multiply gifts made before the deadline. Terms are the organization's own."
            href="/search?matching=1"
          >
            <OrgRail orgs={matching} />
          </Section>
        )}

        <Section title="Near you" subtitle="Organizations with an address closest to yours.">
          <NearYou cities={cities} />
        </Section>

        {featured.length > 0 && (
          <Section
            title="Verified, with something live"
            subtitle="Profiles whose contact details we have confirmed, running an open campaign."
            href="/search?verified=1"
          >
            <OrgRail orgs={featured} />
          </Section>
        )}

        <section className="my-8 rounded-[16px] border border-ink-300 bg-ink-050 p-6 md:p-10">
          <h2 className="font-display text-xl font-bold text-ink-900">
            Run an organization? Your listing may already be here.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-600">
            We seed the directory from the IRS Exempt Organizations Business Master File, so most
            registered charities already have a stub. Claiming it costs nothing, takes about ten
            minutes, and puts your own departments, campaigns and payment details on the page.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/claim"
              className="inline-flex h-12 items-center rounded-[8px] bg-brand-700 px-6 font-semibold text-white hover:bg-brand-900"
            >
              Claim your listing
            </Link>
            <Link
              href="/for-organizations"
              className="inline-flex h-12 items-center rounded-[8px] border border-ink-300 bg-white px-6 font-semibold text-brand-700 hover:bg-brand-050"
            >
              How it works for organizations
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
