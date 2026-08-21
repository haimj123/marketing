import type { Metadata } from "next";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { listRequests, type StoredRequest } from "@/lib/request-store";
import {
  getClaimedCount,
  getOrganizationCount,
  IS_DEMO_DATA,
  listOrganizations,
} from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { RawParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const KIND_LABEL: Record<StoredRequest["kind"], string> = {
  claim: "Claim requests",
  removal: "Removal requests",
  abuse: "Reports",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const token = process.env.ADMIN_TOKEN;
  const supplied = typeof raw.token === "string" ? raw.token : undefined;

  // Claim review is too central to outsource, so the queue lives here — but a
  // queue anyone can open is worse than no queue. When ADMIN_TOKEN is set it
  // is required; when it is not, the page refuses to render the contents and
  // says why, rather than quietly exposing them.
  if (!token) {
    return (
      <div className="page max-w-2xl py-12">
        <div className="rounded-[8px] border border-warning/40 bg-bronze-100 p-6">
          <h1 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
            <ShieldAlert aria-hidden className="size-5 text-warning" />
            Admin is not configured
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Set <code className="rounded bg-white/70 px-1 font-mono">ADMIN_TOKEN</code> in the
            environment and open{" "}
            <code className="rounded bg-white/70 px-1 font-mono">/admin?token=…</code>. Until then
            the review queues are not rendered.
          </p>
          <p className="mt-3 text-sm text-ink-600">
            A shared token is the floor, not the goal. M2 replaces it with Supabase Auth plus a
            role check, and the queues move to Postgres so they survive a redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (supplied !== token) {
    return (
      <div className="page max-w-2xl py-12">
        <h1 className="font-display text-xl font-bold text-ink-900">Not authorised</h1>
        <p className="mt-2 text-sm text-ink-600">Append a valid ?token= to this URL.</p>
      </div>
    );
  }

  const requests = listRequests();
  const unclaimed = listOrganizations({}).filter((o) => o.claimStatus === "unclaimed").length;
  const stale = listOrganizations({}).filter((o) =>
    o.campaigns.some((c) => c.status === "flagged_stale"),
  ).length;

  return (
    <div className="page py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Admin</h1>

      <p className="mt-3 flex items-start gap-2 rounded-[8px] bg-bronze-100 p-4 text-sm text-bronze-600">
        <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
        Request queues are held in the server&rsquo;s memory and are lost on redeploy. This is a
        development affordance, not storage.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Organizations" value={getOrganizationCount()} />
        <Stat label="Claimed" value={getClaimedCount()} />
        <Stat label="Unclaimed stubs" value={unclaimed} />
        <Stat label="Orgs with a stale campaign" value={stale} />
      </dl>

      {IS_DEMO_DATA && (
        <p className="mt-4 text-sm text-ink-600">
          Serving the demo fixture. Run{" "}
          <code className="rounded bg-ink-050 px-1 font-mono">npm run ingest:bmf</code> to import
          the IRS Business Master File, review the filtered batch, then publish.
        </p>
      )}

      {(["claim", "removal", "abuse"] as const).map((kind) => {
        const rows = requests.filter((r) => r.kind === kind);
        return (
          <section key={kind} className="mt-10">
            <h2 className="font-display text-lg font-bold text-ink-900">
              {KIND_LABEL[kind]}{" "}
              <span className="tabular font-normal text-ink-600">({rows.length})</span>
            </h2>
            {rows.length === 0 ? (
              <p className="mt-2 text-sm text-ink-600">Nothing in the queue.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-ink-300 text-left text-xs uppercase tracking-wide text-ink-600">
                      <th scope="col" className="py-2 pr-4 font-semibold">Ref</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Received</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Organization</th>
                      <th scope="col" className="py-2 pr-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-ink-050 align-top">
                        <td className="tabular py-3 pr-4 font-semibold">{row.id}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-ink-600">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="py-3 pr-4">{row.orgSlug}</td>
                        <td className="py-3 pr-4 text-ink-600">
                          {Object.entries(row.payload).map(([key, value]) => (
                            <span key={key} className="block">
                              <span className="font-semibold text-ink-900">{key}:</span> {value}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-ink-300 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</dt>
      <dd className="tabular mt-1 font-display text-2xl font-extrabold text-ink-900">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
