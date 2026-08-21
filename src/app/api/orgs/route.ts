import { NextResponse } from "next/server";
import { getOrganization } from "@/lib/data";

/**
 * Bulk read for client screens that hold slugs rather than records — the
 * giving list and the favorites page. Capped so the endpoint can't be used to
 * pull the whole directory in one request.
 */
export async function GET(request: Request) {
  const slugs = (new URL(request.url).searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  const organizations = slugs
    .map((slug) => getOrganization(slug))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  return NextResponse.json({ organizations });
}
