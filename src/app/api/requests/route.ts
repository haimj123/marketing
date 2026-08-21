import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrganization } from "@/lib/data";
import { addRequest } from "@/lib/request-store";

const schema = z.object({
  kind: z.enum(["claim", "removal", "abuse"]),
  orgSlug: z.string().min(1).max(120),
  email: z.email().max(200),
  name: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  method: z.enum(["email", "phone", "domain"]).optional(),
  reason: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  const { kind, orgSlug, ...rest } = parsed.data;
  if (!getOrganization(orgSlug)) {
    return NextResponse.json({ error: "Unknown organization" }, { status: 404 });
  }

  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === "string" && value.trim()) payload[key] = value.trim();
  }

  const record = addRequest(kind, orgSlug, payload);

  return NextResponse.json({
    id: record.id,
    // Said plainly rather than implied: nothing has been emailed to anyone.
    delivered: false,
    note: "Queued for manual review. No verification code has been sent — email delivery is not configured on this deployment.",
  });
}
