import { NextResponse } from "next/server";
import { getNearbyOrganizations } from "@/lib/data";

/**
 * Distance sort lives on the server so the browser only ever sends a
 * coordinate pair and gets listings back. The coordinate is not logged and
 * not stored — "near me" should not cost a donor their location history.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  return NextResponse.json({ results: getNearbyOrganizations({ lat, lng }, 8) });
}
