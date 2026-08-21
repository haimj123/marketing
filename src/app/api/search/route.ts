import { NextResponse } from "next/server";
import { searchOrganizations } from "@/lib/data";

/** Typeahead for the header search. Cheap enough to hit on every keystroke. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = searchOrganizations(q, 6).map((o) => ({
    slug: o.slug,
    name: o.dba ?? o.legalName,
    city: [o.city, o.region].filter(Boolean).join(", "),
    verificationLevel: o.verificationLevel,
    claimStatus: o.claimStatus,
    category: o.categorySlugs[0] ?? null,
  }));

  return NextResponse.json({ results });
}
