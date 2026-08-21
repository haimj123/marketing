import "server-only";

/**
 * Claim, removal and abuse requests.
 *
 * These are held in memory in the server process. That is a real limitation
 * and it is stated on every screen that writes here: the queue does not
 * survive a redeploy, and it is not shared between serverless instances. It
 * exists so the flows are genuinely wired end to end — a submission reaches a
 * reviewable admin queue rather than a `console.log` — and so that M2 has one
 * file to swap when `claim_requests`, `removal_requests` and `abuse_reports`
 * move to Postgres.
 *
 * Nothing here is a substitute for durable storage. Do not launch on it.
 */

export type RequestKind = "claim" | "removal" | "abuse";

export interface StoredRequest {
  id: string;
  kind: RequestKind;
  orgSlug: string;
  createdAt: string;
  status: "open" | "actioned" | "declined";
  /** Free-form, validated per kind at the route boundary. */
  payload: Record<string, string>;
}

const store: StoredRequest[] = [];

function reference(): string {
  return `ST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function addRequest(
  kind: RequestKind,
  orgSlug: string,
  payload: Record<string, string>,
): StoredRequest {
  const record: StoredRequest = {
    id: reference(),
    kind,
    orgSlug,
    createdAt: new Date().toISOString(),
    status: "open",
    payload,
  };
  // Newest first, and bounded so a bot cannot exhaust memory.
  store.unshift(record);
  if (store.length > 500) store.length = 500;
  return record;
}

export function listRequests(kind?: RequestKind): StoredRequest[] {
  return kind ? store.filter((r) => r.kind === kind) : [...store];
}

export function setRequestStatus(id: string, status: StoredRequest["status"]): boolean {
  const record = store.find((r) => r.id === id);
  if (!record) return false;
  record.status = status;
  return true;
}
